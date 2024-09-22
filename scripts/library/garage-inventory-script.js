const garageInventoryListContainer = document.getElementById('garageInventoryList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const myAddModal = document.getElementById('myAddModal');
const addModalCloseBtn = document.getElementById * ('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');
const updateModal = document.getElementById('myUpdateModal');
const updateModalContent = document.getElementById('updateModalContent');
// const updateCloseBtn = document.getElementById('updateCloseBtn');
const updateSubmitBtn = document.getElementById('updateSubmitBtn');

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let entries = [];
let updateInventoryDetails = {};
let jwt;

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        console.log('Retrieved token:', token);
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch garage inventory list using Axios
const fetchGarageInventoryList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://localhost:8080/app/inventory/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching garage inventory list:', error.message);
        return [];
    }
};

const fetchGarageItemById = async (inventoryId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://localhost:8080/app/inventory/search/id/${inventoryId}`);
        return response.data.inventory;
    } catch (error) {
        console.error('Error fetching inventory:', error.message);
    }
}

// Render garage inventory list items
const renderGarageInventoryList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const entriesToDisplay = entries.slice(startIdx, endIdx);

    garageInventoryListContainer.innerHTML = '';

    entriesToDisplay.forEach((entry, index) => {
        const garageInventoryElement = document.createElement('div');
        garageInventoryElement.classList.add('garage-inventory-element');
        garageInventoryElement.dataset.index = startIdx + index;

        const nameElement = document.createElement('h3');
        nameElement.textContent = `${entry.name} - ${entry.location}`;

        garageInventoryElement.appendChild(nameElement);

        garageInventoryElement.addEventListener('click', () => openModal(entry));

        garageInventoryListContainer.appendChild(garageInventoryElement);
    });
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Item</h2><hr /><hr />
        <div class="modal-body">
            <input class="input" type="text" name="name" placeholder="Item Name" />
            <input class="input" type="text" name="description" placeholder="Description" /><br />
            <select name="condition">
                <option value="Good">Good</option>
                <option value="Bad">Bad</option>
                <option value="Decent">Decent</option>
                <option value="Worn">Worn</option>
            </select>
            <select name="location">
                <option value="Garage">Garage</option>
                <option value="Shed">Shed</option>
                <option value="House">House</option>
            </select>
            <select name="quantity">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="multi">Multi</option>
            </select>
        </div><hr />
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
        <script>submitBtn.addEventListener('click', () => submitInfo())</script>
    `;
    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        // Get book information from the form or wherever it's stored
        const name = document.querySelector('input[name="name"]').value;
        const description = document.querySelector('input[name="description"]').value;
        const condition = document.querySelector('select[name="condition"]').value;
        const location = document.querySelector('select[name="location"]').value;
        const quantity = document.querySelector('select[name="quantity"]').value;

        if (!name || !description || !condition || !location || !quantity) {
            throw new Error("Please fill in all required fields.");
        }

        // Create a data object with the book information
        const data = {
            name: name,
            description: description,
            condition: condition,
            location: location,
            quantity: quantity
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Send a POST request to add the book information
        const response = await axiosWithToken.post('http://localhost:8080/app/inventory/add', data);

        // Optionally, handle the response or perform additional actions
        console.log('Item added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        entries = await fetchGarageInventoryList();

        renderGarageInventoryList(entries, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error submitting item information:', error.message);
        // Handle errors or provide feedback to the user
    }
}

// Open modal with garage inventory details
const openModal = (entry) => {
    modalContent.innerHTML = `
        <h2>${entry.name}</h2><hr />
        <p>Description: ${entry.description}</p>
        <p>Condition: ${entry.condition}</p>
        <p>Location: ${entry.location}</p>
        <p>Quantity: ${entry.quantity}</p>
        <button onClick="openUpdateModal(${entry.inventoryId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${entry.inventoryId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

const confirmDeleteEntry = (inventoryId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(inventoryId);
    }
};

// Function to handle entry deletion
const deleteEntry = async (inventoryId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://localhost:8080/app/inventory/delete/${inventoryId}`);
        
        // Optionally, you can reload the contact list after deletion
        entries = await fetchGarageInventoryList();
        renderGarageInventoryList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting inventoryId:', error.message);
    }
};

const openUpdateModal = async (inventoryId) => {
    try {
        updateInventoryDetails = await fetchGarageItemById(inventoryId);
        console.log(updateInventoryDetails);
        if (updateInventoryDetails) {
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Inventory Informaton</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="text" id="updateName" value="${updateInventoryDetails.name}" />
            <input class="input" type="text" id="updateDescription" value="${updateInventoryDetails.description}" /><br />
            <select id="updateCondition" value="${updateInventoryDetails.condition}">
                <option value="Good">Good</option>
                <option value="Bad">Bad</option>
                <option value="Decent">Decent</option>
                <option value="Worn">Worn</option>
            </select><br />
            <select id="updateLocation" value="${updateInventoryDetails.location}">
                <option value="Garage">Garage</option>
                <option value="Shed">Shed</option>
                <option value="House">House</option>
            </select><br />
            <input class="input" type="text" id="updateQuantity" value="${updateInventoryDetails.quantity}" /><br />
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updateInventoryDetails.inventoryId})">Update</button><br /><br />
    `;
    updateModal.style.display = 'block';
        } else {
            console.error('Error fetching inventory details')
        }
    } catch (error) {
        console.error('Error opening update modal:', error.message);
    }
};

// Function to submit the update
const submitUpdate = async (inventoryId) => {
    try {
        const updateName = document.getElementById('updateName').value;
        const updateDescription = document.getElementById('updateDescription').value;
        const updateCondition = document.getElementById('updateCondition').value;
        const updateLocation = document.getElementById('updateLocation').value;
        const updateQuantity = document.getElementById('updateQuantity').value;
        
        const data = {
            inventoryId: inventoryId,
            name: updateName,
            description: updateDescription,
            condition: updateCondition,
            location: updateLocation,
            quantity: updateQuantity
        };

        console.log(data);

        const response = await axios.put(`http://localhost:8080/app/inventory/update/${data.inventoryId}`, data);

        console.log('Inventory updated successfully:', response);

        updateModal.style.display = 'none';

        entries = await fetchGarageInventoryList();
        renderGarageInventoryList(entries, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error updating inventory information:', error.message);
        // Handle errors or provide feedback to the user
    }
};

// Close modal
closeBtn.onclick = () => {
    modal.style.display = 'none';
};

addModalCloseBtn.onclick = () => {
    myAddModal.style.display = 'none';
}

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
    entries = await fetchGarageInventoryList();
    renderGarageInventoryList(entries, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(entries.length / itemsPerPage);
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
    renderGarageInventoryList(entries, currentPage);
};

// Initialize the page
initPage();
