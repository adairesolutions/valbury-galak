const moment = require('moment');
const extract = require('pdf-text-extract');

moment.updateLocale('en', {
  monthsShort: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "AUG", "Sept", "Oct", "Nov", "Dec"
  ]
});

async function FetchFileName() {
  const url = "https://timeapi.io/api/time/current/zone?timeZone=Asia%2FJakarta";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    datenow = new Date(json['dateTime']);
  } catch (error) {
    console.error(error.message);
  }

  var date = datenow;
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

    var pdfLength = JSON.stringify(pages.slice(3, -3)).length;
    var pdfText = JSON.stringify(pages.slice(3, -3));
    // console.log(pdfText);

    if (pdfLength = 872) {
      // EURUSD
      var eurusd_signals = [];
      var signaldate = moment(date).locale('id').format('MM/DD/YY').toString();
      var signalorder = JSON.stringify(pages.slice(3, -3)).substring(2, 6).toLocaleLowerCase();
      var signalprice = JSON.stringify(pages.slice(3, -3)).substring(18, 25);
      var signalsl = JSON.stringify(pages.slice(3, -3)).substring(71, 78);
      var signaltp1 = JSON.stringify(pages.slice(3, -3)).substring(125, 132);
      var signaltp2 = JSON.stringify(pages.slice(3, -3)).substring(178, 185);
      var eursignalobj = {
        'date': signaldate,
        'order': signalorder,
        'price': signalprice,
        'stoploss': signalsl,
        'takeprofit1': signaltp1,
        'takeprofit2': signaltp2,
      }
      eurusd_signals.push(eursignalobj);
      console.log(eurusd_signals);
    } else if (pdfLength = 879) {
      // EURUSD
      var eurusd_signals = [];
      var signaldate = moment(date).locale('id').format('MM/DD/YY').toString();
      var signalorder = JSON.stringify(pages.slice(3, -3)).substring(2, 6).toLocaleLowerCase();
      var signalprice = JSON.stringify(pages.slice(3, -3)).substring(18, 25);
      var signalsl = JSON.stringify(pages.slice(3, -3)).substring(71, 78);
      var signaltp1 = JSON.stringify(pages.slice(3, -3)).substring(125, 132);
      var signaltp2 = JSON.stringify(pages.slice(3, -3)).substring(178, 185);
      var eursignalobj = {
        'date': signaldate,
        'order': signalorder,
        'price': signalprice,
        'stoploss': signalsl,
        'takeprofit1': signaltp1,
        'takeprofit2': signaltp2,
      }
      eurusd_signals.push(eursignalobj);
      console.log(eurusd_signals);
    }
  });
}

FetchFileName();