const musicListContainer = document.getElementById('musicList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const myAddModal = document.getElementById('myAddModal');
const addModalCloseBtn = document.getElementById('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');
const updateModal = document.getElementById('myUpdateModal');
const updateModalContent = document.getElementById('updateModalContent');
// const updateCloseBtn = document.getElementById('updateCloseBtn');
const updateSubmitBtn = document.getElementById('updateSubmitBtn');

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let musicEntries = [];
let updateMusicDetails = {};
let jwt;

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        console.log('Retrieved token:', token);
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch book list using Axios
const fetchMusicList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/music/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching music list:', error.message);
        return [];
    }
};

const fetchMusicById = async (songId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/music/song/id/${songId}`);
        return response.data.song;
    } catch (error) {
        console.error('Error fetching music:', error.message);
        return {};
    }
}

// Render music list items
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

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = () => {
    // Clear the modal content (if needed)
    addModalContent.innerHTML = `
        <h2>Add Music Information</h2><hr />
        <div class="modal-body">
            <input class="input" type="text" name="title" placeholder="Title" />
            <input class="input" type="text" name="artist" placeholder="Artist" /><br />
            <input class="input" type="text" name="genre" placeholder="Genre" /><br />
        </div><hr />
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
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

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Send a POST request to add the book information
        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/music/add-song-information', data);

        // Optionally, handle the response or perform additional actions
        console.log('Book added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        music = await fetchMusicList();

        renderMusicList(music, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error submitting music information:', error.message);
        // Handle errors or provide feedback to the user
    }
}

// Open modal with music details
const openModal = (music) => {
    modalContent.innerHTML = `
        <h2>${music.title}</h2><hr />
        <p>Author: ${music.artist}</p>
        <p>Genre: ${music.genre}</p>
        <button onClick="openUpdateModal(${music.songId})" class="update-button">Update</button>
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
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/music/delete/${songId}`);
        
        // Optionally, you can reload the music list after deletion
        entries = await fetchMusicList();
        renderMusicList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting songId:', error.message);
    }
};

const openUpdateModal = async (songId) => {
    try {
        updateMusicDetails = await fetchMusicById(songId);
        if (updateMusicDetails) {
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Music Entry</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="text" id="updateTitle" placeholder="Song Title" value="${updateMusicDetails.title}" />
            <input class="input" type="text" id="updateArtist" placeholder="Address" value="${updateMusicDetails.artist}" /><br />
            <input class="input" type="text" name="updateGenre" placeholder="Genre" value="${updateMusicDetails.genre}" /><br />
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updateMusicDetails.songId})">Update</button><br /><br />
    `;
    updateModal.style.display = 'block';
        } else {
            console.error('Error fetching music details')
        }
    } catch (error) {
        console.error('Error opening update model:', error.message);
    }
};

// Function to submit the update
const submitUpdate = async (songId) => {
    try {
        const updateTitle = document.getElementById('updateTitle').value;
        const updateArtist = document.getElementById('updateArtist').value;
        const updateGenre = document.getElementById('updateGenre').value;

        // Validate the required fields if needed

        const data = {
            songId: songId,
            title: updateTitle,
            artist: updateArtist,
            genre: updateGenre
        };

        console.log(data);

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.put(`http://192.168.1.36:8080/app/music/update/${data.songId}`, data);

        console.log('Song Information updated successfully:', response);

        updateModal.style.display = 'none';

        musicEntries = await fetchMusicList();
        renderBookList(musicEntries, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error updating music information:', error.message);
        // Handle errors or provide feedback to the user
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

    if (event.target === updateModal) {
        updateModal.style.display = 'none';
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
    const hrElement = document.createElement('hr');
    paginationContainer.appendChild(hrElement);
};

// Handle pagination button click
const onPageClick = (page) => {
    currentPage = page;
    renderMusicList(music, currentPage);
};

// Initialize the page
initPage();
