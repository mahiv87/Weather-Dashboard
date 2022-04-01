var searchFormEl = $('#search-form');
var searchInputEl = $('#search-input');
var searchHistory = $('#search-history');
var searchBtnEl = $('.custom-btn');
var pastBtnEl = $('.past-btn');
var dateEl = dayjs().format('dddd MM/DD/YYYY');
var weatherContainerEl = $('#weather-container');
var currentWeatherEl = $('#current-weather');
var fiveDayEl = $('#fiveday');

// Array to for local storage
var weatherData = [];

// Variable to push name data to
var nameOfCity;

function formSubmitHandler(event) {
    event.preventDefault();
    
    currentWeatherEl.attr('style', 'display: block');

    var cityName = searchInputEl.val().trim();    

    if (!cityName) {
        window.alert('You need a search value.');
        return;
    }

    historyBtnEl(cityName)
    geoCode(cityName);    
    
    function storeWeatherData() {
        localStorage.setItem('weather', JSON.stringify(weatherData));
    }

    weatherData.push(cityName);

    storeWeatherData();
}

// Function displays weather when past search buttons clicked
function renderPast(event) {
    event.preventDefault();

    currentWeatherEl.attr('style', 'display: block');

    weatherData.forEach(pastName => {
        geoCode(pastName);
    })   
}

// Function at page load to grab Names from local storage
function init() {
    var storedWeatherData = JSON.parse(localStorage.getItem('weather'));
  
    if (storedWeatherData !== null) {
      weatherData = storedWeatherData;
    }
    weatherData.forEach(pastSearch => {
        historyBtnEl(pastSearch);
    })
  }
  
  init();

//   This function dynamically creates past search buttons
function historyBtnEl(name) {
    var cityBtn = $('<button>');
    cityBtn.addClass('past-btn past-btn btn col-12 mt-1');
    cityBtn.attr('type', 'button');
    cityBtn.text(name);
    searchHistory.append(cityBtn);
}

// Function takes name of city and grabs lat and lon
function geoCode(city) {
    var geoUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + city + '&appid=d78a881d9b1f59aec0dc0e3072bf1729';

    fetch(geoUrl)
    .then(function (response) {
        if(!response.ok) {
            throw response.json();
        }
        return response.json();
    })
    .then(function (geoCoord) {
        
        var latitude = geoCoord[0].lat;
        var longitude = geoCoord[0].lon;

        searchApi(latitude, longitude);
        geoReverse(latitude, longitude);
    })
    .catch(function (error) {
        console.error(error);
    })
}

// This function takes lat and lon
// to get name of city
function geoReverse(lat, lon) {
    var geoReversUrl = 'https://api.openweathermap.org/geo/1.0/reverse?lat=' + lat + '&lon=' + lon + '&limit=2&appid=d78a881d9b1f59aec0dc0e3072bf1729'

    fetch(geoReversUrl)
    .then(function (response) {
        if(!response.ok) {
            throw response.json();
        }

        return response.json();
    })
    .then(function (reverseGeo) {
        printReverseGeo(reverseGeo);
    })
    .catch(function (error) {
        console.error(error);
    });
}

// Function fetchs weather data from OpenWeather api
function searchApi(lat, lon) {
    var currentApi = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=hourly,minutely,alerts&appid=d78a881d9b1f59aec0dc0e3072bf1729&units=imperial';

    fetch(currentApi)
    .then(function (response) {
        if(!response.ok) {
            throw response.json();
        }

        return response.json();
    })
    .then(function (searchResults) {

        printCurrentWeather(searchResults);

    })
    .catch(function (error) {
        console.error(error);
    });

}

// This function grabs name of city and adds it to nameOfCity variable
function printReverseGeo(nameReverse) {
    var reverseName = nameReverse[0].name;
       nameOfCity = reverseName;
}

