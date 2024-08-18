// NEWS //
export function updateNewsSection(news) {
    if (news && news.length > 0) {
        listenToNewsEvents(news);
    } else {
        const newsElement = document.getElementById('news-content');
        newsElement.innerText = 'No data available';
    }
}

function listenToNewsEvents(news) {
    let currentPage = 1;
    const itemsPerPage = 4; // 4 items per page
    const totalPages = Math.ceil(news.length / itemsPerPage);
    const paginationControls = document.getElementById('pagination-controls');

    function updatePaginationControls() {
        paginationControls.innerHTML = '';

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

        paginationControls.appendChild(createPageButton(1, currentPage === 1));

        if (currentPage > 3) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            paginationControls.appendChild(dots);
        }

        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            paginationControls.appendChild(createPageButton(i, currentPage === i));
        }

        if (currentPage < totalPages - 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            paginationControls.appendChild(dots);
        }

        if (totalPages > 1) {
            paginationControls.appendChild(createPageButton(totalPages, currentPage === totalPages));
        }

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
        newsContainer.innerHTML = '';

        newsToDisplay.forEach(newsItem => {
            createNews(newsItem);
        });

        updatePaginationControls();
    }

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
            console.log(news.thumbnail.resolutions)
            const img = document.createElement('img');
            img.src = news.thumbnail.resolutions[1].url;
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

    // Info Container
    const infoContainer = document.createElement('div');
    infoContainer.classList.add('news-info-container');

    // Related Tickers
    if (news.relatedTickers && news.relatedTickers.length > 0) {
        const tickers = document.createElement('div');
        tickers.classList.add('news-tickers');

        const maxVisibleTickers = 3;
        let currentStartIndex = 0;

        function updateTickerDisplay() {
            tickers.innerHTML = '';

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

            prevButton.classList.toggle('disabled', currentStartIndex === 0);
            nextButton.classList.toggle('disabled', currentStartIndex + maxVisibleTickers >= news.relatedTickers.length);
        }

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

        infoContainer.appendChild(prevButton);
        infoContainer.appendChild(tickers);
        infoContainer.appendChild(nextButton);

        updateTickerDisplay();
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
    div.appendChild(publishTime);

    div.addEventListener('click', () => {
        window.open(news.link, '_blank');
    });

    newsContainer.appendChild(div);
}
