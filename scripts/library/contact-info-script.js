const contactListContainer = document.getElementById('contactList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

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

// Close modal if clicked outside the modal
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
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