// This function renders weather to page
function printCurrentWeather(currentWeatherResult){
    // Displays Current Weather
    var cityEl = $('<h2>');
    cityEl.text(nameOfCity + ' (' + dateEl + ') ');

    var iconCode = currentWeatherResult.current.weather[0].icon;
    var iconUrl = 'https://openweathermap.org/img/w/' + iconCode + '.png';
    var icon = $('<img>');
    icon.attr('src', iconUrl).attr('alt', currentWeatherResult.current.weather[0].description);

    cityEl.append(icon);
    currentWeatherEl.html('');
    currentWeatherEl.append(cityEl);

    var tempEl = $('<p>');
    tempEl.text('Temp: ' + currentWeatherResult.current.temp + '°F');
    currentWeatherEl.append(tempEl);

    var windEl = $('<p>');
    windEl.text('Wind: ' + currentWeatherResult.current.wind_speed + ' MPH');
    currentWeatherEl.append(windEl);

    var humidityEl = $('<p>');
    humidityEl.text('Humidity: ' + currentWeatherResult.current.humidity + ' %');
    currentWeatherEl.append(humidityEl);
    
    var uvEl = $('<p>');
    var uviEl = $('<span>');
    
    var uviNumber = currentWeatherResult.current.uvi
    uviEl.text(uviNumber);    
    uviEl.addClass('uv-color');
    uvEl.text('UV Index: ');    
    currentWeatherEl.append(uvEl);
    uvEl.append(uviEl);
    
    if (uviNumber <= 2) {
        $('.uv-color').attr('style', 'background-color: green; padding-block: 5px; padding-inline: 10px; border-radius: 5px;')
    } else if (uviNumber >= 3 || uviNumber <= 5) {
        $('.uv-color').attr('style', 'background-color: yellow; padding-block: 5px; padding-inline: 10px; border-radius: 5px;')
    } else if (uviNumber >= 6 || uviNumber <= 7) {
        $('.uv-color').attr('style', 'background-color: orange; padding-block: 5px; padding-inline: 10px; border-radius: 5px;') 
    } else if (uviNumber >= 8 || uviNumber <= 10) {
        $('.uv-color').attr('style', 'background-color: red; padding-block: 5px; padding-inline: 10px; border-radius: 5px;') 
    } else if (uviNumber >= 11) {
        $('.uv-color').attr('style', 'background-color: violet; padding-block: 5px; padding-inline: 10px; border-radius: 5px;') 
    }
    
    // Clear search input
    searchInputEl.val('');

    // Displays 5-Day Forecast
    fiveDayEl.attr('style', 'display: block');

    var fiveDayArr = [currentWeatherResult.daily[1],
        currentWeatherResult.daily[2],
        currentWeatherResult.daily[3],
        currentWeatherResult.daily[4],
        currentWeatherResult.daily[5],
    ]
    
    var dayCardContainer = $('.day-card-container');
    dayCardContainer.html('');

    fiveDayArr.forEach(day => {

        var dayCardSize = $('<div>');
        dayCardSize.addClass('col-12 col-sm-3 col-lg-2 my-3 ms-1');
        dayCardContainer.append(dayCardSize);
        
        var dayCard = $('<div>');
        dayCard.addClass('card text-center');
        dayCard.attr('style', 'min-width: 12rem; background-color: #0a014f;');
        dayCardSize.append(dayCard);

        var dayCardBody = $('<div>');
        dayCardBody.addClass('card-body');
        dayCard.append(dayCardBody);

        var dayCardDate = $('<h5>');
        dayCardDate.addClass('card-title');
        dayCardDate.text(dayjs.unix(day.dt).format('ddd MM/DD/YYYY'));
        dayCardDate.attr('style', 'color: #fcfcfc;');
        dayCardBody.append(dayCardDate);

        var dayCardIconCode = day.weather[0].icon;
        var dayCardIconUrl = 'https://openweathermap.org/img/w/' + dayCardIconCode + '.png';
        var dayCardIcon = $('<img>');
        dayCardIcon.attr('src', dayCardIconUrl).attr('alt', day.weather[0].description);
        dayCardBody.append(dayCardIcon);

        var dayCardTemp = $('<p>');
        dayCardTemp.text('Temp: ' + day.temp.day + '°F');
        dayCardTemp.attr('style', 'color: #fcfcfc;');
        dayCardBody.append(dayCardTemp);

        var dayCardWind = $('<p>');
        dayCardWind.text('Wind: ' + day.wind_speed + ' MPH');
        dayCardWind.attr('style', 'color: #fcfcfc;');
        dayCardBody.append(dayCardWind);
        
        var dayCardHumidity = $('<p>');
        dayCardHumidity.text('Humidity: ' + day.humidity + ' %');
        dayCardHumidity.attr('style', 'color: #fcfcfc;');
        dayCardBody.append(dayCardHumidity);
    });
}

// Hides Elements on page start
currentWeatherEl.attr('style', 'display: none');
fiveDayEl.attr('style', 'display: none');

// Event Listeners
searchHistory.on('click', '.past-btn', renderPast);
searchFormEl.on('submit', formSubmitHandler);