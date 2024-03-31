const generalTrxListContainer = document.getElementById('generalTrxList');
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
let trxTypeDropdown;
let userDropdown;

// Pagination
const itemsPerPage = 4;
let currentPage = 1;
let transactions = [];
let transactionTypes = [];
let users = [];
let updatedTransactionDetails = {};

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        console.log('Retrieved token:', token);
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch general transaction list using Axios
const fetchGeneralTrxList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/general-transactions/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching general transaction list:', error.message);
        return [];
    }
};

const fetchTransactionById = async (genTrxId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/general-transactions/transaction/search/id/${genTrxId}`);
        return response.data.transaction
    } catch (error) {
        console.error('Error fetching transaction list:', error.message);
        return {};
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

// Render general trx list items
const renderGeneralTrxList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const generalTrxToDisplay = entries.slice(startIdx, endIdx);

    generalTrxListContainer.innerHTML = '';

    generalTrxToDisplay.forEach((transaction, index) => {
        const generalTrxElement = document.createElement('div');
        generalTrxElement.classList.add('general-trx-element');
        generalTrxElement.dataset.index = startIdx + index;

        const amountElement = document.createElement('h3');
        amountElement.textContent = transaction.amount.toFixed(2);

        const generalTrxDateElement = document.createElement('p');
        generalTrxDateElement.textContent = `${transaction.paymentDate} - ${transaction.username}`;

        generalTrxElement.appendChild(amountElement);
        generalTrxElement.appendChild(generalTrxDateElement);

        generalTrxElement.addEventListener('click', () => openModal(transaction));

        generalTrxListContainer.appendChild(generalTrxElement);
    });
};

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

// Open modal with transaction details
const openModal = (transaction) => {
    modalContent.innerHTML = `
        <h2>${transaction.amount.toFixed(2)}</h2><hr />
        <p>Transaction Date: ${transaction.paymentDate}</p>
        <p>Entity: ${transaction.entity}</p>
        <p>Transaction Type: ${transaction.transactionTypeDescr}</p>
        <p>Username: ${transaction.username}</p>
        <button onClick="openUpdateModal(${transaction.genTrxId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${transaction.genTrxId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

const confirmDeleteEntry = (genTrxId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(genTrxId);
    }
};

// Function to handle entry deletion
const deleteEntry = async (genTrxId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/general-transactions/delete/${genTrxId}`);
        
        // Optionally, you can reload the vehicleId list after deletion
        entries = await fetchGeneralTrxList();
        renderGeneralTrxList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting genTrxId:', error.message);
    }
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = async () => {
    addModalContent.innerHTML = `
    <h2>Add Transaction Information</h2><hr />
    <div class="modal-body">
        <input class="input" type="number" name="amount" placeholder="Amount ($0.00)" /><br />
        <input class="input" type="date" name="paymentDate" placeholder="Payment Date" /><br />
        <input class="input" type="text" name="entity" placeholder="Entity" /><br />
        <select id="trxTypeDropdown" name="trxTypeId"></select>
        <select id="userDropdown" name="userId"></select>
    </div><hr />
    <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
    <script>
        submitBtn.addEventListener('click', () => submitInfo())
    </script>
    `;
    trxTypeDropdown = document.getElementById('trxTypeDropdown')
    userDropdown = document.getElementById('userDropdown');

    await fetchTransactionTypesList();
    await fetchUsers();

    renderTransactionTypeDropdown();
    renderUserDropdown();
    renderPagination();

    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        const paymentDate = document.querySelector('input[name="paymentDate"]').value;
        const amount = document.querySelector('input[name="amount"]').value;
        const entity = document.querySelector('input[name="entity"]').value;
        const trxTypeId = document.querySelector('select[name="trxTypeId"]').value;
        const userId = document.querySelector('select[name="userId"]').value;

        const data = {
            paymentDate: paymentDate,
            amount: amount,
            entity: entity,
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

        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/general-transactions/add', data);

        console.log('Entry added successfully:', response.data);

        myAddModal.style.display = 'none';

        trxEntries = await fetchGeneralTrxList();
        renderGeneralTrxList(trxEntries, currentPage);
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
        <h2>Update Transaction Details</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="number" id="updateAmount" placeholder="Amount ($0.00)" value=${updatedTranasction.amount}/><br />
            <input class="input" type="date" id="updatePaymentDate" placeholder="Payment Date" value=${updatedTranasction.paymentDate}/><br />
            <input class="input" type="text" id="updateEntity" placeholder="Payment Date" value=${updatedTranasction.entity}/><br />
            <select id="trxTypeDropdown" ></select>
            <select id="userDropdown" ></select>
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updatedTranasction.autoTrxId})">Update</button><br /><br />
    `;
    trxTypeDropdown = document.getElementById('trxTypeDropdown')
    userDropdown = document.getElementById('userDropdown');

    await fetchTransactionTypesList();
    await fetchUsers();

    renderTransactionTypeDropdown();
    renderUserDropdown();
    renderPagination();
    updateModal.style.display = 'block';
        } else {
            console.error('Error fetching transaction details')
        }
    } catch (error) {
        console.error('Error opening update model:', error.message);
    }
};

// Function to submit the update
const submitUpdate = async (genTrxId) => {
    try {
        const updateAmount = document.getElementById('updateAmount').value;
        const updateAutoTrxDate = document.getElementById('updatePaymentDate').value;
        const updateEntity = document.getElementById('updateEntity').value;
        const updateTrxTypeId = document.getElementById('trxTypeDropdown').value;
        const updateUserId = document.getElementById('userDropdown').value;

        // Validate the required fields if needed

        const data = {
            amount: updateAmount,
            autoTrxDate: updateAutoTrxDate,
            entity: updateEntity,
            trxTypeId: updateTrxTypeId,
            userId: updateUserId,
            genTrxId: genTrxId
        };

        console.log(data);

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.put(`http://192.168.1.36:8080/app/general-transactions/update/${data.genTrxId}`, data);

        console.log('Transaction updated successfully:', response);

        updateModal.style.display = 'none';

        transactions = await fetchGeneralTrxList();
        renderGeneralTrxList(transactions, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error updating transaction information:', error.message);
        // Handle errors or provide feedback to the user
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

    if (event.target === myAddModal) {
        myAddModal.style.display = 'none';
    }

    if (event.target === updateModal) {
        updateModal.style.display = 'none';
    }
};

// Initialize page
const initPage = async () => {
    transactions = await fetchGeneralTrxList();
    renderGeneralTrxList(transactions, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
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
    renderGeneralTrxList(transactions, currentPage);
};

// Initialize the page
initPage();
