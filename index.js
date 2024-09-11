const moment = require('moment');
const download = require('url-download');
const extract = require('pdf-text-extract');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://geraldzandisko:Ah7klEx0MBidohg2@adairesolution-cluster.86e4g.mongodb.net/?retryWrites=true&w=majority&appName=adairesolution-cluster";
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

moment.updateLocale('in', {
  monthsShort: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "AUG", "Sept", "Oct", "Nov", "Dec"
  ]
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function FetchtheSignal() {
  const url = "https://timeapi.io/api/time/current/zone?timeZone=Asia%2FJakarta";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    var datenow = new Date(json['dateTime']);
  } catch (error) {
    console.error(error.message);
  }

  const urlbulletin = "https://86c7czpmn0.execute-api.us-east-1.amazonaws.com/valbury-bulletin";
  try {
    const response = await fetch(urlbulletin);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    var xau = json;
  } catch (error) {
    console.error(error.message);
  }

  if (xau == undefined || xau.length == 0) {
    console.log('Could not find Previous signal data.');
  } else {
    const xausig = xau['document']['xauusd_signals'];
    const countbuy = xausig.filter(item => item.order === 'buy').length;
    const countsell = xausig.filter(item => item.order === 'sell').length;

    var date = datenow;
    var signaldate = moment(date).locale('id').format('MM/DD/YYYY').toString();
    var datadate = xausig.pop()['date'].toString();
    var dateclean = moment(date).locale('id').format('DD');
    var monthclean = moment(date).locale('id').format('MMM');
    var yearclean = moment(date).locale('id').format('YYYY');

    let downloadPDF = new Promise((resolve, reject) => {
      download('https://research.valbury.co.id/resources/files/vaf/' + dateclean + '_' + monthclean + '_' + yearclean + '_DAILY_MARKET_OUTLOOK_.pdf', './market-outlook')
        .on('close', function () {
          console.log('One file has been downloaded.');
        });
      resolve();
    });

    let sortThingsOut = new Promise((resolve, reject) => {
      if (signaldate == datadate) {
        console.log('Signal has been updated.');
      } else {
        var signalid = countbuy + countsell;
        var outlookname = dateclean + '_' + monthclean + '_' + yearclean + '_' + 'DAILY_MARKET_OUTLOOK_';
        const path = require('path');
        const filePath = path.join(__dirname, './market-outlook/' + outlookname + '.pdf');
        extract(filePath, function (err, pages) {
          if (err) {
            console.log(err);
            return;
          }
          var pdfResult = JSON.stringify(pages[4].slice(0, -212));
          var pdfResultLength = pdfResult.length;
          // console.log(pdfResult);
          if (pdfResultLength = 206) {
            // XAUUSD
            var xauusd_signals = [];
            var signalorder = pdfResult.substring(1, 5).toLocaleLowerCase();
            var signalprice = pdfResult.substring(17, 24);
            var signalsl = pdfResult.substring(71, 78);
            var signaltp1 = pdfResult.substring(125, 132);
            var signaltp2 = pdfResult.substring(178, 186);
            var xausignalobj = {
              'xauusd_signals': [{
                'id': signalid,
                'date': signaldate,
                'order': signalorder,
                'price': signalprice,
                'stoploss': signalsl,
                'takeprofit1': signaltp1,
                'takeprofit2': signaltp2
              }]
            }
            xauusd_signals.push(xausignalobj);
            // console.log(xauusd_signals);
            localStorage.setItem('sigdata', JSON.stringify(xauusd_signals));
            // Add
            Uploadthesig().catch(console.dir);
          } else {
            console.log("No case, well done!");
          }
        });
      }
      resolve();
    });
    await Promise.all([downloadPDF, sortThingsOut]);
  }
}

async function Uploadthesig() {
  var sigdata = localStorage.getItem('sigdata');
  insertsig = JSON.parse(sigdata)[0]['xauusd_signals'][0];
  // console.log(insertsig[0]);
  try {
    await client.connect();
    const db = client.db('valbury');
    const collection = db.collection('xauusd_signals');
    await collection.updateOne(
      {
        "provider": "vaf"
      },
      {
        $push: {
          "xauusd_signals": {
            "id": insertsig.id, "date": insertsig.date, "order": insertsig.order, "price": insertsig.price, "stoploss": insertsig.stoploss, "takeprofit1": insertsig.takeprofit1, "takeprofit2": insertsig.takeprofit2
          }
        }
      }
    );
  } finally {
    await client.close();
  }
  localStorage.clear();
}

FetchtheSignal();