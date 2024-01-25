const vehicleListContainer = document.getElementById('vehicleList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const myAddModal = document.getElementById('myAddModal');
const addModalCloseBtn = document.getElementById('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');


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

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Vehicle Information</h2><hr />
        <input class="input" type="text" name="make" placeholder="Manufacturer Name" />
        <input class="input" type="text" name="model" placeholder="Model Name" /><br />
        <input class="input" type="text" name="year" placeholder="Model Year" /><br />
        <select name="transmission">
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
        </select><br />
        <select name="capacity">
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="8">8</option>
        </select><br />
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button>
        <script>submitBtn.addEventListener('click', () => submitInfo())</script>
    `;
    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        // Get book information from the form or wherever it's stored
        const make = document.querySelector('input[name="make"]').value;
        console.log(make)
        const model = document.querySelector('input[name="model"]').value;
        console.log(model);
        const year = document.querySelector('input[name="year"]').value;
        const transmission = document.querySelector('select[name="transmission"]').value;
        const capacity = document.querySelector('select[name="capacity"]').value;

        // Validate the required fields if needed

        // Create a data object with the book information
        const data = {
            make: make,
            model: model,
            year: year,
            transmission: transmission,
            capacity: capacity
        };

        // Send a POST request to add the book information
        const response = await axios.post('http://localhost:8080/app/vehicles/add', data);

        // Optionally, handle the response or perform additional actions
        console.log('vehicle added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        vehicles = await fetchVehicleList();
        renderVehicleList(vehicles, currentPage);
    } catch (error) {
        console.error('Error submitting vehicle information:', error.message);
        // Handle errors or provide feedback to the user
    }
}

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

    if (event.target === myAddModal) {
        myAddModal.style.display = 'none';
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
