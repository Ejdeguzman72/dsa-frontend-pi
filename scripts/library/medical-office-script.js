const medicalOfficeListContainer = document.getElementById('medicalOfficeList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const myAddModal = document.getElementById('myAddModal');
const addModalCloseBtn = document.getElementById * ('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');

// Fetch medical office list using Axios
const fetchMedicalOfficeList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/medical-offices/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching medical office list:', error.message);
        return [];
    }
};

// Render medical office list items
const renderMedicalOfficeList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const medicalOfficesToDisplay = entries.slice(startIdx, endIdx);

    medicalOfficeListContainer.innerHTML = '';

    medicalOfficesToDisplay.forEach((entry, index) => {
        const medicalOfficeElement = document.createElement('div');
        medicalOfficeElement.classList.add('medical-office-element');
        medicalOfficeElement.dataset.index = startIdx + index;

        const nameElement = document.createElement('h3');
        nameElement.textContent = entry.name;

        const addressElement = document.createElement('p');
        addressElement.textContent = `Address: ${entry.address} ${entry.city} ${entry.state} ${entry.zip}`;

        medicalOfficeElement.appendChild(nameElement);
        medicalOfficeElement.appendChild(addressElement);

        medicalOfficeElement.addEventListener('click', () => openModal(entry));

        medicalOfficeListContainer.appendChild(medicalOfficeElement);
    });
};

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let medicalOffices = {};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Office Information</h2><hr />
        <input class="input" type="text" name="name" placeholder="Office Name" />
        <input class="input" type="text" name="address" placeholder="Address" /><br />
        <input class="input" type="text" name="city" placeholder="City" /><br />
        <input class="input" type="text" name="state" placeholder="State" /><br />
        <input class="input" type="text" name="zip" placeholder="Zipcode" /><br />
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

// Open modal with medical office details
const openModal = (office) => {
    modalContent.innerHTML = `
        <h2>${office.name}</h2><hr />
        <p>Address: ${office.address}</p>
        <p>City: ${office.city}</p>
        <p>State: ${office.state}</p>
        <p>Zip: ${office.zip}</p>
        <button onClick="updateEntry(${office.medicalOfficeId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${office.medicalOfficeId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

const confirmDeleteEntry = (medicalOfficeId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(medicalOfficeId);
    }
};

// Function to handle office deletion
const deleteEntry = async (medicalOfficeId) => {
    try {
        
        await axios.delete(`http://localhost:8080/app/medical-offices/delete/${medicalOfficeId}`);
        
        // Optionally, you can reload the contact list after deletion
        entries = await fetchMedicalOfficeList();
        renderMedicalOfficeList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting medicalOfficeId:', error.message);
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
};

// Initialize page
const initPage = async () => {
    medicalOffices = await fetchMedicalOfficeList();
    renderMedicalOfficeList(medicalOffices, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(medicalOffices.length / itemsPerPage);
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
    renderMedicalOfficeList(medicalOffices, currentPage);
};

// Initialize the page
initPage();
