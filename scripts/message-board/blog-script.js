const blogListContainer = document.getElementById('blogList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        console.log('Retrieved token:', token);
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
    const totalPages = Math.ceil(blogs.length / itemsPerPage);
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
    renderBlogList(blogs, currentPage);
};

// Initialize the page
initPage();
