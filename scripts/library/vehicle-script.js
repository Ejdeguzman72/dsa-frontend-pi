const vehicleListContainer = document.getElementById('vehicleList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const myAddModal = document.getElementById('myAddModal');
const addModalCloseBtn = document.getElementById('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');
const updateModal = document.getElementById('myUpdateModal');
const updateModalContent = document.getElementById('updateModalContent');
// const updateCloseBtn = document.getElementById('updateCloseBtn');
const updateSubmitBtn = document.getElementById('updateSubmitBtn');
let vehicleManufacturerFilterDropdown = document.getElementById('vehicle-make-filter');
let vehicleYearFilterDropdown = document.getElementById('vehicle-year-filter');
let vehicleTransmissionFilterDropdown = document.getElementById('vehicle-transmission-filter');
// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let vehicles = {};
let updatedVehicleDetails = {};

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        console.log('Retrieved token:', token);
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch vehicle list using Axios
const fetchVehicleList = async (make, year, transmission) => {
    try {
        const jwtToken = await retrieveJwt();
        let response;
        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        makeSelectedType = vehicleManufacturerFilterDropdown.value;
        yearType = vehicleYearFilterDropdown.value;
        transmissionType = vehicleTransmissionFilterDropdown.value;

        if (makeSelectedType && makeSelectedType != null) {
            response = await axiosWithToken.get(`http://192.168.1.36:8080/app/vehicles/all/make/${makeSelectedType}`);
        } else if (yearType && yearType != null) {
            response = await axiosWithToken.get(`http://192.168.1.36:8080/app/vehicles/all/year/${yearType}`);
        } else {
            response = await axiosWithToken.get('http://192.168.1.36:8080/app/vehicles/all');
        }

        return response.data.list;
    } catch (error) {
        console.error('Error fetching vehicle list:', error.message);
        return [];
    }
};

const fetchVehicleManufacturers = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/vehicles/all');
        const vehicles = response.data.list;
        const manufacturersList = [...new Set(vehicles.map(vehicle => vehicle.make))];
        return manufacturersList;
    } catch (error) {
        console.error('Error fetching vehicle list:', error.message);
        return [];
    }
}

const fetchVehicleYear = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/vehicles/all');
        const vehicles = response.data.list;
        const vehiclesByList = [...new Set(vehicles.map(vehicle => vehicle.year))];
        return vehiclesByList;
    } catch (error) {
        console.error('Error fetching vehicle list:', error.message);
        return [];
    }
}

const fetchVehicleTransmission = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/vehicles/all');
        const vehicles = response.data.list;
        const vehhiclesByTransmission = [...new Set(vehicles.map(vehicle => vehicle.transmission))];
        console.log(vehhiclesByTransmission);
        return vehhiclesByTransmission;
    } catch (error) {
        console.error('Error fetching vehicle list:', error.message);
        return [];
    }
}

