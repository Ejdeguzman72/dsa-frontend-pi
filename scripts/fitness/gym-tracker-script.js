const gymTrackerListContainer = document.getElementById('gymTrackerList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

// Fetch gym tracker list using Axios
const fetchGymTrackerList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/gym-tracker/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching gym tracker list:', error.message);
        return [];
    }
};

// Render gym tracker list items
const renderGymTrackerList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const entriesToDisplay = entries.slice(startIdx, endIdx);

    gymTrackerListContainer.innerHTML = '';

    entriesToDisplay.forEach((entry, index) => {
        const gymTrackerElement = document.createElement('div');
        gymTrackerElement.classList.add('gym-tracker-element');
        gymTrackerElement.dataset.index = startIdx + index;

        exerciseElement = document.createElement('h3');
        exerciseElement.textContent = entry.exerciseName;

        setsElement = document.createElement('p');
        setsElement.textContent = `${entry.sets} - ${entry.reps}`;

        gymTrackerElement.appendChild(exerciseElement);
        gymTrackerElement.appendChild(setsElement);

        gymTrackerElement.addEventListener('click', () => openModal(entry));

        gymTrackerListContainer.appendChild(gymTrackerElement);
    });
};

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let entries = {};

// Open modal with gym tracker details
const openModal = (entry) => {
    modalContent.innerHTML = `
        <h2>${entry.exerciseName}</h2>
        <p>Sets: ${entry.sets}</p>
        <p>Reps: ${entry.reps}</p>
        <p>Weight: ${entry.weight}</p>
        <p>Date: ${entry.date}</p>
        <p>Exercise Type: ${entry.exerciseTypeName}</p>
        <p>Username: ${entry.username}</p>
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
    entries = await fetchGymTrackerList();
    renderGymTrackerList(entries, currentPage);
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
    renderGymTrackerList(entries, currentPage);
};

// Initialize the page
initPage();
