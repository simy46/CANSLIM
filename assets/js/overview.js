export function updateOverviewSection(stockInfo, summaryDetail) {
    if (stockInfo && summaryDetail) {
        updateRecentPerformance(stockInfo, summaryDetail);
        updateOverviewGrid(summaryDetail);
        updateAdditionalInfo(stockInfo);
    } else {
        document.getElementById('overview-section').textContent = 'No data available';
    }
}

function updateRecentPerformance(stockInfo, summaryDetail) {
    const regularMarketPrice = stockInfo.regularMarketPrice || '-';
    const previousClose = summaryDetail.previousClose || 0;
    const change = regularMarketPrice - previousClose;
    const percentChange = (change / previousClose * 100).toFixed(2);

    document.getElementById('regular-market-price').textContent = regularMarketPrice;
    
    const changeElement = document.getElementById('todays-change');
    changeElement.innerHTML = ''; // Clear previous content
    
    const changeSpan = document.createElement('span');
    changeSpan.textContent = `${change.toFixed(2)} (${percentChange}%)`;
    changeSpan.classList.add(change >= 0 ? 'bullish' : 'bearish');
    changeElement.appendChild(changeSpan);

    const img = document.createElement('img');
    img.id='change-img'
    img.src = change >= 0 ? '/up.png' : '/down.png';
    img.alt = change >= 0 ? 'Up' : 'Down';

    changeElement.appendChild(img);

    document.getElementById('regular-market-day-high').textContent = summaryDetail.dayHigh || '-';
    document.getElementById('regular-market-day-low').textContent = summaryDetail.dayLow || '-';
    document.getElementById('volume').textContent = summaryDetail.volume || '-';
}

function updateOverviewGrid(summaryDetail) {
    document.getElementById('previous-close').textContent = summaryDetail.previousClose || '-';
    document.getElementById('open').textContent = summaryDetail.open || '-';
    document.getElementById('day-low').textContent = summaryDetail.dayLow || '-';
    document.getElementById('day-high').textContent = summaryDetail.dayHigh || '-';
    document.getElementById('average-volume').textContent = summaryDetail.averageVolume || '-';

    document.getElementById('dividend-rate').textContent = summaryDetail.trailingAnnualDividendRate || '-';
    document.getElementById('dividend-yield').textContent = summaryDetail.trailingAnnualDividendYield ? (summaryDetail.trailingAnnualDividendYield * 100).toFixed(2) + '%' : '-';
    document.getElementById('ex-dividend-date').textContent = summaryDetail.exDividendDate ? new Date(summaryDetail.exDividendDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
    document.getElementById('payout-ratio').textContent = summaryDetail.payoutRatio ? (summaryDetail.payoutRatio * 100).toFixed(2) + '%' : '-';
    document.getElementById('five-year-avg-dividend-yield').textContent = summaryDetail.fiveYearAvgDividendYield ? (summaryDetail.fiveYearAvgDividendYield * 100).toFixed(2) + '%' : '-';

    document.getElementById('beta').textContent = summaryDetail.beta || '-';
    document.getElementById('trailing-pe').textContent = summaryDetail.trailingPE || '-';
    document.getElementById('forward-pe').textContent = summaryDetail.forwardPE || '-';
    document.getElementById('price-to-sales').textContent = summaryDetail.priceToSalesTrailing12Months || '-';
    document.getElementById('market-cap').textContent = summaryDetail.marketCap || '-';

    document.getElementById('fifty-two-week-low').textContent = summaryDetail.fiftyTwoWeekLow || '-';
    document.getElementById('fifty-two-week-high').textContent = summaryDetail.fiftyTwoWeekHigh || '-';
    document.getElementById('fifty-day-average').textContent = summaryDetail.fiftyDayAverage || '-';
    document.getElementById('two-hundred-day-average').textContent = summaryDetail.twoHundredDayAverage || '-';
}

function updateAdditionalInfo(stockInfo) {
    const tradeable = document.getElementById('tradeable');
    const crypto = document.getElementById('crypto-tradeable');

    document.getElementById('exchange').textContent = stockInfo.exchange || '-';
    document.getElementById('market-state').textContent = stockInfo.marketState || '-';
    document.getElementById('quote-type').textContent = stockInfo.quoteType || '-';
    document.getElementById('market').textContent = stockInfo.market || '-';
    if (stockInfo.tradeable) {
        tradeable.textContent = 'Yes';
        tradeable.classList.add('bullish')
    } else {
        tradeable.textContent = 'No';
        tradeable.classList.add('bearish');
    }

    if (stockInfo.cryptoTradeable) {
        crypto.textContent = 'Yes';
        crypto.classList.add('bullish')
    } else {
        crypto.textContent = 'No';
        crypto.classList.add('bearish');
    }
}