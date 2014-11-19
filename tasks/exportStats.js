module.exports = function(grunt) {

  grunt.registerTask("stats", function() {

    grunt.task.requires("json");

    var raw = grunt.data.json.FanMap_Responses;
    var zones = {};

    var getZone = function(zone) {
      if (!zones[zone]) {
        zones[zone] = {
          players: {},
          lifespans: { "1": 0, "2": 0, "3+": 0, "5+": 0, "10+": 0, "20+": 0, "30+": 0 },
          total: 0
        };
      }
      return zones[zone];
    };

    raw.forEach(function(row) {
      if (row.block || !row.zone) return;
      var zone = getZone(row.zone);
      if (row.favorite) {
        if (!zone.players[row.favorite]) {
          zone.players[row.favorite] = 1;
        } else {
          zone.players[row.favorite]++;
        }
      }
      if (row.lifespan) {
        zone.lifespans[row.lifespan]++;
      }
      zone.total++;
    });

    for (var id in zones) {
      var zone = zones[id];
      //favorite players
      var sorted = [];
      Object.keys(zone.players).forEach(function(jersey) {
        sorted.push({ player: jersey, count: zone.players[jersey] });
      });
      sorted.sort(function(a, b) {
        return b.count - a.count;
      });
      zone.players = sorted.slice(0, 5);
      zone.favorite = sorted[0];
      //median length of fanhood
      var longest = "1";
      Object.keys(zone.lifespans).forEach(function(span) {
        if (zone.lifespans[span] > zone.lifespans[longest]) {
          longest = span;
        }
      });
      zone.longest = {
        lifespan: longest,
        count: zone.lifespans[longest]
      };
    }

    grunt.file.write("build/stats.json", JSON.stringify(zones, null, 2));

  });

};