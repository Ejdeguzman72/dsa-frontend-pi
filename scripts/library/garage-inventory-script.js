const garageInventoryListContainer = document.getElementById('garageInventoryList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const myAddModal = document.getElementById('myAddModal');
const addModalCloseBtn = document.getElementById * ('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');

// Fetch garage inventory list using Axios
const fetchGarageInventoryList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/inventory/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching garage inventory list:', error.message);
        return [];
    }
};

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

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let entries = {};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Item</h2><hr />
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
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button>
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

        // Validate the required fields if needed

        // Create a data object with the book information
        const data = {
            name: name,
            description: description,
            condition: condition,
            location: location,
            quantity: quantity
        };

        // Send a POST request to add the book information
        const response = await axios.post('http://localhost:8080/app/inventory/add', data);

        // Optionally, handle the response or perform additional actions
        console.log('Item added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        entries = await fetchGarageInventoryList();
        renderGarageInventoryList(entries, currentPage);
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
        <button onClick="updateEntry(${entry.inventoryId})" class="update-button">Update</button>
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
        
        await axios.delete(`http://localhost:8080/app/entertainment/delete/${inventoryId}`);
        
        // Optionally, you can reload the contact list after deletion
        entries = await fetchGarageInventoryList();
        renderGarageInventoryList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting inventoryId:', error.message);
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
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderGarageInventoryList(entries, currentPage);
};

// Initialize the page
initPage();
