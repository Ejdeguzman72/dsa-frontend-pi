const contactListContainer = document.getElementById('contactList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const myAddModal = document.getElementById('myAddModal');
const addModalCloseBtn = document.getElementById * ('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');

// Fetch contact info list using Axios
const fetchContactList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/person-info/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching conatact list:', error.message);
        return [];
    }
};

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

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let entries = {};

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

        // Validate the required fields if needed

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

        // Send a POST request to add the contact information
        const response = await axios.post('http://localhost:8080/app/person-info/add', data);

        // Optionally, handle the response or perform additional actions
        console.log('Contact added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        medicalOffices = await fetchContactList();
        renderContactList(medicalOffices, currentPage);
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
        <p>Address: ${contact.address01 + ' ' + contact.city + ', ' + contact.state + ' ' + contact.zip}</p>
        <button onClick="updateEntry(${contact.personId})" class="update-button">Update</button>
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
        
        await axios.delete(`http://localhost:8080/app/person-info/delete/${personId}`);
        
        // Optionally, you can reload the contact list after deletion
        entries = await fetchContactList();
        renderContactList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting contact:', error.message);
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
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderContactList(entries, currentPage);
};

// Initialize the page
initPage();
