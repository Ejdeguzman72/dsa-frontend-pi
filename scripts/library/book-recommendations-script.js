const bookListContainer = document.getElementById('bookList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const myAddModal = document.getElementById('myAddModal');
const addModalCloseBtn = document.getElementById * ('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');
const updateModal = document.getElementById('myUpdateModal');
const updateModalContent = document.getElementById('updateModalContent');
// const updateCloseBtn = document.getElementById('updateCloseBtn');
const updateSubmitBtn = document.getElementById('updateSubmitBtn');
let bookAuthorFilterDropdown = document.getElementById('book-author-filter');
let jwt;

// Pagination
const itemsPerPage = 5;

let currentPage = 1;
let books = {};
let updateBookDetais = {};

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch book list using Axios
const fetchBookList = async () => {
    try {
        const jwtToken = await retrieveJwt();
        let response;
        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        let selectedAuthor = bookAuthorFilterDropdown.value;
        if (selectedAuthor && selectedAuthor.trim() !== "") {
            response = await axiosWithToken.get(`http://192.168.1.36:8080/app/books/book/search/author/${selectedAuthor}`);
        } else {
            response = await axiosWithToken.get('http://192.168.1.36:8080/app/books/all');
        }
        return response.data.list;
    } catch (error) {
        console.error('Error fetching book list:', error.message);
        return [];
    }
};

const fetchAuthorList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/books/all');
        const books = response.data.list;
        const authorList = [...new Set(books.map(book => book.author))];
        return authorList;
    } catch (error) {
        console.error('Error fetching author list:', error.message);
        return [];
    }
}

const fetchBookById = async (bookId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/books/book/search/id/${bookId}`);
        return response.data.book;
    } catch (error) {
        console.error('Error fetching book with ID: ', updateBookDetais, error.message);
    }
}

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

const renderAuthorDropdown = async () => {
    const authorFilterTypes = await fetchAuthorList();
    if (!Array.isArray(authorFilterTypes)) {
        console.log('Expected an array of authors but got: ', authorFilterTypes);
        return;
    }
    bookAuthorFilterDropdown.innerHTML = '<option value="">All Authors</option>';
    authorFilterTypes.forEach(author => {
        const option = document.createElement('option');
        option.value = author;
        option.text = author;
        bookAuthorFilterDropdown.add(option);
    })
}

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Book Information</h2><hr />
        <div class="modal-body">
            <input class="input" type="text" name="title" placeholder="Title" />
            <input class="input" type="text" name="author" placeholder="Author" /><br />
            <textarea class="textarea" cols="50" rows="5"></textarea/><br />
        </div><hr />
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
        <script>submitBtn.addEventListener('click', () => submitInfo())</script>
        <script src="scripts/dropdown/entertainment-type-dropdown.js"></script>
    `;
    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        // Get book information from the form or wherever it's stored
        const title = document.querySelector('input[name="title"]').value;
        const author = document.querySelector('input[name="author"]').value;
        const description = document.querySelector('textarea').value;

        // Validate required fields
        if (!title || !author || !description) {
            throw new Error("Please fill in all required fields.");
        }

        // Create a data object with the book information
        const bookData = {
            title: title,
            author: author,
            descr: description
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Send a POST request to add the book information
        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/books/add', bookData);

        // Optionally, handle the response or perform additional actions
        console.log('Book added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        books = await fetchBookList();

        renderBookList(books, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error submitting book information:', error.message);
        // Handle errors or provide feedback to the user
    }
}

// Open modal with book details
const openModal = (book) => {
    modalContent.innerHTML = `
        <h2>${book.title}</h2><hr />
        <p>Author: ${book.author}</p>
        <p>${book.descr}</p>
        <button onClick="openUpdateModal(${book.bookId})" class="update-button">Update</button>
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
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/books/delete/${bookId}`);

        // Optionally, you can reload the auto shop list after deletion
        books = await fetchBookList();
        renderBookList(books, currentPage);

        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting book:', error.message);
    }
};

const openUpdateModal = async (bookId) => {
    try {
        updateBookDetais = await fetchBookById(bookId);
        if (updateBookDetais) {
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Book Information</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="text" id="updateTitle" placeholder="Repair Shop Name" value="${updateBookDetais.title}" />
            <input class="input" type="text" id="updateAuthor" placeholder="Address" value="${updateBookDetais.author}" /><br />
            <textarea class="textarea" cols="50" rows="5" id="updateDescr">${updateBookDetais.descr}</textarea/><br />
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updateBookDetais.bookId})">Update</button><br /><br />
    `;
            updateModal.style.display = 'block';
        } else {
            console.error('Error fetching book details')
        }
    } catch (error) {
        console.error('Error opening update model:', error.message);
    }
};

// Function to submit the update
const submitUpdate = async (bookId) => {
    try {
        const updateTitle = document.getElementById('updateTitle').value;
        const updateAuthor = document.getElementById('updateAuthor').value;
        const updateDescr = document.getElementById('updateDescr').value;

        // Validate the required fields if needed

        const data = {
            bookId: bookId,
            title: updateTitle,
            author: updateAuthor,
            descr: updateDescr
        };

        console.log(data);

        const response = await axios.put(`http://192.168.1.36:8080/app/books/update/${data.bookId}`, data);

        console.log('Book Information updated successfully:', response);

        updateModal.style.display = 'none';

        books = await fetchBookList();
        renderBookList(books, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error updating book information:', error.message);
        // Handle errors or provide feedback to the user
    }
};

// Close modal
closeBtn.onclick = () => {
    modal.style.display = 'none';
};

addModalCloseBtn.onclick = () => {
    myAddModal.style.display = 'none';
}

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
    renderAuthorDropdown();
    books = await fetchBookList();
    renderBookList(books, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(books.length / itemsPerPage);  // Based on filtered recipes
    const maxVisiblePages = 5;  // Maximum number of page buttons to show at once
    paginationContainer.innerHTML = '';

    // First button
    const firstButton = document.createElement('button');
    firstButton.classList.add('pagination-button')
    firstButton.textContent = 'First';
    firstButton.disabled = currentPage === 1;
    firstButton.addEventListener('click', () => onPageClick(1));
    paginationContainer.appendChild(firstButton);

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.classList.add('pagination-button')
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
        button.classList.add('pagination-button')
        button.textContent = i;
        if (i === currentPage) {
            button.classList.add('active');  // Highlight the active page
        }
        button.addEventListener('click', () => onPageClick(i));
        paginationContainer.appendChild(button);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.classList.add('pagination-button')
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => onPageClick(currentPage + 1));
    paginationContainer.appendChild(nextButton);

    // Last button
    const lastButton = document.createElement('button');
    lastButton.classList.add('pagination-button');
    lastButton.textContent = 'Last';
    lastButton.disabled = currentPage === totalPages;
    lastButton.addEventListener('click', () => onPageClick(totalPages));
    paginationContainer.appendChild(lastButton);
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderBookList(books, currentPage);
    renderPagination();
};

bookAuthorFilterDropdown.addEventListener('change', async () => {
    console.log('Dropdown value selected', bookAuthorFilterDropdown.value);
    books = await fetchBookList();
    renderBookList(books, currentPage);
    console.log('rendering the new list');
    renderPagination();
})

// Initialize the page
initPage();
