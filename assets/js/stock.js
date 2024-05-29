import { SERVER_URL, SELECTED_SYMBOL } from './const.js'

document.addEventListener("DOMContentLoaded", async () => {
    const symbol = sessionStorage.getItem(SELECTED_SYMBOL);
    listenToNewsEvent();

    if (!symbol) {
        console.error('Ticker symbol is missing');
        return;
    }

    setLoading(true);

    try {
        const response = await fetch(`${SERVER_URL}/api/check-stock?symbol=${symbol}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        updateCheckList(data.checkList);
        data.news.forEach(createNews);
    } catch (error) {
        console.error('Error fetching data:', error);
    }

    setLoading(false);
});

function listenToNewsEvent() {
    const newsHeader = document.querySelector('.news-header');
    const toggleButton = document.getElementById('toggle-news');
    const newsContent = document.getElementById('news-content');

    // Initially hide the news content if not already hidden
    newsContent.style.display = 'none';

    newsHeader.addEventListener('click', function() {
    // Check current display state and toggle it
    const isDisplayed = newsContent.style.display !== 'none';
    newsContent.style.display = isDisplayed ? 'none' : 'block';

    // Correctly toggle classes based on the new display state
    toggleButton.classList.toggle('fa-chevron-up', !isDisplayed);
    toggleButton.classList.toggle('fa-chevron-down', isDisplayed);
    });
}

function updateCheckList(results) {
    const stockName = document.getElementById('stock-name');
    const stockTicker = document.getElementById('stock-ticker');

    stockName.textContent = results.nameAndTicker.displayName;
    stockTicker.textContent = `(${results.nameAndTicker.symbol})`
    console.log(results)

    increaseInFunds(results);
    for (let key in results) {
        if (Object.prototype.hasOwnProperty.call(results, key)) {
            const element = document.getElementById(`${key}-result`);
            const passElement = document.getElementById(`${key}-pass`);
            const rowElement = element ? element.closest('tr') : null;

            if (element) {
                const value = !Array.isArray(results[key].value) ? results[key].value : results[key].value[0];
                element.textContent = value !== null ? value : 'N/A';

                if (rowElement) {
                    if (value === null) {
                        rowElement.style.textDecoration = 'line-through';
                        rowElement.style.color = 'gray';
                        rowElement.style.backgroundColor = '#f0f0f0';
                        element.style.fontWeight = 'normal'
                    } else {
                        rowElement.style.textDecoration = 'none';
                        rowElement.style.color = '';
                        rowElement.style.backgroundColor = '';
                    }
                }
            }

            if (passElement) {
                if (results[key].bool) {
                    passElement.className = 'pass';
                    passElement.textContent = 'pass';
                    element.style.color = '#2ecc71';
                } 
                else if (results[key].bool === false) {
                    passElement.className = 'fail'
                    passElement.textContent = 'fail'
                    element.style.color = '#e74c3c';
                } else {
                    passElement.className = 'undefined'
                    passElement.textContent = 'N/A'
                }
            }
        }
    }
}

function increaseInFunds(results) {
    const increase = document.getElementById('desired-value-increase');
    if (results.increaseInFundsOwnership && results.increaseInFundsOwnership.value) {
        increase.textContent = results.increaseInFundsOwnership.value[1];
    } else {
        increase.textContent = 'N/A';
    }
}



async function displayStockInfos() {
    const symbol = sessionStorage.getItem(SELECTED_SYMBOL);
    const response = await fetchStockData(symbol);
    const data = await response.json();


}

async function fetchStockData(symbol) {
    try {
        const response = await fetch(`${SERVER_URL}/api/check-stock?symbol=${symbol}`);
        if (!response.ok) {
            noStockFound();
        }
        const data = await response.json();
        
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    }
}

function setLoading(loading) {
    const loader = document.getElementById('loading')
    loading ? loader.style.display = 'flex' : loader.style.display = 'none'
}

// PLUS TARD //
function noStockFound() {

}

function createNews(news) {
    const newsContainer = document.getElementById('news-content')
    const div = document.createElement('div');
    div.classList.add('news-item');

    const h4 = document.createElement('h4');
    h4.textContent = news.title;
    h4.classList.add('news-title');
    div.appendChild(h4);

    const div2 = document.createElement('div');
    div2.classList.add('ticker-publisher-container');

    if (news.relatedTickers) {
        const tickers = document.createElement('div');
        tickers.classList.add('news-tickers');
    
        news.relatedTickers.forEach((ticker) => {
            const tickerSpan = document.createElement('span');
            tickerSpan.textContent = ticker;
            tickerSpan.onclick = () => {
                sessionStorage.setItem(SELECTED_SYMBOL, ticker);
                window.location.href = `/stock`;
            };
            tickers.appendChild(tickerSpan);
        });
    
        div2.appendChild(tickers);
    }

    const publisher = document.createElement('p');
    publisher.textContent = `Published by ${news.publisher}`;
    publisher.classList.add('news-publisher');
    div2.appendChild(publisher);

    div.appendChild(div2);

    div.addEventListener('click', () => {
        window.open(news.link, '_blank');
    });

    newsContainer.appendChild(div);
}