const garageInventoryListContainer = document.getElementById('garageInventoryList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

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
