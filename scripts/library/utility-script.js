document.addEventListener('DOMContentLoaded', () => {
    const utilityListContainer = document.getElementById('utilityList');
    const paginationContainer = document.getElementById('pagination');
    const modal = document.getElementById('myModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.getElementById('closeListModal');
    const addModalContent = document.getElementById('addModalContent');
    const myAddModal = document.getElementById('myAddModal');
    const addModalButton = document.getElementById('addModalButton');
    const addModalCloseBtn = document.getElementById('addModalCloseBtn');
    const submitBtn = document.getElementById('submitBtn');
    const updateModal = document.getElementById('myUpdateModal');
    const updateModalContent = document.getElementById('updateModalContent');
    // const updateCloseBtn = document.getElementById('updateCloseBtn');
    const updateSubmitBtn = document.getElementById('updateSubmitBtn');
    let utilityTypesDropdown;

    // Pagination
    const itemsPerPage = 5;

    let currentPage = 1;
    let utilities = [];
    let utilityTypes = [];
    let updatedUtilityDetails = {};

    const retrieveJwt = async () => {
        try {
            let token = localStorage.getItem('DeGuzmanStuffAnywhere');
            return token;
        } catch (error) {
            console.log('Error retrieving jwt token:', error.message);
        }
    }

    // Fetch utility list using Axios
    const fetchUtilityList = async () => {
        try {
            const jwtToken = await retrieveJwt();

            const axiosWithToken = axios.create({
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const response = await axiosWithToken.get('http://192.168.1.36:8080/app/utility-information/all');
            return response.data.list;
        } catch (error) {
            console.error('Error fetching utility list:', error.message);
            return [];
        }
    };

    const fetchUtilityTypes = async () => {
        try {
            const jwtToken = await retrieveJwt();

            const axiosWithToken = axios.create({
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const response = await axiosWithToken.get('http://192.168.1.36:8080/app/utility-types/all');
            utilityTypes = response.data.list;

        } catch (error) {
            console.error('Error fetching utility type list:', error.message);
            return [];
        }
    }

    const renderUtilityTypesDropdown = () => {
        document.addEventListener('DOMContentLoaded', () => {
            console.log("utilityTypesDropdown:", utilityTypesDropdown);
            const utilityTypesDropdown = document.getElementById('utilityTypesDropdown');

            if (utilityTypesDropdown) {
                utilityTypesDropdown.innerHTML = '';

                utilityTypes.forEach(type => {
                    const option = document.createElement("option");
                    option.value = type.utilityTypeId;
                    option.text = type.utilityTypeDescr;
                    utilityTypesDropdown.add(option);
                });
            } else {
                console.error("Element with id 'utilityTypesDropdown' not found");
            }
        });
    }

    const fetchUtilityById = async (utilityId) => {
        try {
            const jwtToken = await retrieveJwt();

            const axiosWithToken = axios.create({
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const response = await axiosWithToken.get(`http://192.168.1.36:8080/app/utility-information/utility/id/${utilityId}`);
            return response.data.utility;
        } catch (error) {
            console.error('Error fetching utility with ID: ', utilityId, error.message);
        }
    }

    // Render utility list items
    const renderUtilityList = (utilityList, page) => {
        const startIdx = (page - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const utilitiesToDisplay = utilityList.slice(startIdx, endIdx);

        utilityListContainer.innerHTML = '';

        utilitiesToDisplay.forEach((utility, index) => {
            const utilityElement = document.createElement('div');
            utilityElement.classList.add('utility-element');
            utilityElement.dataset.index = startIdx + index;

            const nameElement = document.createElement('h3');
            nameElement.textContent = utility.name;

            const utilityTypeDescrElement = document.createElement('p');
            utilityTypeDescrElement.textContent = utility.utilityTypeDescr;

            utilityElement.appendChild(nameElement);
            utilityElement.appendChild(utilityTypeDescrElement);

            utilityElement.addEventListener('click', () => openModal(utility));

            utilityListContainer.appendChild(utilityElement);
        });
    };

    addModalButton.addEventListener('click', () => openAddModal());

    const openAddModal = async () => {
        // Clear the modal content (if needed)
        addModalContent.innerHTML = `
        <h2>Add Utility Information</h2><hr />
        <div class="modal-body">
            <input class="input" type="text" name="name" placeholder="Name" />
            <input class="input" type="text" name="phone" placeholder="Phone" /><br />
            <input class="input" type="text" name="url" placeholder="URL" /><br />
            <input class="input" type="text" name="phone" placeholder="Due Date" /><br />
            <select id="utilityTypesDropdown name="utilityTypeId"></select>
        </div><hr />
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
        <script>submitBtn.addEventListener('click', () => submitInfo())</script>
    `;
        utilityTypesDropdown = document.getElementById('utilityTypesDropdown'); // Fetch the dropdown element
        await fetchUtilityTypes();
        renderUtilityTypesDropdown();
        myAddModal.style.display = 'block';
    };


    const submitInfo = async () => {
        try {
            // Get utility information from the form or wherever it's stored
            const name = document.querySelector('input[name="name"]').value;
            const phone = document.querySelector('input[name="phone"]').value;
            const url = document.querySelector('input[name="url"]').value;
            const dueDate = document.querySelector('input[name="dueDate"]').value;
            const utilityTypeId = document.querySelector('input[name="utilityTypeId"]').value;
            // Validate the required fields if needed

            // Create a data object with the utility information
            const utilityData = {
                name: name,
                phone: phone,
                url: url,
                dueDate: dueDate,
                utilityTypeId: utilityTypeId
            };

            const jwtToken = await retrieveJwt();

            const axiosWithToken = axios.create({
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // Send a POST request to add the utility information
            const response = await axiosWithToken.post('http://192.168.1.36:8080/app/utility-information/add', utilityData);

            // Optionally, handle the response or perform additional actions
            console.log('Utility added successfully:', response.data);

            // Close the add modal after successful submission
            myAddModal.style.display = 'none';

            utilities = await fetchUtilityList();

            renderUtilityList(utilities, currentPage);
            renderPagination();
        } catch (error) {
            console.error('Error submitting utility information:', error.message);
            // Handle errors or provide feedback to the user
        }
    }

    // Open modal with utility details
    const openModal = (utility) => {
        modalContent.innerHTML = `
        <h2>${utility.name}</h2><hr />
        <p>Phone: ${utility.phone}</p>
        <p>Rntity URL - ${utility.url}</p>
        <p>Due Date: ${utility.dueDate}</p>
        <p>Type: ${utility.utilityTypeDescr}</p>
        <button onClick="openUpdateModal(${utility.utilityId})" class="update-button">Update</button>
        <button onClick="confirmDeleteEntry(${utility.utilityId})" class="delete-button">Delete</button>
    `;
        modal.style.display = 'block';
    };

    // Function to confirm utility deletion
    const confirmDeleteEntry = (utilityId) => {
        const confirmModal = window.confirm('Are you sure you want to delete these utility details?');
        if (confirmModal) {
            deleteUtility(utilityId);
        }
    };

    // Function to handle utility deletion
    const deleteEntry = async (utilityId) => {
        try {
            const jwtToken = await retrieveJwt();

            const axiosWithToken = axios.create({
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });
            await axiosWithToken.delete(`http://192.168.1.36:8080/app/utility-information/delete/${utilityId}`);

            // Optionally, you can reload the auto shop list after deletion
            entries = await fetchUtilityList();
            renderUtilityList(entries, currentPage);

            // Close the modal after successful deletion
            modal.style.display = 'none';
        } catch (error) {
            console.error('Error deleting utility:', error.message);
        }
    };

    const openUpdateModal = async (utilityId) => {
        try {
            updatedUtilityDetails = await fetchUtilityById(utilityId);
            if (updatedUtilityDetails) {
                modal.style.display = 'none';
                updateModalContent.innerHTML = `
        <h2>Update Utility Information</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="text" id="updateName" placeholder="Repair Shop Name" value="${updatedUtilityDetails.name}" />
            <input class="input" type="text" id="updatePhone" placeholder="Address" value="${updatedUtilityDetails.phone}" /><br />
            <input class="input" type="text" id="updateUrl" placeholder="Address" value="${updatedUtilityDetails.url}" /><br />
            <input class="input" type="text" id="updateUrl" placeholder="Address" value="${updatedUtilityDetails.dueDate}" /><br />
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updateBookDetais.bookId})">Update</button><br /><br />
    `;
                updateModal.style.display = 'block';
            } else {
                console.error('Error fetching utility details')
            }
        } catch (error) {
            console.error('Error opening update model:', error.message);
        }
    };

    // Function to submit the update
    const submitUpdate = async (utilityId) => {
        try {
            const updateTitle = document.getElementById('updateTitle').value;
            const updateAuthor = document.getElementById('updateAuthor').value;
            const updateDescr = document.getElementById('updateDescr').value;

            // Validate the required fields if needed

            const data = {
                utilityId: utilityId
            };

            console.log(data);

            const response = await axios.put(`http://192.168.1.36:8080/app/utility-information/update/${data.utilityId}`, data);

            console.log('Utility Information updated successfully:', response);

            updateModal.style.display = 'none';

            utilities = await fetchUtilityList();
            renderUtilityList(utilities, currentPage);
            renderPagination();
        } catch (error) {
            console.error('Error updating utility information:', error.message);
            // Handle errors or provide feedback to the user
        }
    };

    // Close modal
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // addModalCloseBtn.onclick = () => {
    //     myAddModal.style.display = 'none';
    // }

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
        utilities = await fetchUtilityList();
        renderUtilityList(utilities, currentPage);
        renderPagination();
    };

    // Render pagination buttons
    const renderPagination = () => {
        const totalPages = Math.ceil(utilities.length / itemsPerPage);  // Based on filtered recipes
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
        renderUtilityList(utilities, currentPage);
        renderPagination();
    };

    // Initialize the page
    initPage();

});