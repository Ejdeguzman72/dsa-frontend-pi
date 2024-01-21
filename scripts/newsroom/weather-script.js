document.addEventListener('DOMContentLoaded', function () {
    // Make an HTTP request to fetch the JSON data using Axios
    axios.get('http://192.168.1.36:8081/app/weather/city/New York')
        .then(response => {
            // Call the renderWeatherInfo function with the received data
            renderWeatherInfo(response.data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
});

function renderWeatherInfo(data) {
    const weatherInfoContainer = document.getElementById('weather-info');
    
    // Extract relevant information from the JSON data
    const cityName = data.name;
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const windSpeed = data.wind.speed;

    // Create HTML structure for weather information
    const htmlContent = `
        <p>Current Location: ${cityName}</p>
        <p>Temperature: ${temperature} K</p>
        <p>Description: ${description}</p>
        <p>Wind Speed: ${windSpeed} m/s</p>
    `;

    // Set the HTML content in the container
    weatherInfoContainer.innerHTML = htmlContent;
}
