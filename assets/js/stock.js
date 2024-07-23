import { SERVER_URL } from './const.js'

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');
    
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
        console.log(data2)
        updateStockDetails(data2);
        setLoadingInformations(false);
        /*// Example usage
        const overallScore = 85;
        const bigRockScores = [10, 55, 65]; // Skipping the first element for Big Rock #1
        
        updateCANSlimScores(overallScore, bigRockScores);*/

        listenToNavEvents();
        listenToNewsEvents();

    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

function updateCANSlimScores(overallScore, bigRockScores) {
    // Function to set the progress
    function setProgress(circle, score) {
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (score / 100) * circumference;

        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;

        if (score <= 25) {
            circle.classList.add('low-score');
        } else if (score <= 50) {
            circle.classList.add('medium-score');
        } else if (score <= 75) {
            circle.classList.add('high-score');
        } else {
            circle.classList.add('very-high-score');
        }
    }

    // Update overall score
    const overallCircle = document.querySelector('#overall-score').parentNode.querySelector('.progress-circle-fg');
    document.getElementById('overall-score').textContent = overallScore;
    setProgress(overallCircle, overallScore);

    // Update big rock scores
    const bigRockCircles = [
        document.querySelector('#big-rock-2-score').parentNode.querySelector('.progress-circle-fg'),
        document.querySelector('#big-rock-3-score').parentNode.querySelector('.progress-circle-fg'),
        document.querySelector('#big-rock-4-score').parentNode.querySelector('.progress-circle-fg')
    ];

    bigRockScores.forEach((score, index) => {
        if (score !== null) {
            document.getElementById(`big-rock-${index + 2}-score`).textContent = score;
            setProgress(bigRockCircles[index], score);
        }
    });
}


function listenToNewsEvents() {
    const newsContent = document.getElementById('news-content');
    const seeMoreButton = document.getElementById('see-more-news');
    let maxHeightIncrement = 300; // Height to add each time "See more" is clicked

    seeMoreButton.addEventListener('click', () => {
        let currentMaxHeight = parseInt(window.getComputedStyle(newsContent).maxHeight);
        newsContent.style.maxHeight = (currentMaxHeight + maxHeightIncrement) + 'px';
        
        // Hide the button if all news are shown
        if (newsContent.scrollHeight <= newsContent.offsetHeight) {
            seeMoreButton.style.display = 'none';
        }
    });
}

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
        document.getElementById('stock-name').textContent = data.quoteSummary.price.longName || '-';
        document.getElementById('stock-ticker').textContent = `(${data.quoteSummary.price.symbol})` || '-';
    }

    // Overview //
    updateOverviewSection(data.quoteSummary ? data.quoteSummary.summaryDetail : null);
    updateNewsSection(data.news);
    updateRecommendationsSection(data.recommendations.recommendedSymbols);
    updateProfileSection(data.quoteSummary);
    /*updateFinancialsSection(data.quoteSummary ? data.quoteSummary.incomeStatementHistory : null);
    updateOptionsSection(data.options);
    updateChartSection(data.chart);
    updateQuoteSummarySection(data.quoteSummary);
    updateInsightsSection(data.insights);*/
}

