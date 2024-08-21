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
import { captureAndSendImage, captureAndDownloadImage } from './captureChecklist.js';


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
        setTimeout(() => {
            setLoadingBuyingCheckList(false);
        }, 1500);

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
    if (isLoading) {
        // LOGIQUE LOADING SCREEN //
    } else {
        document.getElementById('share-twitter').addEventListener('click', captureAndSendImage);
        document.getElementById('download-btn').addEventListener('click', captureAndDownloadImage);
    }
}




function setLoadingInformations(isLoading) {
    if (isLoading) {

    } else {

    }
}


function updateStockDetails(data, stockInfo) {
    if (data.quoteSummary && data.quoteSummary.price) {
        document.getElementById('stock-name').textContent = data.quoteSummary.price.longName || '-';
        document.getElementById('stock-ticker').textContent = `(${data.quoteSummary.price.symbol})` || '-';
        console.log(data.quoteSummary && data.quoteSummary.price)
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
        if (Object.prototype.hasOwnProperty.call(results, key) && key !== 'marketTrend' && key !== 'overall') {
            const element = document.getElementById(`${key}-result`);
            if (element) {
                const value = results[key].value;
                console.log(value)
                element.textContent = value !== null ? value : 'No data';

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

    checkInCorrection(results.marketTrend);
    checkOverall(results.overall)
}

function checkOverall(overall) {
    const overallElem = document.getElementById('overall-result');

    if (!overall || overall.overallScore === null) {
        overallElem.textContent = 'Insufficient Data';
        overallElem.classList.remove('pass', 'correction', 'fail', 'undefined');
        overallElem.classList.add('undefined');
        return;
    }

    const score = parseFloat(overall.overallScore);
    let className;

    if (score >= 70) {
        className = 'pass';
    } else if (score >= 40) {
        className = 'correction';
    } else {
        className = 'fail';
    }

    overallElem.textContent = `${score}%`;
    overallElem.classList.remove('pass', 'correction', 'fail', 'undefined'); // Supprime les anciennes classes
    overallElem.classList.add(className);
}

function checkInCorrection(marketTrend) {
    const marketResult = document.getElementById('marketTrend-result');
    if (marketResult) {
        const value = marketTrend.value;
        marketResult.textContent = value !== undefined ? value : 'No data';

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

