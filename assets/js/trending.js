import { SERVER_URL, ETAG_KEY, TRENDING_STOCKS_TICKERS, TRENDING_STOCKS_KEY, STOCK_SELECTION } from "./const";
let once = true;

document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const loadingDaily = document.getElementById('loading-daily');
    const stocksContainer = document.getElementById('stocks-container');
    const dailyGainersContainer = document.getElementById('daily-gainers-container');
    const savedSelection = localStorage.getItem(STOCK_SELECTION) || 'trending';


    const isTrending = savedSelection === 'trending';




    listenToAllEvent(savedSelection);

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

function listenToAllEvent(savedSelection) {
    const input = document.getElementById('stock-selector');

    if (savedSelection === 'gainers') {
        toggleHeaderText(true);
    } else {
        toggleHeaderText(false);
    }

    input.value = savedSelection;
    input.onchange = function(){switchContainer()};  // Attach the event first
    switchContainer();
}

function switchContainer() {
    const selector = document.getElementById('stock-selector');
    const trendingContainer = document.getElementById('trending-container');
    const gainersContainer = document.getElementById('gainers-container');
    const title = document.querySelector('#section-title > h1');
    
    if (selector.value === 'trending') {
        title.textContent = 'Trending Stocks';
        trendingContainer.classList.remove('hidden');
        gainersContainer.classList.add('hidden');
        toggleHeaderText(true);

    } else {
        title.textContent = 'Daily Gainers';
        trendingContainer.classList.add('hidden');
        gainersContainer.classList.remove('hidden');
        toggleHeaderText(false);
    }

    localStorage.setItem(STOCK_SELECTION, selector.value);
}


function toggleHeaderText(isTrending) {
    const trendingText = document.getElementById('trending-text');
    const dailyText = document.getElementById('daily-text');
    const fire = document.querySelector('.fa-fire');
    const chart = document.querySelector('.fa-chart-line');
    
    if (isTrending) {
        trendingText.classList.add('visible');
        trendingText.classList.remove('hidden');
        dailyText.classList.remove('visible');
        dailyText.classList.add('hidden');
        fire.classList.remove('hidden');
        fire.classList.add('i-visible');
        chart.classList.remove('i-visible');
        chart.classList.add('hidden');
    } else {
        trendingText.classList.remove('visible');
        trendingText.classList.add('hidden');
        dailyText.classList.add('visible');
        dailyText.classList.remove('hidden');
        chart.classList.remove('hidden');
        fire.classList.remove('i-visible');
        chart.classList.add('i-visible');
        fire.classList.add('hidden');
    }
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