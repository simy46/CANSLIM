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
        title.textContent = 'Trending'
        trendingContainer.classList.remove('hidden');
        gainersContainer.classList.add('hidden');
        icon.classList.add('fa-fire')
        icon.classList.remove('fa-chart-line')
    } else if (selectedValue === 'gainers') {
        title.textContent = ' Daily Gainers'
        gainersContainer.classList.remove('hidden');
        trendingContainer.classList.add('hidden');
        icon.classList.add('fa-chart-line')
        icon.classList.remove('fa-fire')
    }

    localStorage.setItem(STOCK_SELECTION, selectedValue)
}

function formatNumber(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

function createStock(stock, container) {
    console.log(stock)
    const stockDiv = document.createElement('div');
    stockDiv.classList.add('stock-card', stock.regularMarketChangePercent >= 0 ? 'positive' : 'negative');

    // Header section with name, ticker and market change
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header');

    const stockName = document.createElement('h3');
    const name = stock.displayName || stock.longName;
    stockName.textContent = name;

    const ticker = document.createElement('span');
    ticker.textContent = `(${stock.symbol})`;
    ticker.classList.add('ticker');

    const changeDiv = document.createElement('div');
    changeDiv.classList.add('change');

    const change = document.createElement('p');
    change.textContent = `${stock.regularMarketChange ? stock.regularMarketChange.toFixed(2) : '-'} (${stock.regularMarketChangePercent ? stock.regularMarketChangePercent.toFixed(2) : '-'}%)`;
    change.classList.add(stock.regularMarketChangePercent >= 0 ? 'positive' : 'negative');

    const changeIcon = document.createElement('img');
    changeIcon.src = stock.regularMarketChangePercent >= 0 ? '/up.png' : '/down.png';
    changeIcon.alt = stock.regularMarketChangePercent >= 0 ? 'Up' : 'Down';
    changeIcon.classList.add('change-icon');

    changeDiv.append(change, changeIcon);

    headerDiv.append(stockName, ticker, changeDiv);

    // Section 1: Key Statistics
    const keyStatsDiv = document.createElement('div');
    keyStatsDiv.classList.add('section');

    const keyStatsTitle = document.createElement('h3');
    keyStatsTitle.textContent = 'Key Statistics';
    keyStatsDiv.appendChild(keyStatsTitle);

    const marketCap = createStatElement('Market Cap', `${stock.marketCap ? `${formatNumber(stock.marketCap)} USD` : '-'}`);
    const beta = createStatElement('Beta', `${stock.beta !== undefined ? stock.beta : '-'}`);
    const dividendDate = createStatElement('Dividend Date', `${stock.dividendDate ? new Date(stock.dividendDate).toLocaleDateString() : '-'}`);
    dividendDate.classList.add('date');
    const trailingAnnualDividendYield = createStatElement('Dividend Yield', `${stock.trailingAnnualDividendYield !== undefined ? (stock.trailingAnnualDividendYield * 100).toFixed(2) : '-'}%`);

    keyStatsDiv.append(marketCap, beta, dividendDate, trailingAnnualDividendYield);

    // Section 2: Market Performance
    const performanceDiv = document.createElement('div');
    performanceDiv.classList.add('section');

    const performanceTitle = document.createElement('h3');
    performanceTitle.textContent = 'Market Performance';
    performanceDiv.appendChild(performanceTitle);

    const priceDiv = createStatElement('Market Price', `${stock.regularMarketPrice} ${stock.currency}`);
    const regularMarketTime = createStatElement('Trading Time', `${stock.regularMarketTime ? new Date(stock.regularMarketTime).toLocaleString() : '-'}`);
    regularMarketTime.classList.add('date');
    const todayRange = createStatElement('Today\'s Range', `${stock.regularMarketDayLow !== undefined ? stock.regularMarketDayLow : '-'} - ${stock.regularMarketDayHigh !== undefined ? stock.regularMarketDayHigh : '-'}`);
    const range = stock.fiftyTwoWeekRange.low ? `${stock.fiftyTwoWeekRange.low} - ${stock.fiftyTwoWeekRange.high}` : stock.fiftyTwoWeekRange ? stock.fiftyTwoWeekRange : '-'
    const fiftyTwoWeekRange = createStatElement('52 Week Range', range);

    performanceDiv.append(priceDiv, regularMarketTime, todayRange, fiftyTwoWeekRange);

    // Section 3: Additional Information
    const additionalInfoDiv = document.createElement('div');
    additionalInfoDiv.classList.add('section');

    const additionalInfoTitle = document.createElement('h3');
    additionalInfoTitle.textContent = 'Additional Information';
    additionalInfoDiv.appendChild(additionalInfoTitle);

    const region = createStatElement('Region', `${stock.region || '-'}`);
    const language = createStatElement('Language', `${stock.language || '-'}`);
    const quoteSourceName = createStatElement('Quote Source', `${stock.quoteSourceName || '-'}`);
    const market = createStatElement('Market', `${stock.market || '-'}`);

    additionalInfoDiv.append(region, language, quoteSourceName, market);

    // Append all sections to the main stockDiv
    stockDiv.append(headerDiv, keyStatsDiv, performanceDiv, additionalInfoDiv);

    container.appendChild(stockDiv);

    stockDiv.addEventListener('click', () => {
        if (!stock.cryptoTradeable) {
            window.location.href = `/canslim-stock?symbol=${stock.symbol}`;
        } else {
            window.location.href = '/crypto-analysis';
        }
    });
}

function createStatElement(label, value) {
    const statDiv = document.createElement('div');
    statDiv.classList.add('stat');

    const statLabel = document.createElement('span');
    statLabel.textContent = label;
    statLabel.classList.add('stat-label');

    const statValue = document.createElement('span');
    statValue.textContent = value;
    statValue.classList.add('stat-value');

    statDiv.append(statLabel, statValue);
    return statDiv;
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
