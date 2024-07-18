import { SERVER_URL, ETAG_KEY, TRENDING_STOCKS_TICKERS, TRENDING_STOCKS_KEY, STOCK_SELECTION } from "./const.js";
let once = true;

document.addEventListener('DOMContentLoaded', async () => {
    const selectedValue = localStorage.getItem(STOCK_SELECTION) || 'trending';
    const isTrending = selectedValue === 'trending'

    listenToAllEvent();

    setLoading(true, isTrending);
    await populate(isTrending);
    setLoading(false, isTrending);

    setLoading(true, !isTrending);
    await populate(!isTrending);
    setLoading(false, !isTrending);
});

async function populate(isTrending) {
    const stocksContainer = document.getElementById('stocks-container');
    const dailyGainersContainer = document.getElementById('daily-gainers-container');

    const container = isTrending ? stocksContainer : dailyGainersContainer;
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

function setLoading(isLoading, isTrending) {
    const loadingTrending = document.getElementById('loading');
    const loadingDaily = document.getElementById('loading-daily');
    const stocksContainer = document.getElementById('stocks-container');
    const dailyGainersContainer = document.getElementById('daily-gainers-container');
    
    const loading = isTrending ? loadingTrending : loadingDaily;
    const container = isTrending ? stocksContainer : dailyGainersContainer;

    console.log(`LOADING : ${loading}`);
    console.log(`CONTAINER : ${container}`)

    loading.style.display = isLoading ? 'flex' : 'none';
    container.style.display = isLoading ? 'none' : 'grid';
}

function listenToAllEvent() {
    const input = document.getElementById('stock-selector');
    const selectedValue = localStorage.getItem(STOCK_SELECTION) || 'trending';

    input.value = selectedValue;

    document.getElementById('stock-selector').addEventListener('change', showContainer);
    showContainer();
}

function showContainer() {
    const trendingContainer = document.getElementById('trending-container');
    const gainersContainer = document.getElementById('gainers-container');
    const selectedValue = document.getElementById('stock-selector').value;
    const title = document.querySelector('#section-title > h1');
    const icon = document.querySelector('#section-title > i');
    
    if (selectedValue === 'trending') {
        title.textContent = 'Trending Stocks'
        trendingContainer.classList.remove('hidden');
        gainersContainer.classList.add('hidden');
        icon.classList.add('fa-fire')
        icon.classList.remove('fa-chart-line')
    } else if (selectedValue === 'gainers') {
        title.textContent = ' Daily Gainers Stocks'
        gainersContainer.classList.remove('hidden');
        trendingContainer.classList.add('hidden');
        icon.classList.add('fa-chart-line')
        icon.classList.remove('fa-fire')
    }

    localStorage.setItem(STOCK_SELECTION, selectedValue)
}

function createStock(stock, container) {
    const stockDiv = document.createElement('div');
    stockDiv.classList.add('stock-card', stock.regularMarketChangePercent >= 0 ? 'up' : 'down');

    // Header section with name, ticker and market change
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header');

    const titleDiv = document.createElement('div');
    titleDiv.classList.add('title');

    const stockName = document.createElement('h3');
    const name = stock.displayName || stock.longName;
    stockName.textContent = name;

    const ticker = document.createElement('span');
    ticker.textContent = `(${stock.symbol})`;
    ticker.classList.add('ticker');

    titleDiv.append(stockName, ticker);

    const changeDiv = document.createElement('div');
    changeDiv.classList.add('change');

    const change = document.createElement('p');
    change.textContent = `${stock.regularMarketChange ? stock.regularMarketChange.toFixed(2) : 'N/A'} (${stock.regularMarketChangePercent ? stock.regularMarketChangePercent.toFixed(2) : 'N/A'}%)`;
    change.classList.add(stock.regularMarketChangePercent >= 0 ? 'positive' : 'negative');

    changeDiv.appendChild(change);

    headerDiv.append(titleDiv, changeDiv);

    // Section 1: Overview
    const overviewDiv = document.createElement('div');
    overviewDiv.classList.add('section');

    const overviewTitle = document.createElement('h3');
    overviewTitle.textContent = 'Overview';
    overviewDiv.appendChild(overviewTitle);

    const priceDiv = document.createElement('div');
    priceDiv.classList.add('price');
    const priceLabel = document.createElement('span');
    priceLabel.textContent = 'Market Price: ';
    const priceValue = document.createElement('span');
    priceValue.textContent = `${stock.regularMarketPrice} ${stock.currency}`;
    priceDiv.append(priceLabel, priceValue);

    const marketCap = document.createElement('p');
    marketCap.textContent = `Market Cap: ${stock.marketCap ? stock.marketCap.toLocaleString() : 'N/A'}`;

    const exchange = document.createElement('p');
    exchange.textContent = `Exchange: ${stock.exchange || 'N/A'}`;

    overviewDiv.append(priceDiv, marketCap, exchange);

    // Section 2: Additional Information
    const additionalInfoDiv = document.createElement('div');
    additionalInfoDiv.classList.add('section');

    const additionalInfoTitle = document.createElement('h3');
    additionalInfoTitle.textContent = 'Additional Information';
    additionalInfoDiv.appendChild(additionalInfoTitle);

    const region = document.createElement('p');
    region.textContent = `Region: ${stock.region || 'N/A'}`;

    const language = document.createElement('p');
    language.textContent = `Language: ${stock.language || 'N/A'}`;

    const quoteSourceName = document.createElement('p');
    quoteSourceName.textContent = `Quote Source: ${stock.quoteSourceName || 'N/A'}`;

    const beta = document.createElement('p');
    beta.textContent = `Beta: ${stock.beta !== undefined ? stock.beta : 'N/A'}`;

    const market = document.createElement('p');
    market.textContent = `Market: ${stock.market || 'N/A'}`;

    const regularMarketTime = document.createElement('p');
    regularMarketTime.textContent = `Trading Time: ${stock.regularMarketTime ? new Date(stock.regularMarketTime).toLocaleString() : 'N/A'}`;

    const dividendDate = document.createElement('p');
    dividendDate.textContent = `Dividend Date: ${stock.dividendDate ? new Date(stock.dividendDate).toLocaleDateString() : 'N/A'}`;

    const trailingAnnualDividendYield = document.createElement('p');
    trailingAnnualDividendYield.textContent = `Dividend Yield: ${stock.trailingAnnualDividendYield !== undefined ? (stock.trailingAnnualDividendYield * 100).toFixed(2) : 'N/A'}%`;

    additionalInfoDiv.append(region, language, quoteSourceName, beta, market, regularMarketTime, dividendDate, trailingAnnualDividendYield);

    // Append all sections to the main stockDiv
    stockDiv.append(headerDiv, overviewDiv, additionalInfoDiv);

    container.appendChild(stockDiv);

    stockDiv.addEventListener('click', () => {
        if (!stock.cryptoTradeable) {
            window.location.href = `/canslim-stock?symbol=${stock.symbol}`;
        } else {
            window.location.href = '/crypto-analysis';
        }
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
