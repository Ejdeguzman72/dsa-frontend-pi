const medicalTrxListContainer = document.getElementById('medicalTrxList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const addModalButton = document.getElementById('addModalButton');
const myAddModal = document.getElementById('myAddModal');
const submitBtn = document.getElementById('submitBtn');
let medicalOfficeDropdown;
let trxTypeDropdown;
let userDropdown;

// Pagination
const itemsPerPage = 4;
let currentPage = 1;
let transactions = [];
let medicalOffices = [];
let transactionTypes = [];
let users = [];

// Fetch medical trx list using Axios
const fetchMedicalTrxList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/medical-transactions/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching medical transaction list:', error.message);
        return [];
    }
};

const fetchMedicalOfficesList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/medical-offices/all');
        medicalOffices = response.data.list;
        console.log(medicalOffices)
    } catch (error) {
        console.error('Error fetching medical office list:', error.message);
        return [];
    }
};

const fetchTransactionTypesList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/transaction-types/all');
        transactionTypes = response.data.list;
    } catch (error) {
        console.error('Error fetching transaction type list:', error.message);
        return [];
    }
};

const fetchUsers = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/users/all');
        users = response.data.list;
    } catch (error) {
        console.error('Error fetching user list:', error.message);
        return [];
    } 
}

// Render medical trx list items
const renderMedicalTrxList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const medicalTrxToDisplay = entries.slice(startIdx, endIdx);

    medicalTrxListContainer.innerHTML = '';

    medicalTrxToDisplay.forEach((transaction, index) => {
        const medicalTrxElement = document.createElement('div');
        medicalTrxElement.classList.add('medical-trx-element');
        medicalTrxElement.dataset.index = startIdx + index;

        const amountElement = document.createElement('h3');
        amountElement.textContent = transaction.amount.toFixed(2);

        const medTrxDateElement = document.createElement('p');
        medTrxDateElement.textContent = `${transaction.medTrxDate} - ${transaction.username}`;

        medicalTrxElement.appendChild(amountElement);
        medicalTrxElement.appendChild(medTrxDateElement);

        medicalTrxElement.addEventListener('click', () => openModal(transaction));

        medicalTrxListContainer.appendChild(medicalTrxElement);
    });
};

const renderMedicalOfficeDropdown = () => {
    medicalOfficeDropdown.innerHTML = '';

    medicalOffices.forEach(type => {
        const option = document.createElement('option');
        option.value = type.medicalOfficeId;
        option.text = `${type.name} - ${type.address} ${type.city}, ${type.state} ${type.zip}`
        medicalOfficeDropdown.add(option);
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

// Open modal with transaction details
const openModal = (transaction) => {
    modalContent.innerHTML = `
        <h2>${transaction.amount.toFixed(2)}</h2><hr />
        <p>Transaction Date: ${transaction.medTrxDate}</p>
        <p>Office: ${transaction.facilityName} - ${transaction.address} ${transaction.city} ${transaction.state} ${transaction.zip} </p>
        <p>Transaction Type: ${transaction.transactionTypeDescr}</p>
        <p>Username: ${transaction.username}</p>
        <button onClick="updateEntry(${transaction.medTrxId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${transaction.medTrxId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

const confirmDeleteEntry = (medTrxId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(medTrxId);
    }
};

// Function to handle entry deletion
const deleteEntry = async (medTrxId) => {
    try {
        
        await axios.delete(`http://localhost:8080/app/medical-transactions/delete/${medTrxId}`);
        
        // Optionally, you can reload the vehicleId list after deletion
        entries = await fetchMedicalTrxList();
        renderMedicalTrxList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting medTrxId:', error.message);
    }
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = async () => {
    addModalContent.innerHTML = `
    <h2>Add Transaction Information</h2><hr />
    <div class="modal-body">
        <input class="input" type="number" name="amount" placeholder="Amount ($0.00)" /><br />
        <input class="input" type="date" name="medTrxDate" placeholder="Payment Date" /><br />
        <select id="medicalOfficeDropdown" name="medicalOfficeId"></select>
        <select id="trxTypeDropdown" name="trxTypeId"></select>
        <select id="userDropdown" name="userId"></select>
    </div><hr />
    <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
    <script>
        submitBtn.addEventListener('click', () => submitInfo())
    </script>
    `;

    medicalOfficeDropdown = document.getElementById('medicalOfficeDropdown');
    trxTypeDropdown = document.getElementById('trxTypeDropdown')
    userDropdown = document.getElementById('userDropdown');

    await fetchMedicalOfficesList();
    await fetchTransactionTypesList();
    await fetchUsers();

    renderMedicalOfficeDropdown();
    renderTransactionTypeDropdown();
    renderUserDropdown();
    renderPagination();

    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        const medTrxDate = document.querySelector('input[name="medTrxDate"]').value;
        const amount = document.querySelector('input[name="amount"]').value;
        const medicalOfficeId = document.querySelector('select[name="medicalOfficeId"]').value;
        const trxTypeId = document.querySelector('select[name="trxTypeId"]').value;
        const userId = document.querySelector('select[name="userId"]').value;

        const data = {
            medTrxDate: medTrxDate,
            amount: amount,
            medicalOfficeId: medicalOfficeId,
            trxTypeId: trxTypeId,
            userId: userId
        };

        const response = await axios.post('http://localhost:8080/app/medical-transactions/add', data);

        console.log('Entry added successfully:', response.data);

        myAddModal.style.display = 'none';

        trxEntries = await fetchMedicalTrxList();
        renderMedicalTrxList(trxEntries, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error submitting transaction information:', error.message);
    }
}

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
};

// Initialize page
const initPage = async () => {
    transactions = await fetchMedicalTrxList();
    renderMedicalTrxList(transactions, currentPage);
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
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderMedicalTrxList(transactions, currentPage);
};

// Initialize the page
initPage();
