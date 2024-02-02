const recipeListContainer = document.getElementById('recipeList');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('myModal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementsByClassName('close')[0];

const retrieveJwt = async () => {
    try {
        let token = localStorage.getItem('DeGuzmanStuffAnywhere');
        console.log('Retrieved token:', token);
        return token;
    } catch (error) {
        console.log('Error retrieving jwt token:', error.message);
    }
}

// Fetch recipe list using Axios
const fetchRecipeList = async () => {
    try {
        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });
        const response = await axiosWithToken.get('http://192.168.1.36:8080/app/recipes/all');
        return response.data.list;
    } catch (error) {
        console.error('Error fetching recipe list:', error.message);
        return [];
    }
};

// Render recipe list items
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
        typeElement.textContent = `${entry.descr}`

        const recipeTitleElement = document.createElement('p')
        recipeTitleElement.textContent = 'Ingredients';

        recipeElement.appendChild(nameElement);
        recipeElement.appendChild(typeElement);

        recipeElement.addEventListener('click', () => openModal(entry));

        recipeListContainer.appendChild(recipeElement);
    });
};

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let recipes = {};

// Open modal with contact info details
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
    entries = await fetchRecipeList();
    renderRecipeList(entries, currentPage);
    renderPagination();
};

// Render pagination buttons
const renderPagination = () => {
    const totalPages = Math.ceil(entries.length / itemsPerPage);
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
    renderRecipeList(entries, currentPage);
};

// Initialize the page
initPage();
