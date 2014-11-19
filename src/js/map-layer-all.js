var $ = require("jquery");
var leaflet = require("leaflet");
var popup = require("./map-popup");
require("./lib/leaflet.markercluster/dist/leaflet.markercluster.js");

var isMobile = window.matchMedia && window.matchMedia("(max-width: 480px)").matches;

var cluster = new leaflet.MarkerClusterGroup({
  showCoverageOnHover: false,
  //disableClusteringAtZoom: 5,
  maxClusterRadius: 60,
  spiderfyOnMaxZoom: false,
  //singleMarkerMode: true,
  iconCreateFunction: function(cluster) {
    var sizeClass = "small";
    var bounds = 40;
    var count = cluster.getChildCount();
    if (count > 50) {
      sizeClass = "large";
      bounds = 60;
    } else if (count > 10) {
      sizeClass = "medium";
      bounds = 50;
    }
    return new leaflet.DivIcon({
      iconSize: [bounds, bounds],
      className: "marker-cluster " + sizeClass,
      html: count
    });
  }
});

//cluster event listeners - all markers trigger here
cluster.on("click clusterclick", function(e) {
  var marker = e.layer;
  //is this a cluster, with zoom to spare?
  if (e.type == "clusterclick" && this._map.getZoom() < this._map.getMaxZoom()) {
    return;
  }
  popup.open(marker);
});

var ready;

module.exports = {
  load: function() {
    if (ready) return ready;

    //returns a promise when load is called
    var deferred = $.Deferred();

    //delay for animation
    setTimeout(function() {
      var request = $.ajax({
        url: "all.json"
      });
      request.done(function(data) {
        var markers = [];
        data.forEach(function(item) {
          var marker = new leaflet.Marker([item.lat, item.lng], {
            icon: leaflet.divIcon({
              className: "fan-icon",
              iconSize: isMobile ? [25, 25] : [15, 15]
            }),
          });
          marker.data = item;
          markers.push(marker);
        });
        cluster.addLayers(markers);
        cluster.bringToBack();
        deferred.resolve(cluster);
      });
    }, 10);

    ready = deferred.promise();
    return ready;
  }
};