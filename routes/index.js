var express = require('express');
var router = express.Router();
const ls = require('local-storage');
const axios = require('axios');
var helperService = require('../services/helperService');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/air-pak/:city/:lat/:lon', async function (req, res) {
  if (!req.params.city) {
    res.status(404).send({ 'msg': 'Please provide the city name' });
  }
  let cityInfo = null;
  let cityName = req.params.city.toLowerCase();
  if(req.params.lat && req.params.lon) {
    cityInfo = helperService.getCityNameByLatLon(req.params.lat,req.params.lon);
    if(cityInfo) {
     cityInfo.name = cityInfo.name.toLowerCase();
     cityName = cityInfo.name;
     console.info('found city name against lat lon', cityName);
    }
  } else {
    //get all city info along with lat, long and ids
    cityInfo = helperService.getCityIdByName(cityName);
    cityInfo.name = cityInfo.name.toLowerCase();
  }
  // in case we don't have city information in json list
  if(!cityInfo) {
    cityInfo = {
      id: null,
      name: cityName,
      state: '',
      country: '',
      coord: {
        lat: req.params.lat,
        lon: req.params.lon
      }
    }
  };
  //ip from which we get the request
  cityInfo.ip = req.connection.remoteAddress;
  let cacheResult = {};
  cacheResult = ls.get('payload' + cityName);
  if (cacheResult && cacheResult.currentTemperature) {
    console.log('data from cache')
    return res.status(200).send(cacheResult);
  }
  console.log('data from API')
  try {
    const result = await getData(cityInfo);
    ls.set('payload' + cityName, result);
    cacheResult = ls.get('payload' + cityName);
    return res.status(200).send(cacheResult);
  } catch (error) {
    console.error(error, 'error');
    return res.status(404).send(error);
  }
});

function getData(data) {
  return new Promise((resolve, reject) => {
    const payload = {
      cityName: null,
      totalPollenCount: null,
      temperature: {},
      currentTemperature: null,
      minTemperature: null,
      maxTemperature: null,
      airQuality: {},
      aqius: null,
    };
    //method returns a promise that resolves after all of the given promises have either fulfilled or rejected
    Promise.allSettled([
      axios.get('http://ec2-3-23-111-60.us-east-2.compute.amazonaws.com:5000/pollendetails/' + data.name),
      axios.get('http://api.openweathermap.org/data/2.5/weather?lat=' + data.coord.lat + '&lon=' + data.coord.lon  + '&units=metric&APPID=624b9990964f6e8bc6fb390a87172ce3'),
      data.coord && data.coord.lat 
      ? axios.get('http://api.airvisual.com/v2/nearest_city?lat=' + data.coord.lat + '&lon='+ data.coord.lon + '&key=dd32c20f-28a1-409c-9023-52eac0fcde2d') 
      : axios.get('http://api.airvisual.com/v2/nearest_city?lat=&key=dd32c20f-28a1-409c-9023-52eac0fcde2d', {
        headers: {
          'x-forwarded-for': data.ip
        }
      })
    ]).then(async (results) => {
        payload.cityName = data.name;
        if (results && results.length > 0) {
          //pollen count
          const cityData = await results[0]?.value?.data?.islamabad;
          payload.totalPollenCount = cityData && cityData.length > 0 ? cityData[cityData.length -1]['h-8'] : null;
          //weather
          payload.temperature = await results[1]?.value?.data?.main;
          payload.currentTemperature = payload.temperature?.temp;
          payload.minTemperature = payload.temperature?.temp_min;
          payload.maxTemperature = payload.temperature?.temp_max;
          //airVisual aqius
          payload.airQuality = await results[2]?.value?.data;
          payload.aqius = payload.airQuality?.data?.current?.pollution?.aqius
        }
        console.log(payload);
        return resolve(payload);
      })
  }).catch(err => {
    throw err;
  })
}

module.exports = router;
