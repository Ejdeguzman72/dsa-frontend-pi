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
const updateModal = document.getElementById('myUpdateModal');
const updateModalContent = document.getElementById('updateModalContent');
// const updateCloseBtn = document.getElementById('updateCloseBtn');
const updateSubmitBtn = document.getElementById('updateSubmitBtn');
let entertainmentTypeFilterDropdown = document.getElementById('entertainment-filter');
let entertainmentTypesDropdown;

// Constants
const itemsPerPage = 5;

// State
let currentPage = 1;
let entertainmentEntries = [];
let entertainmentTypes = [];
let updateEntertainmentDetails = {};
let jwt;

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch entertainment list using Axios
const fetchEntertainmentList = async (entityId) => {
    try {
        const jwtToken = await retrieveJwt();
        let response;
        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        selectedType = entertainmentTypeFilterDropdown.value;

        if (selectedType && selectedType > 0) {
            response = await axiosWithToken.get(`http://192.168.1.36:8080/app/entertainment/all/type/${selectedType}`)
        } else {
            response = await axiosWithToken.get('http://192.168.1.36:8080/app/entertainment/all');
        }

        return response.data.list || [];
    } catch (error) {
        console.error('Error fetching entertainment list:', error.message);
        return [];
    }
};

const fetchEntertainmentById = async (entityId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/entertainment/search/id/${entityId}`);
        return response.data.entertainment;
    } catch (error) {
        console.error('Error fetching entertainment list:', error.message);
        return {};
    }
}

// Fetch entertainment types
const fetchEntertainmentTypes = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/entertainment-types/all');
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

// Fetch entertainment types
const fetchEntertainmentTypesForFilter = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/entertainment-types/all');
        console.log(response.data.list)
        return response.data.list;
    } catch (error) {
        console.error('Error fetching entertainment types:', error);
    }
};

const renderEntertainmentTypeFilter = async () => {
    const filterTypes = await fetchEntertainmentTypesForFilter();
    console.log(filterTypes);
    if (!Array.isArray(filterTypes)) {
        console.error('Expected an array of entertainment types but got:', filterTypes);
        return;
    }
    entertainmentTypeFilterDropdown.innerHTML = '<option value="">All Types</option>';
    filterTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.entertainmentTypeId;
        option.text = type.descr;
        entertainmentTypeFilterDropdown.add(option);
    })
}

entertainmentTypeFilterDropdown.addEventListener('change', async () => {
    console.log('Dropdown value selected', entertainmentTypeFilterDropdown.value);
    entertainmentEntries = await fetchEntertainmentList();
    renderEntertainmentList(entertainmentEntries, currentPage);
    console.log('rendering the new list');
    renderPagination();
})

const openModal = (entry) => {
    modalContent.innerHTML = `
        <h2>${entry.name + ' - ' + entry.descr}</h2><hr />
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
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/entertainment/delete/${entityId}`);
        
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

        if (!name || !entertainmentTypeId) {
            throw new Error("Please fill in all required fields.");
        }

        const data = {
            name: name,
            entertainmentTypeId: entertainmentTypeId
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/entertainment/add', data);

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
        renderEntertainmentTypeFilter();
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
    const hrElement = document.createElement('hr');
    paginationContainer.appendChild(hrElement);
};

const onPageClick = (page) => {
    currentPage = page;
    renderEntertainmentList(entertainmentEntries, currentPage);
};

// Initialize the page
initPage();
