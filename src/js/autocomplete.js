var $ = require("jquery");
var template = require("./_autocomplete.html");
var menuTemplate = require("./_autocomplete-menu.html");
var ich = require("icanhaz");

var inputs = $(".autocomplete");

ich.addTemplate("autocomplete", menuTemplate);

var metaKeys = {
  "Up": -1,
  "Down": 1,
  "Enter": 0
};

var keycodes = {
  40: -1,
  38: 1,
  13: 0
}

inputs.each(function() {
  this.innerHTML = template;
  $(this).data("state", {
    index: 0,
    value: null
  });
});

inputs.on("keyup", "input", function(e) {
  var textInput = $(this);
  var text = textInput.val();
  var re = new RegExp("\\b" + text, "i");
  var autocomplete = textInput.closest(".autocomplete");
  var state = autocomplete.data("state");
  var list = players.filter(function(player) {
    return player.label.match(re);
  });
  if (e.keyCode in keycodes) {
    state.index += keycodes[e.keyCode];
    state.index = state.index % list.length;
    //underflow
    if (state.index < 0) state.index = list.length + state.index;
  } else {
    state.index = 0;
  }
  var menu = autocomplete.find(".dropdown");
  var contents = ich.autocomplete({ 
    list: list.map(function(d, i) {
      d = Object.create(d);
      if (i == state.index) {
        d.selected = true;
      }
      return d;
    })
  });
  var selected = list[state.index];
  state.value = selected ? selected.data : null;
  autocomplete.find(".value").val(state.value);
  autocomplete.data("state", state);
  menu.html(contents);
  if (e.keyCode == 13) {
    if (selected) textInput.val(selected.label);
    menu.empty();
  }
});

inputs.on("blur", "input", function(e) {
  //delay to give click handlers a chance
  setTimeout(function() {
    var textInput = $(this);
    var autocomplete = textInput.closest(".autocomplete");
    var menu = autocomplete.find(".dropdown");
    menu.empty();
  }, 100);
});

inputs.on("click", ".dropdown li", function() {
  var item = $(this);
  var autocomplete = item.closest(".autocomplete");
  var state = autocomplete.data("state");
  state.value = item.attr("data-id");
  autocomplete.find(".view").val(item.html());
  autocomplete.find(".value").val(state.value);
  autocomplete.data("state", state);
  item.closest(".dropdown").empty();
});