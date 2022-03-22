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
        getFiveDayForecast(event);
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