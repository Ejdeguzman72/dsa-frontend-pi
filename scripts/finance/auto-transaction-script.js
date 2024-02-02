const autoTrxListContainer = document.getElementById('autoTrxList');
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

let vehicleDropdown;
let autoShopDropdown;
let trxTypeDropdown;
let userDropdown;

// Pagination
const itemsPerPage = 5;

let currentPage = 1;
let autoTransactions = [];
let vehicles = [];
let autoShops = [];
let transactionTypes = [];
let users = [];
let updatedTranasction = {};

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        console.log('Retrieved token:', token);
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch auto transaction list using Axios
const fetchAutotrxList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/auto-transactions/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching auto repair transaction list:', error.message);
        return [];
    }
};

const fetchTransactionById = async (autoTrxId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/auto-transactions/transaction/search/id/${autoTrxId}`);
        return response.data.transaction
    } catch (error) {
        console.error('Error fetching transaction list:', error.message);
        return {};
    }
}

const fetchVehicleList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/vehicles/all');
        vehicles = response.data.list;
    } catch (error) {
        console.error('Error fetching vehicle list:', error.message);
        return [];
    }
}

const fetchAutoShops = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/auto-repair-shops/all');
        autoShops = response.data.list;
    } catch (error) {
        console.error('Error fetching auto repair shop list:', error.message);
        return [];
    }
}

const fetchTransactionTypesList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/transaction-types/all');
        transactionTypes = response.data.list;
    } catch (error) {
        console.error('Error fetching transaction type list:', error.message);
        return [];
    }
};

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

// Render auto transaction list items
const renderAutotrxList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const autoTrxToDisplay = entries.slice(startIdx, endIdx);

    autoTrxListContainer.innerHTML = '';

    autoTrxToDisplay.forEach((autotrx, index) => {
        const autoTrxElement = document.createElement('div');
        autoTrxElement.classList.add('autotrx-element');
        autoTrxElement.dataset.index = startIdx + index;

        const amountElement = document.createElement('h3');
        amountElement.textContent = autotrx.amount.toFixed(2);

        const autoTrxDateElement = document.createElement('p');
        autoTrxDateElement.textContent = autotrx.autoTrxDate;

        const userElement = document.createElement('p')
        userElement.textContent = autotrx.username;

        autoTrxElement.appendChild(amountElement);
        autoTrxElement.appendChild(autoTrxDateElement);
        autoTrxElement.appendChild(userElement);

        autoTrxElement.addEventListener('click', () => openModal(autotrx));

        autoTrxListContainer.appendChild(autoTrxElement);
    });
};

const renderVehicleDropdown = () => {
    vehicleDropdown.innerHTML = '';

    vehicles.forEach(type => {
        const option = document.createElement('option');
        option.value = type.vehicleId;
        option.text = `${type.year} ${type.make} ${type.make}`
        vehicleDropdown.add(option);
    })
}

const renderAutoshopDropdown = () => {
    autoShops.innerHTML = '';

    autoShops.forEach(type => {
        const option = document.createElement('option');
        option.value = type.autoShopId;
        option.text = `${type.autoShopName} - ${type.address} ${type.city} ${type.state} ${type.zip}`
        autoShopDropdown.add(option);
    })
}


const renderTransactionTypeDropdown = () => {
    trxTypeDropdown.innerHTML = '';

    transactionTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.trxTypeId;
        option.text = type.trxTypeDescr;
        trxTypeDropdown.add(option);
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

// Open modal with auto transaction details
const openModal = (autoTrx) => {
    modalContent.innerHTML = `
        <h2>${autoTrx.amount.toFixed(2)}</h2><hr />
        <p>Transaction Date: ${autoTrx.autoTrxDate}</p>
        <p>Manufacturer: ${autoTrx.make}</p>
        <p>Model: ${autoTrx.model}</p>
        <p>Year: ${autoTrx.year}</p>
        <p>Auto Repair Shop: ${autoTrx.autoShopName}</p>
        <p>User: ${autoTrx.username}</p>
        <p>Transaction Type: ${autoTrx.transactionTypeDescr}</p>
        <button onClick="openUpdateModal(${autoTrx.autoTrxId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${autoTrx.autoTrxId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

const confirmDeleteEntry = (autoTrxId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(autoTrxId);
    }
};

