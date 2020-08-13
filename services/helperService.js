let cities = [];
var fs = require('fs');
var controller = {};

var readJson = (path, cb) => {
  fs.readFile(require.resolve(path), (err, data) => {
    if (err)
      cb(err)
    else
      cb(null, JSON.parse(data))
  })
}

readJson('./city.list.json', (err, data) => {
  cities = data;
})

controller.getCityIdByName = function(name) {
  return cities.find(each => each.name.toLowerCase() === name);
}

module.exports = controller;