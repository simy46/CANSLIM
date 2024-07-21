import { SERVER_URL } from './const.js'

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');
    
    listenToNavEvents();

    if (!symbol) {
        console.error('Ticker symbol is missing');
        return;
    }

    setLoadingBuyingCheckList(true)
    setLoadingInformations(true);

    try {
        // Première requête : check-stock
        const response1 = await fetch(`${SERVER_URL}/api/check-stock?symbol=${symbol}`);
        if (!response1.ok) {
            throw new Error('Network response was not ok for check-stock');
        }
        const data1 = await response1.json();
        updateCheckList(data1);
        setLoadingBuyingCheckList(false)

        // Deuxième requête : stock-details
        const response2 = await fetch(`${SERVER_URL}/api/stock-details?symbol=${symbol}`);
        if (!response2.ok) {
            throw new Error('Network response was not ok for stock-details');
        }
        const data2 = await response2.json();
        updateStockDetails(data2);
        setLoadingInformations(false);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

function listenToNavEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.main-content section');

    // Fonction pour masquer toutes les sections
    function hideAllSections() {
        sections.forEach(section => {
            section.style.display = 'none';
        });
    }

    // Fonction pour afficher une section
    function showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    }

    // Fonction pour gérer l'activation de la navigation
    function activateNavItem(navItem) {
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');
    }

    // Ajouter des gestionnaires de clic aux éléments de navigation
    navItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const navItemId = event.target.id;
            const sectionId = navItemId.replace('nav-', '') + '-section';

            hideAllSections();
            showSection(sectionId);
            activateNavItem(event.target);
        });
    });

    // Initialiser l'affichage pour montrer la section Overview par défaut
    hideAllSections();
    showSection('overview-section');
}

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


function updateStockDetails(data) {
    // Mettez à jour les sections avec les détails du stock
    if (data.quoteSummary && data.quoteSummary.price) {
        document.getElementById('stock-name').innerText = data.quoteSummary.price.longName || '-';
        document.getElementById('stock-ticker').innerText = data.quoteSummary.price.symbol || '-';
    }

    // Overview //
    updateOverviewSection(data.quoteSummary ? data.quoteSummary.summaryDetail : null);
    updateNewsSection(data.news);
    updateProfileSection(data.profile);
    updateFinancialsSection(data.quoteSummary ? data.quoteSummary.incomeStatementHistory : null);
    updateOptionsSection(data.options);
    updateChartSection(data.chart);
    updateQuoteSummarySection(data.quoteSummary);
    updateRecommendationsSection(data.recommendations);
    updateInsightsSection(data.insights);
}

function updateOverviewSection(overview) {
    if (overview) {
        document.getElementById('previous-close').textContent = overview.previousClose || 'N/A';
        document.getElementById('open').textContent = overview.open || 'N/A';
        document.getElementById('day-low').textContent = overview.dayLow || 'N/A';
        document.getElementById('day-high').textContent = overview.dayHigh || 'N/A';
        document.getElementById('volume').textContent = overview.volume || 'N/A';
        document.getElementById('average-volume').textContent = overview.averageVolume || 'N/A';

        document.getElementById('dividend-rate').textContent = overview.dividendRate || 'N/A';
        document.getElementById('dividend-yield').textContent = overview.dividendYield || 'N/A';
        document.getElementById('ex-dividend-date').textContent = overview.exDividendDate ? new Date(overview.exDividendDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
        document.getElementById('payout-ratio').textContent = overview.payoutRatio || 'N/A';
        document.getElementById('five-year-avg-dividend-yield').textContent = overview.fiveYearAvgDividendYield || 'N/A';

        document.getElementById('beta').textContent = overview.beta || 'N/A';
        document.getElementById('trailing-pe').textContent = overview.trailingPE || 'N/A';
        document.getElementById('forward-pe').textContent = overview.forwardPE || 'N/A';
        document.getElementById('price-to-sales').textContent = overview.priceToSalesTrailing12Months || 'N/A';
        document.getElementById('market-cap').textContent = overview.marketCap || 'N/A';

        document.getElementById('fifty-two-week-low').textContent = overview.fiftyTwoWeekLow || 'N/A';
        document.getElementById('fifty-two-week-high').textContent = overview.fiftyTwoWeekHigh || 'N/A';
        document.getElementById('fifty-day-average').textContent = overview.fiftyDayAverage || 'N/A';
        document.getElementById('two-hundred-day-average').textContent = overview.twoHundredDayAverage || 'N/A';
    } else {
        document.getElementById('overview-section').textContent = 'No data available';
    }
}

function updateNewsSection(news) {
    if (news) {
        news.forEach(createNews);
    } else {
        const newsElement = document.getElementById('news-content');
        newsElement.innerText = 'No data available';
    }
}

function updateProfileSection(profile) {
    const profileElement = document.getElementById('profile-content');
    if (profile) {
        profileElement.innerText = JSON.stringify(profile, null, 2);
    } else {
        profileElement.innerText = 'No data available';
    }
}

function updateFinancialsSection(financials) {
    const financialsElement = document.getElementById('financials-content');
    if (financials) {
        financialsElement.innerText = JSON.stringify(financials, null, 2);
    } else {
        financialsElement.innerText = 'No data available';
    }
}

function updateOptionsSection(options) {
    const optionsElement = document.getElementById('options-content');
    if (options) {
        optionsElement.innerText = JSON.stringify(options, null, 2);
    } else {
        optionsElement.innerText = 'No data available';
    }
}

function updateChartSection(chart) {
    const chartElement = document.getElementById('chart-content');
    if (chart) {
        chartElement.innerText = JSON.stringify(chart, null, 2);
    } else {
        chartElement.innerText = 'No data available';
    }
}

function updateQuoteSummarySection(quoteSummary) {
    const quoteSummaryElement = document.getElementById('quote-summary-content');
    if (quoteSummary) {
        quoteSummaryElement.innerText = JSON.stringify(quoteSummary, null, 2);
    } else {
        quoteSummaryElement.innerText = 'No data available';
    }
}

function updateRecommendationsSection(recommendations) {
    console.log(recommendations)
    const recommendationsElement = document.getElementById('recommendations-content');
    if (recommendations) {
        recommendationsElement.innerText = JSON.stringify(recommendations, null, 2);
    } else {
        recommendationsElement.innerText = 'No data available';
    }
}

function updateInsightsSection(insights) {
    const insightsElement = document.getElementById('insights-content');
    if (insights) {
        insightsElement.innerText = JSON.stringify(insights, null, 2);
    } else {
        insightsElement.innerText = 'No data available';
    }
}


function updateCheckList(results) {
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
        return data;
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    }
}

// PLUS TARD //
function noStockFound() {
}

function createNews(news) {
    const newsContainer = document.getElementById('news-content');
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
                window.location.href = `/stock?symbol=${ticker}`;
            };
            tickers.appendChild(tickerSpan);
        });
    
        div.appendChild(tickers);
    }

    // PUBLISH TIME //
    const publishTime = document.createElement('p');
    const publishDate = new Date(news.providerPublishTime);
    const formattedDate = publishDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    publishTime.textContent = formattedDate;
    publishTime.classList.add('news-publish-time');
    div.appendChild(publishTime);

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
