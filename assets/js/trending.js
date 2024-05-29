import { SERVER_URL, SELECTED_SYMBOL, ETAG_KEY, TRENDING_STOCKS_TICKERS, TRENDING_STOCKS_KEY } from "./const";
let once = true;

document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('loading');
    const loadingDaily = document.getElementById('loading-daily');
    const stocksContainer = document.getElementById('stocks-container');
    const dailyGainersContainer = document.getElementById('daily-gainers-container');

    // listenToAllEvent();

    setLoading(true, loading, stocksContainer);
    await populate(stocksContainer, true);
    setLoading(false, loading, stocksContainer);

    setLoading(true, loadingDaily, dailyGainersContainer);
    await populate(dailyGainersContainer, false);
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
    const left = document.getElementById("prev-button");
    const right = document.getElementById("next-button");

    left.addEventListener("click", function() {
        if (activeIndex > 0) {
            activeIndex--;
            showContainer(activeIndex);
        }
    });

    right.addEventListener("click", function() {
        if (activeIndex < containers.length - 1) {
            activeIndex++;
            showContainer(activeIndex);
        }
    });
}

function showContainer(index) {
    const containers = document.querySelectorAll(".container");

    let activeIndex = parseInt(localStorage.getItem("activeContainerIndex")) || 0;

    containers.forEach(container => {
        container.classList.remove("active");
    });

    if (index >= 0 && index < containers.length) {
        containers[index].classList.add("active");
        localStorage.setItem("activeContainerIndex", index);
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
        sessionStorage.setItem(SELECTED_SYMBOL, stock.symbol);
        if (!stock.cryptoTradeable) {
            window.location.href = `/stock?symbol=${symbol}`;
        } else {
            window.location.href = `/crypto-analysis?symbol=${symbol}`;
        }

        /*
        if (stock.title) {
            if (!stock.cryptoTradeable) {
                window.location.href = '/stock';
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
            sessionStorage.setItem(TRENDING_STOCKS_TICKERS, JSON.stringify(stocksTickers));
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
