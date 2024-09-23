const contactListContainer = document.getElementById('contactList');
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
const searchInputButton = document.getElementById('search-btn')
const lastnameSearchInput = document.getElementById('lastname-search-input');
const phoneSearchInput = document.getElementById('phone-search-input');
const emailSearchInput = document.getElementById('email-search-input')


// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let entries = [];
let updateContactDetails = {};
let jwt;

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch contact info list using Axios
const fetchContactList = async () => {
    try {
        const jwtToken = await retrieveJwt();
        let response;
        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const selectedLastname = lastnameSearchInput.value;
        const selectedEmail = emailSearchInput.value;
        const selectedPhone = phoneSearchInput.value;
        if (selectedLastname && selectedLastname.trim() !== "") {
            response = await axiosWithToken.get(`http://192.168.1.36:8080/app/person-info/contact/lastname/${selectedLastname}`);
        } else if (selectedEmail && selectedEmail.trim() !== "") {
            response = await axiosWithToken.get(`http://192.168.1.36:8080/app/person-info/contact/email/${selectedEmail}`);
        } else if (selectedPhone && selectedPhone.trim() !== "") {
            response = await axiosWithToken.get(`http://192.168.1.36:8080/app/person-info/contact/phone/${selectedPhone}`);;
        } else {
            response = await axiosWithToken.get('http://192.168.1.36:8080/app/person-info/all');
        }
        return response.data.list;
    } catch (error) {
        console.error('Error fetching conatact list:', error.message);
        return [];
    }
};

const fetchContactById = async (personId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/person-info/contact/id/${personId}`);
        return response.data.person;
    } catch (error) {
        console.error('Error fetching person:', error.message);
    }
}

// Render contact info list items
const renderContactList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const entriesToDisplay = entries.slice(startIdx, endIdx);

    contactListContainer.innerHTML = '';

    entriesToDisplay.forEach((entry, index) => {
        const contactElement = document.createElement('div');
        contactElement.classList.add('contact-element');
        contactElement.dataset.index = startIdx + index;

        const nameElement = document.createElement('h3');
        nameElement.textContent = `${entry.firstname + ' ' + entry.lastname}`;

        const phoneElement = document.createElement('p');
        phoneElement.textContent = `Phone: ${entry.phone}`

        const emailElement = document.createElement('p');
        emailElement.textContent = `Email: ${entry.email}`;

        contactElement.appendChild(nameElement);
        contactElement.appendChild(phoneElement);
        contactElement.appendChild(emailElement);

        contactElement.addEventListener('click', () => openModal(entry));

        contactListContainer.appendChild(contactElement);
    });
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Contact Information</h2><hr />
        <div class="modal-body">
            <input class="input" type="text" name="firstname" placeholder="First Name" />
            <input class="input" type="text" name="middleInitial" placeholder="Middle Initial (optional)" />
            <input class="input" type="text" name="lastname" placeholder="Last Name" /><br />
            <input class="input" type="text" name="address01" placeholder="Address" /><br />
            <input class="input" type="text" name="city" placeholder="City" /><br />
            <input class="input" type="text" name="state" placeholder="State" /><br />
            <input class="input" type="text" name="zipcode" placeholder="Zipcode" /><br />
            <input class="input" type="text" name="phone" placeholder="Phone" /><br />
            <input class="input" type="text" name="email" placeholder="Email" /><br />
            <input class="input" type="text" name="birthdate" placeholder="Birthdate" />
        </div><hr />
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
        <script>submitBtn.addEventListener('click', () => submitInfo())</script>
    `;
    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        // Get contact information from the form or wherever it's stored
        const firstname = document.querySelector('input[name="firstname"]').value;
        const middleInitial = document.querySelector('input[name="middleInitial"]').value;
        const lastname = document.querySelector('input[name="lastname"]').value;
        const address01 = document.querySelector('input[name="address01"]').value;
        const city = document.querySelector('input[name="city"]').value;
        const state = document.querySelector('input[name="state"]').value;
        const zipcode = document.querySelector('input[name="zipcode"]').value;
        const phone = document.querySelector('input[name="phone"]').value;
        const email = document.querySelector('input[name="email"]').value;
        const birthdate = document.querySelector('input[name="birthdate"]').value;

        if (!firstname || !middleInitial || !lastname || !address01 || !city || !state || !zipcode || !phone || !email || !birthdate) {
            throw new Error("Please fill in all required fields.");
        }

        // Create a data object with the contact information
        const data = {
            firstname: firstname,
            middleInitial: middleInitial,
            lastname: lastname,
            address01: address01,
            city: city,
            state: state,
            zipcode: zipcode,
            phone: phone,
            email: email,
            birthdate: birthdate
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Send a POST request to add the contact information
        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/person-info/add', data);

        // Optionally, handle the response or perform additional actions
        console.log('Contact added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        medicalOffices = await fetchContactList();

        renderContactList(medicalOffices, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error submitting contact information:', error.message);
        // Handle errors or provide feedback to the user
    }
}

// Open modal with contact info details
const openModal = (contact) => {
    modalContent.innerHTML = `
        <h2>${contact.firstname + ' ' + contact.lastname}</h2><hr />
        <p>Email: ${contact.email}</p>
        <p>Phone}: ${contact.phone}</p>
        <p>Birthdate: ${contact.birthdate}</p>
        <p>Address: ${contact.address01 + ' ' + contact.city + ', ' + contact.state + ' ' + contact.zipcode}</p>
        <button onClick="openUpdateModal(${contact.personId})" class="update-button">Update</button>
        <button onClick="confirmDeleteContact(${contact.personId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

// Function to confirm contact deletion
const confirmDeleteContact = (personId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(personId);
    }
};

// Function to handle contact deletion
const deleteEntry = async (personId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/person-info/delete/${personId}`);
        
        // Optionally, you can reload the contact list after deletion
        entries = await fetchContactList();
        renderContactList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting contact:', error.message);
    }
};

