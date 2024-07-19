import { SERVER_URL } from './const.js'

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');

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

function updateCheckList(results) {
    const stockName = document.getElementById('stock-name');
    const stockTicker = document.getElementById('stock-ticker');

    stockName.textContent = results.stockInfo.displayName;
    stockTicker.textContent = `(${results.stockInfo.symbol})`;
    console.log(results);

    for (let key in results) {
        if (Object.prototype.hasOwnProperty.call(results, key)) {
            const element = document.getElementById(`${key}-result`);
            const cardElement = element ? element.closest('.card') : null;

            if (element) {
                const value = results[key].value;
                const weight = results[key].weight;
                element.textContent = value !== null ? value : 'No data available';

                if (cardElement) {
                    let size = getBubbleSize(weight);
                    cardElement.style.width = `${size}px`;
                    cardElement.style.height = 'auto';
                    cardElement.style.fontSize = `${size / 15}px`;
                    cardElement.style.padding = '10px';
                    element.style.fontSize = '1.2em';

                    if (value === undefined) {
                        cardElement.classList.add('undefined');
                        cardElement.style.backgroundColor = '#f0f0f0';
                        cardElement.style.color = 'gray';
                    } else {
                        cardElement.classList.remove('undefined');
                        cardElement.style.backgroundColor = '';
                        cardElement.style.color = '';
                    }
                }
            }

            if (cardElement) {
                if (results[key].bool === true) {
                    cardElement.classList.add('pass');
                } else if (results[key].bool === false) {
                    cardElement.classList.add('fail');
                } else {
                    cardElement.classList.add('undefined');
                }
            }
        }
    }
}

function getBubbleSize(weight) {
    const minSize = 200; // Minimum size of the cards
    const maxSize = 400; // Maximum size of the cards
    return minSize + (maxSize - minSize) * (weight / 10);
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