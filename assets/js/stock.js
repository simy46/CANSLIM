import { SERVER_URL } from './const.js'

let officersDisplayed = 2;
let officers = [];

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const symbol = urlParams.get('symbol');

    if (!symbol) {
        console.error('Ticker symbol is missing');
        return;
    }

    listenToNavEvents();

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
        // Example usage
        const overallScore = 85;
        const bigRockScores = [10, 55, 65]; // Skipping the first element for Big Rock #1
        
        // updateCANSlimScores(overallScore, bigRockScores);

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
    updateInsightsSection(data.insights);
    /*updateFinancialsSection(data.quoteSummary ? data.quoteSummary.incomeStatementHistory : null);
    updateOptionsSection(data.options);
    updateChartSection(data.chart);
    updateQuoteSummarySection(data.quoteSummary);
    */
}

// OVERVIEW //
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

// NEWS //
function updateNewsSection(news) {
    if (news) {
        news.forEach(createNews);
    } else {
        const newsElement = document.getElementById('news-content');
        newsElement.innerText = 'No data available';
    }

    listenToNewsEvents();
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


// PROFILE //
async function updateProfileSection(quoteSummary) {
    const assetProfile = quoteSummary.assetProfile || {};
    const summaryProfile = quoteSummary.summaryProfile || {};

    document.getElementById('company-description').textContent = assetProfile.longBusinessSummary || summaryProfile.longBusinessSummary || 'N/A';
    document.getElementById('industry').textContent = assetProfile.industry || summaryProfile.industry || 'N/A';
    document.getElementById('sector').textContent = assetProfile.sector || summaryProfile.sector || 'N/A';
    document.getElementById('address').textContent = `${assetProfile.address1 || ''}, ${assetProfile.address2 || ''}, ${assetProfile.city || ''}, ${assetProfile.state || ''}, ${assetProfile.zip || ''}, ${assetProfile.country || ''}`;
    document.getElementById('phone').textContent = assetProfile.phone || summaryProfile.phone || 'N/A';

    // Website
    createWebsite(assetProfile);

    // Officers
    const officers = assetProfile.companyOfficers || [];
    initOfficers(officers);

    // Risk Metrics
    document.getElementById('audit-risk').textContent = assetProfile.auditRisk || 'N/A';
    document.getElementById('board-risk').textContent = assetProfile.boardRisk || 'N/A';
    document.getElementById('compensation-risk').textContent = assetProfile.compensationRisk || 'N/A';
    document.getElementById('shareholder-rights-risk').textContent = assetProfile.shareHolderRightsRisk || 'N/A';
    document.getElementById('overall-risk').textContent = assetProfile.overallRisk || 'N/A';
}

function initOfficers(officers) {
    let officersDisplayed = 2;

    function displayOfficers() {
        const officersContainer = document.getElementById('company-officers');
        officersContainer.innerHTML = '';

        const officersToShow = officers.slice(0, officersDisplayed);
        officersToShow.forEach(officer => createOfficers(officer, officersContainer));

        document.getElementById('show-more-button').style.display = officersDisplayed < officers.length ? 'block' : 'none';
        document.getElementById('show-less-button').style.display = officersDisplayed > 2 ? 'block' : 'none';
    }

    document.getElementById('show-more-button').addEventListener('click', () => {
        officersDisplayed += 2;
        displayOfficers();
    });

    document.getElementById('show-less-button').addEventListener('click', () => {
        officersDisplayed = 2;
        displayOfficers();
    });

    displayOfficers();
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

function showMoreOfficers(officers) {
    officersDisplayed += 2;
    displayOfficers(officers);
}

function showLessOfficers(officers) {
    officersDisplayed = 2;
    displayOfficers(officers);
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

// INSIGHTS //
// Helper function to format dates
function formatDate(dateString, locale = 'en-US') {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(locale, options);
}

function updateInsightsSection(insights) {
    // Technical Events
    const technicalEventsContent = document.getElementById('technical-events-content');
    if (insights.instrumentInfo && insights.instrumentInfo.technicalEvents) {
        const techEvents = insights.instrumentInfo.technicalEvents;
        technicalEventsContent.appendChild(createTechnicalEventSection(techEvents.shortTermOutlook, 'Short Term'));
        technicalEventsContent.appendChild(createTechnicalEventSection(techEvents.intermediateTermOutlook, 'Intermediate Term'));
        technicalEventsContent.appendChild(createTechnicalEventSection(techEvents.longTermOutlook, 'Long Term'));
    } else {
        technicalEventsContent.textContent = 'No data available';
    }

    // Key Technicals
    const keyTechnicalsContent = document.getElementById('key-technicals-content');
    if (insights.instrumentInfo && insights.instrumentInfo.keyTechnicals) {
        const keyTechnicals = insights.instrumentInfo.keyTechnicals;
        keyTechnicalsContent.appendChild(createKeyTechnicalItem('Support', keyTechnicals.support));
        keyTechnicalsContent.appendChild(createKeyTechnicalItem('Resistance', keyTechnicals.resistance));
        keyTechnicalsContent.appendChild(createKeyTechnicalItem('Stop Loss', keyTechnicals.stopLoss));
    } else {
        keyTechnicalsContent.textContent = 'No data available';
    }

    // Valuation
    const valuationContent = document.getElementById('valuation-content');
    if (insights.instrumentInfo && insights.instrumentInfo.valuation) {
        const valuation = insights.instrumentInfo.valuation;
        valuationContent.appendChild(createValuationItem(valuation));
    } else {
        valuationContent.textContent = 'No data available';
    }

    // Company Snapshot
    const companySnapshotContent = document.getElementById('company-snapshot-content');
    if (insights.companySnapshot) {
        const company = insights.companySnapshot.company;
        const sector = insights.companySnapshot.sector;
        companySnapshotContent.appendChild(createSnapshotItem('Innovativeness', company.innovativeness, sector.innovativeness));
        companySnapshotContent.appendChild(createSnapshotItem('Hiring', company.hiring, sector.hiring));
        companySnapshotContent.appendChild(createSnapshotItem('Sustainability', company.sustainability, sector.sustainability));
        companySnapshotContent.appendChild(createSnapshotItem('Insider Sentiments', company.insiderSentiments, sector.insiderSentiments));
        companySnapshotContent.appendChild(createSnapshotItem('Earnings Reports', company.earningsReports, sector.earningsReports));
        companySnapshotContent.appendChild(createSnapshotItem('Dividends', company.dividends, sector.dividends));
    } else {
        companySnapshotContent.textContent = 'No data available';
    }

    // Recommendation
    const recommendationContent = document.getElementById('recommendation-content');
    if (insights.recommendation) {
        const recommendation = insights.recommendation;
        recommendationContent.appendChild(createRecommendationItem(recommendation));
    } else {
        recommendationContent.textContent = 'No data available';
    }

    // Events
    const eventsContent = document.getElementById('events-content');
    if (insights.events) {
        insights.events.forEach(event => {
            eventsContent.appendChild(createEventItem(event));
        });
    } else {
        eventsContent.textContent = 'No data available';
    }

    // Reports
    const reportsContent = document.getElementById('reports-content');
    if (insights.reports) {
        insights.reports.forEach(report => {
            reportsContent.appendChild(createReportItem(report));
        });
    } else {
        reportsContent.textContent = 'No data available';
    }

    // Significant Developments
    const sigDevsContent = document.getElementById('significant-developments-content');
    if (insights.sigDevs) {
        insights.sigDevs.forEach(dev => {
            sigDevsContent.appendChild(createSignificantDevelopmentItem(dev));
        });
    } else {
        sigDevsContent.textContent = 'No data available';
    }

    // SEC Reports
    const secReportsContent = document.getElementById('sec-reports-content');
    if (insights.secReports) {
        insights.secReports.forEach(report => {
            secReportsContent.appendChild(createSECReportItem(report));
        });
    } else {
        secReportsContent.textContent = 'No data available';
    }
}

// Helper functions to create elements
function createTechnicalEventSection(event, term) {
    const section = document.createElement('div');
    section.classList.add('insight-content');

    const termHeading = document.createElement('h4');
    termHeading.textContent = `${term} Outlook`;
    section.appendChild(termHeading);

    section.appendChild(createInsightItem('State Description', event.stateDescription));
    section.appendChild(createInsightItem('Direction', event.direction, getHighlightClass(event.direction)));
    section.appendChild(createInsightItem('Score', event.score));
    section.appendChild(createInsightItem('Score Description', event.scoreDescription, getHighlightClass(event.scoreDescription)));
    section.appendChild(createInsightItem('Sector Direction', event.sectorDirection, getHighlightClass(event.sectorDirection)));
    section.appendChild(createInsightItem('Sector Score', event.sectorScore));
    section.appendChild(createInsightItem('Sector Score Description', event.sectorScoreDescription, getHighlightClass(event.sectorScoreDescription)));
    section.appendChild(createInsightItem('Index Direction', event.indexDirection, getHighlightClass(event.indexDirection)));
    section.appendChild(createInsightItem('Index Score', event.indexScore));
    section.appendChild(createInsightItem('Index Score Description', event.indexScoreDescription, getHighlightClass(event.indexScoreDescription)));

    return section;
}

function getHighlightClass(value) {
    if (typeof value === 'string') {
        if (value.toLowerCase().includes('bullish')) {
            return 'bullish';
        } else if (value.toLowerCase().includes('bearish')) {
            return 'bearish';
        } else if (value.toLowerCase().includes('neutral')) {
            return 'neutral';
        }
    }
    return '';
}

function createInsightItem(attribute, value, highlightClass) {
    const item = document.createElement('div');
    item.classList.add('insight-item');

    const attrSpan = document.createElement('span');
    attrSpan.classList.add('attribute');
    attrSpan.textContent = attribute;

    const dotsSpan = document.createElement('span');
    dotsSpan.classList.add('dots');

    const valueSpan = document.createElement('span');
    valueSpan.classList.add('value-insight');
    if (highlightClass) {
        valueSpan.classList.add(highlightClass);
    }
    valueSpan.textContent = value;

    item.appendChild(attrSpan);
    item.appendChild(dotsSpan);
    item.appendChild(valueSpan);

    return item;
}

function createKeyTechnicalItem(attribute, value) {
    return createInsightItem(attribute, value);
}

function createValuationItem(valuation) {
    const section = document.createElement('div');
    section.classList.add('insight-content');

    section.appendChild(createInsightItem('Description', valuation.description));
    section.appendChild(createInsightItem('Discount', valuation.discount));
    section.appendChild(createInsightItem('Relative Value', valuation.relativeValue));
    section.appendChild(createInsightItem('Provider', valuation.provider));

    return section;
}

function createSnapshotItem(attribute, companyValue, sectorValue) {
    const item = document.createElement('div');
    item.classList.add('snapshot-item');

    const attrSpan = document.createElement('span');
    attrSpan.classList.add('attribute');
    attrSpan.textContent = attribute;

    const companyValueSpan = document.createElement('span');
    companyValueSpan.classList.add('company-value');
    companyValueSpan.textContent = companyValue;

    const sectorValueSpan = document.createElement('span');
    sectorValueSpan.classList.add('sector-value');
    sectorValueSpan.textContent = sectorValue;

    item.appendChild(attrSpan);
    item.appendChild(companyValueSpan);
    item.appendChild(sectorValueSpan);

    return item;
}

function createRecommendationItem(recommendation) {
    const section = document.createElement('div');
    section.classList.add('insight-content');

    section.appendChild(createInsightItem('Provider', recommendation.provider));
    section.appendChild(createInsightItem('Target Price', recommendation.targetPrice));
    section.appendChild(createInsightItem('Rating', recommendation.rating));

    return section;
}

function createEventItem(event) {
    const section = document.createElement('div');
    section.classList.add('insight-content');

    section.appendChild(createInsightItem('Event Type', event.eventType));
    section.appendChild(createInsightItem('Price Period', event.pricePeriod));
    section.appendChild(createInsightItem('Trading Horizon', event.tradingHorizon));
    section.appendChild(createInsightItem('Trade Type', event.tradeType));
    section.appendChild(createInsightItem('Start Date', formatDate(event.startDate)));
    section.appendChild(createInsightItem('End Date', formatDate(event.endDate)));

    return section;
}

function createReportItem(report) {
    const section = document.createElement('div');
    section.classList.add('insight-content');

    section.appendChild(createInsightItem('Provider', report.provider));
    section.appendChild(createInsightItem('Report Date', formatDate(report.reportDate)));
    section.appendChild(createInsightItem('Report Title', report.reportTitle));

    return section;
}

function createSignificantDevelopmentItem(dev) {
    const section = document.createElement('div');
    section.classList.add('insight-content');

    section.appendChild(createInsightItem('Headline', dev.headline));
    section.appendChild(createInsightItem('Date', formatDate(dev.date)));

    return section;
}


function createSECReportItem(report) {
    const section = document.createElement('div');
    const div = document.createElement('div');
    section.classList.add('insight-content');

    const img = document.createElement('img');
    img.src = report.snapshotUrl;
    img.alt = report.formType;

    section.appendChild(img);
    div.appendChild(createInsightItem('Form Type', report.formType));
    div.appendChild(createInsightItem('Title', report.title));
    div.appendChild(createInsightItem('Description', report.description));
    div.appendChild(createInsightItem('Filing Date', formatDate(report.filingDate)));

    section.appendChild(div);

    return section;
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

// RECOMMENDATIONS //
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

        if (cardElement) {
            if (isInCorrection) {
                cardElement.classList.add('correction');
            } else if(marketTrend.bool) {
                cardElement.classList.add('pass');
            } else {
                cardElement.classList.add('fail');
            }
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

