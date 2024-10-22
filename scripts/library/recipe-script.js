const recipeListContainer = document.getElementById('recipeList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];
const addModalContent = document.getElementById('addModalContent');
const addModalButton = document.getElementById('addModalButton');
const myAddModal = document.getElementById('myAddModal');
const submitBtn = document.getElementById('submitBtn');
const recipeChart = document.getElementById('recipeChart');
let recipeTypesDropdown;
let recipeTypeDropdownFilter = document.getElementById('recipe-filter');
addModalButton.addEventListener('click', () => openAddModal());

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let recipes = [];
let filteredRecipes = [];

// Fetch JWT Token
const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
};

// Fetch Recipe List using Axios
const fetchRecipeList = async () => {
    try {
        const jwtToken = await retrieveJwt();
        let response;
        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        let selectedType = recipeTypeDropdownFilter.value;
        if (selectedType && selectedType > 0) {
            response = await axiosWithToken.get(`http://192.168.1.36:8080/app/recipes/all/types/${selectedType}`);
        } else {
            response = await axiosWithToken.get('http://192.168.1.36:8080/app/recipes/all');
        }
        filteredRecipes = response.data.list;  // Update filteredRecipes
        return filteredRecipes;
    } catch (error) {
        console.error('Error fetching recipe list:', error.message);
        return [];
    }
};

// Fetch Recipe Types
const fetchRecipeTypes = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/recipe-types/all');
        recipeTypes = response.data.list;
    } catch (error) {
        console.error('Error fetching recipe type list:', error.message);
        return [];
    }
};

const fetchRecipeTypesForFilter = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/recipe-types/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching recipe type list:', error.message);
        return [];
    }
};

// Render Recipe Type Dropdown
const renderRecipeTypeDropdown = () => {
    recipeTypesDropdown.innerHTML = '';

    recipeTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type.recipeTypeId;
        option.text = type.descr;
        recipeTypesDropdown.add(option);
    });
};

// Render Recipe Types for Filter Dropdown
const renderRecipeTypesDropdownFilter = async () => {
    const filterTypes = await fetchRecipeTypesForFilter();
    if (!Array.isArray(filterTypes)) {
        console.error('Expected an array of recipe types but got:', filterTypes);
        return;
    }
    recipeTypeDropdownFilter.innerHTML = '<option value="">All Recipe Types</option>';
    filterTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.recipeTypeId;
        option.text = type.descr;
        recipeTypeDropdownFilter.add(option);
    });
};

// Render Recipe List Items
const renderRecipeList = (entries, page) => {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const entriesToDisplay = entries.slice(startIdx, endIdx);

    recipeListContainer.innerHTML = '';

    entriesToDisplay.forEach((entry, index) => {
        const recipeElement = document.createElement('div');
        recipeElement.classList.add('recipe-element');
        recipeElement.dataset.index = startIdx + index;

        const nameElement = document.createElement('h3');
        nameElement.textContent = `${entry.name}`;

        const typeElement = document.createElement('p');
        typeElement.textContent = `${entry.descr}`;

        recipeElement.appendChild(nameElement);
        recipeElement.appendChild(typeElement);

        recipeElement.addEventListener('click', () => openModal(entry));

        recipeListContainer.appendChild(recipeElement);
    });
};

// Open modal with recipe details
const openModal = (recipe) => {
    modalContent.innerHTML = `
        <h2>${recipe.name}</h2>
        <p>Type: ${recipe.descr}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
        <h3>Directions:</h3>
        <ol>
            ${recipe.directions.map(direction => `<li>${direction}</li>`).join('')}
        </ol>
    `;
    modal.style.display = 'block';
};

// Handle Filter Change
const handleFilterChange = async () => {
    filteredRecipes = await fetchRecipeList();  // Fetch filtered recipes
    currentPage = 1;  // Reset to first page if list changes
    renderRecipeList(filteredRecipes, currentPage);
    renderPagination();  // Update pagination
};

// Close Modal
closeBtn.onclick = () => {
    modal.style.display = 'none';
};

// Render Pagination with First, Previous, Next, and Last
const renderPagination = () => {
    const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);  // Based on filtered recipes
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

// Handle Pagination Button Click
const onPageClick = (page) => {
    currentPage = page;
    renderRecipeList(filteredRecipes, currentPage);
    renderPagination();
};

// Initialize Page
const initPage = async () => {
    await renderRecipeTypesDropdownFilter();
    filteredRecipes = await fetchRecipeList();
    renderRecipeList(filteredRecipes, currentPage);
    renderPagination();
};

// Add Event Listener for Filter Dropdown Change
recipeTypeDropdownFilter.addEventListener('change', handleFilterChange);

// Initialize the Page on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initPage();
});
