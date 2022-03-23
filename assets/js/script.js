// Global Variables
var apiKey = "428d8c67a7b8557196b90d4ff04fd043";
var searchedCity = "";
var priorCity = "";

// Error Handling
var errorHandler = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

// Fetch conditions/forecast
var getWeatherCurrent = (event) => {
    let city = $('#search').val();
    currentCity = $('#search').val();
    
    //fetch
    let apiURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + apiKey;
    fetch(apiURL) 
    .then(errorHandler)
    .then((response) => {
        return response.json();
    })
    .then((response) => {  //save
        saveSearch(city);
        $('#search-error').text("");

        let currentIcon = "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png"; //pull weather icon

        // moment.js UTC convert
        let timeUTC = response.dt;
        let timezone = response.timezone;
        let timezoneOffset = timezone/60/60;
        let currentTime = moment.unix(timeUTC).utc().utcOffset(timezoneOffset);

        // data for forecast
        renderCities();
        getForecast(event);
        $('#header').text(response.name);
        let currentWeatherHTML = `
        <h3>${response.name} ${currentTime.format("(MM/DD/YY)")}<img src="${currentIcon}"></h3>
        <ul class="list">
            <li>Temp: ${response.main.temp}&#8457;</li>
            <li>Humidity: ${response.main.humidity}%</li>
            <li>Wind Speed: ${response.wind.speed} mph</li>
            <li id="uvIndex">UV Index:</li>
        </ul>`;
        $('#current-forecast').html(currentWeatherHTML);
        
        // UV data
        let longitude = response.coord.lon;
        let latitude = response.coord.lat;
        let uvQueryURL = "api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&APPID=" + apiKey;
        fetch(uvQueryURL)
        .then(errorHandler)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
            let uvIndex = response.value;
            $('#uvIndex').html(`UV Index: <span id="uvValue">${uvIndex}</span>`);
            if (uvIndex >= 0 && uvIndex < 3) {
                $('#uvValue').attr("class", "uvGood");
            } else if (uvIndex >= 3 && uvIndex < 8) {
                $('#uvValue').attr("class", "uvEh");
            } else if (uvIndex >= 8) {
                $('#uvValue').attr("class", "uvBad");
            }
        });
    });
}

var getForecast = (event) => {
    let city = $('#search').val();
    let apiURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + apiKey;
    fetch(apiURL)
    .then(errorHandler)
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        let forecastHTML = `
        <h2>Five Day Forecast:</h2>
        <div id="forecastUl" class="d-inline-flex flex-wrap">
        `;
        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset/60/60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/w/" + dayData.weather[0].icon + ".png";

            if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
                forecastHTML += `
                <div class="day-card card m-2 p0">
                    <ul class="list p-3">
                        <li>${thisMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayData.main.temp}&#8457;</li>
                        <br></br>
                        <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }
        forecastHTML += `</div>`;
        $(`#five-day-forecast`).html(forecastHTML);
    })
}

// storing cities
var history = (newCity) => {
    let usedCity = false;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            usedCity = true;
            break;
        }
    }

    if(usedCity === false) {
        localStorage.setItem('cities' + localStorage.length, usedCity);
    }
}

var renderCities = () => {
    $('#search-history').empty();
    if (localStorage.length === 0) {
        if (priorCity) {
            $('#search').attr("value", priorCity);
        } else {
           let lastCityKey = "cities" + (localStorage.length - 1);
           lastCity = localStorage.getItem(lastCityKey);

           for (let i = 0; i < localStorage.length; i) {
               let city = localStorage.getItem("cities" + i);
               let cityEl;

               if (searchedCity = "") {
                   searchedCity = lastCity;
               }
               if (city === searchedCity) {
                   cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
               } else {
                   cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
               }
               $("#search-history").prepend(cityEl);
           }

           if (localStorage.length > 0) {
               $('#clear-history').html($('<a id="clear-history" href="#">clear</a>'));
           } else {
               $('#clear-history').html('');
           }
            
        }
    }
}

