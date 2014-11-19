/* global ich */
var $ = require("jquery");
var leaflet = require("leaflet");
var popupHTML = require("./_zonePopup.html");
var constants = require("./map-constants");
var ich = require("icanhaz");

ich.addTemplate("zone", popupHTML);

var layer = leaflet.geoJson();

var rgba = function(r, g, b, a) { return "rgba(" + [r, g, b, a || 1].join(",") + ")" };
var hsl = function(h, s, l) {
  l /= 100;
  s /= 100;
  var chroma = (1 - Math.abs(2 * l - 1)) * s;
  var hPrime = h / 60;
  var x = chroma * (1 - Math.abs(hPrime % 2 - 1));
  var r = 0, g = 0, b = 0;
  if (hPrime) {
    if (hPrime < 1) {
      r = chroma;
      g = x;
    } else if (hPrime < 2) {
      r = x;
      g = chroma;
    } else if (hPrime < 3) {
      g = chroma;
      b = x;
    } else if (hPrime < 4) {
      g = x;
      b = chroma;
    } else if (hPrime < 5) {
      r = x;
      b = chroma;
    } else if (hPrime < 6) {
      r = chroma;
      b = x;
    }
  }
  var m = l - chroma * .5;
  r += m;
  g += m;
  b += m;
  return rgba(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
};

var most = 0;

var enqueue = function(url) {
  return $.Deferred(function(deferred) {
    var loaded = false;
    //augment the promise with a load() function
    deferred.load = function() {
      if (!loaded) {
        $.ajax({
          url: url,
          dataType: "json"
        }).then(function(data) {
          deferred.resolve(data);
        });
        loaded = true;
      }
      return deferred;
    };
  });
};

//we would normally just load these, but we need access to stats outside of init
var worldRequest = enqueue("assets/countries.geo.json");
var stateRequest = enqueue("assets/states.geo.json");
var statsRequest = enqueue("stats.json");

//to be called when the promises resolve
var init = function(world, states, stats) {
  world.features = world.features.filter(function(feature) {
    feature.name = feature.properties.name;
    return feature.id !== "USA";
  });

  states.features.forEach(function(feature) {
    feature.name = feature.properties.NAME;
  });

  layer.addData(world);
  layer.addData(states);

  Object.keys(stats).forEach(function(zone) {
    if (stats[zone].total > most) most = stats[zone].total;
    var convert = function(player) {
      player.name = constants.playerMap[player.player];
    };
    stats[zone].players.forEach(convert);
    if (stats[zone].favorite) convert(stats[zone].favorite);
  });

  layer.eachLayer(function(l) {
    var stat = stats[l.feature.name];
    if (!stat || !stat.total) return;
    l.bindPopup(ich.zone({
      zone: l.feature.name,
      stats: stat
    }, true));
  });
};

var playerPalette = {
  "3": rgba(11, 72, 107),
  "25": rgba(59, 134, 134),
  "24": rgba(121, 189, 154),
  "29": rgba(207, 240, 158)
};
var lifespans = ["1", "2", "3+", "5+", "10+", "20+", "30+"];
// var gradations = lifespans.map(function(_, i) { return hsl(270 - i * 20, 40, 70 - i * 8) });
var gradations = [
  rgba(0, 22, 63),
  rgba(35, 57, 93),
  rgba(70, 92, 123),
  rgba(105, 127, 153),
  rgba(140, 162, 183),
  rgba(175, 197, 213),
  rgba(210, 232, 243)
].reverse();

var color = function(metric) { //favorite, lifespan
  var nothing = { fill: false, stroke: false, clickable: false };
  statsRequest.then(function(stats) {
    layer.setStyle(function(feature) {
      var stat = stats[feature.name];
      if (!stat) {
        return nothing;
      }

      switch (metric) {

      case "lifespan":
        return { color: gradations[lifespans.indexOf(stat.longest.lifespan)], stroke: false, fillOpacity: .7 };

      case "favorite":
        if (!stat.favorite) return nothing;
        var color = playerPalette[stat.favorite.player] || rgba(221, 221, 200);
        return { color: color, stroke: false, fillOpacity: .7 };

      default:
        console.error("Matched no paint ID");
        return nothing;

      }
    });
  });
};

var ready;

module.exports = {
  load: function() {
    if (ready) return ready;
    var deferred = $.Deferred();
    //delay for animation
    setTimeout(function() {
      var requests = $.when(
        worldRequest.load(),
        stateRequest.load(),
        statsRequest.load()
      );
      requests.then(init).then(function() {
        deferred.resolve(layer);
      });
    }, 10);
    ready = deferred.promise();
    return ready;
  },
  paint: color
};