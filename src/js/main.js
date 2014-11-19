var Share = require("share");
var map = require("./map");
require("./form");
require("./overlay");
var $ = require("jquery");

map.instance.on("click", function() {
  $(".form-panel").removeClass("show");
});

new Share(".share", {
  ui: {
    flyout: "bottom left"
  }
});