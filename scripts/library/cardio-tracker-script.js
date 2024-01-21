const cardioListContainer = document.getElementById('cardioList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

// Fetch cardio tracker list using Axios
const fetchCardioList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/cardio-tracker-app/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching cardio tracker list:', error.message);
        return [];
    }
};

// Render cardio tracker list items
const renderCardioList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const entriesToDisplay = entries.slice(startIdx, endIdx);

    cardioListContainer.innerHTML = '';

    entriesToDisplay.forEach((entry, index) => {
        const cardioElement = document.createElement('div');
        cardioElement.classList.add('cardio-element');
        cardioElement.dataset.index = startIdx + index;

        const descrElement = document.createElement('h3');
        descrElement.textContent = entry.descr;

        const cDistanceElement = document.createElement('p');
        cDistanceElement.textContent = `Distance(miles): ${entry.cDistance}`;

        cardioElement.appendChild(descrElement);
        cardioElement.appendChild(cDistanceElement);

        cardioElement.addEventListener('click', () => openModal(entry));

        cardioListContainer.appendChild(cardioElement);
    });
};

// Pagination
const itemsPerPage = 4;
let currentPage = 1;
let entries = {};

// Open modal with cardio tracker details
const openModal = (cardio) => {
    modalContent.innerHTML = `
        <h2>${cardio.descr}</h2>
        <p>Distance: ${cardio.cDistance}</p>
        <p>Time: ${cardio.cTime}</p>
        <p>Username: ${cardio.username}</p>
        <p>Date: ${cardio.cDate}</p>
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
    entries = await fetchCardioList();
    renderCardioList(entries, currentPage);
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
    renderCardioList(entries, currentPage);
};

// Initialize the page
initPage();
