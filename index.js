const moment = require('moment');
const extract = require('pdf-text-extract');

moment.updateLocale('en', {
  monthsShort: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
  ]
});

function DateMaster() {
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
  });
}

DateMaster();