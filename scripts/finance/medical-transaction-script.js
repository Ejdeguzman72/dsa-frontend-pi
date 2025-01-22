const medicalTrxListContainer = document.getElementById('medicalTrxList');
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
let updatedMedicalTransaction = {};

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch medical trx list using Axios
const fetchMedicalTrxList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/medical-transactions/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching medical transaction list:', error.message);
        return [];
    }
};

const fetchMedicalTrxById = async (medTrxId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/medical-transactions/transaction/search/id/${medTrxId}`);
        return response.data.transaction;
    } catch (error) {
        console.error('Error fetching medical transaction:', error.message);
        return [];
    }
}

const fetchMedicalOfficesList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/medical-offices/all');
        medicalOffices = response.data.list;
        console.log(medicalOffices)
    } catch (error) {
        console.error('Error fetching medical office list:', error.message);
        return [];
    }
};

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
        <button onClick="openUpdateModal(${transaction.medTrxId})" class="update-button">Update</button>
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
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/medical-transactions/delete/${medTrxId}`);
        
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

        if (!medTrxDate || !amount || !medicalOfficeId || !trxTypeId || !userId) {
            throw new Error('Please fill all required fields');
        }

        const data = {
            medTrxDate: medTrxDate,
            amount: amount,
            medicalOfficeId: medicalOfficeId,
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

        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/medical-transactions/add', data);

        console.log('Entry added successfully:', response.data);

        myAddModal.style.display = 'none';

        trxEntries = await fetchMedicalTrxList();
        renderMedicalTrxList(trxEntries, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error submitting transaction information:', error.message);
    }
}


const openUpdateModal = async (medTrxId) => {
    try {
        updatedMedicalTransaction = await fetchMedicalTrxById(medTrxId);
        if (updatedMedicalTransaction) {
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Transaction Details</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="number" id="updateAmount" placeholder="Amount ($0.00)" value=${updatedMedicalTransaction.amount}/><br />
            <input class="input" type="date" id="updateMedTrxDate" placeholder="Payment Date" value=${updatedMedicalTransaction.medTrxDate}/><br />
            <select id="medicalOfficeDropdown" ></select>
            <select id="trxTypeDropdown" ></select>
            <select id="userDropdown" ></select>
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updatedMedicalTransaction.medTrxDate})">Update</button><br /><br />
    `;
    medicalOfficeDropdown = document.getElementById('medicalOfficeDropdown');
    trxTypeDropdown = document.getElementById('trxTypeDropdown')
    userDropdown = document.getElementById('userDropdown');

    await fetchTransactionTypesList();
    await fetchUsers();

    renderMedicalOfficeDropdown();
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
const submitUpdate = async (medTrxId) => {
    try {
        const updateAmount = document.getElementById('updateAmount').value;
        const updateMedTrxDate = document.getElementById('updateMedTrxDate').value;
        const updateMedicalOfficeId = document.getElementById('medicalOfficeDropdown').value;
        const updateTrxTypeId = document.getElementById('trxTypeDropdown').value;
        const updateUserId = document.getElementById('userDropdown').value;

        // Validate the required fields if needed

        const data = {
            amount: updateAmount,
            medTrxDate: updateMedTrxDate,
            medicalOfficeId: updateMedicalOfficeId,
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

        const response = await axiosWithToken.put(`http://192.168.1.36:8080/app/medical-transactions/update/${data.medTrxId}`, data);

        console.log('Transaction updated successfully:', response);

        updateModal.style.display = 'none';

        transactions = await fetchMedicalTrxList();
        renderMedicalTrxList(transactions, currentPage);
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
        updateModal.style,display = 'none';
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
    const totalPages = Math.ceil(transactions.length / itemsPerPage);  // Based on filtered recipes
    const maxVisiblePages = 5;  // Maximum number of page buttons to show at once
    paginationContainer.innerHTML = '';

    // First button
    const firstButton = document.createElement('button');
    firstButton.textContent = 'First';
    firstButton.disabled = currentPage === 1;
    firstButton.addEventListener('click', () => onPageClick(1));
    paginationContainer.appendChild(firstButton);

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Prev';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => onPageClick(currentPage - 1));
    paginationContainer.appendChild(prevButton);

    // Calculate start and end page range for numeric buttons
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if there are fewer pages at the end
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Numeric page buttons
    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        if (i === currentPage) {
            button.classList.add('active');  // Highlight the active page
        }
        button.addEventListener('click', () => onPageClick(i));
        paginationContainer.appendChild(button);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => onPageClick(currentPage + 1));
    paginationContainer.appendChild(nextButton);

    // Last button
    const lastButton = document.createElement('button');
    lastButton.textContent = 'Last';
    lastButton.disabled = currentPage === totalPages;
    lastButton.addEventListener('click', () => onPageClick(totalPages));
    paginationContainer.appendChild(lastButton);
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderMedicalTrxList(transactions, currentPage);
    renderPagination();
};

// Initialize the page
initPage();
