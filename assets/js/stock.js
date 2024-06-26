import { SERVER_URL } from './const.js'
import { listenToButtonEvent } from './header.js';

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');

    buttonEvent();
    listenToButtonEvent();

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
        noStockFound();  
    }

    setLoading(false);
});

function buttonEvent() {
    const button = document.getElementById('error-button');

    button.addEventListener('click', (e) => {
        e.stopPropagation();
        window.location.href = '/'
    })
}

function updateCheckList(results) {
    const stockName = document.getElementById('stock-name');
    const stockTicker = document.getElementById('stock-ticker');

    stockName.textContent = results.stockInfo.displayName;
    stockTicker.textContent = `(${results.stockInfo.symbol})`
    console.log(results)

    for (let key in results) {
        if (Object.prototype.hasOwnProperty.call(results, key)) {
            const element = document.getElementById(`${key}-result`);
            const passElement = document.getElementById(`${key}-pass`);
            const rowElement = element ? element.closest('tr') : null;
            

            if (element) {
                const value = results[key].value;
                element.textContent = value !== null ? value : 'N/A';

                if (rowElement) {
                    if (!value) {
                        rowElement.classList.add('undefined')
                    } else {
                        rowElement.style.textDecoration = 'none';
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
                    passElement.textContent = 'N/A'
                    passElement.classList.add('undefined')
                }
            }
        }
    }
}

// SOON //
async function displayStockInfos() {
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
    const loader = document.getElementById('loading');
    if (loading) {
        loader.style.display = 'flex';
        document.body.classList.add('no-scroll');
    } else {
        loader.style.display = 'none';
        document.body.classList.remove('no-scroll');
    }
}

// PLUS TARD //
function noStockFound() {
    const errorDiv = document.getElementById('error-page');
    errorDiv.style.display = 'flex';
    document.body.id = 'no-scrolling'
}

function createNews(news) {
    const newsContainer = document.getElementById('news-content')
    const div = document.createElement('div');
    div.classList.add('news-item');

    const h4 = document.createElement('h7');
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
            tickerSpan.onclick = (e) => {
                e.stopPropagation();
                window.location.href = `/canslim-stock?symbol=${ticker}`;
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