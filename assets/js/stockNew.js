// NEWS //
export function updateNewsSection(news) {
    if (news) {
        listenToNewsEvents(news); // Initialize pagination and display the first page
    } else {
        const newsElement = document.getElementById('news-content');
        newsElement.innerText = 'No data available';
    }
}

function listenToNewsEvents(news) {
    let currentPage = 1;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(news.length / itemsPerPage);
    const paginationControls = document.getElementById('pagination-controls');

    function updatePaginationControls() {
        paginationControls.innerHTML = ''; // Clear current controls

        const createPageButton = (pageNumber, isCurrent = false) => {
            const button = document.createElement('button');
            button.textContent = pageNumber;
            button.classList.add('pagination-button');
            if (isCurrent) button.classList.add('current-page');
            button.disabled = isCurrent;
            button.onclick = () => {
                currentPage = pageNumber;
                displayNewsPage();
            };
            return button;
        };

        // Previous Button
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = '<';
            prevButton.classList.add('pagination-button');
            prevButton.onclick = () => {
                currentPage--;
                displayNewsPage();
            };
            paginationControls.appendChild(prevButton);
        }

        // Always show the first page
        paginationControls.appendChild(createPageButton(1, currentPage === 1));

        // Add "..." before current page if necessary
        if (currentPage > 3) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            paginationControls.appendChild(dots);
        }

        // Show pages around the current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            paginationControls.appendChild(createPageButton(i, currentPage === i));
        }

        // Add "..." after current page if necessary
        if (currentPage < totalPages - 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            paginationControls.appendChild(dots);
        }

        // Always show the last page
        if (totalPages > 1) {
            paginationControls.appendChild(createPageButton(totalPages, currentPage === totalPages));
        }

        // Next Button
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '>';
            nextButton.classList.add('pagination-button');
            nextButton.onclick = () => {
                currentPage++;
                displayNewsPage();
            };
            paginationControls.appendChild(nextButton);
        }
    }

    function displayNewsPage() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const newsToDisplay = news.slice(startIndex, endIndex);

        const newsContainer = document.getElementById('news-content');
        newsContainer.innerHTML = ''; // Clear the current news

        newsToDisplay.forEach(newsItem => {
            createNews(newsItem); // Assuming createNews is a function that creates and appends news items
        });

        updatePaginationControls();
    }

    // Initial display
    displayNewsPage();
}

function createNews(news) {
    const newsContainer = document.getElementById('news-content');
    const div = document.createElement('div');
    div.classList.add('news-item');

        // Content Container
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('news-content-container');
    
        // Thumbnail
        if (news.thumbnail && news.thumbnail.resolutions && news.thumbnail.resolutions.length > 0) {
            const img = document.createElement('img');
            img.src = news.thumbnail.resolutions[1].url; // Small thumbnail
            img.alt = news.title;
            img.classList.add('news-thumbnail');
            contentContainer.appendChild(img);
        }
    
        // Title
        const h4 = document.createElement('h4');
        h4.textContent = news.title;
        h4.classList.add('news-title');
        contentContainer.appendChild(h4);
    
        div.appendChild(contentContainer);

    // Info Container: Tickers, Author
    const infoContainer = document.createElement('div');
    infoContainer.classList.add('news-info-container');

    // Related Tickers
    if (news.relatedTickers && news.relatedTickers.length > 0) {
        const tickers = document.createElement('div');
        tickers.classList.add('news-tickers');

        const maxVisibleTickers = 3;
        let currentStartIndex = 0;

        function updateTickerDisplay() {
            tickers.innerHTML = ''; // Clear existing tickers

            const visibleTickers = news.relatedTickers.slice(currentStartIndex, currentStartIndex + maxVisibleTickers);

            visibleTickers.forEach((ticker) => {
                const tickerSpan = document.createElement('span');
                tickerSpan.textContent = ticker;
                tickerSpan.onclick = (e) => {
                    e.stopPropagation();
                    window.location.href = `/canslim-stock?symbol=${ticker}`;
                };
                tickers.appendChild(tickerSpan);
            });

            // Update navigation controls
            prevButton.classList.toggle('disabled', currentStartIndex === 0);
            nextButton.classList.toggle('disabled', currentStartIndex + maxVisibleTickers >= news.relatedTickers.length);
        }

        // Navigation buttons
        const prevButton = document.createElement('span');
        prevButton.classList.add('ticker-nav', 'prev-ticker');
        prevButton.textContent = '←';
        prevButton.onclick = (e) => {
            e.stopPropagation();
            if (currentStartIndex > 0) {
                currentStartIndex -= maxVisibleTickers;
                updateTickerDisplay();
            }
        };

        const nextButton = document.createElement('span');
        nextButton.classList.add('ticker-nav', 'next-ticker');
        nextButton.textContent = '→';
        nextButton.onclick = (e) => {
            e.stopPropagation();
            if (currentStartIndex + maxVisibleTickers < news.relatedTickers.length) {
                currentStartIndex += maxVisibleTickers;
                updateTickerDisplay();
            }
        };

        // Append tickers and navigation controls
        infoContainer.appendChild(prevButton);
        infoContainer.appendChild(tickers);
        infoContainer.appendChild(nextButton);

        updateTickerDisplay(); // Initialize ticker display
    }

    // Publisher
    const publisher = document.createElement('p');
    publisher.textContent = news.publisher;
    publisher.classList.add('news-publisher');
    infoContainer.appendChild(publisher);

    div.appendChild(infoContainer);

    // Publish Time
    const publishTime = document.createElement('p');
    const publishDate = new Date(news.providerPublishTime);
    const formattedDate = publishDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    publishTime.textContent = formattedDate;
    publishTime.classList.add('news-publish-time');
    div.appendChild(publishTime); // Moved publish time to the bottom

    div.addEventListener('click', () => {
        window.open(news.link, '_blank');
    });

    newsContainer.appendChild(div);
}
