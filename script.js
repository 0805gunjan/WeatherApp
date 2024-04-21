let cityInput= document.getElementById('input_city'),
searchbtn = document.getElementById('searchbtn'),
api_key= '483f616e813c4d21f1f08d7c7fc65fc4';
currentWeatherCard = document.querySelectorAll('.weather-left .card')[0],
windspeedVal = document.getElementById('windspeedVal'),
humidityVal = document.getElementById('humidityVal'),
dayCard = document.querySelector('.loc'),
sunriseCard = document.querySelector('.highlights .card1'),
hourlyForecastCard = document.querySelector('.hourlyforecast'),
fiveDaysForecastCard = document.querySelector('.highlights .currentforecast');

function getWeatherDetails(name, lat, lon, country, state){
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
    WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
    days = [
        `Sunday`,
        `Monday`,
        `Tuesday`, 
        `Wednesday`,
        `Thursday`,
        `Friday`,
        `Saturday`
    ],
    months = [
        `Jan`, `Feb`, `March`, `April`, `May`, `June`, `July`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`
    ];

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        let date = new Date();
        currentWeatherCard.innerHTML = `
        <div class="currentweather">
            <div class="details">
               <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
               <p>${data.weather[0].description}</p>
            </div>
            <div class="weather-icon">
               <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
            </div>
        </div>
        `;
        let {sunrise, sunset} = data.sys,
        {timezone, humidity} = data.main,
        {speed} = data.wind,
        sRiseTime = new Date(sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        sSetTime = new Date(sunset* 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        sunriseCard.innerHTML = `
        <div class="sunrise">
            <h2>Sunrise & Sunset</h2>
            <h3><i class="fa-regular fa-sun"></i></h3>
            <p>${sRiseTime}</p>
            <h3><i class="fa-regular fa-moon"></i></h3>
            <p>${sSetTime}</p>
        </div>
        `;
        windspeedVal.innerHTML = `
            <h3 id="windspeedVal"><i class="fa-solid fa-location-arrow"></i> ${speed}m/s</h3>
        `;
        humidityVal.innerHTML = `
        <h3 id="humidityVal">${humidity}%</h3>
        `;
    }).catch(() => {
        alert(`Failed to catch current weather`);
    })

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        let date = new Date();
        dayCard.innerHTML = `
        <div class="date">
            <h2>Date and Location</h2>
            <hr>
            <p><i class="fa-regular fa-calendar"></i>${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]}, ${date.getFullYear()}</p>
            <p><i class="fa-solid fa-location-dot"></i>${name}, ${country}</p>
        </div>
        `;
    }).catch(() => {
        alert(`Failed to catch weather date and location`);
    })

    fetch(FORECAST_API_URL).then(res => res.json()).then(data =>{
        let hourlyforecast = data.list;
        hourlyForecastCard.innerHTML = ``;
        for(i=0; i<4; i++){
            let hrForecastDate = new Date(hourlyforecast[i].dt_txt);
            let hr = hrForecastDate.getHours();
            let a = 'PM';
            if(hr < 12) a = 'AM';
            if(hr == 0) hr = 12;
            if(hr > 12) hr = hr - 12;
            hourlyForecastCard.innerHTML += `
                <div class="card">
                    <p>${hr} ${a}</p>
                    <img src="http://openweathermap.org/img/wn/${hourlyforecast[i].weather[0].icon}.png" alt="">
                    <p>${(hourlyforecast[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
                 </div>
            `;
        }

        let uniqueForecasteDys = [];
        let fivedaysForecast = data.list.filter(forecast => {
            let forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecasteDys.includes(forecastDate)){
                return uniqueForecasteDys.push(forecastDate);
            }
        })
        fiveDaysForecastCard.innerHTML = `
        <div class="card-header">
            <h4><i class="fa-regular fa-calendar"></i> 5 day forecast</h4>
            <hr>
         </div>
         `;
        for(i=0; i< fivedaysForecast.length; i++){
            let date = new Date(fivedaysForecast[i].dt_txt);
            fiveDaysForecastCard.innerHTML += `
            
                <div class="dayforecast">
                    <p>${date.getDate()} ${months[date.getMonth()]}</p>
                    <p>${days[date.getDay()]}</p>
                    <h3>${(fivedaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</h3>
                    <img src="http://openweathermap.org/img/wn/${fivedaysForecast[i].weather[0].icon}@2x.png" alt="">
                </div>
            `;
        }
    }).catch(() => {
        alert(`Failed to catch weather forecast`);
    })
}

function getCityCoordinates(){
    let cityName = cityInput.value.trim();
    cityInput.value = '';
    if(!cityName) return;
    let GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        let {name, lat, lon, country, state} = data[0];
        getWeatherDetails(name, lat, lon, country, state);
    }).catch(() => {
        alert(`Failed to catch coordinates of ${cityName}`);
    });
}

function getUserCordinates(){
    navigator.geolocation.getCurrentPosition(position => {
        let {latitude, longitude} = position.coords;
        let REVERSE_CODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=${api_key}`;

        fetch(REVERSE_CODING_URL).then(res => res.json()).then(data => {
            let {name, country, state} = data[0];
            getWeatherDetails(name, latitude, longitude, country, state);
        }).catch(() => {
            alert(`Failed to fetch user cordinates`);
        });
    });
}

searchbtn.addEventListener('click', getCityCoordinates);
locbtn.addEventListener('click', getUserCordinates);