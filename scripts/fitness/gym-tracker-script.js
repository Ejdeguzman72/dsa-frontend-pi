const gymTrackerListContainer = document.getElementById('gymTrackerList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeListModal');
const addModalContent = document.getElementById('addModalContent');
const addModalButton = document.getElementById('addModalButton');
const myAddModal = document.getElementById('myAddModal');
const submitBtn = document.getElementById('submitBtn');
const updateModal = document.getElementById('myUpdateModal');
const updateModalContent = document.getElementById('updateModalContent');
// const updateCloseBtn = document.getElementById('updateCloseBtn');
const updateSubmitBtn = document.getElementById('updateSubmitBtn');
let exerciseTypesDropdown;
let userDropdown;

// Pagination
const itemsPerPage = 5;

let currentPage = 1;
let entries = [];
let exerciseTypes = [];
let users = [];
let updatedExerciseEnty = {};

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}


// Fetch gym tracker list using Axios
const fetchGymTrackerList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/gym-tracker/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching gym tracker list:', error.message);
        return [];
    }
};

const fetchExerciseEntry = async (exerciseId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/gym-tracker/exercise/search/id/${exerciseId}`);
        return response.data.exercise;
    } catch (error) {
        console.error('Error fetching exercise entry:', error.message);
        return [];
    } 
}

const fetchExerciseTypes = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/exercise-type/all');
        exerciseTypes = response.data.list;
    } catch (error) {
        console.error('Error fetching exercise type list:', error.message);
        return [];
    } 
}

const fetchUsers = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/users/all');
        users = response.data.list;
    } catch (error) {
        console.error('Error fetching user type list:', error.message);
        return [];
    } 
}

// Render gym tracker list items
const renderGymTrackerList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const entriesToDisplay = entries.slice(startIdx, endIdx);

    gymTrackerListContainer.innerHTML = '';

    entriesToDisplay.forEach((entry, index) => {
        const gymTrackerElement = document.createElement('div');
        gymTrackerElement.classList.add('gym-tracker-element');
        gymTrackerElement.dataset.index = startIdx + index;

        exerciseElement = document.createElement('h3');
        exerciseElement.textContent = entry.exerciseName;

        setsElement = document.createElement('p');
        setsElement.textContent = `${entry.sets} - ${entry.reps}`;

        gymTrackerElement.appendChild(exerciseElement);
        gymTrackerElement.appendChild(setsElement);

        gymTrackerElement.addEventListener('click', () => openModal(entry));

        gymTrackerListContainer.appendChild(gymTrackerElement);
    });
};

const renderExerciseTypeDropdown = () => {
    exerciseTypesDropdown.innerHTML = '';

    exerciseTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.exerciseTypeId;
        option.text = type.exercise_type_name;
        exerciseTypesDropdown.add(option);
    })
}

const renderUserDropdown = () => {
    userDropdown.innerHTML = '';

    users.forEach(type => {
        const option = document.createElement('option');
        option.value = type.userId;
        option.text = type.username;
        userDropdown.add(option);
    })
}

// Open modal with gym tracker details
const openModal = (entry) => {
    modalContent.innerHTML = `
        <h2>${entry.exerciseName}</h2><hr />
        <p>Sets: ${entry.sets}</p>
        <p>Reps: ${entry.reps}</p>
        <p>Weight: ${entry.weight}</p>
        <p>Date: ${entry.date}</p>
        <p>Exercise Type: ${entry.exerciseTypeName}</p>
        <p>Username: ${entry.username}</p>
        <button onClick="openUpdateModal(${entry.exerciseId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${entry.exerciseId})" class="delete-button">Delete</button>
    `;
    modal.style.display = 'block';
};

const confirmDeleteEntry = (exerciseId) => {
    const confirmModal = window.confirm('Are you sure you want to delete this entry?');
    if (confirmModal) {
        deleteEntry(exerciseId);
    }
};

// Function to handle entry deletion
const deleteEntry = async (exerciseId) => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        await axiosWithToken.delete(`http://192.168.1.36:8080/app/gym-tracker/delete/${exerciseId}`);
        
        // Optionally, you can reload the vehicleId list after deletion
        entries = await fetchGymTrackerList();
        renderGymTrackerList(entries, currentPage);
        
        // Close the modal after successful deletion
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error deleting exerciseId:', error.message);
    }
};

addModalButton.addEventListener('click', () => openAddModal());

const openAddModal = async () => {
    addModalContent.innerHTML = `
    <h2>Add Exercise Information</h2><hr />
    <div class="modal-body">
        <select id="exerciseTypesDropdown" name="exerciseTypeId"></select>
        <input class="input" type="text" name="exerciseName" placeholder="Exercise Name" /><br />
        <input class="input" type="number" name="sets" placeholder="Sets" /><br />
        <input class="input" type="number" name="reps" placeholder="reps" /><br />
        <input class="input" type="number" name="weight" placeholder="Weight" /><br />
        <input class="input" type="date" name="date" placeholder="Date" /><br />
        <select id="userDropdown" name="userId"></select>
    </div><hr />
    <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
    <script>
        submitBtn.addEventListener('click', () => submitInfo())
    </script>
    `;
    exerciseTypesDropdown = document.getElementById('exerciseTypesDropdown')
    userDropdown = document.getElementById('userDropdown');

    await fetchExerciseTypes();
    await fetchUsers();

    renderExerciseTypeDropdown();
    renderUserDropdown();
    renderPagination();

    myAddModal.style.display = 'block';
};

