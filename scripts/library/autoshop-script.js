document.addEventListener('DOMContentLoaded', () => {
    const autoShopListContainer = document.getElementById('autoShopList');
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
    const searchButton = document.getElementById('zip-search-btn')
    const zipSearchInput = document.getElementById('zipCode-search-input');
    let jwt;

    // Pagination
    const itemsPerPage = 5;
    let currentPage = 1;
    let autoshops = [];
    let updateAutoShopDetails = {};

    retrieveJwt = async () => {
        try {
            let token = localStorage.getItem('DeGuzmanStuffAnywhere');
            return token;
        } catch (error) {
            console.log('Error retrieving jwt token:', error.message);
        }
    }

    // Fetch auto repair shop list using Axios
    fetchAutoshopList = async () => {
        try {
            const jwtToken = await retrieveJwt();
            let response;
            const axiosWithToken = axios.create({
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });
            let selectedZipCode = zipSearchInput.value;
            console.log('test')
            if (selectedZipCode && selectedZipCode.trim() !== "") {
                console.log('selectedZipcode')
                response = await axiosWithToken.get(`http://localhost:8080/app/auto-repair-shops/all/search/zip/${selectedZipCode}`)
            } else {
                response = await axiosWithToken.get('http://localhost:8080/app/auto-repair-shops/all');
            }
            return response.data.list;
        } catch (error) {
            console.error('Error fetching auto repair shop list:', error.message);
            return [];
        }
    };

    fetchAutoShopById = async (autoShopId) => {
        try {
            const jwtToken = await retrieveJwt();

            const axiosWithToken = axios.create({
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const response = await axiosWithToken.get(`http://localhost:8080/app/auto-repair-shops/repair-shop/search/id/${autoShopId}`);
            return response.data.autoShop;
        } catch (error) {
            console.error('Error fetching auto repair shop with ID: ', updateAutoShopDetails, error.message);
        }
    }

    // Render auto repair shop list items
    renderAutoshopList = (autoshops, page) => {
        const startIdx = (page - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const autoshopsToDisplay = autoshops.slice(startIdx, endIdx);

        autoShopListContainer.innerHTML = '';

        autoshopsToDisplay.forEach((autoshop, index) => {
            const autoshopElement = document.createElement('div');
            autoshopElement.classList.add('autoshop-element');
            autoshopElement.dataset.index = startIdx + index;

            const nameElement = document.createElement('h3');
            nameElement.textContent = autoshop.autoShopName;

            const addressElement = document.createElement('p');
            addressElement.textContent = `Address: ${autoshop.address}`;

            const cityElement = document.createElement('p');
            cityElement.textContent = `City: ${autoshop.city}`;

            const stateElement = document.createElement('p');
            stateElement.textContent = `State: ${autoshop.state}`;

            const zipElement = document.createElement('p');
            zipElement.textContent = `Zip: ${autoshop.zip}`;

            autoshopElement.appendChild(nameElement);

            autoshopElement.addEventListener('click', () => openModal(autoshop));

            autoShopListContainer.appendChild(autoshopElement);
        });
    };

    addModalButton.addEventListener('click', () => openAddModal());

    const openAddModal = () => {
        try {
            // Clear the modal content (if needed)
            addModalContent.innerHTML = `
            <h2>Add Repair Shop</h2>
            <hr />
            <div class="modal-body">
                <input class="input" type="text" name="autoShopName" placeholder="Repair Shop Name" />
                <input class="input" type="text" name="address" placeholder="Address" /><br />
                <input class="input" type="text" name="city" placeholder="City" /><br />
                <input class="input" type="text" name="state" placeholder="State" /><br />
                <input class="input" type="text" name="zip" placeholder="Zipcode" /><br />
            </div><hr />
            <button id="submitBtn" class="add-button" onClick="submitInfo()">Submit</button><br /><br />
            <script>submitBtn.addEventListener('click', () => submitInfo())</script>
        `;
            myAddModal.style.display = 'block';
        } catch (error) {
            console.error('Error opening add modal:', error);
        }
    };


    submitInfo = async () => {
        try {
            // Get book information from the form or wherever it's stored
            const autoShopName = document.querySelector('input[name="autoShopName"]').value;
            const address = document.querySelector('input[name="address"]').value;
            const city = document.querySelector('input[name="city"]').value;
            const state = document.querySelector('input[name="state"]').value;
            const zip = document.querySelector('input[name="zip"]').value;

            if (!autoShopName || !address || !city || !state || !zip) {
                throw new Error("Please fill in all required fields.");
            }

            // Create a data object with the book information
            const data = {
                autoShopName: autoShopName,
                address: address,
                city: city,
                state: state,
                zip: zip
            };

            const jwtToken = await retrieveJwt();

            const axiosWithToken = axios.create({
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });

            // Send a POST request to add the book information
            const response = await axiosWithToken.post('http://localhost:8080/app/auto-repair-shops/add', data);

            // Optionally, handle the response or perform additional actions
            console.log('Office added successfully:', response.data);

            // Close the add modal after successful submission
            myAddModal.style.display = 'none';

            medicalOffices = await fetchAutoshopList();

            renderAutoshopList(medicalOffices, currentPage);
            renderPagination();
        } catch (error) {
            console.error('Error submitting repair shop information:', error.message);
            // Handle errors or provide feedback to the user
        }
    }

    // Open modal with auto repair shop details
    openModal = (autoshop) => {
        modalContent.innerHTML = `
        <h2>${autoshop.autoShopName}</h2><hr />
        <p>Address: ${autoshop.address}</p>
        <p>City: ${autoshop.city}</p>
        <p>State: ${autoshop.state}</p>
        <p>Zip: ${autoshop.zip}</p>
        <button onClick="openUpdateModal(${autoshop.autoShopId})" class="update-button" id="updateModal">Update</button>
        <button onClick="confirmDeleteAutoShop(${autoshop.autoShopId})" class="delete-button">Delete</button>
    `;
        modal.style.display = 'block';
    };

    // Function to confirm auto shop deletion
    confirmDeleteAutoShop = (autoShopId) => {
        const confirmModal = window.confirm('Are you sure you want to delete this auto repair shop?');
        if (confirmModal) {
            deleteAutoShop(autoShopId);
        }
    };

    // Function to handle auto shop deletion
    deleteAutoShop = async (autoShopId) => {
        try {
            const jwtToken = await retrieveJwt();

            const axiosWithToken = axios.create({
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });
            // Send a DELETE request to your API endpoint
            await axiosWithToken.delete(`http://localhost:8080/app/auto-repair-shops/delete/${autoShopId}`);

            // Optionally, you can reload the auto shop list after deletion
            autoshops = await fetchAutoshopList();
            renderAutoshopList(autoshops, currentPage);

            // Close the modal after successful deletion
            modal.style.display = 'none';
        } catch (error) {
            console.error('Error deleting auto repair shop:', error.message);
        }
    };

    openUpdateModal = async (autoShopId) => {
        try {
            updateAutoShopDetails = await fetchAutoShopById(autoShopId);
            if (updateAutoShopDetails) {
                modal.style.display = 'none';
                updateModalContent.innerHTML = `
        <h2>Update Auto Repair Shop</h2>
        <hr />
        <div class="modal-body">
            <input class="input" type="text" id="updateAutoShopName" placeholder="Repair Shop Name" value="${updateAutoShopDetails.autoShopName}" />
            <input class="input" type="text" id="updateAddress" placeholder="Address" value="${updateAutoShopDetails.address}" /><br />
            <input class="input" type="text" id="updateCity" placeholder="City" value="${updateAutoShopDetails.city}" /><br />
            <input class="input" type="text" id="updateState" placeholder="State" value="${updateAutoShopDetails.state}" /><br />
            <input class="input" type="text" id="updateZip" placeholder="Zipcode" value="${updateAutoShopDetails.zip}" /><br />
        </div><hr />
        <button id="updateSubmitBtn" class="update-button" onClick="submitUpdate(${updateAutoShopDetails.autoShopId})">Update</button><br /><br />
    `;
                updateModal.style.display = 'block';
            } else {
                console.error('Error fetching auto repair shop details')
            }
        } catch (error) {
            console.error('Error opening update model:', error.message);
        }
    };

    // Function to submit the update
    submitUpdate = async (autoShopId) => {
        try {
            const updateAutoShopName = document.getElementById('updateAutoShopName').value;
            const updateAddress = document.getElementById('updateAddress').value;
            const updateCity = document.getElementById('updateCity').value;
            const updateState = document.getElementById('updateState').value;
            const updateZip = document.getElementById('updateZip').value;

            // Validate the required fields if needed

            const data = {
                autoShopName: updateAutoShopName,
                address: updateAddress,
                city: updateCity,
                state: updateState,
                zip: updateZip,
                autoShopId: autoShopId
            };

            console.log(data);

            const jwtToken = await retrieveJwt();

            const axiosWithToken = axios.create({
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });

            const response = await axiosWithToken.put(`http://localhost:8080/app/auto-repair-shops/update/${data.autoShopId}`, data);

            console.log('Auto Repair Shop updated successfully:', response);

            updateModal.style.display = 'none';

            autoshops = await fetchAutoshopList();
            renderAutoshopList(autoshops, currentPage);
            renderPagination();
        } catch (error) {
            console.error('Error updating auto repair shop information:', error.message);
            // Handle errors or provide feedback to the user
        }
    };

    // closeBtn.onclick = () => {
    //     modal.style.display = 'none';
    // };

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
        autoshops = await fetchAutoshopList();
        console.log(autoshops)
        renderAutoshopList(autoshops, currentPage);
        renderPagination();
    };

    // Render pagination buttons
    const renderPagination = () => {
        const totalPages = Math.ceil(autoshops.length / itemsPerPage);
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
        renderAutoshopList(autoshops, currentPage);
    };

    
    searchButton.addEventListener('click', async () => {
        try {
            currentPage = 1; // Reset to first page on new search
            autoshops = await fetchAutoshopList();
            renderAutoshopList(autoshops, currentPage);
            renderPagination();
        } catch (error) {
            console.error('Error fetching auto repair shops for search:', error.message);
        }
    });

    // Initialize the page
    initPage();

});

