/*

Google Apps Script for API endpoint

*/

var sheetID = "sheet-id";
//init row configuration
var rowConfig = SpreadsheetApp
  .openById(sheetID)
  .getActiveSheet()
  .getRange(1, 1, 1, 100)
  .getValues().pop()
  .filter(function(d) { return d });

/***
Requests may come in with the following parameters:

name
favorite - player name (number?)
note
location - geocodable location

Resulting in the following derived fields
lat - (will be rounded to nearest .01 degrees)
lng - see lat
zone - state or country for heatmapping
approve - flags them for inclusion on the map
feature - flags them for star status

Approval is contingent on a flag to give us some editorial leeway. Truly offensive stuff can just be deleted.
*/

//maps a parameter hash to a row in the spreadsheet according to column names
var rowMapper = function(data) {
  var row = [];
  for (var key in data) {
    var index = rowConfig.indexOf(key);
    if (index > -1) {
      var value;
      if (key in data) {
        value = data[key];
      } else {
        value = "";
      }
      row[index] = data[key];
    }
  }
  for (var i = 0; i < row.length; i++) {
    if (typeof row[i] == "undefined") {
      row[i] = "";
    }
  }
  return row;
}

//called on web request
function doGet(e) {
  if (!e && !e.parameter) return;
  //lock the sheet
  var lock = LockService.getPublicLock();
  lock.tryLock(30 * 1000);

  var sheet = SpreadsheetApp.openById(sheetID).getActiveSheet();
  var params = e.parameter;
  params.timestamp = Date.now();
  //prefer GPS to geocoding
  if (params.gps) {
    var latlng = params.gps.split(",");
    params.lat = latlng[0];
    params.lng = latlng[1];
  } else if (params.location) {
    var geocoded = Maps.newGeocoder().geocode(e.parameter.location);
    if (geocoded.status == "OK") {
      loc = geocoded.results.shift().geometry.location;
      params.lat = loc.lat;
      params.lng = loc.lng;
    }
  }
  var row = rowMapper(params);
  sheet.appendRow(row);

  lock.releaseLock();

  //return JSONP if given callback, otherwise plain JSON
  var output = ContentService.createTextOutput();
  var rowContents = JSON.stringify(row);
  if (params.callback) {
    output.setContent(params.callback + "(" + rowContents + ")");
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    output.setContent(rowContents);
    output.setMimeType(ContentService.MimeType.JSON);
  }
  return output;
}

function doPost(e) {
  return doGet(e);
}

//test function, so you don't have to deploy each time
function test() {
  doGet({
    parameter: {
      name: "Thomas",
      location: "seattle, wa",
      note: "hello, world",
      favorite: 3
    }
  });
}

//fill function to add random people to the sheet, so that we can test lots of points
function fill() {
  var sheet = SpreadsheetApp.openById(sheetID).getActiveSheet();
  var count = 100;
  var firstNames = ["Alice", "Bob", "Charles", "Dawn", "Erin", "Fred", "Gwen", "Harry"];
  var lastNames = ["I.", "J.", "K.", "L.", "M.", "N."];
  var getRandom = function(arr) { return arr[Math.floor(Math.random() * arr.length)] };
  for (var i = 0; i < count; i++) {
    var params = {
      timestamp: Date.now(),
      name: getRandom(firstNames) + " " + getRandom(lastNames),
      location: "Nowhere, USA",
      lifespan: 4,
      season: Math.random() > .5,
      lat: 47 + (Math.random() - .5),
      lng: -122 + (Math.random() - .5),
      favorite: Math.round(Math.random() * 90),
      note: "Randomly generated person"
    };
    var row = rowMapper(params);
    sheet.appendRow(row);
  }
}