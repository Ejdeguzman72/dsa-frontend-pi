const medicalTrxListContainer = document.getElementById('medicalTrxList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

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

// Pagination
const itemsPerPage = 4;
let currentPage = 1;
let transactions = {};

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
const deleteEntry = async (genTrxId) => {
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
