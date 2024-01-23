const entertainmentListContainer = document.getElementById('entertainmentList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

// Fetch auto entertainment list using Axios
const fetchEntertainmentList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/entertainment/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching entertainment list:', error.message);
        return [];
    }
};

// Render entertainment list items
const renderEntertainmentList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const entriesToDisplay = entries.slice(startIdx, endIdx);

    entertainmentListContainer.innerHTML = '';

    entriesToDisplay.forEach((entry, index) => {
        const entertainmentElement = document.createElement('div');
        entertainmentElement.classList.add('entertainment-element');
        entertainmentElement.dataset.index = startIdx + index;

        const nameElement = document.createElement('h3');
        nameElement.textContent = `${entry.name}`;

        entertainmentElement.appendChild(nameElement);

        entertainmentElement.addEventListener('click', () => openModal(entry));

        entertainmentListContainer.appendChild(entertainmentElement);
    });
};

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let entries = {};

// Open modal with entertainment details
const openModal = (entry) => {
    modalContent.innerHTML = `
        <h2>${entry.name + ' - ' + entry.descr}</h2><hr />
        <button onClick="updateEntry(${entry.entityId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntertainment(${entry.entityId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

// Function to confirm emtertainment deletion
const confirmDeleteEntertainment = (entityId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(entityId);
    }
};

// Function to handle contact deletion
const deleteEntry = async (entityId) => {
    try {
        
        await axios.delete(`http://localhost:8080/app/entertainment/delete/${entityId}`);
        
        // Optionally, you can reload the contact list after deletion
        entries = await fetchEntertainmentList();
        renderEntertainmentList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting entityId:', error.message);
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
    entries = await fetchEntertainmentList();
    renderEntertainmentList(entries, currentPage);
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
    renderEntertainmentList(entries, currentPage);
};

// Initialize the page
initPage();
