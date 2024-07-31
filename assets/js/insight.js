export function updateInsightsSection(insights) {
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

function formatDate(dateString, locale = 'en-US') {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(locale, options);
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
