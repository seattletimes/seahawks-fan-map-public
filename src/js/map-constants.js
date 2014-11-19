/* global players */
var playerMap = {};
for (var i = 0; i < players.length; i++) {
  playerMap[players[i].data] = players[i].label;
}

module.exports = {
  playerMap: playerMap,
  views: {
    seattle: [
      [47.72, -122.45],
      [47.53, -122.14]
    ],
    wa: [
      [49.01, -124.90],
      [45.54, -116.84]
    ],
    us: [
      [49.27, -125.56],
      [23.97, -65.65]
    ]
  }
};