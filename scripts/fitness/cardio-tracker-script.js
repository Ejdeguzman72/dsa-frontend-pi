const cardioListContainer = document.getElementById('cardioList');
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
let cardioTypesDropdown;
let userDropdown;

// Pagination
const itemsPerPage = 4;

let currentPage = 1;
let entries = [];
let cardioTypes = [];
let users = [];
let updatedCardioDetails = {};

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch cardio tracker list using Axios
const fetchCardioList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/cardio-tracker-app/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching cardio tracker list:', error.message);
        return [];
    }
};

const fetchCardioById = async (cardioId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/cardio-tracker-app/cardio/id/${cardioId}`);
        return response.data.cardio;
    } catch (error) {
        console.error('Error fetching cardio information:', error.message);
        return [];
    }
}

const fetchCardioTypes = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/cardio-types/all');
        cardioTypes = response.data.list;
    } catch (error) {
        console.error('Error fetching cardio type list:', error.message);
        return [];
    } 
}

const fetchUsers = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/users/all');
        users = response.data.list;
    } catch (error) {
        console.error('Error fetching user list:', error.message);
        return [];
    } 
}

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

const renderCardioTypesDropdown = () => {
    cardioTypesDropdown.innerHTML = '';

    cardioTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.cardioTypeId;
        option.text = type.descr;
        cardioTypesDropdown.add(option);
    })
}

const renderUserDropdown = () => {
    userDropdown.innerHTML = '';

    users.forEach(type => {
        const option = document.createElement('option');
        option.value = type.userId;
        option.text = type.username;
        userDropdown.add(option);
    })
}

// Open modal with cardio tracker details
const openModal = (cardio) => {
    modalContent.innerHTML = `
        <h2>${cardio.descr}</h2><hr />
        <p>Distance: ${cardio.cDistance}</p>
        <p>Time: ${cardio.cTime}</p>
        <p>Username: ${cardio.username}</p>
        <p>Date: ${cardio.cDate}</p>
        <button onClick="openUpdateModal(${cardio.cardioId})" class="update-button">Update</button>
        <button onClick="confirmDeleteCardio(${cardio.cardioId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

// Function to confirm cardio deletion
const confirmDeleteCardio = (cardioId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(cardioId);
    }
};

// Function to handle cardio deletion
const deleteEntry = async (cardioId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/cardio-tracker-app/delete/${cardioId}`);
        console.log("Deleting entry with ID: " + cardioId);
        // Optionally, you can reload the cardio list after deletion
        entries = await fetchCardioList();
        renderCardioList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting cardio:', error.message);
    }
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = async () => {
    addModalContent.innerHTML = `
    <h2>Add Cardio Information</h2><hr />
    <div class="modal-body">
        <select id="cardioTypesDropdown" name="cardioTypeId"></select>
        <input class="input" type="date" name="cDate" placeholder="Date" /><br />
        <input class="input" type="number" name="cDistance" placeholder="Distance(miles)" /><br />
        <input class="input" type="text" name="cTime" placeholder="Time" /><br />
        <select id="userDropdown" name="userId"></select>
    </div><hr />
    <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
    <script>
        submitBtn.addEventListener('click', () => submitInfo())
    </script>
    `;
    cardioTypesDropdown = document.getElementById('cardioTypesDropdown')
    userDropdown = document.getElementById('userDropdown');

    await fetchCardioTypes();
    await fetchUsers();

    renderCardioTypesDropdown();
    renderUserDropdown();
    renderPagination();

    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        const cDate = document.querySelector('input[name="cDate"]').value;
        const cDistance = document.querySelector('input[name="cDistance"]').value;
        const cTime = document.querySelector('input[name="cTime"]').value;
        const cardioTypeId = document.querySelector('select[name="cardioTypeId"]').value;
        const userId = document.querySelector('select[name="userId"]').value;

        if (!cDate || !cDistance || !cTime || !cardioTypeId || !userId) {
            throw new Error("Please fill in all required fields.");
        }

        const data = {
            cDate: cDate,
            cDistance: cDistance,
            cTime: cTime,
            cardioTypeId: cardioTypeId,
            userId: userId
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/cardio-tracker-app/add', data);

        console.log('Entry added successfully:', response.data);

        myAddModal.style.display = 'none';

        cardioEntries = await fetchCardioList();
        renderCardioList(cardioEntries, currentPage);
    } catch (error) {
        console.error('Error submitting cardio information:', error.message);
    }
}

const openUpdateModal = async (cardioId) => {
    try {
        updatedCardioDetails = await fetchCardioById(cardioId);
        if (updatedCardioDetails) {
            console.log(updatedCardioDetails);
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Cardio Information Shop</h2>
        <hr />
        <div class="modal-body">
            <select id="cardioTypesDropdown" name="updateCardioTypeId"></select>
            <input class="input" type="date" name="updateCDate" placeholder="Date" value="${updatedCardioDetails.cDate}" id="updateCDate" /><br />
            <input class="input" type="number" name="updateCDistance" placeholder="Distance(miles)" value="${updatedCardioDetails.cDistance}" id="updateCDistance" /><br />
            <input class="input" type="text" name="updateCTime" placeholder="Time" value="${updatedCardioDetails.cTime}" id="updateCTime" /><br />
            <select id="userDropdown" name="updateUserId"></select>
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updatedCardioDetails.cardioId})">Update</button><br /><br />
    `;

    cardioTypesDropdown = document.getElementById('cardioTypesDropdown')
    userDropdown = document.getElementById('userDropdown');

    await fetchCardioTypes();
    await fetchUsers();

    renderCardioTypesDropdown();
    renderUserDropdown();
    renderPagination();

    updateModal.style.display = 'block';
        } else {
            console.error('Error fetching cardio details')
        }
    } catch (error) {
        console.error('Error opening update model:', error.message);
    }
};

// Function to submit the update
const submitUpdate = async (cardioId) => {
    // try {
        const updateCardioTypeId = document.getElementById('cardioTypesDropdown').value;
        const updateCDate = document.getElementById('updateCDate').value;
        const updateCDistance = document.getElementById('updateCDistance').value;
        const updateCTime = document.getElementById('updateCTime').value;
        const updateUserId = document.getElementById('userDropdown').value;

        // Validate the required fields if needed

        const data = {
            cardioTypeId: updateCardioTypeId,
            cDate: updateCDate,
            cDistance: updateCDistance,
            cTime: updateCTime,
            userId: updateUserId,
            cardioId: cardioId
        };

        console.log(data);

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.put(`http://192.168.1.36:8080/app/cardio-tracker-app/update/${data.cardioId}`, data);

        console.log('Cardio Entry updated successfully:', response);

        updateModal.style.display = 'none';

        entries = await fetchCardioList();
        renderCardioList(entries, currentPage);
        renderPagination();
    // } catch (error) {
        console.error('Error updating auto repair shop information:', error.message);
        // Handle errors or provide feedback to the user
    // }
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

    if (event.target === myAddModal) {
        myAddModal.style.display = 'none';
    }

    if (event.target === updateModal) {
        updateModal.style.display = 'none';
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
    const hrElement = document.createElement('hr');
    paginationContainer.appendChild(hrElement);
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderCardioList(entries, currentPage);
};

// Initialize the page
initPage();
