var exec = require("child_process").exec;
var chalk = require("chalk");
var cmd = "grunt sheets static publish:live";
var interval = 1 * 60 * 60 * 1000;

//testing
// cmd = "ls -al";
// interval = 5 * 1000;

var run = function() {
  var now = new Date();
  exec("git pull origin prod; git checkout prod", function(err, stdout, stderr) {
    console.log(chalk.bgRed.white("===Run: %s==="), now.toLocaleTimeString());
    if (err) console.log(chalk.red(stderr));
    console.log(stdout);

    exec(cmd, function(err, stdout, stderr) {
      console.log(stdout);
      if (stderr) console.log(chalk.red(stderr));
      exec("TITLE Seahawks Cron");
      setTimeout(run, interval);
    });
  });
};

run();