const openUpdateModal = async (personId) => {
    try {
        updateContactDetails = await fetchContactById(personId);
        console.log(updateContactDetails);
        if (updateContactDetails) {
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Contact Informaton</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="text" id="updateFirstname" value="${updateContactDetails.firstname}" />
            <input class="input" type="text" id="updateMiddleInitial" value="${updateContactDetails.middleInitial}" /><br />
            <input class="input" type="text" id="updateLastname" value="${updateContactDetails.lastname}" /><br />
            <input class="input" type="number" id="updateAge" value="${updateContactDetails.age}" /><br />
            <input class="input" type="text" id="updateAddress01" value="${updateContactDetails.address01}" /><br />
            <input class="input" type="text" id="updateAddress02" value="${updateContactDetails.address02}" /><br />
            <input class="input" type="text" id="updateCity" value="${updateContactDetails.city}" /><br />
            <input class="input" type="text" id="updateState" value="${updateContactDetails.state}" /><br />
            <input class="input" type="text" id="updateZipcode" value="${updateContactDetails.zipcode}" /><br />
            <input class="input" type="text" id="updateBirthdate" value="${updateContactDetails.birthdate}" /><br />
            <input class="input" type="text" id="updatePhone" value="${updateContactDetails.phone}" /><br />
            <input class="input" type="email" id="updateEmail" value="${updateContactDetails.email}" /><br />
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updateContactDetails.personId})">Update</button><br /><br />
    `;
    updateModal.style.display = 'block';
        } else {
            console.error('Error fetching contact details')
        }
    } catch (error) {
        console.error('Error opening update modal:', error.message);
    }
};

// Function to submit the update
const submitUpdate = async (personId) => {
    try {
        const updateFirstname = document.getElementById('updateFirstname').value;
        const updateMiddleInitial = document.getElementById('updateMiddleInitial').value;
        const updateLastname = document.getElementById('updateLastname').value;
        const updateAge = document.getElementById('updateAge').value;
        const updateAddress01 = document.getElementById('updateAddress01').value;
        const updateAddress02 = document.getElementById('updateAddress02').value;
        const updateCity = document.getElementById('updateCity').value;
        const updateState = document.getElementById('updateState').value;
        const updateZipcode = document.getElementById('updateZipcode').value;
        const updateBirthdate = document.getElementById('updateBirthdate').value;
        const updatePhone = document.getElementById('updatePhone').value;
        const updateEmail = document.getElementById('updateEmail').value;

        // Validate the required fields if needed

        const data = {
            personId: personId,
            firstname: updateFirstname,
            middleInitial: updateMiddleInitial,
            lastname: updateLastname,
            age: updateAge,
            address01: updateAddress01,
            addres02: updateAddress02,
            city: updateCity,
            state: updateState,
            zipcode: updateZipcode,
            birthdate: updateBirthdate,
            phone: updatePhone,
            email: updateEmail
        };

        console.log(data);

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.put(`http://192.168.1.36:8080/app/person-info/update/${data.personId}`, data);

        console.log('Contact Info updated successfully:', response);

        updateModal.style.display = 'none';

        entries = await fetchContactList();
        renderContactList(entries, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error updating contact information:', error.message);
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

document.addEventListener('DOMContentLoaded', () => {
    searchInputButton.addEventListener('click', async () => {
        try {
            currentPage = 1; // Reset to first page on new search
            entries = await fetchContactList();
            renderContactList(entries, currentPage);
            renderPagination();
        } catch (error) {
            console.error('Error fetching contact info for search:', error.message);
        }
    });
});

// Initialize page
const initPage = async () => {
    entries = await fetchContactList();
    renderContactList(entries, currentPage);
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
    renderContactList(entries, currentPage);
};

// Initialize the page
initPage();
