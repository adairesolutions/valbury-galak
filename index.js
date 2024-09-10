const moment = require('moment');
const extract = require('pdf-text-extract');

moment.updateLocale('en', {
  monthsShort: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "AUG", "Sept", "Oct", "Nov", "Dec"
  ]
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

  const xausig = xau['document']['xauusd_signals'];
  const countbuy = xausig.filter(item => item.order === 'buy').length;
  const countsell = xausig.filter(item => item.order === 'sell').length;

  var date = datenow;
  var signalid = countbuy + countsell - 1;
  var dateclean = moment(date).locale('en').format('DD');
  var monthclean = moment(date).locale('en').format('MMM');
  var yearclean = moment(date).locale('en').format('YYYY');
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
      var signaldate = moment(date).locale('id').format('MM/DD/YY').toString();
      var signalorder = pdfResult.substring(1, 5).toLocaleLowerCase();
      var signalprice = pdfResult.substring(17, 24);
      var signalsl = pdfResult.substring(71, 78);
      var signaltp1 = pdfResult.substring(125, 132);
      var signaltp2 = pdfResult.substring(178, 186);
      var xausignalobj = {
        'id': signalid,
        'date': signaldate,
        'order': signalorder,
        'price': signalprice,
        'stoploss': signalsl,
        'takeprofit1': signaltp1,
        'takeprofit2': signaltp2,
      }
      xauusd_signals.push(xausignalobj);
      console.log(xauusd_signals);
    } else {
      console.log("No case, well done!");
    }
  });
}

FetchtheSignal();