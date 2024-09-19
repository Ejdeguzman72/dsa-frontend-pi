const restaurantListContainer = document.getElementById('restaurantList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const addModalButton = document.getElementById('addModalButton');
const myAddModal = document.getElementById('myAddModal');
const submitBtn = document.getElementById('submitBtn');
const updateModal = document.getElementById('myUpdateModal');
const updateModalContent = document.getElementById('updateModalContent');
// const updateCloseBtn = document.getElementById('updateCloseBtn');
const updateSubmitBtn = document.getElementById('updateSubmitBtn');
const restaurantChart = document.getElementById('restaurantChart');
let restaurantFilterDropdown = document.getElementById('restaurant-filter');
let restaurantTypesDropdown;

// Pagination
const itemsPerPage = 5;

let currentPage = 1;
let restaurants = [];
let restaurantTypes = [];
let updatedRestaurantDetails = {};
let restaurantCategoryData = [];

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch medical office list using Axios
const fetchRestaurantList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://localhost:8080/app/restaurants/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching restaurant list:', error.message);
        return [];
    }
};

const categorizeRestaurants = () => {
    const categories = {}; // Object to store restaurant categories and their counts

    // Loop through restaurants
    for (let i = 0; i < restaurants.length; i++) {
        const category = getCategory(restaurants[i]); // Assume you have a function getCategory that returns the category of a restaurant
        // Increment the count for this category
        categories[category] = (categories[category] || 0) + 1;
    }

    // Extracting category names and counts for chart data
    const categoryNames = Object.keys(categories);
    const categoryCounts = Object.values(categories);

    // Creating the bar chart
    new Chart("restaurantChart", {
        type: "bar",
        data: {
            labels: categoryNames, // Category names on x-axis
            datasets: [{
                data: categoryCounts, // Counts on y-axis
                backgroundColor: "rgba(0,0,255,0.5)" // Bar color
            }]
        },
        options: {
            legend: {display: false},
            title: {
                display: true,
                text: "Restaurant Categories"
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

// Example function to get the category of a restaurant
function getCategory(restaurant) {
    // Assuming the category is stored in the 'category' property of the restaurant object
    return restaurant.descr;
}


const fetchRestaurantById = async (restaurantId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://localhost:8080/app/restaurants/restaurant/search/id/${restaurantId}`);
        return response.data.restaurant;
    } catch (error) {
        console.error('Error fetching restaurant list:', error.message);
        return {};
    }
}

const fetchRestaurantTypes = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://localhost:8080/app/restaurant-types/all');
        if (Array.isArray(response.data.list)) {
            restaurantTypes = response.data.list
        } else {
            console.error('Expected list of restaurant types but got:', response.data.list);
            return [];
        }
    } catch (error) {
        console.error('Error fetching restaurant type list:', error.message);
        return [];
    }
}

const fetchRestaurantTypesForFilter = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://localhost:8080/app/restaurant-types/all');
        if (Array.isArray(response.data.list)) {
            return response.data.list
        } else {
            console.error('Expected list of restaurant types but got:', response.data.list);
            return [];
        }
    } catch (error) {
        console.error('Error fetching restaurant type list:', error.message);
        return [];
    }
}

const fetchRestaurantTypesDropdown = () => {
    restaurantTypesDropdown.innerHTML = '';

    restaurantTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type.restaurantTypeId;
        option.text = type.descr;
        restaurantTypesDropdown.add(option);
    });
};

const renderRestaurantTypeFilter = async () => {
    const filterTypes = await fetchRestaurantTypesForFilter();
    if (!Array.isArray(filterTypes)) {
        console.error('Expected an array of restaurant types but got:', filterTypes);
        return;
    }
    restaurantFilterDropdown.innerHTML = '<option value="">All Recipes</option>';
    filterTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type.restaurantTypeId;
        option.text = type.descr;
        restaurantFilterDropdown.add(option);
    });
}

// Render restaurant list items
const renderRestaurantList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const entriesToDisplay = entries.slice(startIdx, endIdx);

    restaurantListContainer.innerHTML = '';

    entriesToDisplay.forEach((entry, index) => {
        const restaurantElement = document.createElement('div');
        restaurantElement.classList.add('restaurant-element');
        restaurantElement.dataset.index = startIdx + index;

        const nameElement = document.createElement('h3');
        nameElement.textContent = `${entry.name} - ${entry.city}, ${entry.state}`;


        restaurantElement.appendChild(nameElement);

        restaurantElement.addEventListener('click', () => openModal(entry));

        restaurantListContainer.appendChild(restaurantElement);
    });
};

