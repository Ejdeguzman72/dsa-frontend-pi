// Inside the <script> tag in your HTML file

document.addEventListener("DOMContentLoaded", function () {
    // Select dropdown element
    const dropdown = document.getElementById("entertainmentTypesDropdown");
  
    // Axios request to fetch data from the server
    axios.get('http://localhost:8080/app/entertainment-types/all')
      .then(function (response) {
        // Handle the successful response
        const entertainmentTypes = response.data;
  
        // Populate the dropdown with options
        entertainmentTypes.forEach(type => {
          const option = document.createElement("option");
          option.value = type.entertainmentTypeId; // Set the value to entertainmentTypeId
          option.text = type.descr; // Set the text to the description
          dropdown.add(option);
        });
      })
      .catch(function (error) {
        // Handle errors
        console.error('Error fetching data:', error);
      });
  });
  