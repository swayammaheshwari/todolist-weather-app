const https = require("https")

const url = process.env.WEATHER_API

function getWeatherData() {
  return new Promise((resolve, reject) => {
    let weatherDetail = {};
    https.get(url,function(response){
      response.on("data",(data)=>{
        const weatherData = JSON.parse(data);
        let city = weatherData.name
        let temp = weatherData.main.temp
        let weatherDescription = weatherData.weather[0].description
        let icon = weatherData.weather[0].icon
        weatherDetail = {
          city,
          temp,
          weatherDescription,
          icon
        }
        resolve(weatherDetail);
      })
      .on("error", (error) => {
        reject(error);
      });
    });
  });
}

module.exports = {getWeatherData}