const fetchVehicleById = async (vehicleId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/vehicles/vehicle/id/${vehicleId}`);
        return response.data.vehicle;
    } catch (error) {
        console.error('Error fetching vehicle with ID: ', updatedVehicleDetails, error.message);
    }
}

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

const renderVehicleManufacturerDropdownFilter = async () => {
    const manufacturerFilterTypes = await fetchVehicleManufacturers();
    console.log(manufacturerFilterTypes);
    if (!Array.isArray(manufacturerFilterTypes)) {
        console.log('Expected an array of entertainment types but got: ', manufacturerFilterTypes);
        return;
    }
    vehicleManufacturerFilterDropdown.innerHTML = '<option value="">All Manufacturers</option>';
    manufacturerFilterTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.text = type;
        vehicleManufacturerFilterDropdown.add(option);
    })
}

const renderVehicleYearDropdownFilter = async () => {
    const vehicleYearList = await fetchVehicleYear();
    console.log(vehicleYearList);
    if (!Array.isArray(vehicleYearList)) {
        console.log('Expected an array of entertainment types but got: ', vehicleYearList);
        return;
    }
    vehicleYearFilterDropdown.innerHTML = '<option value="">All Years</option>';
    vehicleYearList.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.text = type;
        vehicleYearFilterDropdown.add(option);
    })
}

const renderVehicleTransmissionDropdownFilter = async () => {
    const vehicleTransmissionFilter = await fetchVehicleTransmission();
    console.log(vehicleTransmissionFilter);
    if (!Array.isArray(vehicleTransmissionFilter)) {
        console.log('Expected an array of entertainment types but got: ', vehicleTransmissionFilter);
        return;
    }
    vehicleTransmissionFilterDropdown.innerHTML = '<option value="">All Transmission</option>';
    vehicleTransmissionFilter.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.text = type;
        vehicleTransmissionFilterDropdown.add(option);
    })
}

vehicleManufacturerFilterDropdown.addEventListener('change', async () => {
    console.log('Dropdown value selected', vehicleManufacturerFilterDropdown.value);
    vehicles = await fetchVehicleList();
    renderVehicleList(vehicles, currentPage);
    console.log('rendering the new list');
    renderPagination();
});

vehicleYearFilterDropdown.addEventListener('change', async () => {
    console.log('Dropdown value selected', vehicleManufacturerFilterDropdown.value);
    vehicles = await fetchVehicleList();
    renderVehicleList(vehicles, currentPage);
    console.log('rendering the new list');
    renderPagination();
})

vehicleTransmissionFilterDropdown.addEventListener('change', async () => {
    console.log('Dropdown value selected', vehicleManufacturerFilterDropdown.value);
    vehicles = await fetchVehicleList();
    renderVehicleList(vehicles, currentPage);
    console.log('rendering the new list');
    renderPagination();
})

const confirmDeleteEntry = (vehicleId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(vehicleId);
    }
};

// Function to handle entry deletion
const deleteEntry = async (vehicleId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/vehicles/delete/${vehicleId}`);

        // Optionally, you can reload the vehicleId list after deletion
        entries = await fetchVehicleList();
        renderVehicleList(entries, currentPage);

        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting vehicleId:', error.message);
    }
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Vehicle Information</h2><hr />
        <div class="modal-body">
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
        </div><hr />
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
        <script>submitBtn.addEventListener('click', () => submitInfo())</script>
    `;
    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        // Get book information from the form or wherever it's stored
        const make = document.querySelector('input[name="make"]').value;
        const model = document.querySelector('input[name="model"]').value;
        const year = document.querySelector('input[name="year"]').value;
        const transmission = document.querySelector('select[name="transmission"]').value;
        const capacity = document.querySelector('select[name="capacity"]').value;

        if (!make || !model || !year || !transmission || !capacity) {
            throw new Error("Please fill in all required fields.");
        }

        // Create a data object with the book information
        const data = {
            make: make,
            model: model,
            year: year,
            transmission: transmission,
            capacity: capacity
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Send a POST request to add the book information
        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/vehicles/add', data);

        // Optionally, handle the response or perform additional actions
        console.log('vehicle added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        vehicles = await fetchVehicleList();

        renderVehicleList(vehicles, currentPage);
        renderPagination();
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
        <button onClick="openUpdateModal(${vehicle.vehicleId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${vehicle.vehicleId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

const openUpdateModal = async (vehicleId) => {
    try {
        updatedVehicleDetails = await fetchVehicleById(vehicleId);
        if (updatedVehicleDetails) {
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Vehicle Information</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="text" id="updateMake" placeholder="Vehicle Manufacturer" value="${updatedVehicleDetails.make}" />
            <input class="input" type="text" id="updateModel" placeholder="Vehicle Model" value="${updatedVehicleDetails.model}" /><br />
            <input class="input" type="text" id="updateYear" placeholder="Year" value="${updatedVehicleDetails.year}" /><br />
            <select name="transmission" id="updateTransmission">
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
            </select><br />
            <select name="capacity" id="updateCapacity">
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="8">8</option>
            </select><br />
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updatedVehicleDetails.vehicleId})">Update</button><br /><br />
    `;
    updateModal.style.display = 'block';
        } else {
            console.error('Error fetching vehicle details')
        }
    } catch (error) {
        console.error('Error opening update model:', error.message);
    }
};

// Function to submit the update
const submitUpdate = async (vehicleId) => {
    // try {
        const updateMake = document.getElementById('updateMake').value;
        console.log(updateMake)
        const updateModel = document.getElementById('updateModel').value;
        console.log(updateModel)
        const updateYear = document.getElementById('updateYear').value;
        console.log(updateYear)
        const updateTransmission = document.getElementById('updateTransmission').value;
        console.log(updateTransmission)
        const updateCapacity = document.getElementById('updateCapacity').value;
        console.log(updateCapacity)

        // Validate the required fields if needed

        const data = {
            make: updateMake,
            model: updateModel,
            year: updateYear,
            transmission: updateTransmission,
            capacity: updateCapacity,
            vehicleId: vehicleId
        };

        console.log(data);

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.put(`http://192.168.1.36:8080/app/vehicles/update/${data.vehicleId}`, data);

        console.log('Vehicle Information updated successfully:', response);

        updateModal.style.display = 'none';

        vehicles = await fetchVehicleList();
        renderVehicleList(vehicles, currentPage);
        renderPagination();
    // } catch (error) {
    //     console.error('Error updating vehicle information:', error.message);
    //     // Handle errors or provide feedback to the user
    // }
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
    renderVehicleManufacturerDropdownFilter();
    renderVehicleYearDropdownFilter();
    renderVehicleTransmissionDropdownFilter();
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
    const hrElement = document.createElement('hr');
    paginationContainer.appendChild(hrElement);
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderVehicleList(vehicles, currentPage);
};

// Initialize the page
initPage();
