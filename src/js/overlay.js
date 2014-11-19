var $ = require("jquery");
var cookie = require("./cookies");

var overlay = $(".overlay");

if (!cookie.read("sfm-visited")) {
  overlay.addClass("show visible");
  cookie.write("sfm-visited", "true");
}

var closeOverlay = function(e) {
  var $target = $(e.target);
  //poor man's delegation
  if ($target.is(".overlay") || $target.closest(".close").length) {
    overlay.removeClass("visible");
    setTimeout(function() {
      overlay.removeClass("show");
    }, 500);
  }
};

overlay.on("click", closeOverlay);

$(document.body).on("click", ".show-dialog", function() {
  overlay.addClass("show");
  setTimeout(function() {
    overlay.addClass("visible");
  }, 100);
});