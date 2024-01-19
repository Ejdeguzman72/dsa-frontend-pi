const contactListContainer = document.getElementById('contactList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

// Fetch auto repair shop list using Axios
const fetchContactList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/person-info/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching conatact list:', error.message);
        return [];
    }
};

// Render auto repair shop list items
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

        contactElement.appendChild(nameElement);

        contactElement.addEventListener('click', () => openModal(entry));

        contactListContainer.appendChild(contactElement);
    });
};

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let entries = {};

// Open modal with auto repair shop details
const openModal = (contact) => {
    modalContent.innerHTML = `
        <h2>${contact.firstname + ' ' + contact.lastname}</h2>
        <p>Email: ${contact.email}</p>
        <p>Phone}: ${contact.phone}</p>
        <p>Birthdate: ${contact.birthdate}</p>
        <p>Address: ${contact.address01 + ' ' + contact.city + ', ' + contact.state + ' ' + contact.zip}</p>
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
