// Elements
const entertainmentListContainer = document.getElementById('entertainmentList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const addModalButton = document.getElementById('addModalButton');
const myAddModal = document.getElementById('myAddModal');
const submitBtn = document.getElementById('submitBtn');
let entertainmentTypesDropdown;

// Constants
const itemsPerPage = 5;

// State
let currentPage = 1;
let entertainmentEntries = [];
let entertainmentTypes = [];

// Fetch entertainment list using Axios
const fetchEntertainmentList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/entertainment/all');
        return response.data.list || [];
    } catch (error) {
        console.error('Error fetching entertainment list:', error.message);
        return [];
    }
};

// Fetch entertainment types
const fetchEntertainmentTypes = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/entertainment-types/all');
        entertainmentTypes = response.data.list; // Store entertainment types in state
    } catch (error) {
        console.error('Error fetching entertainment types:', error);
    }
};

const fetchEntertainmentTypesDropdown = () => {
    entertainmentTypesDropdown.innerHTML = '';

    entertainmentTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type.entertainmentTypeId;
        option.text = type.descr;
        entertainmentTypesDropdown.add(option);
    });
};

const renderEntertainmentList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const entriesToDisplay = entries.slice(startIdx, endIdx);

    entertainmentListContainer.innerHTML = '';

    entriesToDisplay.forEach((entry, index) => {
        const entertainmentElement = document.createElement('div');
        entertainmentElement.classList.add('entertainment-element');
        entertainmentElement.dataset.index = startIdx + index;

        const nameElement = document.createElement('h3');
        nameElement.textContent = `${entry.name}`;

        entertainmentElement.appendChild(nameElement);

        entertainmentElement.addEventListener('click', () => openModal(entry));

        entertainmentListContainer.appendChild(entertainmentElement);
    });
};

const openModal = (entry) => {
    modalContent.innerHTML = `
        <h2>${entry.name + ' - ' + entry.descr}</h2><hr />
        <button onClick="updateEntry(${entry.entityId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntertainment(${entry.entityId})" class="delete-button">Delete</button>
    `;

    modal.style.display = 'block';
};

const confirmDeleteEntertainment = (entityId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(entityId);
    }
};

const deleteEntry = async (entityId) => {
    try {
        await axios.delete(`http://localhost:8080/app/entertainment/delete/${entityId}`);
        
        entertainmentEntries = await fetchEntertainmentList();
        renderEntertainmentList(entertainmentEntries, currentPage);
        
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting entityId:', error.message);
    }
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = async () => {
    addModalContent.innerHTML = `
    <h2>Add Entertainment Entry</h2><hr />
    <div class="modal-body">
        <input class="input" type="text" name="name" placeholder="Entertainment Title" /><br />
        <label for="entertainmentTypesDropdown">Select Entertainment Type:</label>
        <select id="entertainmentTypesDropdown" name="entertainmentTypeId"></select> <!-- New dropdown element -->
    </div><hr />
    <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
    <script>
        submitBtn.addEventListener('click', () => submitInfo())
    </script>
    `;

    entertainmentTypesDropdown = document.getElementById('entertainmentTypesDropdown')
    
    await fetchEntertainmentTypes();

    fetchEntertainmentTypesDropdown();

    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        const name = document.querySelector('input[name="name"]').value;
        const entertainmentTypeId = document.querySelector('select[name="entertainmentTypeId"]').value;

        const data = {
            name: name,
            entertainmentTypeId: entertainmentTypeId
        };

        const response = await axios.post('http://localhost:8080/app/entertainment/add', data);

        console.log('Entry added successfully:', response.data);

        myAddModal.style.display = 'none';

        entertainmentEntries = await fetchEntertainmentList();

        renderEntertainmentList(entertainmentEntries, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error submitting entertaiment information:', error.message);
    }
}

closeBtn.onclick = () => {
    modal.style.display = 'none';
};

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
    try {
        entertainmentEntries = await fetchEntertainmentList();
        renderEntertainmentList(entertainmentEntries, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error initializing page:',error.message);
    }
};

const renderPagination = () => {
    const totalPages = Math.ceil(entertainmentEntries.length / itemsPerPage);
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => onPageClick(i));
        paginationContainer.appendChild(button);
    }
};

const onPageClick = (page) => {
    currentPage = page;
    renderEntertainmentList(entertainmentEntries, currentPage);
};

// Initialize the page
initPage();