function updateOverviewSection(overview) {
    if (overview) {
        document.getElementById('previous-close').textContent = overview.previousClose || '-';
        document.getElementById('open').textContent = overview.open || '-';
        document.getElementById('day-low').textContent = overview.dayLow || '-';
        document.getElementById('day-high').textContent = overview.dayHigh || '-';
        document.getElementById('volume').textContent = overview.volume || '-';
        document.getElementById('average-volume').textContent = overview.averageVolume || '-';

        document.getElementById('dividend-rate').textContent = overview.dividendRate || '-';
        document.getElementById('dividend-yield').textContent = overview.dividendYield || '-';
        document.getElementById('ex-dividend-date').textContent = overview.exDividendDate ? new Date(overview.exDividendDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';
        document.getElementById('payout-ratio').textContent = overview.payoutRatio || '-';
        document.getElementById('five-year-avg-dividend-yield').textContent = overview.fiveYearAvgDividendYield || '-';

        document.getElementById('beta').textContent = overview.beta || '-';
        document.getElementById('trailing-pe').textContent = overview.trailingPE || '-';
        document.getElementById('forward-pe').textContent = overview.forwardPE || '-';
        document.getElementById('price-to-sales').textContent = overview.priceToSalesTrailing12Months || '-';
        document.getElementById('market-cap').textContent = overview.marketCap || '-';

        document.getElementById('fifty-two-week-low').textContent = overview.fiftyTwoWeekLow || '-';
        document.getElementById('fifty-two-week-high').textContent = overview.fiftyTwoWeekHigh || '-';
        document.getElementById('fifty-day-average').textContent = overview.fiftyDayAverage || '-';
        document.getElementById('two-hundred-day-average').textContent = overview.twoHundredDayAverage || '-';
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

async function updateProfileSection(quoteSummary) {
    const assetProfile = quoteSummary.assetProfile || {};
    const summaryProfile = quoteSummary.summaryProfile || {};

    document.getElementById('company-description').textContent = assetProfile.longBusinessSummary || summaryProfile.longBusinessSummary || 'N/A';
    document.getElementById('industry').textContent = assetProfile.industry || summaryProfile.industry || 'N/A';
    document.getElementById('sector').textContent = assetProfile.sector || summaryProfile.sector || 'N/A';
    document.getElementById('address').textContent = `${assetProfile.address1 || ''}, ${assetProfile.address2 || ''}, ${assetProfile.city || ''}, ${assetProfile.state || ''}, ${assetProfile.zip || ''}, ${assetProfile.country || ''}`;
    document.getElementById('phone').textContent = assetProfile.phone || summaryProfile.phone || 'N/A';

    // website //
   createWebsite(assetProfile);

    // Officers
    const officersContainer = document.getElementById('company-officers');
    officersContainer.innerHTML = '';
    const officers = assetProfile.companyOfficers || [];
    officers.forEach(officer => createOfficers(officer, officersContainer));

    // Risk Metrics
    document.getElementById('audit-risk').textContent = assetProfile.auditRisk || 'N/A';
    document.getElementById('board-risk').textContent = assetProfile.boardRisk || 'N/A';
    document.getElementById('compensation-risk').textContent = assetProfile.compensationRisk || 'N/A';
    document.getElementById('shareholder-rights-risk').textContent = assetProfile.shareHolderRightsRisk || 'N/A';
    document.getElementById('overall-risk').textContent = assetProfile.overallRisk || 'N/A';

}

function createWebsite(assetProfile) {
    const websiteElement = document.getElementById('website');
    if (assetProfile.website) {
        const a = document.createElement('a');
        a.href = assetProfile.website;
        a.target = '_blank';
        a.textContent = assetProfile.website;
        websiteElement.textContent = '';
        websiteElement.appendChild(a);
    } else {
        websiteElement.textContent = 'N/A';
    }
}

function createOfficers(officer, container) {
    const officerElement = document.createElement('div');
    officerElement.classList.add('officer');

    const nameElement = document.createElement('div');
    nameElement.classList.add('name');
    nameElement.textContent = officer.name;

    const titleElement = document.createElement('div');
    titleElement.classList.add('title');
    titleElement.textContent = officer.title;

    officerElement.appendChild(nameElement);
    officerElement.appendChild(titleElement);

    if (officer.totalPay) {
        const compensationElement = document.createElement('div');
        compensationElement.classList.add('compensation');
        compensationElement.textContent = `Total Pay: $${officer.totalPay.toLocaleString()}`;
        officerElement.appendChild(compensationElement);
    }

    container.appendChild(officerElement);
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
    console.log(recommendations);
    const recommendationsElement = document.getElementById('recommendations-content');
    recommendationsElement.innerHTML = ''; // Clear previous content
    if (recommendations) {
        createRecommendation(recommendations, recommendationsElement);
    } else {
        recommendationsElement.textContent = 'No data available';
    }
}

function createRecommendation(recommendations, parentElement) {
    // Trouver la longueur maximale du texte des recommandations
    const maxLength = Math.max(...recommendations.map(rec => `${rec.symbol}`)) + 1;

    recommendations.forEach(recommendation => {
        const recommendationElement = document.createElement('div');
        recommendationElement.classList.add('recommendation');

        // Calculate background color based on score
        const score = recommendation.score;
        const color = scoreToColor(score);
        recommendationElement.style.backgroundColor = color;

        // Set the text content
        const text = `${recommendation.symbol}`;
        recommendationElement.textContent = text;

        // Appliquer la largeur uniforme
        recommendationElement.style.width = `${maxLength}ch`;

        // Add click event to redirect
        recommendationElement.onclick = (e) => {
            e.stopPropagation();
            window.location.href = `/canslim-stock?symbol=${recommendation.symbol}`;
        };

        // Append to parent element
        parentElement.appendChild(recommendationElement);
    });
}



function scoreToColor(score) {
    const startColor = { r: 105, g: 53, b: 80 }; // #693550
    const endColor = { r: 44, g: 67, b: 88 }; // #2c4358

    // Convert score to a value between 0 and 1
    const normalizedScore = Math.min(Math.max(score, 0), 1);

    // Interpolate between startColor and endColor
    const r = Math.floor(startColor.r + normalizedScore * (endColor.r - startColor.r));
    const g = Math.floor(startColor.g + normalizedScore * (endColor.g - startColor.g));
    const b = Math.floor(startColor.b + normalizedScore * (endColor.b - startColor.b));

    return `rgb(${r}, ${g}, ${b})`;
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
        if (Object.prototype.hasOwnProperty.call(results, key) && key !== 'marketTrend') {
            const element = document.getElementById(`${key}-result`);
            const cardElement = element ? element.closest('.card') : null;

            if (element) {
                const value = results[key].value;
                element.textContent = value;


                if (cardElement) {
                    if (value === undefined) {
                        cardElement.classList.add('undefined');
                        cardElement.style.backgroundColor = '#f0f0f0';
                        cardElement.style.color = 'gray';
                        element.textContent = 'No data available'
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

    checkInCorrection(results.marketTrend);
}

function checkInCorrection(marketTrend) {
    const marketResult = document.getElementById('marketTrend-result');
    const cardElement = marketResult ? marketResult.closest('.card') : null;

    if (marketResult) {
        const value = marketTrend.value;
        const isInCorrection = marketTrend.isInCorrection;

        marketResult.textContent = value;

        if (cardElement && isInCorrection) {
                cardElement.classList.add('correction');
        }
    }
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
                window.location.href = `/canslim-stock?symbol=${ticker}`;
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
