var $ = require("jquery");
var leaflet = require("leaflet");
var constants = require("./map-constants");
var tiles = require("./map-tiles");
var popup = require("./map-popup");
var cluster = require("./map-layer-all");
var featured = require("./map-layer-featured");
var stats= require("./map-layer-stats");

//module-level state
var locationMarker = null;

var isMobile = window.matchMedia && window.matchMedia("(max-width: 480px)").matches;

var map = leaflet.map("fan-map", {
  minZoom: 3,
  maxZoom: 14,
  maxBounds: [
    [-180, -200],
    [180, 200]
  ]
});

window.map = map;

tiles.lite.addTo(map);
featured.addTo(map);
popup.setMap(map);

map.setView(isMobile ? [35, -95] : [35, -50], 3);

//register events
$(document.body).on("click", ".map-preset", function() {
  var preset = this.getAttribute("data-preset");
  if (preset == "world") {
    map.setZoom(3);
  } else {
    facade.goto(preset);
  }
});

var currentLayer = null;

var facade = {
  locate: function(callback) {
    facade.clearLocation();
    navigator.geolocation.getCurrentPosition(function(position) {
      var coords = [position.coords.latitude, position.coords.longitude];
      var accuracy = position.coords.accuracy;
      //find circle fit based on meters-per-pixel from Leaflet
      for (var zoom = 0, mpp = 156412; zoom < 18; zoom++, mpp = mpp >> 1) {
        if (accuracy > mpp * 100) {
          zoom--;
          break;
        }
      }
      locationMarker = leaflet.circle(coords, accuracy);
      locationMarker.addTo(map);
      map.setView(coords, zoom, { animate: true });
      callback(position);
    });
  },
  clearLocation: function() {
    if (locationMarker) {
      map.removeLayer(locationMarker);
      locationMarker = null;
    }
  },
  goto: function(lat, lng, zoom) {
    if (typeof lat == "string") {
      var preset = lat;
      if (preset in constants.views) {
        map.fitBounds(constants.views[preset]);
      }
      return;
    }
    map.setView(lat, lng, zoom);
  },
  switchLayer: function(id, color) {
    if (currentLayer) map.removeLayer(currentLayer);
    $(".switch-layer.active").removeClass("active");
    var button = $(".switch-layer").filter("[data-layer=" + id + "]");
    if (color) {
      button = button.filter("[data-color=" + color + "]");
    }
    button.addClass("active loading");
    if (id == "cluster") {
      return cluster.load().then(function(layer) {
        currentLayer = layer;
        layer.addTo(map);
        button.removeClass("loading");
      });
    } else {
      return stats.load().then(function(layer) {
        currentLayer = layer;
        layer.addTo(map);
        stats.paint(color || "favorite");
        button.removeClass("loading");
      });
    }
  },
  instance: map
};

facade.switchLayer("stats", "favorite");

$(".switch-layer").on("click", function() {
  facade.switchLayer(this.getAttribute("data-layer"), this.getAttribute("data-color"));
});

module.exports = facade;