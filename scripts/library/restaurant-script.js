const restaurantListContainer = document.getElementById('restaurantList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

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

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let restaurants = {};

// Open modal with auto repair shop details
const openModal = (restaurant) => {
    modalContent.innerHTML = `
        <h2>${restaurant.name}</h2>
        <p>Address: ${restaurant.address}</p>
        <p>City: ${restaurant.city}</p>
        <p>State: ${restaurant.state}</p>
        <p>Zip: ${restaurant.zip}</p>
        <p>Type: ${restaurant.descr}</p>
        <button onClick="updateEntry(${restaurant.restaurantId})">Update</button>
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


// Close modal
closeBtn.onclick = () => {
    modal.style.display = 'none';
};

// Close modal if clicked outside the modal
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
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
