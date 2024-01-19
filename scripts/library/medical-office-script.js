const medicalOfficeListContainer = document.getElementById('medicalOfficeList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

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
        medicalOfficeElement.classList.add('autoshop-element');
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

// Open modal with auto repair shop details
const openModal = (office) => {
    modalContent.innerHTML = `
        <h2>${office.name}</h2>
        <p>Address: ${office.address}</p>
        <p>City: ${office.city}</p>
        <p>State: ${office.state}</p>
        <p>Zip: ${office.zip}</p>
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
    autoshops = await fetchMedicalOfficeList();
    renderMedicalOfficeList(autoshops, currentPage);
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
