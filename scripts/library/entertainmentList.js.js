// entertainmentList.js

// Elements
const entertainmentListContainer = document.getElementById('entertainmentList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalButton = document.getElementById('addModalButton');
const entries = {};

// Constants
const itemsPerPage = 5;

// State
let currentPage = 1;

// Fetch auto entertainment list using Axios
const fetchEntertainmentList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/entertainment/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching entertainment list:', error.message);
        return [];
    }
};

// Render entertainment list items
const renderEntertainmentList = (entries, page) => {
    // Your existing rendering logic
};

// Open modal with entertainment details
const openModal = (entry) => {
    // Your existing modal opening logic
};

// Function to confirm entertainment deletion
const confirmDeleteEntertainment = (entityId) => {
    // Your existing deletion confirmation logic
};

// Function to handle entry deletion
const deleteEntry = async (entityId) => {
    // Your existing deletion logic
};

// Initialize page
const initPage = async () => {
    entries = await fetchEntertainmentList();
    renderEntertainmentList(entries, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    // Your existing pagination rendering logic
};

// Handle pagination button click
const onPageClick = (page) => {
    // Your existing pagination click handling logic
};

// Close modal if clicked outside the modal
window.onclick = (event) => {
    // Your existing modal close logic
};

// Include the initPage function in the file
initPage();
