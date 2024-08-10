export function updateRecommendationsSection(recommendations) {
    const recommendationsElement = document.getElementById('recommendations-content');
    recommendationsElement.innerHTML = ''; // Clear previous content
    if (recommendations && recommendations.length > 0) {
        createRecommendation(recommendations, recommendationsElement);
    } else {
        recommendationsElement.textContent = 'No recommendations available';
    }
}

function createRecommendation(recommendations, parentElement) {
    recommendations.forEach(recommendation => {
        const recommendationElement = document.createElement('div');
        recommendationElement.classList.add('recommendation-card');

        // Create and append title
        const titleElement = document.createElement('div');
        titleElement.classList.add('recommendation-symbol');
        titleElement.textContent = recommendation.symbol;
        recommendationElement.appendChild(titleElement);

        // Create and append score as a progress ring
        const scoreElement = document.createElement('div');
        scoreElement.classList.add('recommendation-score');
        scoreElement.innerHTML = createProgressRing(recommendation.score);
        recommendationElement.appendChild(scoreElement);

        // Add click event to redirect
        recommendationElement.onclick = (e) => {
            e.stopPropagation();
            window.location.href = `/canslim-stock?symbol=${recommendation.symbol}`;
        };

        // Append to parent element
        parentElement.appendChild(recommendationElement);
    });
}

function createProgressRing(score) {
    const percentage = (score * 100).toFixed(2);
    return `
        <svg class="progress-ring" width="60" height="60">
            <circle class="progress-ring__circle" stroke="white" stroke-width="4" fill="transparent" r="26" cx="30" cy="30"/>
            <circle class="progress-ring__circle" stroke="#4caf50" stroke-width="4" fill="transparent" r="26" cx="30" cy="30"
                    stroke-dasharray="${percentage} ${100 - percentage}" stroke-dashoffset="25"/>
            <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="12px" dy=".3em">${percentage}%</text>
        </svg>
    `;
}
