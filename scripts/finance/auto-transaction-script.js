const autoTrxListContainer = document.getElementById('autoTrxList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

// Fetch auto transaction list using Axios
const fetchAutotrxList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/auto-transactions/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching auto repair transaction list:', error.message);
        return [];
    }
};

// Render auto transaction list items
const renderAutotrxList = (autoTrxs, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const autoTrxToDisplay = autoTrxs.slice(startIdx, endIdx);

    autoTrxListContainer.innerHTML = '';

    autoTrxToDisplay.forEach((autotrx, index) => {
        const autoTrxElement = document.createElement('div');
        autoTrxElement.classList.add('autotrx-element');
        autoTrxElement.dataset.index = startIdx + index;

        const amountElement = document.createElement('h3');
        amountElement.textContent = autotrx.amount;

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

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let autoTransactions = {};

// Open modal with auto transaction details
const openModal = (autoTrx) => {
    modalContent.innerHTML = `
        <h2>${autoTrx.amount}</h2>
        <p>Transaction Date: ${autoTrx.autoTrxDate}</p>
        <p>Manufacturer: ${autoTrx.make}</p>
        <p>Model: ${autoTrx.model}</p>
        <p>Year: ${autoTrx.year}</p>
        <p>Auto Repair Shop: ${autoTrx.autoShopName}</p>
        <p>User: ${autoTrx.username}</p>
        <p>Transaction Type: ${autoTrx.transactionTypeDescr}</p>
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
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderAutotrxList(autoTransactions, currentPage);
};

// Initialize the page
initPage();
