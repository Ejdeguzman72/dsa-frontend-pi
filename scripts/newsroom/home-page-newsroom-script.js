document.addEventListener('DOMContentLoaded', () => {
    const articlesContainer = document.getElementById('articles-container');
    const paginationContainer = document.getElementById('pagination-container');
    const perPage = 10; // Number of articles per page
    let currentPage = 1;
    let articles = []; // Declare articles here

    // Function to display articles for the current page
    const displayArticles = () => {
        articlesContainer.innerHTML = '';

        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;

        for (let i = startIndex; i < endIndex && i < articles.length; i++) {
            const article = articles[i];

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

            articleDiv.appendChild(articleTitle);
            articleDiv.appendChild(articleAuthor);
            articleDiv.appendChild(articleDescription);
            articleDiv.appendChild(articleLink);
            articleDiv.appendChild(articleImage);

            articlesContainer.appendChild(articleDiv);
        }
    };

    // Function to create pagination buttons
    const createPaginationButtons = (totalPages) => {
        paginationContainer.innerHTML = '';

        const firstButton = document.createElement('button');
        firstButton.textContent = 'First';
        firstButton.addEventListener('click', () => {
            if (currentPage !== 1) {
                currentPage = 1;
                displayArticles();
            }
        });
        paginationContainer.appendChild(firstButton);

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Prev';
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayArticles();
            }
        });
        paginationContainer.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.addEventListener('click', () => {
                currentPage = i;
                displayArticles();
            });
            paginationContainer.appendChild(button);
        }

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayArticles();
            }
        });
        paginationContainer.appendChild(nextButton);

        const lastButton = document.createElement('button');
        lastButton.textContent = 'Last';
        lastButton.addEventListener('click', () => {
            if (currentPage !== totalPages) {
                currentPage = totalPages;
                displayArticles();
            }
        });
        paginationContainer.appendChild(lastButton);
    };

    // Make a GET request using Axios
    axios.get('http://192.168.1.36:8081/app/news/all')
        .then(response => {
            articles = response.data.articles; // Assign articles here

            const totalPages = Math.ceil(articles.length / perPage);
            displayArticles();
            createPaginationButtons(totalPages);
        })
        .catch(error => {
            console.error('Error fetching articles:', error);
        });
});