// Function to handle entry deletion
const deleteEntry = async (autoTrxId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/auto-transactions/delete/${autoTrxId}`);
        
        // Optionally, you can reload the vehicleId list after deletion
        entries = await fetchAutotrxList();
        renderAutotrxList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting autoTrxId:', error.message);
    }
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = async () => {
    addModalContent.innerHTML = `
    <h2>Add Transaction Information</h2><hr />
    <div class="modal-body">
        <input class="input" type="number" name="amount" placeholder="Amount ($0.00)" /><br />
        <input class="input" type="date" name="autoTrxDate" placeholder="Payment Date" /><br />
        <select id="vehicleDropdown" name="vehicleId"></select>
        <select id="autoShopDropdown" name="autoShopId"></select>
        <select id="trxTypeDropdown" name="trxTypeId"></select>
        <select id="userDropdown" name="userId"></select>
    </div><hr />
    <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
    <script>
        submitBtn.addEventListener('click', () => submitInfo())
    </script>
    `;

    autoShopDropdown = document.getElementById('autoShopDropdown');
    vehicleDropdown = document.getElementById('vehicleDropdown');
    trxTypeDropdown = document.getElementById('trxTypeDropdown')
    userDropdown = document.getElementById('userDropdown');

    await fetchVehicleList();
    await fetchAutoShops();
    await fetchTransactionTypesList();
    await fetchUsers();

    renderVehicleDropdown();
    renderAutoshopDropdown();
    renderTransactionTypeDropdown();
    renderUserDropdown();
    renderPagination();
    
    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        const autoTrxDate = document.querySelector('input[name="autoTrxDate"]').value;
        const amount = document.querySelector('input[name="amount"]').value;
        const vehicleId = document.querySelector('select[name="vehicleId"]').value;
        const autoShopId = document.querySelector('select[name="autoShopId"]').value;
        const trxTypeId = document.querySelector('select[name="trxTypeId"]').value;
        const userId = document.querySelector('select[name="userId"]').value;

        const data = {
            autoTrxDate: autoTrxDate,
            amount: amount,
            vehicleId: vehicleId,
            autoShopId: autoShopId,
            trxTypeId: trxTypeId,
            userId: userId
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/auto-transactions/add', data);

        console.log('Entry added successfully:', response.data);

        myAddModal.style.display = 'none';

        trxEntries = await fetchAutotrxList();
        renderAutotrxList(trxEntries, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error submitting transaction information:', error.message);
    }
}

const openUpdateModal = async (autoTrxId) => {
    try {
        updatedTranasction = await fetchTransactionById(autoTrxId);
        if (updatedTranasction) {
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Auto Repair Shop</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="number" id="updateAmount" placeholder="Amount ($0.00)" value=${updatedTranasction.amount}/><br />
            <input class="input" type="date" id="updateAutoTrxDate" placeholder="Payment Date" value=${updatedTranasction.autoTrxDate}/><br />
            <select id="vehicleDropdown" ></select>
            <select id="autoShopDropdown" ></select>
            <select id="trxTypeDropdown" ></select>
            <select id="userDropdown" ></select>
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updatedTranasction.autoTrxId})">Update</button><br /><br />
    `;
    autoShopDropdown = document.getElementById('autoShopDropdown');
    vehicleDropdown = document.getElementById('vehicleDropdown');
    trxTypeDropdown = document.getElementById('trxTypeDropdown')
    userDropdown = document.getElementById('userDropdown');

    await fetchVehicleList();
    await fetchAutoShops();
    await fetchTransactionTypesList();
    await fetchUsers();

    renderVehicleDropdown();
    renderAutoshopDropdown();
    renderTransactionTypeDropdown();
    renderUserDropdown();
    renderPagination();
    updateModal.style.display = 'block';
        } else {
            console.error('Error fetching auto repair shop details')
        }
    } catch (error) {
        console.error('Error opening update model:', error.message);
    }
};

// Function to submit the update
const submitUpdate = async (autoTrxId) => {
    // try {
        const updateAmount = document.getElementById('updateAmount').value;
        console.log(updateAmount);
        const updateAutoTrxDate = document.getElementById('updateAutoTrxDate').value;
        console.log(updateAutoTrxDate);
        const updateVehicleId = document.getElementById('vehicleDropdown').value;
        console.log(updateVehicleId);
        const updateAutoShopId = document.getElementById('autoShopDropdown').value;
        console.log(updateAutoShopId);
        const updateTrxTypeId = document.getElementById('trxTypeDropdown').value;
        const updateUserId = document.getElementById('userDropdown').value;

        // Validate the required fields if needed

        const data = {
            amount: updateAmount,
            autoTrxDate: updateAutoTrxDate,
            autoShopId: updateAutoShopId,
            vehicleId: updateVehicleId,
            trxTypeId: updateTrxTypeId,
            userId: updateUserId,
            autoTrxId: autoTrxId
        };

        console.log(data);

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.put(`http://192.168.1.36:8080/app/auto-transactions/update/${data.autoTrxId}`, data);

        console.log('Transaction updated successfully:', response);

        updateModal.style.display = 'none';

        autoTransactions = await fetchAutotrxList();
        renderAutotrxList(autoTransactions, currentPage);
        renderPagination();
    // } catch (error) {
        console.error('Error updating transaction information:', error.message);
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
    autoTransactions = await fetchAutotrxList();
    renderAutotrxList(autoTransactions, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(autoTransactions.length / itemsPerPage);
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
    renderAutotrxList(autoTransactions, currentPage);
};

// Initialize the page
initPage();
