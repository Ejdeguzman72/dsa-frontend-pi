const restaurantListContainer = document.getElementById('restaurantList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const addModalButton = document.getElementById('addModalButton');
const myAddModal = document.getElementById('myAddModal');
const submitBtn = document.getElementById('submitBtn');
let restaurantTypesDropdown;

// Pagination
const itemsPerPage = 5;

let currentPage = 1;
let restaurants = [];
let restaurantTypes = [];

// Fetch medical office list using Axios
const fetchRestaurantList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/restaurants/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching restaurant list:', error.message);
        return [];
    }
};

const fetchRestaurantTypes = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/restaurant-types/all');
        restaurantTypes = response.data.list;
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
        <button onClick="updateEntry(${restaurant.restaurantId})" class="update-button">Update</button>
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

        await axios.delete(`http://localhost:8080/app/restaurants/delete/${restaurantId}`);

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

        const data = {
            name: name,
            address: address,
            city: city,
            state: state,
            zip: zip,
            restaurantTypeId: restaurantTypeId
        };

        const response = await axios.post('http://localhost:8080/app/restaurants/add', data);

        console.log('Entry added successfully:', response.data);

        myAddModal.style.display = 'none';

        restaurantEntries = await fetchRestaurantList();
        renderRestaurantList(restaurantEntries, currentPage);
    } catch (error) {
        console.error('Error submitting restaurant information:', error.message);
    }
}

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
};

// Initialize page
const initPage = async () => {
    restaurants = await fetchRestaurantList();
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
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderRestaurantList(restaurants, currentPage);
};

// Initialize the page
initPage();
