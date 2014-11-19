
var $ = require("jquery");
var template = require("./_location.html");
var map = require("./map");

var wait = function(delay) {
  var deferred = $.Deferred();
  setTimeout(deferred.resolve, delay);
  return deferred.promise();
};

var inputs = $(".location-input");

inputs.each(function(index) {
  this.innerHTML = template;
});

//start location search
inputs.on("click", ".geolocate", function() {
  var input = $(this).closest(".location-input");
  var gps = input.find("[name=gps]");
  var location = input.find("[name=location]");
  if (input.hasClass("searching")) {
    location.val(null);
    input.removeclass("searching");
    return;
  }
  if (input.hasClass("located")) {
    gps.val(null);
    map.clearLocation();
    input.removeClass("located");
    return;
  }
  input.addClass("searching");
  location.val("Finding your location...");
  map.locate(function(pos) {
    if (!input.hasClass("searching")) return;
    input.removeClass("searching").addClass("located");
    location.val("Location found");
    console.log(pos);
    gps.val([pos.coords.latitude, pos.coords.longitude].join());
  });
});

//focusing on location should clear GPS search
inputs.on("focus", "[name=location]", function() {
  var location = $(this);
  var input = location.closest(".location-input");
  map.clearLocation();
  input.find("[name=gps]").val(null);
  location.val(null);
  input.removeClass("searching located");
});