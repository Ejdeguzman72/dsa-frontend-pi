const musicListContainer = document.getElementById('musicList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

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
