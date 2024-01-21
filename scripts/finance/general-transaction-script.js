const generalTrxListContainer = document.getElementById('generalTrxList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

// Fetch auto repair shop list using Axios
const fetchGeneralTrxList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/general-transactions/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching general transaction list:', error.message);
        return [];
    }
};

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

// Pagination
const itemsPerPage = 4;
let currentPage = 1;
let transactions = {};

// Open modal with transaction details
const openModal = (transaction) => {
    modalContent.innerHTML = `
        <h2>${transaction.amount.toFixed(2)}</h2>
        <p>Transaction Date: ${transaction.paymentDate}</p>
        <p>Entity: ${transaction.entity}</p>
        <p>Transaction Type: ${transaction.transactionTypeDescr}</p>
        <p>Username: ${transaction.username}</p>
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
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderGeneralTrxList(transactions, currentPage);
};

// Initialize the page
initPage();
