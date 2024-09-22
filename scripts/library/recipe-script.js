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
        return response.data.list;
    } catch (error) {
        console.error('Error fetching recipe list:', error.message);
        return [];
    }
};

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
}

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
}

const renderRecipeTypeDropdown = () => {
    recipeTypesDropdown.innerHTML = '';

    recipeTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type.recipeTypeId;
        option.text = type.descr;
        recipeTypesDropdown.add(option);
    })
}

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
    })
}

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

const categorizeRecipes = () => {
    const categories = {}; // Object to store restaurant categories and their counts

    // Loop through restaurants
    for (let i = 0; i < recipes.length; i++) {
        console.log(recipes);
        const category = getCategory(recipes[i]);
        console.log(category);
        // Increment the count for this category
        categories[category] = (categories[category] || 0) + 1;
    }

    // Extracting category names and counts for chart data
    const categoryNames = Object.keys(categories);
    const categoryCounts = Object.values(categories);

    // Creating the bar chart
    new Chart("recipeChart", {
        type: "bar",
        data: {
            labels: categoryNames, // Category names on x-axis
            datasets: [{
                data: categoryCounts, // Counts on y-axis
                backgroundColor: "rgba(0,0,255,0.5)" // Bar color
            }]
        },
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: "Recipe Categories"
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

function getCategory(recipe) {
    console.log(recipe.descr)
    return recipe.descr;
}

// Pagination
const itemsPerPage = 5;
let currentPage = 1;
let recipes = [];

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

const openAddModal = async () => {
    addModalContent.innerHTML = `
    <h2>Add Recipe Information</h2><hr />
        <div class="recipe-modal-body">
            <input class="input" type="text" name="name" placeholder="Recipe Name"/><br />
            <div id="ingredientsContainer">
                <textarea class="input" name="ingredients" placeholder="Ingredients"></textarea>
                <button type="button" onclick="addIngredientField()">Add Ingredient</button>
            </div>
            <div id="directionsContainer">
                <textarea class="input" name="directions" placeholder="Directions"></textarea>
                <button type="button" onclick="addDirectionField()">Add Direction</button>
            </div>
            <label for="recipeTypesDropdown">Select Recipe Type:</label>
            <select id="recipeTypesDropdown" name="recipeTypeId"></select>
        </div><hr />
        <button id="submitBtn" class="add-button" onClick=submitInfo()>Submit</button><br /><br />
    <script>
        submitBtn.addEventListener('click', () => submitInfo())
    </script>
        `;
    recipeTypesDropdown = document.getElementById('recipeTypesDropdown');
    await fetchRecipeTypes();
    renderPagination();
    renderRecipeTypeDropdown();
    myAddModal.style.display = 'block';
};

const addIngredientField = () => {
    const ingredientsContainer = document.getElementById('ingredientsContainer');
    const textarea = document.createElement('textarea');
    textarea.classList.add('input');
    textarea.setAttribute('name', 'ingredients');
    textarea.setAttribute('placeholder', 'Ingredients');
    ingredientsContainer.appendChild(textarea);
};

const addDirectionField = () => {
    const directionsContainer = document.getElementById('directionsContainer');
    const textarea = document.createElement('textarea');
    textarea.classList.add('input');
    textarea.setAttribute('name', 'directions');
    textarea.setAttribute('placeholder', 'Directions');
    directionsContainer.appendChild(textarea);
};

const submitInfo = async () => {
    try {
        const name = document.querySelector('input[name="name"]').value;
        const ingredientsInputs = document.querySelectorAll('textarea[name="ingredients"]');
        const ingredients = Array.from(ingredientsInputs).map(input => input.value);
        const directionsInputs = document.querySelectorAll('textarea[name="directions"]');
        const directions = Array.from(directionsInputs).map(input => input.value);
        const recipeTypeId = document.querySelector('select[name="recipeTypeId"]').value; // Corrected the field name



        if (!name || !ingredients || !directions || !recipeTypeId) {
            throw new Error("Please fill in all required fields.");
        }

        const data = {
            name: name,
            ingredients: ingredients,
            directions: directions,
            recipeTypeId: recipeTypeId,
        };

        const jwtToken = await retrieveJwt();

        const axiosWithToken = axios.create({
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const response = await axiosWithToken.post('http://192.168.1.36:8080/app/recipes/add', data);

        console.log('Recipe added successfully:', response.data);

        myAddModal.style.display = 'none';

        recipes = await fetchRecipeList();
        renderRecipeList(recipes, currentPage);
    } catch (error) {
        console.error('Error submitting recipes information:', error.message);
    }
}

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

document.addEventListener('DOMContentLoaded', () => {
    const recipeTypeDropdownFilter = document.getElementById('recipe-filter');
    
    if (recipeTypeDropdownFilter) {
        recipeTypeDropdownFilter.addEventListener('change', async () => {
            console.log('Dropdown value selected', recipeTypeDropdownFilter.value);
            const recipes = await fetchRecipeList();
            renderRecipeList(recipes, currentPage);
            console.log('rendering the new list');
            renderPagination();
        });
    } else {
        console.error('Dropdown filter element not found');
    }
})


// Initialize page
const initPage = async () => {
    renderRecipeTypesDropdownFilter();
    recipes = await fetchRecipeList();
    categorizeRecipes();
    renderRecipeList(recipes, currentPage);
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
