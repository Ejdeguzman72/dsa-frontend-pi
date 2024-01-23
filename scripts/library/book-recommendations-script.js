const bookListContainer = document.getElementById('bookList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

// Fetch book list using Axios
const fetchBookList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/books/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching book list:', error.message);
        return [];
    }
};

// Render book list items
const renderBookList = (bookList, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const booksToDisplay = bookList.slice(startIdx, endIdx);

    bookListContainer.innerHTML = '';

    booksToDisplay.forEach((book, index) => {
        const bookElement = document.createElement('div');
        bookElement.classList.add('book-element');
        bookElement.dataset.index = startIdx + index;

        const titleElement = document.createElement('h3');
        titleElement.textContent = book.title;

        const authorElement = document.createElement('p');
        authorElement.textContent = `Author: ${book.author}`;

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = book.descr;

        bookElement.appendChild(titleElement);
        bookElement.appendChild(authorElement);
        bookElement.appendChild(descriptionElement);

        bookElement.addEventListener('click', () => openModal(book));

        bookListContainer.appendChild(bookElement);
    });
};

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let books = {};

// Open modal with book details
const openModal = (book) => {
    modalContent.innerHTML = `
        <h2>${book.title}</h2>
        <p>Author: ${book.author}</p>
        <p>${book.descr}</p>
        <button onClick="updateBook(${book.bookId})">Update</button>
        <button onClick="confirmDeleteBook(${book.bookId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

// Function to confirm book deletion
const confirmDeleteBook = (bookId) => {
    const confirmModal = window.confirm('Are you sure you want to delete these book details?');
    if (confirmModal) {
        deleteBook(bookId);
    }
};

// Function to handle auto shop deletion
const deleteBook = async (bookId) => {
    try {
        
        await axios.delete(`http://localhost:8080/app/books/delete/${bookId}`);
        
        // Optionally, you can reload the auto shop list after deletion
        books = await fetchBookList();
        renderBookList(books, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting book:', error.message);
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
    books = await fetchBookList();
    renderBookList(books, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(books.length / itemsPerPage);
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
    renderBookList(books, currentPage);
};

// Initialize the page
initPage();
