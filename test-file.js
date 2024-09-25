const extract = require('pdf-text-extract');

const path = require('path');
const filePath = path.join(__dirname, './market-outlook/' + '25_Sept_2024_DAILY_MARKET_OUTLOOK_' + '.pdf');

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
  var clrpdfResult = JSON.stringify(pages[4].slice(0, 206));
  var clrpdfResultLength = clrpdfResult.length;
  // USDJPY
  var ujpypdfResult = JSON.stringify(pages[3].slice(211, -28));
  var ujpypdfResultLength = ujpypdfResult.length;

  // USDJPY
  console.log(ujpypdfResultLength);
  console.log("ORDER" + ": " + ujpypdfResult.substring(1, 5));
  console.log("PRICE" + ": " + ujpypdfResult.substring(17, 24));
  console.log("STOP LOSS" + ": " + ujpypdfResult.substring(71, 78));
  console.log("TP 1" + ": " + ujpypdfResult.substring(125, 132));
  console.log("TP 2" + ": " + ujpypdfResult.substring(179, 186));

  // Oil
  console.log(clrpdfResultLength);
  console.log("ORDER" + ": " + clrpdfResult.substring(1, 4));
  console.log("PRICE" + ": " + clrpdfResult.substring(46, 51));
  console.log("STOP LOSS" + ": " + clrpdfResult.substring(100, 105));
  console.log("TP 1" + ": " + clrpdfResult.substring(154, 159));
  console.log("TP 2" + ": " + clrpdfResult.substring(208, 213));
});