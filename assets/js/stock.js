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
        updateStockDetails(data2, data1.stockInfo);
        setLoadingInformations(false);
        // Example usage
        const overallScore = 85;
        const bigRockScores = [10, 55, 65]; // Skipping the first element for Big Rock #1
        
        //updateCANSlimScores(overallScore, bigRockScores);

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


function updateStockDetails(data, stockInfo) {
    // Mettez à jour les sections avec les détails du stock
    if (data.quoteSummary && data.quoteSummary.price) {
        document.getElementById('stock-name').textContent = data.quoteSummary.price.longName || '-';
        document.getElementById('stock-ticker').textContent = `(${data.quoteSummary.price.symbol})` || '-';
    }

    // Overview //
    updateOverviewSection(stockInfo, data.quoteSummary.summaryDetail);
    updateNewsSection(data.news);
    updateRecommendationsSection(data.recommendations ? data.recommendations.recommendedSymbols : null);
    updateProfileSection(data.quoteSummary);
    updateInsightsSection(data.insights);
    updateOptionsSection(data.options);
    /*updateFinancialsSection(data.quoteSummary ? data.quoteSummary.incomeStatementHistory : null);
    updateChartSection(data.chart);
    updateQuoteSummarySection(data.quoteSummary);
    */
}

// OVERVIEW //
function updateOverviewSection(stockInfo, summaryDetail) {
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

// NEWS //
function updateNewsSection(news) {
    if (news) {
        displayNews(news, 3); // Display 3 news items initially
        listenToNewsEvents(news);
    } else {
        const newsElement = document.getElementById('news-content');
        newsElement.innerText = 'No data available';
    }
}

function displayNews(news, maxDisplayed) {
    const newsContent = document.getElementById('news-content');
    newsContent.innerHTML = '';

    const newsToShow = news.slice(0, maxDisplayed);
    newsToShow.forEach(createNews);

    document.getElementById('see-more-news').style.display = maxDisplayed < news.length ? 'block' : 'none';
    document.getElementById('see-less-news').style.display = maxDisplayed > 3 ? 'block' : 'none';
}

function listenToNewsEvents(news) {
    let newsDisplayed = 3;

    document.getElementById('see-more-news').addEventListener('click', () => {
        newsDisplayed += 2;
        displayNews(news, newsDisplayed);
    });

    document.getElementById('see-less-news').addEventListener('click', () => {
        newsDisplayed = 3;
        displayNews(news, newsDisplayed);
    });
}


function createNews(news) {
    const newsContainer = document.getElementById('news-content');
    const div = document.createElement('div');
    div.classList.add('news-item');

    const h4 = document.createElement('h4');
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

    document.getElementById('company-description').textContent = assetProfile.longBusinessSummary || summaryProfile.longBusinessSummary || '-';
    document.getElementById('industry').textContent = assetProfile.industry || summaryProfile.industry || '-';
    document.getElementById('sector').textContent = assetProfile.sector || summaryProfile.sector || '-';
    document.getElementById('address').textContent = `${assetProfile.address1 || ''}, ${assetProfile.address2 || ''}, ${assetProfile.city || ''}, ${assetProfile.state || ''}, ${assetProfile.zip || ''}, ${assetProfile.country || ''}`;
    document.getElementById('phone').textContent = assetProfile.phone || summaryProfile.phone || '-';

    // Website
    createWebsite(assetProfile);

    // Officers
    const officers = assetProfile.companyOfficers || [];
    initOfficers(officers);

    // Risk Metrics
    document.getElementById('audit-risk').textContent = assetProfile.auditRisk || '-';
    document.getElementById('board-risk').textContent = assetProfile.boardRisk || '-';
    document.getElementById('compensation-risk').textContent = assetProfile.compensationRisk || '-';
    document.getElementById('shareholder-rights-risk').textContent = assetProfile.shareHolderRightsRisk || '-';
    document.getElementById('overall-risk').textContent = assetProfile.overallRisk || '-';
}

function initOfficers(officers) {
    let officersDisplayed = 2;

    function displayOfficers() {
        const officersContainer = document.getElementById('company-officers');
        if (officers) {
            officersContainer.innerHTML = '';

            const officersToShow = officers.slice(0, officersDisplayed);
            officersToShow.forEach(officer => createOfficers(officer, officersContainer));

            document.getElementById('show-more-officers').style.display = officersDisplayed < officers.length ? 'block' : 'none';
            document.getElementById('show-less-officers').style.display = officersDisplayed > 2 ? 'block' : 'none';
        } else {
            officersContainer.textContent = "No data on officers"
        }
        
    }

    document.getElementById('show-more-officers').addEventListener('click', () => {
        officersDisplayed += 2;
        displayOfficers();
    });

    document.getElementById('show-less-officers').addEventListener('click', () => {
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
        websiteElement.textContent = '-';
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
    const symbol = insights.symbol;
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
        displaySECReports(insights.secReports, symbol, 3);
        listenToSecButtonEvents(insights.secReports, symbol);
    } else {
        secReportsContent.textContent = 'No data available';
    }

    // Bullish & Bearish Summary
    const bullishBearishSummaryContent = document.getElementById('bullish-bearish-summary-content');
    if (insights.upsell) {
        bullishBearishSummaryContent.appendChild(createBullishBearishSummaryItem(insights.upsell));
    } else {
        bullishBearishSummaryContent.textContent = 'No data available';
    }

    // Research Reports
    const researchReportsContent = document.getElementById('research-reports-content');
    if (insights.upsellSearchDD && insights.upsellSearchDD.researchReports) {
        researchReportsContent.appendChild(createResearchReportItem(insights.upsellSearchDD.researchReports));
    } else {
        researchReportsContent.textContent = 'No data available';
    }
}

function createBullishBearishSummaryItem(upsell) {
    const section = document.createElement('div');
    section.classList.add('insight-content');

    if (!upsell.msBullishSummary || !upsell.msBearishSummary) {
        section.textContent = 'No data available';
        return section;
    }

    const bullishHeading = document.createElement('h4');
    bullishHeading.textContent = 'Bullish Summary';
    section.appendChild(bullishHeading);
    upsell.msBullishSummary.forEach(summary => {
        section.appendChild(createInsightItem('Bullish', summary, 'bullish'));
    });


    const bearishHeading = document.createElement('h4');
    bearishHeading.textContent = 'Bearish Summary';
    section.appendChild(bearishHeading);

    upsell.msBearishSummary.forEach(summary => {
        section.appendChild(createInsightItem('Bearish', summary, 'bearish'));
    });
    

    return section;
}

function createResearchReportItem(report) {
    const section = document.createElement('div');
    section.classList.add('insight-content');

    section.appendChild(createInsightItem('Provider', report.provider));
    section.appendChild(createInsightItem('Title', report.title));
    section.appendChild(createInsightItem('Summary', report.summary));
    section.appendChild(createInsightItem('Investment Rating', report.investmentRating));
    section.appendChild(createInsightItem('Report Date', formatDate(report.reportDate)));

    return section;
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

function displaySECReports(reports, symbol, maxDisplayed) {
    const secReportsContent = document.getElementById('sec-reports-content');
    secReportsContent.innerHTML = '';

    const reportsToShow = reports.slice(0, maxDisplayed);
    reportsToShow.forEach(report => {
        secReportsContent.appendChild(createSECReportItem(report, symbol));
    });

    document.getElementById('show-more-sec-reports').style.display = maxDisplayed < reports.length ? 'block' : 'none';
    document.getElementById('show-less-sec-reports').style.display = maxDisplayed > 3 ? 'block' : 'none';
}

function listenToSecButtonEvents(reports, symbol) {
    let secReportsDisplayed = 3;

    document.getElementById('show-more-sec-reports').addEventListener('click', () => {
        secReportsDisplayed += 2;
        displaySECReports(reports, symbol, secReportsDisplayed);
    });

    document.getElementById('show-less-sec-reports').addEventListener('click', () => {
        secReportsDisplayed = 3;
        displaySECReports(reports, symbol, secReportsDisplayed);
    });
}

function createSECReportItem(report, symbol) {
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

    section.onclick = () => {
        const url = `https://finance.yahoo.com/sec-filing/${symbol}/${report.id};`
        window.open(url, '_blank')
    }

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

// OPTIONS //
function updateOptionsSection(optionsData) {
    if (optionsData) {
        populateUpcomingExpirations(optionsData.expirationDates);
        attachEventListeners(optionsData.options[0]); // Use the first expiration date's options by default
        displayOptionsDetails(optionsData.options[0].calls); // Display the first set of call options by default
    } else {
        document.getElementById('expiration-dates-content').innerText = 'No data available';
        document.getElementById('options-details-content').innerText = 'No data available';
    }
}

function populateUpcomingExpirations(expirationDates) {
    const upcomingExpirationsContent = document.getElementById('upcoming-expirations-content');
    upcomingExpirationsContent.innerHTML = '';
    expirationDates.forEach(date => {
        const dateElement = document.createElement('div');
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        dateElement.textContent = formattedDate;
        upcomingExpirationsContent.appendChild(dateElement);
    });
}

function attachEventListeners(options) {
    const optionTypeSelect = document.getElementById('option-type');
    
    optionTypeSelect.addEventListener('change', () => {
        const selectedType = optionTypeSelect.value;
        displayOptionsDetails(options[selectedType]);
    });
}

function displayOptionsDetails(optionDetails) {
    const content = document.getElementById('options-details-content');
    content.innerHTML = ''; // Clear previous content

    if (optionDetails.length === 0) {
        content.textContent = 'No options data available for the selected criteria';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('option-details-table');
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Strike', 'Last Price', 'Change', '% Change', 'Volume', 'Open Interest', 'Bid', 'Ask', 'Implied Volatility'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    optionDetails.forEach(option => {
        const row = document.createElement('tr');
        
        const strikeCell = document.createElement('td');
        strikeCell.textContent = option.strike ? option.strike.toFixed(2) : '-';
        row.appendChild(strikeCell);

        const lastPriceCell = document.createElement('td');
        lastPriceCell.textContent = option.lastPrice ? option.lastPrice.toFixed(2) : '-';
        row.appendChild(lastPriceCell);

        const changeCell = document.createElement('td');
        changeCell.textContent = option.change ? option.change.toFixed(2) : '-';
        row.appendChild(changeCell);

        const percentChangeCell = document.createElement('td');
        percentChangeCell.textContent = option.percentChange ? option.percentChange.toFixed(2) + '%' : '-';
        row.appendChild(percentChangeCell);

        const volumeCell = document.createElement('td');
        volumeCell.textContent = option.volume || '-';
        row.appendChild(volumeCell);

        const openInterestCell = document.createElement('td');
        openInterestCell.textContent = option.openInterest || '-';
        row.appendChild(openInterestCell);

        const bidCell = document.createElement('td');
        bidCell.textContent = option.bid ? option.bid.toFixed(2) : '-';
        row.appendChild(bidCell);

        const askCell = document.createElement('td');
        askCell.textContent = option.ask ? option.ask.toFixed(2) : '-';
        row.appendChild(askCell);

        const impliedVolatilityCell = document.createElement('td');
        impliedVolatilityCell.textContent = option.impliedVolatility ? (option.impliedVolatility * 100).toFixed(2) + '%' : '-';
        row.appendChild(impliedVolatilityCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    content.appendChild(table);
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
    const maxLength = Math.max(...recommendations.map(rec => rec.symbol.length)) + 1;

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
    const startColor = { r: 178, g: 34, b: 34 };
    const endColor = { r: 34, g: 139, b: 34 };

    // Ajuster la plage de score pour qu'elle soit de 0 à 0.5
    const adjustedScore = Math.min(Math.max(score / 0.5, 0), 1);

    // Interpoler entre startColor et endColor
    const r = Math.floor(startColor.r + adjustedScore * (endColor.r - startColor.r));
    const g = Math.floor(startColor.g + adjustedScore * (endColor.g - startColor.g));
    const b = Math.floor(startColor.b + adjustedScore * (endColor.b - startColor.b));

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
                        } else if (results[key].bool === false && results[key].value !== null) {
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