// Open modal with auto repair shop details
const openModal = (restaurant) => {
    modalContent.innerHTML = `
        <h2>${restaurant.name}</h2><hr />
        <p>Address: ${restaurant.address}</p>
        <p>City: ${restaurant.city}</p>
        <p>State: ${restaurant.state}</p>
        <p>Zip: ${restaurant.zip}</p>
        <p>Type: ${restaurant.descr}</p>
        <button onClick="openUpdateModal(${restaurant.restaurantId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${restaurant.restaurantId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

const confirmDeleteEntry = (restaurantId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(restaurantId);
    }
};

// Function to handle entry deletion
const deleteEntry = async (restaurantId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://localhost:8080/app/restaurants/delete/${restaurantId}`);

        // Optionally, you can reload the restaurant list after deletion
        entries = await fetchRestaurantList();
        renderRestaurantList(entries, currentPage);

        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting restaurantId:', error.message);
    }
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = async () => {
    addModalContent.innerHTML = `
    <h2>Add Restaurant Information</h2><hr />
    <div class="modal-body">
        <input class="input" type="text" name="name" placeholder="Restaurant Name" /><br />
        <input class="input" type="text" name="address" placeholder="Address" /><br />
        <input class="input" type="text" name="city" placeholder="City" /><br />
        <input class="input" type="text" name="state" placeholder="State" /><br />
        <input class="input" type="text" name="zip" placeholder="Zipcode" /><br />
        <label for="entertainmentTypesDropdown">Select Restaurant Type:</label>
        <select id="restaurantTypesDropdown" name="restaurantTypeId"></select> <!-- New dropdown element -->
    </div><hr />
    <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
    <script>
        submitBtn.addEventListener('click', () => submitInfo())
    </script>
    `;
    restaurantTypesDropdown = document.getElementById('restaurantTypesDropdown')

    await fetchRestaurantTypes();

    renderPagination();
    fetchRestaurantTypesDropdown();

    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        const name = document.querySelector('input[name="name"]').value;
        const address = document.querySelector('input[name="address"]').value;
        const city = document.querySelector('input[name="city"]').value;
        const state = document.querySelector('input[name="state"]').value;
        const zip = document.querySelector('input[name="zip"]').value;
        const restaurantTypeId = document.querySelector('select[name="restaurantTypeId"]').value;

        if (!name || !address || !city || !state || !zip || !restaurantTypeId) {
            throw new Error("Please fill in all required fields.");
        }

        const data = {
            name: name,
            address: address,
            city: city,
            state: state,
            zip: zip,
            restaurantTypeId: restaurantTypeId
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.post('http://localhost:8080/app/restaurants/add', data);

        console.log('Entry added successfully:', response.data);

        myAddModal.style.display = 'none';

        restaurants = await fetchRestaurantList();
        renderRestaurantList(restaurants, currentPage);
    } catch (error) {
        console.error('Error submitting restaurant information:', error.message);
    }
}

const openUpdateModal = async (restaurantId) => {
    try {
        updatedRestaurantDetails = await fetchRestaurantById(restaurantId);
        if (updatedRestaurantDetails) {
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Restaurant Information</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="text" id="updateRestaurantName" placeholder="Restaurant Name" value="${updatedRestaurantDetails.name}" />
            <input class="input" type="text" id="updateAddress" placeholder="Address" value="${updatedRestaurantDetails.address}" /><br />
            <input class="input" type="text" id="updateCity" placeholder="City" value="${updatedRestaurantDetails.city}" /><br />
            <input class="input" type="text" id="updateState" placeholder="State" value="${updatedRestaurantDetails.state}" /><br />
            <input class="input" type="text" id="updateZip" placeholder="Zipcode" value="${updatedRestaurantDetails.zip}" /><br />
            <select id="restaurantTypesDropdown" name="restaurantTypeId"></select>
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updatedRestaurantDetails.restaurantId})">Update</button><br /><br />
    `;
            updateModal.style.display = 'block';
            restaurantTypesDropdown = document.getElementById('restaurantTypesDropdown')

            await fetchRestaurantTypes();
            fetchRestaurantTypesDropdown();
        } else {
            console.error('Error fetching restaurant details')
        }
    } catch (error) {
        console.error('Error opening update model:', error.message);
    }
};

// Function to submit the update
const submitUpdate = async (restaurantId) => {
    try {
        const updateRestaurantName = document.getElementById('updateRestaurantName').value;
        const updateAddress = document.getElementById('updateAddress').value;
        const updateCity = document.getElementById('updateCity').value;
        const updateState = document.getElementById('updateState').value;
        const updateZip = document.getElementById('updateZip').value;
        const updateRestaurantTypeId = document.getElementById('restaurantTypesDropdown').value;

        // Validate the required fields if needed

        const data = {
            restaurantId: restaurantId,
            name: updateRestaurantName,
            address: updateAddress,
            city: updateCity,
            state: updateState,
            zip: updateZip,
            restaurantTypeId: updateRestaurantTypeId
        };

        console.log(data);

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.put(`http://localhost:8080/app/restaurants/update/${data.restaurantId}`, data);

        console.log('Restaurant updated successfully:', response);

        updateModal.style.display = 'none';

        restaurants = await fetchRestaurantList();
        renderRestaurantList(restaurants, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error updating restaurant information:', error.message);
        // Handle errors or provide feedback to the user
    }
};

// Close modal
closeBtn.onclick = () => {
    modal.style.display = 'none';
};

// Close modal if clicked outside the modal
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }

    if (event.target === myAddModal) {
        myAddModal.style.display = 'none';
    }

    if (event.target === updateModal) {
        updateModal.style.display = 'none';
    }
};

// Initialize page
const initPage = async () => {
    renderRestaurantTypeFilter();
    restaurants = await fetchRestaurantList();
    categorizeRestaurants();
    renderRestaurantList(restaurants, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(restaurants.length / itemsPerPage);
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => onPageClick(i));
        paginationContainer.appendChild(button);
    }
    const hrElement = document.createElement('hr');
    paginationContainer.appendChild(hrElement);
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderRestaurantList(restaurants, currentPage);
};

// Initialize the page
initPage();