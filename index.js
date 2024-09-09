const moment = require('moment');
const path = require('path');
const filePath = path.join(__dirname, './market-outlook/09_Sept_2024_DAILY_MARKET_OUTLOOK_.pdf');
const extract = require('pdf-text-extract');

moment.updateLocale('en', {
  monthsShort : [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]
});

function DateMaster() {
  var date = new Date();
  var dateclean = moment(date).locale('en').format('DD');
  var monthclean = moment(date).locale('en').format('MMM');
  var yearclean = moment(date).locale('en').format('YYYY');

  console.log(dateclean + ' ' + monthclean + ' ' + yearclean);
}

extract(filePath, function (err, pages) {
  if (err) {
    console.log(err);
    return
  }
  console.log(JSON.stringify(pages.slice(3, -3)));
});

DateMaster();