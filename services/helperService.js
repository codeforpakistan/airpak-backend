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

controller.getCityNameByLatLon = function(lat,lon) {
  try {
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    let distanceObj = [];
    cities.forEach(eachCity => {
      distanceObj.push({ 
        distance: calculateDistance(lon, lat, eachCity.coord.lon, eachCity.coord.lat), name: eachCity.name,
        coord: {
          lon: eachCity.coord.lon,
          lat: eachCity.coord.lat
        }
      });
    });
    distanceObj = distanceObj.sort(function(a,b) {
      return parseInt(a.distance) - parseInt(b.distance)
    });
    const minDistance = distanceObj.hasMin('distance');
    return minDistance;
  } catch (error) {
    console.error('Error finding city by lat lon', error);
    return null;
  }
}

Array.prototype.hasMin = function(attrib) {
  return (this.length && this.reduce(function(prev, curr){ 
      return prev[attrib] < curr[attrib] ? prev : curr; 
  })) || null;
}

function calculateDistance(lon, lat, long1, lat1) {
  erdRadius = 6371;
  lon = lon * (Math.PI / 180);
  lat = lat * (Math.PI / 180);
  long1 = long1 * (Math.PI / 180);
  lat1 = lat1 * (Math.PI / 180);
  x0 = lon * erdRadius * Math.cos(lat);
  y0 = lat * erdRadius;
  x1 = long1 * erdRadius * Math.cos(lat1);
  y1 = lat1 * erdRadius;
  dx = x0 - x1;
  dy = y0 - y1;
  d = Math.sqrt((dx * dx) + (dy * dy));
  return Math.round(d * 1000);
};

module.exports = controller;