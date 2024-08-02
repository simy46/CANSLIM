export function updateCanslimScores(score) {
    console.log(score);

    // 52 week H/L
    const high52Week = parseFloat(score.fiftyTwoWeekHigh) || 0;
    const low52Week = parseFloat(score.fiftyTwoWeekLow) || 0;
    const currentPrice = parseFloat(score.currentPrice) || 0;

    // Stock Stats
    const marketCap = score.marketCap ? `$${(score.marketCap / 1e12).toFixed(2)}T` : '-';
    const peRatio = score.peRatio ? score.peRatio.toFixed(2) : '-';
    const dividendYield = score.dividendYield ? score.dividendYield.toFixed(2) : '-';

    // SubScores
    const bigRockScores = score.bigRockScores

    // Update the dashboard with the parsed and formatted values
    updateFiftyTwoWeek(high52Week, low52Week, currentPrice);
    updateStockStats(marketCap, peRatio, dividendYield);
    updateSubScores(...bigRockScores);
    updateName(score.info)
}

function updateFiftyTwoWeek(high, low, currentPrice) {
    const fiftyTwoWeek = document.getElementById('fifty-two-week');
    const fiftyTwoWeekText = document.getElementById('fifty-two-week-text')
    
    const range = high - low;
    const position = currentPrice - low;

    // Gestion des valeurs invalides
    if (position < 0 || range <= 0) {
        console.error('Invalid range or position calculation.');
        fiftyTwoWeek.style.width = '0%';  // Reset bar
        return;
    }

    const percentage = (position / range) * 100;

    // Limitez le pourcentage pour qu'il reste entre 0% et 100%
    const clampedPercentage = Math.max(0, Math.min(percentage, 100));

    fiftyTwoWeek.style.width = `${clampedPercentage}%`;
    fiftyTwoWeekText.textContent = `${clampedPercentage.toFixed(2)}%`;
}

function updateStockStats(marketCap, peRatio, dividendYield) {
    const marketCapElement = document.getElementById('market-cap-dashb');
    const peRatioElement = document.getElementById('pe-ratio');
    const dividendYieldElement = document.getElementById('dividend-yield-dashb');

    marketCapElement.textContent = marketCap || '-';
    peRatioElement.textContent = peRatio || '-';
    dividendYieldElement.textContent = dividendYield || '-';
}

function updateSubScores(eps, ownership, rsi) {
    // Update EPS circle
    const epsElement = document.getElementById('eps-score');
    const epsCircle = document.getElementById('eps-circle');
    updateProgressCircle(epsCircle, eps);
    epsElement.textContent = `${eps}%`;

    // Update Fund Ownership circle
    const ownershipElement = document.getElementById('ownership-score');
    const ownershipCircle = document.getElementById('ownership-circle');
    updateProgressCircle(ownershipCircle, ownership);
    ownershipElement.textContent = `${ownership}%`;

    // Update RSI circle
    const rsiElement = document.getElementById('rsi-score');
    const rsiCircle = document.getElementById('rsi-circle');
    updateProgressCircle(rsiCircle, rsi);
    rsiElement.textContent = `${rsi}%`;
}

// Helper function to update the progress circle
function updateProgressCircle(circle, percentage) {
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
}

function updateName(info) {
    const nameElement = document.getElementById('stock-name-dashboard');
    const tickerElement = document.getElementById('stock-ticker-dashboard');
    const exchangeElement = document.getElementById('stock-exchange');

    nameElement.textContent = info.name || '-';
    tickerElement.textContent = `(${info.ticker})` || '-';
    exchangeElement.textContent = info.exchange || '-';
}