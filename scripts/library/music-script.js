const musicListContainer = document.getElementById('musicList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const myAddModal = document.getElementById('myAddModal');
const addModalCloseBtn = document.getElementById('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');

// Fetch book list using Axios
const fetchMusicList = async () => {
    try {
        const response = await axios.get('http://localhost:8080/app/music/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching music list:', error.message);
        return [];
    }
};

// Render book list items
const renderMusicList = (musicList, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const musicToDisplay = musicList.slice(startIdx, endIdx);

    musicListContainer.innerHTML = '';

    musicToDisplay.forEach((music, index) => {
        const musicElement = document.createElement('div');
        musicElement.classList.add('music-element');
        musicElement.dataset.index = startIdx + index;

        const titleElement = document.createElement('h3');
        titleElement.textContent = `${music.title} - ${music.artist}`;

        musicElement.appendChild(titleElement);

        musicElement.addEventListener('click', () => openModal(music));

        musicListContainer.appendChild(musicElement);
    });
};

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let music = {};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Music Information</h2><hr />
        <input class="input" type="text" name="title" placeholder="Title" />
        <input class="input" type="text" name="artist" placeholder="Artist" /><br />
        <input class="input" type="text" name="genre" placeholder="Genre" /><br />
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button>
        <script>submitBtn.addEventListener('click', () => submitInfo())</script>
    `;
    myAddModal.style.display = 'block';
};

const submitInfo = async () => {
    try {
        // Get book information from the form or wherever it's stored
        const title = document.querySelector('input[name="title"]').value;
        const artist = document.querySelector('input[name="artist"]').value;
        const genre = document.querySelector('input[name="genre"]').value;

        // Validate the required fields if needed

        // Create a data object with the book information
        const data = {
            title: title,
            artist: artist,
            genre: genre
        };

        // Send a POST request to add the book information
        const response = await axios.post('http://localhost:8080/app/music/add-song-information', data);

        // Optionally, handle the response or perform additional actions
        console.log('Book added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        music = await fetchMusicList();
        renderMusicList(music, currentPage);
    } catch (error) {
        console.error('Error submitting book information:', error.message);
        // Handle errors or provide feedback to the user
    }
}

// Open modal with music details
const openModal = (music) => {
    modalContent.innerHTML = `
        <h2>${music.title}</h2><hr />
        <p>Author: ${music.artist}</p>
        <p>Genre: ${music.genre}</p>
        <button onClick="updateEntry(${music.songId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${music.songId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

const confirmDeleteEntry = (songId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(songId);
    }
};

// Function to handle music deletion
const deleteEntry = async (songId) => {
    try {
        
        await axios.delete(`http://localhost:8080/app/music/delete/${songId}`);
        
        // Optionally, you can reload the music list after deletion
        entries = await fetchMusicList();
        renderMusicList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting songId:', error.message);
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
};

// Initialize page
const initPage = async () => {
    music = await fetchMusicList();
    renderMusicList(music, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(music.length / itemsPerPage);
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
    renderMusicList(music, currentPage);
};

// Initialize the page
initPage();
