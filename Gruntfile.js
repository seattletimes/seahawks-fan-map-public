module.exports = function(grunt) {

  //load tasks
  grunt.loadTasks("./tasks");

  grunt.registerTask("template", "Perform a complete build of data and templates", ["copy", "state", "json", "export-json", "stats", "build"]);
  grunt.registerTask("default", ["bundle", "less", "template", "connect:dev", "watch"]);
  grunt.registerTask("static", ["bundle", "less", "template"]);
  grunt.registerTask("update", ["sheets", "static", "publish"]);
};
