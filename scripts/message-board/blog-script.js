const blogListContainer = document.getElementById('blogList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch blog list using Axios
const fetchBlogList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/posts/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching blog list:', error.message);
        return [];
    }
};

// Render blog list items
const renderBlogList = (blogs, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const blogsToDisplay = blogs.slice(startIdx, endIdx);

    blogListContainer.innerHTML = '';

    blogsToDisplay.forEach((blog, index) => {
        const blogElement = document.createElement('div');
        blogElement.classList.add('blog-element');
        blogElement.dataset.index = startIdx + index;

        const messageElement = document.createElement('h3');
        messageElement.textContent = blog.content;

        blogElement.appendChild(messageElement);

        blogElement.addEventListener('click', () => openModal(blog));

        blogListContainer.appendChild(blogElement);
    });
};

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let blogs = {};

// Open modal with blog details
const openModal = (blog) => {
    modalContent.innerHTML = `
        <h2>${blog.content} - ${blog.createdDate}</h2>
        <p>Username: ${blog.username}</p>
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
    blogs = await fetchBlogList();
    renderBlogList(blogs, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(blogs.length / itemsPerPage);  // Based on filtered recipes
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
    renderBlogList(blogs, currentPage);
    renderPagination();
};

// Initialize the page
initPage();
