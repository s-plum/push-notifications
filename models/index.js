var fs = require('fs'),
    path = require('path');

fs.readdirSync(__dirname).forEach(function(file) {
  require('./' + file);
});