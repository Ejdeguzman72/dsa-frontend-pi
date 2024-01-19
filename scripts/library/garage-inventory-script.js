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
        <h2>${entry.name}</h2>
        <p>Description: ${entry.description}</p>
        <p>Condition: ${entry.condition}</p>
        <p>Location: ${entry.location}</p>
        <p>Quantity: ${entry.quantity}</p>
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
