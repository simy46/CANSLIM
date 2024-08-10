import { SERVER_URL } from './const.js'
import { updateChartSection } from './chart.js';
import { updateOverviewSection } from './overview.js';
import { updateNewsSection } from './stockNew.js';
import { listenToNavEvents } from './nav.js';
import { updateRecommendationsSection } from './recommendations.js';
import { updateProfileSection } from './profile.js';
import { updateInsightsSection } from './insight.js';
import { updateOptionsSection } from './options.js';
import { updateCanslimScores } from './canslim.js';
import { listenToSearchEvent } from './search.js';


document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');

    setLoadingBuyingCheckList(true)
    setLoadingInformations(true);
    listenToNavEvents();
    listenToSearchEvent()

    if (!symbol || symbol === 'undefined' || symbol === 'null') {
        console.error('Ticker symbol is missing');
        setLoadingBuyingCheckList(false)
        setLoadingInformations(false);
        return;
    }

    try {

        const data1 = await fetchFirstData(symbol);
        updateCheckList(data1);
        setLoadingBuyingCheckList(false)

        fetchSecondData(data1, symbol)
            .then(() => console.log('fetch2 successful'))
        
        const score = {
            overallScore: 85,
            bigRockScores: [
                parseFloat(data1.epsGrowth.value),
                parseFloat(data1.increaseInFundsOwnership.value),
                parseFloat(data1.relativeStrengthRating.value)
            ],
            fiftyTwoWeekHigh: data1.stockInfo.fiftyTwoWeekHigh || null,
            fiftyTwoWeekLow: data1.stockInfo.fiftyTwoWeekLow || null,
            currentPrice: data1.stockInfo.regularMarketPrice || null,
            marketCap: data1.stockInfo.marketCap || null,
            peRatio: data1.stockInfo.trailingPE || null,
            dividendYield: data1.stockInfo.trailingAnnualDividendYield,
            info: {
                name: data1.stockInfo.shortName || data1.stockInfo.longName,
                ticker: data1.stockInfo.symbol,
                exchange: data1.stockInfo.fullExchangeName
            }
        };
        
        //updateCanslimScores(score);
        

    } catch (error) {
        console.error('Error fetching data:', error);
    }
});


function setLoadingBuyingCheckList(isLoading) {
    const mainContent = document.querySelectorAll('.content-container');
    const skeletonContainer = document.querySelectorAll('.skeleton-container');

    if (isLoading) {
        skeletonContainer.forEach(skeleton => {
            skeleton.style.display = 'block';
        });
        mainContent.forEach(content => {
            content.style.display = 'none';
        });
    } else {
        skeletonContainer.forEach(skeleton => {
            skeleton.style.display = 'none';
        });
        mainContent.forEach(content => {
            content.style.display = 'flex';
        });
    }
}


function setLoadingInformations(isLoading) {
    if (isLoading) {

    } else {

    }
}


function updateStockDetails(data, stockInfo) {
    // Mettez à jour les sections avec les détails du stock
    if (data.quoteSummary && data.quoteSummary.price) {
        document.getElementById('stock-name').textContent = data.quoteSummary.price.longName || '-';
        document.getElementById('stock-ticker').textContent = `(${data.quoteSummary.price.symbol})` || '-';
    }

    // Overview //
    updateOverviewSection(stockInfo ? stockInfo : data.options.quote, data.quoteSummary.summaryDetail);
    updateNewsSection(data.news);
    updateRecommendationsSection(data.recommendations ? data.recommendations.recommendedSymbols : null);
    updateProfileSection(data.quoteSummary);
    updateInsightsSection(data.insights);
    updateOptionsSection(data.options);
    updateChartSection(data.chart);
    /*updateFinancialsSection(data.quoteSummary ? data.quoteSummary.incomeStatementHistory : null);
    */
}


function updateFinancialsSection(financials) {
    const financialsElement = document.getElementById('financials-content');
    if (financials) {
        financialsElement.innerText = JSON.stringify(financials, null, 2);
    } else {
        financialsElement.innerText = 'No data available';
    }
}

async function fetchFirstData(symbol) {
    try {
        // Première requête : check-stock
        const response = await fetch(`${SERVER_URL}/api/check-stock?symbol=${symbol}`);
        if (!response.ok) {
            throw new Error('Network response was not ok for check-stock');
        }
        return await response.json();

    } catch (e) {
        
    }   
}

async function fetchSecondData(data1, symbol) {
    try {
        // Deuxième requête : stock-details
        const response = await fetch(`${SERVER_URL}/api/stock-details?symbol=${symbol}`);
        if (!response.ok) {
            throw new Error('Network response was not ok for stock-details');
        }
        const data2 = await response.json();
        console.log(data2)
        updateStockDetails(data2, data1.stockInfo);
        setLoadingInformations(false);
    } catch (e) {
        
    }   
}

function updateCheckList(results) {
    console.log(results);

    for (let key in results) {
        if (Object.prototype.hasOwnProperty.call(results, key) && key !== 'marketTrend') {
            const element = document.getElementById(`${key}-result`);
            if (element) {
                const value = results[key].value;
                element.textContent = value !== undefined ? value : 'No data';

                // Apply styles based on the result
                element.classList.remove('pass', 'fail', 'undefined');
                if (results[key].bool === true) {
                    element.classList.add('pass');
                } else if (results[key].bool === false) {
                    element.classList.add('fail');
                } else {
                    element.classList.add('undefined');
                }
            }
        }
    }

    // Handle the market trend separately
    checkInCorrection(results.marketTrend);
}

function checkInCorrection(marketTrend) {
    const marketResult = document.getElementById('marketTrend-result');
    if (marketResult) {
        const value = marketTrend.value;
        marketResult.textContent = value !== undefined ? value : 'No data';

        // Apply styles based on the market trend
        marketResult.classList.remove('pass', 'fail', 'correction');
        if (marketTrend.isInCorrection) {
            marketResult.classList.add('correction');
        } else if (marketTrend.bool) {
            marketResult.classList.add('pass');
        } else {
            marketResult.classList.add('fail');
        }
    }
}

