var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/air-pak/:city/:lat/:long', function(req, res) {
  if(!req.params.city) {
    res.status(404).send({'msg': 'Please provide the city name'});
  }
  const payload = {
    totalPollenCount: null,
    temperature: {},
    currentTemperature: null,
    minTemperature: null,
    maxTemperature: null,
    airQuality: 200
  };
  //method returns a promise that resolves after all of the given promises have either fulfilled or rejected
  Promise.allSettled([
    axios.get('http://ec2-3-23-111-60.us-east-2.compute.amazonaws.com:5000/pollendetails/' + req.params.city),
    axios.get('http://api.openweathermap.org/data/2.5/weather?q=' + req.params.city.toLowerCase() + '&APPID=624b9990964f6e8bc6fb390a87172ce3')
  ]).
  then((results) => {
    if(results && results.length > 0) {
      if(results[0] && results[0].value && results[0].status === 'fulfilled') {
        const pollenRequest = results[0].value.data;
        payload.totalPollenCount = pollenRequest.islamabad ? pollenRequest.islamabad[pollenRequest.islamabad.length - 1]['h-8']: null;
      }
      if(results[1] && results[1].value && results[1].status === 'fulfilled') {
        const weatherRequest = results[1].value.data;
        payload.temprature = weatherRequest ? weatherRequest.main : {};
        if(payload.temprature) {
          payload.currentTemperature = payload.temprature.temp;
          payload.minTemperature = payload.temprature.temp_min;
          payload.maxTemperature = payload.temprature.temp_max;
        }
      }
    }
    res.status(200).send({msg: payload})
  })
  .catch(err => {
    console.error(err); 
    res.status(500).send({msg: err});
  })
});

module.exports = router;
