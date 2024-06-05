import { SERVER_URL, ETAG_KEY, TRENDING_STOCKS_TICKERS, TRENDING_STOCKS_KEY, STOCK_SELECTION } from "./const";
let once = true;

document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const loadingDaily = document.getElementById('loading-daily');
    const stocksContainer = document.getElementById('stocks-container');
    const dailyGainersContainer = document.getElementById('daily-gainers-container');
    const savedSelection = localStorage.getItem(STOCK_SELECTION) || 'trending';

    const isTrending = savedSelection === 'trending';

    listenToAllEvent();

    setLoading(true, loading, stocksContainer);
    await populate(stocksContainer, isTrending);
    setLoading(false, loading, stocksContainer);

    setLoading(true, loadingDaily, dailyGainersContainer);
    await populate(dailyGainersContainer, isTrending);
    setLoading(false, loadingDaily, dailyGainersContainer);


});

async function populate(container, isTrending) {
    let stocks = isTrending ? await fetchTrendingStocks() : await fetchDailyGainers();
    container.innerHTML = '';
    if (stocks.length > 0) {
        stocks.forEach(stock => createStock(stock, container));
    } else {
        const p = document.createElement('p');
        p.textContent = 'No stocks available';
        container.appendChild(p);
    }
}

function setLoading(isLoading, loading, container) {
    loading.style.display = isLoading ? 'flex' : 'none';
    container.style.display = isLoading ? 'none' : 'grid';
}

function listenToAllEvent() {
    const input = document.getElementById('stock-selector');
    const savedSelection = localStorage.getItem(STOCK_SELECTION) || 'trending';
    input.value = savedSelection;
    input.onchange = function(){switchContainer()};
    switchContainer();
}

function switchContainer() {
    const selector = document.getElementById('stock-selector');
    const trendingContainer = document.getElementById('trending-container');
    const gainersContainer = document.getElementById('gainers-container');
    const title = document.getElementById('section-title');
    
    if (selector.value === 'trending') {
        title.textContent = 'Trending Stocks'
        trendingContainer.classList.remove('hidden');
        gainersContainer.classList.add('hidden');
    } else {
        title.textContent = 'Daily Gainers Stocks'
        trendingContainer.classList.add('hidden');
        gainersContainer.classList.remove('hidden');
    }

    localStorage.setItem(STOCK_SELECTION, selector.value);
}

function createStock(stock, container) {
    console.log(stock)
    const stockDiv = document.createElement('div');
    stockDiv.classList.add('stock', stock.regularMarketChangePercent >= 0 ? 'green' : 'red', 'card');

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('title-trending')


    const stockName = document.createElement('h4');
    const name = stock.displayName || stock.longName;
    if (stock.displayName || stock.longName) {
        stockName.textContent = name;
    } else {
        stockName.textContent = 'N/A'
    }

    const ticker = document.createElement('p');
    ticker.textContent = `(${stock.symbol})`;
    ticker.id = 'ticker'

    titleDiv.append(stockName, ticker);

    const price = document.createElement('p');
    price.textContent = `${stock.regularMarketPrice} ${stock.currency}`;

    const change = document.createElement('p');
    change.textContent = `Change: ${stock.regularMarketChange.toFixed(2)} (${stock.regularMarketChangePercent.toFixed(2)}%)`;

    const volume = document.createElement('p');
    volume.textContent = `Volume: ${stock.regularMarketVolume.toLocaleString()}`;

    const dayRange = document.createElement('p');
    dayRange.textContent = `Day Range: ${stock.regularMarketDayLow} - ${stock.regularMarketDayHigh}`;

    stockDiv.append(titleDiv, price, change, volume, dayRange);
    
    container.appendChild(stockDiv);

    stockDiv.addEventListener('click', () => {
        if (!stock.cryptoTradeable) {
            window.location.href = `/stock?symbol=${stock.symbol}`;
        } else {
            window.location.href = '/crypto-analysis';
        }

        /*
        if (stock.displayName || stock.longName) {
            if (!stock.cryptoTradeable) {
            window.location.href = `/stock?symbol=${stock.symbol}`;
            } else {
                window.location.href = '/crypto-analysis';
            }
        } else {
            stockDiv.littleBoxAppearing = 'No data available for this stock'
        }
        */
    });
}



async function fetchTrendingStocks() {
    try {
        const etag = sessionStorage.getItem(ETAG_KEY);
        const options = {
            method: 'GET',
            headers: {}
        };

        if (etag) {
            options.headers['If-None-Match'] = etag;
        }

        const response = await fetch(`${SERVER_URL}/api/stocks/trending`, options);

        if (response.status === 304) {
            return JSON.parse(sessionStorage.getItem(TRENDING_STOCKS_KEY)) || [];
        }

        if (!response.ok) {
            throw new Error('Error retrieving trending stocks');
        }

        const data = await response.json();

        if (once) {
            const stocksTickers = data.map((stock) => stock.symbol);
            localStorage.setItem(TRENDING_STOCKS_TICKERS, JSON.stringify(stocksTickers));
            once = false;
        }

        const newEtag = response.headers.get('ETag');
        sessionStorage.setItem(ETAG_KEY, newEtag);
        sessionStorage.setItem(TRENDING_STOCKS_KEY, JSON.stringify(data));
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des stocks initiaux:', error);
        return [];
    }
}

async function fetchDailyGainers() {
    const response = await fetch(`${SERVER_URL}/api/stocks/daily-gainers`);

    if (!response.ok) {
        throw new Error('Error retrieving daily gainers');
    }

    const data = await response.json();
    return data
}
