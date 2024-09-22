const medicalOfficeListContainer = document.getElementById('medicalOfficeList');
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
const searchButton = document.getElementById('zip-search-btn')
    const zipSearchInput = document.getElementById('zipCode-search-input');
// Pagination
const itemsPerPage = 5;

let currentPage = 1;
let medicalOffices = [];
let updateMedicalOfficeDetails = {};

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        console.log('Retrieved token:', token);
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch medical office list using Axios
const fetchMedicalOfficeList = async () => {
    try {
        const jwtToken = await retrieveJwt();
        let response;
        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        let selectedZipCode = zipSearchInput.value;
        if (selectedZipCode && selectedZipCode.trim() !== "") {
            response = await axiosWithToken.get(`http://192.168.1.36:8080/app/medical-offices/offices/search/zip/${selectedZipCode}`)
        } else {
            response = await axiosWithToken.get('http://192.168.1.36:8080/app/medical-offices/all');
        }
        return response.data.list;
    } catch (error) {
        console.error('Error fetching medical office list:', error.message);
        return [];
    }
};

const fetchMedicalOfficeById = async (medicalOfficeId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/medical-offices/offices/search/id/${medicalOfficeId}`);
        return response.data.medicalOffice;
    } catch (error) {
        console.error('Error fetching medical office:', error.message);
        return [];
    }
}

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

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Office Information</h2><hr />
        <div class="modal-body">
            <input class="input" type="text" name="name" placeholder="Office Name" />
            <input class="input" type="text" name="address" placeholder="Address" /><br />
            <input class="input" type="text" name="city" placeholder="City" /><br />
            <input class="input" type="text" name="state" placeholder="State" /><br />
            <input class="input" type="text" name="zip" placeholder="Zipcode" /><br />
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
        const address = document.querySelector('input[name="address"]').value;
        const city = document.querySelector('input[name="city"]').value;
        const state = document.querySelector('input[name="state"]').value;
        const zip = document.querySelector('input[name="zip"]').value;

        if (!name || !address || !city || !state || !zip) {
            throw new Error("Please fill in all required fields.");
        }

        // Create a data object with the book information
        const data = {
            name: name,
            address: address,
            city: city,
            state: state,
            zip: zip
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Send a POST request to add the book information
        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/medical-offices/add', data);

        // Optionally, handle the response or perform additional actions
        console.log('Office added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        medicalOffices = await fetchMedicalOfficeList();

        renderMedicalOfficeList(medicalOffices, currentPage);
        renderPagination();
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
        <button onClick="openUpdateModal(${office.medicalOfficeId})" class="update-button">Update</button>
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
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/medical-offices/delete/${medicalOfficeId}`);
        
        // Optionally, you can reload the contact list after deletion
        entries = await fetchMedicalOfficeList();
        renderMedicalOfficeList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting medicalOfficeId:', error.message);
    }
};

const openUpdateModal = async (medicalOfficeId) => {
    try {
        updateMedicalOfficeDetails = await fetchMedicalOfficeById(medicalOfficeId);
        if (updateMedicalOfficeDetails) {
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Auto Repair Shop</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="text" id="updateOfficeName" placeholder="Medical Office Name" value="${updateMedicalOfficeDetails.name}" />
            <input class="input" type="text" id="updateAddress" placeholder="Address" value="${updateMedicalOfficeDetails.address}" /><br />
            <input class="input" type="text" id="updateCity" placeholder="City" value="${updateMedicalOfficeDetails.city}" /><br />
            <input class="input" type="text" id="updateState" placeholder="State" value="${updateMedicalOfficeDetails.state}" /><br />
            <input class="input" type="text" id="updateZip" placeholder="Zipcode" value="${updateMedicalOfficeDetails.zip}" /><br />
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updateMedicalOfficeDetails.medicalOfficeId})">Update</button><br /><br />
    `;
    updateModal.style.display = 'block';
        } else {
            console.error('Error fetching medical office details')
        }
    } catch (error) {
        console.error('Error opening update model:', error.message);
    }
};

// Function to submit the update
const submitUpdate = async (medicalOfficeId) => {
    try {
        const updateOfficeName = document.getElementById('updateOfficeName').value;
        const updateAddress = document.getElementById('updateAddress').value;
        const updateCity = document.getElementById('updateCity').value;
        const updateState = document.getElementById('updateState').value;
        const updateZip = document.getElementById('updateZip').value;

        // Validate the required fields if needed

        const data = {
            name: updateOfficeName,
            address: updateAddress,
            city: updateCity,
            state: updateState,
            zip: updateZip,
            medicalOfficeId: medicalOfficeId
        };

        console.log(data);

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.put(`http://192.168.1.36:8080/app/medical-offices/update/${data.medicalOfficeId}`, data);

        console.log('Medical Office updated successfully:', response);

        updateModal.style.display = 'none';

        medicalOffices = await fetchMedicalOfficeList();
        renderMedicalOfficeList(medicalOffices, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error updating medical office information:', error.message);
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
        upddateModal.style.display = 'none';
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
    const hrElement = document.createElement('hr');
    paginationContainer.appendChild(hrElement);
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderMedicalOfficeList(medicalOffices, currentPage);
};

document.addEventListener('DOMContentLoaded', () => {
    myAddModal.addEventListener('click', () => openAddModal());
});

searchButton.addEventListener('click', async () => {
    try {
        currentPage = 1; // Reset to first page on new search
        medicalOffices = await fetchMedicalOfficeList();
        renderMedicalOfficeList(medicalOffices, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error fetching medical offices for search:', error.message);
    }
});

// Initialize the page
initPage();
