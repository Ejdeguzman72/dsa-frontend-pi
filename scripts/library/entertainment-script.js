// Elements
const entertainmentListContainer = document.getElementById('entertainmentList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const myAddModal = document.getElementById('myAddModal');
const addModalCloseBtn = document.getElementById * ('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');

// Constants
const itemsPerPage = 5;

// State
let currentPage = 1;
let entries = {};

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

// Open modal with entertainment details
const openModal = (entry) => {
    modalContent.innerHTML = `
        <h2>${entry.name + ' - ' + entry.descr}</h2><hr />
        <button onClick="updateEntry(${entry.entityId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntertainment(${entry.entityId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

// Function to confirm entertainment deletion
const confirmDeleteEntertainment = (entityId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(entityId);
    }
};

// Function to handle entry deletion
const deleteEntry = async (entityId) => {
    try {
        await axios.delete(`http://localhost:8080/app/entertainment/delete/${entityId}`);
        
        // Optionally, you can reload the entry list after deletion
        entries = await fetchEntertainmentList();
        renderEntertainmentList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting entityId:', error.message);
    }
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Office Information</h2><hr />
        <input class="input" type="text" name="name" placeholder="Entertainment Title" />
        <textarea cols="50" rows="6"></textarea>
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button>
        <script>submitBtn.addEventListener('click', () => submitInfo())</script>
    `;
    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        // Get book information from the form or wherever it's stored
        const name = document.querySelector('input[name="name"]').value;
        const address = document.querySelector('input[name="address"]').value;
        const city = document.querySelector('input[name="city"]').value;
        const state = document.querySelector('input[name="state"]').value;
        const zip = document.querySelector('input[name="zip"]').value;

        // Validate the required fields if needed

        // Create a data object with the book information
        const data = {
            name: name,
            address: address,
            city: city,
            state: state,
            zip: zip
        };

        // Send a POST request to add the book information
        const response = await axios.post('http://localhost:8080/app/medical-offices/add', data);

        // Optionally, handle the response or perform additional actions
        console.log('Office added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        medicalOffices = await fetchMedicalOfficeList();
        renderMedicalOfficeList(medicalOffices, currentPage);
    } catch (error) {
        console.error('Error submitting medical office information:', error.message);
        // Handle errors or provide feedback to the user
    }
}

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
