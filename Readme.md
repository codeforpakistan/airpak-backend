To Start API Using pm2 and node version 14+
```
 pm2 start  npm -- start  --interpreter=~/.nvm/versions/node/v14.7.0/bin --name='airpak'
```

### Sample API Request
```
GET http://www.weather.opendatapakistan.info/air-pak/islamabad/a/b
```

```
GET http://www.weather.opendatapakistan.info/air-pak/{city_name}/{lat}/{long}
```