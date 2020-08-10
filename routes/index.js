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
    totalPollenCount: null
  };
  //method returns a promise that resolves after all of the given promises have either fulfilled or rejected
  Promise.all([
    axios.get('http://ec2-3-23-111-60.us-east-2.compute.amazonaws.com:5000/pollendetails/' + req.params.city),
    axios.get('http://api.openweathermap.org/data/2.5/weather?q=' + req.params.city.toLowerCase() + '&APPID=624b9990964f6e8bc6fb390a87172ce3')
  ]).
  then((results) => {
    console.log(results,'rr')
    if(results && results.length > 0) {
      const pollenRequest = results[0];
      if(pollenRequest && pollenRequest.data && pollenRequest.data.islamabad) {
        const islamabad = pollenRequest.data.islamabad;
        payload.totalPollenCount = islamabad[islamabad.length - 1]['h-8']
      }
      const weatherRequest = results[1];
      if(weatherRequest && weatherRequest && weatherRequest.data && weatherRequest.data.main) {
        payload.temprature = weatherRequest.data.main;
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
