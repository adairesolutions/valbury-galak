const moment = require('moment');
const extract = require('pdf-text-extract');

moment.updateLocale('en', {
  monthsShort: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "AUG", "Sept", "Oct", "Nov", "Dec"
  ]
});

async function RealDate() {
  const url = "https://worldtimeapi.org/api/timezone/Asia/Jakarta";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    console.log(new Date(json['datetime']));
  } catch (error) {
    console.error(error.message);
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
      return
    }
    console.log(JSON.stringify(pages.slice(3, -3)));
    // EURUSD
    console.log('eurusd');
    console.log(JSON.stringify(pages.slice(3, -3)).substring(2, 10).toLocaleLowerCase());
    console.log(JSON.stringify(pages.slice(3, -3)).substring(19, 26));
    console.log(JSON.stringify(pages.slice(3, -3)).substring(72, 79));
    console.log(JSON.stringify(pages.slice(3, -3)).substring(126, 133));
    console.log(JSON.stringify(pages.slice(3, -3)).substring(180, 187));
    // GBPUSD
    console.log('gbpusd');
  });
}

RealDate();
FetchFileName();

// ["SELL             1.11100   SELL            1.31500\n\nSTOP LOSS       1.11500    STOP LOSS       1.32000\n\nTAKE PROFIT 1   1.10400    TAKE PROFIT 1   1.30700\n\nTAKE PROFIT 2   1.10100    TAKE PROFIT 2   1.30300\n\n\n\n\nBUY             142.200    BUY             0.84100\n\nSTOP LOSS       141.600    STOP LOSS       0.83700\n\nTAKE PROFIT 1   143.200    TAKE PROFIT 1   0.84800\n\nTAKE PROFIT 2   143.700    TAKE PROFIT 2   0.85100\n","SELL            2500.00   SELL               68.70\n\nSTOP LOSS       2510.00   STOP LOSS          69.70\n\nTAKE PROFIT 1   2485.00   TAKE PROFIT 1      67.20\n\nTAKE PROFIT 2   2475.00   TAKE PROFIT 2      66.20\n\n\n\n\nSELL              17480   SELL            18500.00\n\nSTOP LOSS         17580   STOP LOSS       19600.00\n\nTAKE PROFIT 1     17360   TAKE PROFIT 1   18350.00\n\nTAKE PROFIT 2     17230   TAKE PROFIT 2   18200.00\n"]