const openUpdateModal = async (exerciseId) => {
    try {
        updatedExerciseEnty = await fetchExerciseEntry(exerciseId);
        if (updatedExerciseEnty) {
            console.log(updatedExerciseEnty);
            modal.style.display = 'none';
            updateModalContent.innerHTML = `
        <h2>Update Exercise Entry</h2>
        <hr />
        <div class="modal-body">
            <select id="exerciseTypesDropdown" name="updateExerciseTypeId"></select>
            <input class="input" type="text" name="updateExerciseName" placeholder="Exercise Name" value=${updatedExerciseEnty.exerciseName}/><br />
            <input class="input" type="text" number="updateSets" placeholder="Sets" value=${updatedExerciseEnty.sets}/><br />
            <input class="input" type="text" number="updateReps" placeholder="reps" value=${updatedExerciseEnty.reps}/><br />
            <input class="input" type="text" number="updateWeight" placeholder="Weight" value=${updatedExerciseEnty.weight}/><br />
            <input class="input" type="date" name="updateDate" placeholder="Date" value=${updatedExerciseEnty.date}/><br />
            <select id="userDropdown" name="updateUserId"></select>
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updatedExerciseEnty.exerciseId})">Update</button><br /><br />
    `;

    exerciseTypesDropdown = document.getElementById('exerciseTypesDropdown')
    userDropdown = document.getElementById('userDropdown');

    await fetchExerciseTypes();
    await fetchUsers();

    renderExerciseTypeDropdown();
    renderUserDropdown();
    renderPagination();

    updateModal.style.display = 'block';
        } else {
            console.error('Error fetching gym details')
        }
    } catch (error) {
        console.error('Error opening update model:', error.message);
    }
};

const submitInfo = async () => {
    try {
        const exerciseName = document.querySelector('input[name="exerciseName"]').value;
        const sets = document.querySelector('input[name="sets"]').value;
        const reps = document.querySelector('input[name="reps"]').value;
        const weight = document.querySelector('input[name="weight"]').value;
        const date = document.querySelector('input[name="date"]').value;
        const exerciseTypeId = document.querySelector('select[name="exerciseTypeId"]').value;
        const userId = document.querySelector('select[name="userId"]').value;

        if (!exerciseName || !sets || !reps || !weight || !date || !exerciseTypeId || !udserId) {
            throw new Error('Please fill all required fields');
        }

        const data = {
            exerciseName: exerciseName,
            sets: sets,
            reps: reps,
            weight: weight,
            date: date,
            exerciseTypeId: exerciseTypeId,
            userId: userId
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/gym-tracker/add', data);

        console.log('Entry added successfully:', response.data);

        myAddModal.style.display = 'none';

        entries = await fetchGymTrackerList();
        renderGymTrackerList(entries, currentPage);
    } catch (error) {
        console.error('Error submitting exercise information:', error.message);
    }
}

// Function to submit the update
const submitUpdate = async (exerciseId) => {
    try {
        const updateExerciseName = document.getElementsByName('updateExerciseName').value;
        const updateSets = document.getElementsByName('updateSets').value;
        const updateReps = document.getElementsByName('updateReps').value;
        const updateWeight = document.getElementsByName('updateWeight').value;
        const updateDate = document.getElementsByName('updateDate').value;
        const updateExerciseTypeId = document.getElementsByName('updateExerciseTypeId').value;
        const updateUserId = document.getElementsByName('updateUserId').value;

        // Validate the required fields if needed

        const data = {
            exerciseId: exerciseId,
            exerciseName: updateExerciseName,
            sets: updateSets,
            reps: updateReps,
            weight: updateWeight,
            date: updateDate,
            exerciseTypeId: updateExerciseTypeId,
            userId: updateUserId
        };

        console.log(data);

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.put(`http://192.168.1.36:8080/app/gym-tracker/update/${data.exerciseId}`, data);

        console.log('Exercise Entry updated successfully:', response);

        updateModal.style.display = 'none';

        entries = await fetchGymTrackerList();
        renderGymTrackerList(entries, currentPage);
        renderPagination();
    } catch (error) {
        console.error('Error updating auto repair shop information:', error.message);
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
    entries = await fetchGymTrackerList();
    renderGymTrackerList(entries, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(entries.length / itemsPerPage);  // Based on filtered recipes
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
    renderGymTrackerList(entries, currentPage);
    renderPagination();
};

// Initialize the page
initPage();
