const vehicleListContainer = document.getElementById('vehicleList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

// Fetch vehicle list using Axios
const fetchVehicleList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/vehicles/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching vehicle list:', error.message);
        return [];
    }
};

// Render vehicle list items
const renderVehicleList = (vehicleList, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const vehiclesToDisplay = vehicleList.slice(startIdx, endIdx);

    vehicleListContainer.innerHTML = '';

    vehiclesToDisplay.forEach((vehicle, index) => {
        const vehilceElement = document.createElement('div');
        vehilceElement.classList.add('vehicle-element');
        vehilceElement.dataset.index = startIdx + index;

        const entryElement = document.createElement('h3');
        entryElement.textContent = `${vehicle.year} - ${vehicle.make} ${vehicle.model}`;

        vehilceElement.appendChild(entryElement);

        vehilceElement.addEventListener('click', () => openModal(vehicle));

        vehicleListContainer.appendChild(vehilceElement);
    });
};

const confirmDeleteEntry = (vehicleId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(vehicleId);
    }
};

// Function to handle entry deletion
const deleteEntry = async (vehicleId) => {
    try {
        
        await axios.delete(`http://localhost:8080/app/vehicles/delete/${vehicleId}`);
        
        // Optionally, you can reload the vehicleId list after deletion
        entries = await fetchVehicleList();
        renderVehicleList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting vehicleId:', error.message);
    }
};


// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let vehicles = {};

// Open modal with music details
const openModal = (vehicle) => {
    modalContent.innerHTML = `
        <h2>${vehicle.year} ${vehicle.make} ${vehicle.model} </h2><hr />
        <p>Transmission: ${vehicle.transmission}</p>
        <p>Capacity: ${vehicle.capacity}</p>
        <button onClick="updateEntry(${vehicle.vehicleId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${vehicle.vehicleId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
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
    vehicles = await fetchVehicleList();
    renderVehicleList(vehicles, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(vehicles.length / itemsPerPage);
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
    renderVehicleList(vehicles, currentPage);
};

// Initialize the page
initPage();
