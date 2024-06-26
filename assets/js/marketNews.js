import { SERVER_URL, TRENDING_STOCKS_TICKERS } from "./const.js";
import { listenToButtonEvent } from "./header.js";

document.addEventListener('DOMContentLoaded', async () => {
    listenToButtonEvent();

    setLoading(true);
    await getNews();
    setTimeout(() => setLoading(false), 1000);
});

async function getNews() {
    const tickers = localStorage.getItem(TRENDING_STOCKS_TICKERS);
    let storedTickers = tickers ? JSON.parse(tickers) : [];

    const news = await fetchNews(storedTickers);
    news.forEach(createNews);
}

function setLoading(isLoading) {
    const loading = document.getElementById('hamster-loading');
    const newsContainer = document.getElementById('news-container');
    isLoading ? loading.style.display = 'flex' : loading.style.display = 'none';
    isLoading ? newsContainer.style.display = 'none' : newsContainer.style.display = 'grid';
}

async function fetchNews(tickers) {
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tickers)
        };
        const response = await fetch(`${SERVER_URL}/api/market-news`, options);
        if (!response.ok) {
            throw new Error('Error retrieving news');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error retrieving news:', error);
        return [];
    }
}

function createNews(news) {
    if (!news.thumbnail) {
        return
    }

    const div = document.createElement('div');
    div.classList.add('news');
    div.id = 'market-news';

    if (news.thumbnail && news.thumbnail.resolutions.length > 0) {
        const img = document.createElement('img');
        img.src = news.thumbnail.resolutions[0].url;
        img.alt = 'Thumbnail';
        img.classList.add('news-thumbnail');
        div.appendChild(img);
    }

    const h4 = document.createElement('h4');
    h4.textContent = news.title;
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

    const publisher = document.createElement('p');
    publisher.textContent = `Published by ${news.publisher}`;
    publisher.classList.add('news-publisher');
    div.appendChild(publisher)

    div.addEventListener('click', () => {
        window.open(news.link, '_blank');
    });

    const newsContainer = document.getElementById('news-container');
    newsContainer.appendChild(div);
}