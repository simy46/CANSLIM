// NEWS //
export function updateNewsSection(news) {
    if (news) {
        displayNews(news, 3); // Display 3 news items initially
        listenToNewsEvents(news);
    } else {
        const newsElement = document.getElementById('news-content');
        newsElement.innerText = 'No data available';
    }
}

function displayNews(news, maxDisplayed) {
    const newsContent = document.getElementById('news-content');
    newsContent.innerHTML = '';

    const newsToShow = news.slice(0, maxDisplayed);
    newsToShow.forEach(createNews);

    document.getElementById('see-more-news').style.display = maxDisplayed < news.length ? 'block' : 'none';
    document.getElementById('see-less-news').style.display = maxDisplayed > 3 ? 'block' : 'none';
}

function listenToNewsEvents(news) {
    let newsDisplayed = 3;

    document.getElementById('see-more-news').addEventListener('click', () => {
        newsDisplayed += 2;
        displayNews(news, newsDisplayed);
    });

    document.getElementById('see-less-news').addEventListener('click', () => {
        newsDisplayed = 3;
        displayNews(news, newsDisplayed);
    });
}


function createNews(news) {
    const newsContainer = document.getElementById('news-content');
    const div = document.createElement('div');
    div.classList.add('news-item');

    const h4 = document.createElement('h4');
    h4.textContent = news.title;
    h4.classList.add('news-title');
    div.appendChild(h4);

    if (news.relatedTickers) {
        const tickers = document.createElement('div');
        tickers.classList.add('news-tickers');
    
        news.relatedTickers.forEach((ticker) => {
            const tickerSpan = document.createElement('span');
            tickerSpan.textContent = ticker;
            tickerSpan.onclick = (e) => {
                e.stopPropagation();
                window.location.href = `/canslim-stock?symbol=${ticker}`;
            };
            tickers.appendChild(tickerSpan);
        });
    
        div.appendChild(tickers);
    }

    // PUBLISH TIME //
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

    // PUBLISHER //
    const publisher = document.createElement('p');
    publisher.textContent = `Published by ${news.publisher}`;
    publisher.classList.add('news-publisher');
    div.appendChild(publisher);

    div.addEventListener('click', () => {
        window.open(news.link, '_blank');
    });

    newsContainer.appendChild(div);
}