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
        <h2>${music.title}</h2>
        <p>Author: ${music.artist}</p>
        <p>Genre: ${music.genre}</p>
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
