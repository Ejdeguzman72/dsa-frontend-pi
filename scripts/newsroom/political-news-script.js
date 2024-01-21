document.addEventListener('DOMContentLoaded', () => {
    const articlesContainer = document.getElementById('articles-container');
    const perPage = 10; // Number of articles per page
    let currentPage = 1;

    // Function to display articles for the current page
    const displayArticles = (articles) => {
        articlesContainer.innerHTML = '';

        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;

        for (let i = startIndex; i < endIndex && i < articles.length; i++) {
            const article = articles[i];

            // Create HTML elements for the article (similar to previous code)
            const articleDiv = document.createElement('div');
            articleDiv.classList.add('article-element');

            const articleTitle = document.createElement('h2');
            articleTitle.textContent = article.title;

            const articleAuthor = document.createElement('p');
            articleAuthor.textContent = `Author: ${article.author}`;

            const articleDescription = document.createElement('p');
            articleDescription.textContent = article.description;

            const articleLink = document.createElement('a');
            articleLink.href = article.url;
            articleLink.textContent = 'Read More';

            const articleImage = document.createElement('img');
            articleImage.src = article.urlToImage;
            articleImage.alt = 'Article Image';

            // Append elements to the articleDiv
            articleDiv.appendChild(articleTitle);
            articleDiv.appendChild(articleAuthor);
            articleDiv.appendChild(articleDescription);
            articleDiv.appendChild(articleLink);
            articleDiv.appendChild(articleImage);

            // Append the articleDiv to the articlesContainer
            articlesContainer.appendChild(articleDiv);
        }
    };

    // Function to create pagination buttons
    const createPaginationButtons = (totalPages) => {
        const paginationContainer = document.getElementById('pagination-container');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', () => {
                currentPage = i;
                displayArticles(articles);
            });
            paginationContainer.appendChild(button);
        }
    };

    // Make a GET request using Axios
    axios.get('http://192.168.1.36:8081/app/poltical/all')
        .then(response => {
            const articles = response.data.articles;

            // Calculate total pages based on the number of articles and articles per page
            const totalPages = Math.ceil(articles.length / perPage);

            // Display articles for the initial page
            displayArticles(articles);

            // Create pagination buttons
            createPaginationButtons(totalPages);
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
        });
});
