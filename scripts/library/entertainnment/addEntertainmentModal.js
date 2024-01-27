// addModal.js

// Elements
const myAddModal = document.getElementById('myAddModal');
const addModalContent = document.getElementById('addModalContent');
const addModalCloseBtn = document.getElementById('addModalCloseBtn');
const submitBtn = document.getElementById('submitBtn');

// Open add modal function
const openAddModal = () => {
    addModalContent.innerHTML = `
    <h2>Add Office Information</h2><hr />
    <div class="modal-body">
        <input class="input" type="text" name="name" placeholder="Entertainment Title" /><br />
        <label for="entertainmentTypesDropdown">Select Entertainment Type:</label>
        <select id="entertainmentTypesDropdown"></select> <!-- New dropdown element -->
    </div><hr />
    <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
    <script>
        submitBtn.addEventListener('click', () => submitInfo())
    </script>
    `;
    myAddModal.style.display = 'block';
};

const fetchEntertainmentTypesDropdown = () => {
    // Clear existing options
    entertainmentTypesDropdown.innerHTML = '';

    // Populate the dropdown with options
    entertainmentTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type.entertainmentTypeId;
        option.text = type.descr;
        entertainmentTypesDropdown.add(option);
    });
};

// Submit information function
const submitInfo = async () => {
    try {
        // Get book information from the form or wherever it's stored
        const name = document.querySelector('input[name="name"]').value;
        const address = document.querySelector('input[name="address"]').value;
        const city = document.querySelector('input[name="city"]').value;
        const state = document.querySelector('input[name="state"]').value;
        const zip = document.querySelector('input[name="zip"]').value;

        // Validate the required fields if needed

        // Create a data object with the book information
        const data = {
            name: name,
            address: address,
            city: city,
            state: state,
            zip: zip
        };

        // Send a POST request to add the book information
        const response = await axios.post('http://localhost:8080/app/medical-offices/add', data);

        // Optionally, handle the response or perform additional actions
        console.log('Office added successfully:', response.data);

        // Close the add modal after successful submission
        myAddModal.style.display = 'none';

        entries = await fetchEntertainmentList();
        renderEntertainmentList(entries, currentPage);
    } catch (error) {
        console.error('Error submitting entertaiment information:', error.message);
        // Handle errors or provide feedback to the user
    }
};

// Close add modal if clicked outside the modal
window.onclick = (event) => {
    if (event.target === myAddModal) {
        myAddModal.style.display = 'none';
    }
};

// Include the openAddModal function in the file
addModalButton.addEventListener('click', () => openAddModal());
