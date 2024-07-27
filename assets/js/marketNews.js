import { SERVER_URL, TRENDING_STOCKS_TICKERS } from "./const.js";

document.addEventListener('DOMContentLoaded', async () => {
    setLoading(true);
    await getNews();
    setTimeout(() => setLoading(false), 1000);
});


async function getNews() {
    const tickers = localStorage.getItem(TRENDING_STOCKS_TICKERS);
    let storedTickers = tickers ? JSON.parse(tickers) : [];

    const data = await fetchNews(storedTickers);

    if (data.length === 0) {
        return;
    }

    data.news.forEach(createNews);
    data.nav.forEach(createNav);
    data.lists.forEach(createList);
    data.researchReports.forEach(createResearchReport);
}

function setLoading(isLoading) {
    const loading = document.getElementById('loader');
    const newsContainer = document.getElementById('news-container');
    isLoading ? loading.style.display = 'flex' : loading.style.display = 'none';
    isLoading ? newsContainer.style.display = 'none' : newsContainer.style.display = 'flex';
}

async function fetchNews(tickers) {
    try {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tickers })
        };
        const response = await fetch(`${SERVER_URL}/api/market-news`, options);
        if (!response.ok) {
            throw new Error('Error retrieving news');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error retrieving news:', error);
        showErrorPage();
        return [];
    }
}

function showErrorPage() {
    document.getElementById('news-container').style.display = 'none';
    document.getElementById('error-page').style.display = 'block';
}

function createNews(news) {
    console.log(news);
    if (!news.thumbnail) {
        return;
    }

    const div = document.createElement('div');
    div.classList.add('news');

    if (news.thumbnail && news.thumbnail.resolutions.length > 0) {
        const img = document.createElement('img');
        img.src = news.thumbnail.resolutions[0].url;
        img.alt = 'Thumbnail';
        img.classList.add('news-thumbnail');
        div.appendChild(img);
    }

    const div2 = document.createElement('div');
    div2.classList.add('tickers-title-div');

    const h3 = document.createElement('h3');
    h3.textContent = news.title;
    div2.appendChild(h3);

    if (news.relatedTickers) {
        const tickers = document.createElement('div');
        tickers.classList.add('news-tickers');
    
        news.relatedTickers.forEach((ticker) => {
            const tickerSpan = document.createElement('span');
            tickerSpan.textContent = ticker;
            tickerSpan.onclick = (e) => {
                e.stopPropagation();
                window.location.href = `/stock?symbol=${ticker}`;
            };
            
            tickers.appendChild(tickerSpan);
        });
    
        div2.appendChild(tickers);
    }

    const publisher = document.createElement('p');
    publisher.textContent = `Published by ${news.publisher}`;
    publisher.classList.add('news-publisher');
    div2.appendChild(publisher);

    const publishTime = document.createElement('p');
    const date = new Date(news.providerPublishTime);
    const formattedDate = date.toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    publishTime.textContent = `Published on ${formattedDate}`;
    publishTime.classList.add('news-publish-time');
    div2.appendChild(publishTime);

    div.appendChild(div2);

    div.addEventListener('click', () => {
        window.open(news.link, '_blank');
    });

    const newsContainer = document.getElementById('news-container');
    newsContainer.appendChild(div);
}

function createNav(navItem) {
    const div = document.createElement('div');
    div.classList.add('nav-item');

    const a = document.createElement('a');
    a.href = navItem.navUrl;
    a.textContent = navItem.navName;
    a.target = '_blank';
    div.appendChild(a);

    const navContainer = document.getElementById('nav-container');
    navContainer.appendChild(div);
}

function createList(listItem) {
    console.log(listItem);
    const div = document.createElement('div');
    div.classList.add('list-item');

    const icon = document.createElement('img');
    icon.src = listItem.iconUrl;
    icon.alt = listItem.name || listItem.title || 'No Name Available';
    div.appendChild(icon);

    const h3 = document.createElement('h3');
    h3.textContent = listItem.name || listItem.title || 'No Name Available';
    div.appendChild(h3);

    if (listItem.dailyPercentGain !== undefined) {
        const p = document.createElement('p');
        p.textContent = `Daily Gain: ${(listItem.dailyPercentGain * 100).toFixed(2)}%`;
        div.appendChild(p);
    }

    if (listItem.followerCount !== undefined) {
        const p2 = document.createElement('p');
        p2.textContent = `Followers: ${listItem.followerCount}`;
        div.appendChild(p2);
    }

    if (listItem.score !== undefined) {
        const p3 = document.createElement('p');
        p3.textContent = `Score: ${listItem.score}`;
        div.appendChild(p3);
    }

    const p4 = document.createElement('p');
    if (listItem.symbolCount !== undefined) {
        p4.textContent = `Symbol Count: ${listItem.symbolCount}`;
    } else if (listItem.total !== undefined) {
        p4.textContent = `Symbol Count: ${listItem.total}`;
    } else {
        p4.textContent = 'Symbol Count: -';
    }
    div.appendChild(p4);

    div.addEventListener('click', () => {
        const url = listItem.slug ? 
            `https://finance.yahoo.com/u/yahoo-finance/watchlists/${listItem.slug}` :
            `https://finance.yahoo.com/screener/predefined/${listItem.canonicalName}`;
        window.open(url, '_blank');
    });

    const listContainer = document.getElementById('list-container');
    listContainer.appendChild(div);
}



function createResearchReport(report) {
    const div = document.createElement('div');
    div.classList.add('research-report');

    const h3 = document.createElement('h3');
    h3.textContent = report.title;
    div.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = `Author: ${report.author}`;
    div.appendChild(p);

    const p2 = document.createElement('p');
    p2.textContent = `Published on: ${new Date(report.publishDate).toLocaleDateString()}`;
    div.appendChild(p2);

    div.addEventListener('click', () => {
        window.open(report.link, '_blank');
    });

    const reportContainer = document.getElementById('report-container');
    reportContainer.appendChild(div);
}