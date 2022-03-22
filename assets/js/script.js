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

// Fetch and display conditions/forecast
