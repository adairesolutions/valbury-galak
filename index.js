const moment = require('moment');
const extract = require('pdf-text-extract');

moment.updateLocale('en', {
  monthsShort: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "AUG", "Sept", "Oct", "Nov", "Dec"
  ]
});

async function RealDate() {
  const url = "https://timeapi.io/api/time/current/zone?timeZone=Asia%2FJakarta";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    console.log(new Date(json['dateTime']));
  } catch (error) {
    console.error(error.message);
    // console.error(error.message + ", Re Run");
    // RealDate();
    // return;
  }
}

function FetchFileName() {
  var date = new Date();
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
    console.log('Length: ' + JSON.stringify(pages.slice(3, -3)).length);

    if (pdfLength = 872) {
      // EURUSD
      console.log('eurusd');
      console.log(JSON.stringify(pages.slice(3, -3)).substring(2, 10).toLocaleLowerCase());
      console.log(JSON.stringify(pages.slice(3, -3)).substring(18, 25));
      console.log(JSON.stringify(pages.slice(3, -3)).substring(71, 78));
      console.log(JSON.stringify(pages.slice(3, -3)).substring(125, 132));
      console.log(JSON.stringify(pages.slice(3, -3)).substring(178, 185));
      // GBPUSD
      console.log('gbpusd');
    } else if (pdfLength = 879) {
      // EURUSD
      console.log('eurusd');
      console.log(JSON.stringify(pages.slice(3, -3)).substring(2, 10).toLocaleLowerCase());
      console.log(JSON.stringify(pages.slice(3, -3)).substring(19, 26));
      console.log(JSON.stringify(pages.slice(3, -3)).substring(72, 79));
      console.log(JSON.stringify(pages.slice(3, -3)).substring(126, 133));
      console.log(JSON.stringify(pages.slice(3, -3)).substring(180, 187));
      // GBPUSD
      console.log('gbpusd');
    }
  });
}

RealDate();
FetchFileName();