const autoShopListContainer = document.getElementById('autoShopList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

// Fetch auto repair shop list using Axios
const fetchAutoshopList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/auto-repair-shops/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching auto repair shop list:', error.message);
        return [];
    }
};

// Render auto repair shop list items
const renderAutoshopList = (autoshops, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const autoshopsToDisplay = autoshops.slice(startIdx, endIdx);

    autoShopListContainer.innerHTML = '';

    autoshopsToDisplay.forEach((autoshop, index) => {
        const autoshopElement = document.createElement('div');
        autoshopElement.classList.add('autoshop-element');
        autoshopElement.dataset.index = startIdx + index;

        const nameElement = document.createElement('h3');
        nameElement.textContent = autoshop.autoShopName;

        const addressElement = document.createElement('p');
        addressElement.textContent = `Address: ${autoshop.address}`;

        const cityElement = document.createElement('p');
        cityElement.textContent = `City: ${autoshop.city}`;

        const stateElement = document.createElement('p');
        stateElement.textContent = `State: ${autoshop.state}`;

        const zipElement = document.createElement('p');
        zipElement.textContent = `Zip: ${autoshop.zip}`;

        autoshopElement.appendChild(nameElement);

        autoshopElement.addEventListener('click', () => openModal(autoshop));

        autoShopListContainer.appendChild(autoshopElement);
    });
};

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let autoshops = {};

// Open modal with auto repair shop details
const openModal = (autoshop) => {
    modalContent.innerHTML = `
        <h2>${autoshop.autoShopName}</h2>
        <p>Address: ${autoshop.address}</p>
        <p>City: ${autoshop.city}</p>
        <p>State: ${autoshop.state}</p>
        <p>Zip: ${autoshop.zip}</p>
        <button>Update</button>
        <button>Delete</button>
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
    autoshops = await fetchAutoshopList();
    renderAutoshopList(autoshops, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(autoshops.length / itemsPerPage);
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
    renderAutoshopList(autoshops, currentPage);
};

// Initialize the page
initPage();
