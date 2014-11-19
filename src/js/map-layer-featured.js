var $ = require("jquery");
var leaflet = require("leaflet");
var popup = require("./map-popup");

var plantFlag = function() {
  return leaflet.divIcon({
    className: "featured",
    html: "<i class='fa fa-flag'></i>",
    iconSize: [20,20],
    iconAnchor: [10, 10],
  });
};

var featured = leaflet.markerClusterGroup({
  showCoverageOnHover: false,
  maxClusterRadius: 20,
  spiderfyOnMaxZoom: false,
  iconCreateFunction: plantFlag
});

var request = $.ajax({
  url: "featured.json"
});
request.done(function(data) {
  data.forEach(function(item) {
    var marker = new leaflet.Marker([item.lat, item.lng], {
      icon: plantFlag(),
      zIndexOffset: 9999
    });
    marker.data = item;
    featured.addLayer(marker);
  });
});

featured.on("click", function(e) {
  var marker = e.layer;
  popup.open(marker);
});

module.exports = featured;