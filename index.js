const moment = require('moment');
const { Downloader } = require("nodejs-file-downloader");
const extract = require('pdf-text-extract');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://geraldzandisko:Ah7klEx0MBidohg2@adairesolution-cluster.86e4g.mongodb.net/?retryWrites=true&w=majority&appName=adairesolution-cluster";
const fs = require('fs');
const axios = require('axios');
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
const { setTimeout } = require("timers/promises");

// Moment Configuration
moment.updateLocale('id', {
  monthsShort: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "AUG", "Sept", "Oct", "Nov", "Dec"
  ]
});

// MongoDB Connect
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Functions
(async () => {
  const getPDF = async () => {
    // Get Time and Date
    const url = "https://timeapi.io/api/time/current/zone?timeZone=Asia%2FJakarta";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      var datepdf = new Date(json['dateTime']);
    } catch (error) {
      console.error(error.message);
    }
    // Reformat Time and Date
    var date = datepdf;
    var dateget = moment(date).locale('id').format('DD');
    var monthget = moment(date).locale('id').format('MMM');
    var yearget = moment(date).locale('id').format('YYYY');
    var dayget = moment(date).locale('id').format('dddd');
    if (dayget === 'Sabtu' || dayget === 'Minggu') {
      console.log("Market libur");
      return;
    } else {
      // Get Outlook Folder Path
      const path = './market-outlook/' + dateget + '_' + monthget + '_' + yearget + '_DAILY_MARKET_OUTLOOK_.pdf';
      fs.access(path, fs.F_OK, async (err) => {
        if (err == null) {
          console.log('Trading suggestions for today have not been published or already downloaded.');
          return;
        } else {
          // Downloading
          console.log('Downloading trading suggestions for today.');
          const downloader = new Downloader({
            url: 'https://research.valbury.co.id/resources/files/vaf/' + dateget + '_' + monthget + '_' + yearget + '_DAILY_MARKET_OUTLOOK_.pdf',
            directory: "./market-outlook",
          });
          try {
            await downloader.download();
            console.log("Download finished.");
          } catch (error) {
            console.log("Download failed.", error);
          }
        }
      });
    }
  };

  const getSignal = async () => {
    await setTimeout(10000);
    // Get Time and Date
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
    // Get Previous Signal Data
    var data = JSON.stringify({
      "collection": "xauusd_signals",
      "database": "valbury",
      "dataSource": "adairesolution-cluster",
      "projection": {
        "_id": 0,
        "xauusd_signals": 1,
        "clr_signals": 1,
        "usdjpy_signals": 1
      }
    });
    // MongoDB Configs
    var config = {
      method: 'post',
      url: 'https://data.mongodb-api.com/app/data-hocylaq/endpoint/data/v1/action/findOne',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': 'cnGPLA3XjThub3qvYVwztREUrCTkmXbm4Jmfo1313LkcfU24FILAZq5LbZ2Dv9nc'
      },
      data: data
    };
    // Axios Configs
    axios(config)
      .then(function (response) {
        var valburysignal = response.data;
        var valburyjson = JSON.stringify(valburysignal);
        // Signal Array
        // XAUUSD
        var valburyparse = JSON.parse(valburyjson)['document']['xauusd_signals'];
        // Crude Oil
        var clrparse = JSON.parse(valburyjson)['document']['clr_signals'];
        // USDJPY
        var ujpyparse = JSON.parse(valburyjson)['document']['usdjpy_signals'];
        if (valburyparse == undefined || valburyparse.length == 0) {
          console.log('Could not find previous XAU/USD signal data.');
        } else {
          const xausig = JSON.parse(valburyjson)['document']['xauusd_signals'];
          const countbuy = xausig.filter(item => item.order === 'buy').length;
          const countsell = xausig.filter(item => item.order === 'sell').length;
          var date = datenow;
          var signaldate = moment(date).locale('id').format('MM/DD/YYYY').toString();
          var datadate = xausig.pop()['date'].toString();
          var dateclean = moment(date).locale('id').format('DD');
          var monthclean = moment(date).locale('id').format('MMM');
          var yearclean = moment(date).locale('id').format('YYYY');
          // XAUUSD Insert Signal
          if (signaldate === datadate) {
            console.log('XAU/USD signal has been updated. Exiting script.');
          } else {
            var signalid = countbuy + countsell;
            var outlookname = dateclean + '_' + monthclean + '_' + yearclean + '_' + 'DAILY_MARKET_OUTLOOK_';
            const path = require('path');
            // Extract PDF
            const filePath = path.join(__dirname, './market-outlook/' + outlookname + '.pdf');
            extract(filePath, function (err, pages) {
              if (err) {
                err = "Cannot find report file or the downloaded file is corrupted. Please restart the script."
                console.log(err);
                return;
              }
              // XAUUSD
              var pdfResult = JSON.stringify(pages[4].slice(0, -212));
              var pdfResultLength = pdfResult.length;
              // Crude Oil
              var clrpdfResult = JSON.stringify(pages[4].slice(0, -212));
              var clrpdfResultLength = clrpdfResult.length;
              // USDJPY
              var ujpypdfResult = JSON.stringify(pages[4].slice(0, -212));
              var ujpypdfResultLength = ujpypdfResult.length;
              if (pdfResultLength === 206) {
                // XAUUSD Sell
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
                localStorage.setItem('sigdata', JSON.stringify(xauusd_signals));
                UploadXAU().catch(console.dir);
              } else if (pdfResultLength === 214) {
                if (pdfResult.substring(1, 2) === 'S') {
                  var signalorder = pdfResult.substring(1, 5).toLocaleLowerCase();
                  var signalprice = pdfResult.substring(17, 24);
                  var signalsl = pdfResult.substring(71, 78);
                  var signaltp1 = pdfResult.substring(125, 132);
                  var signaltp2 = pdfResult.substring(179, 186);
                } else {
                  var signalorder = pdfResult.substring(1, 4).toLocaleLowerCase();
                  var signalprice = pdfResult.substring(17, 24);
                  var signalsl = pdfResult.substring(71, 78);
                  var signaltp1 = pdfResult.substring(125, 132);
                  var signaltp2 = pdfResult.substring(179, 186);
                }
                // XAUUSD Buy
                var xauusd_signals = [];
                var xausignalobj = {
                  'xauusd_signals': [{
                    'id': signalid,
                    'date': signaldate,
                    'order': signalorder,
                    'price': signalprice,
                    'stoploss': signalsl,
                    'takeprofit1': signaltp1,
                    'takeprofit2': signaltp2
                  }],
                }
                xauusd_signals.push(xausignalobj);
                localStorage.setItem('sigdata', JSON.stringify(xauusd_signals));
                UploadXAU().catch(console.dir);
              }
            });
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  // Run Function
  Promise.all([getPDF(), getSignal()]);
})();

async function UploadXAU() {
  var sigdata = localStorage.getItem('sigdata');
  insertsig = JSON.parse(sigdata)[0]['xauusd_signals'][0];
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
  console.log("New signal has been added!");
};