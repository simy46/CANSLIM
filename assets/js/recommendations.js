// RECOMMENDATIONS //
export function updateRecommendationsSection(recommendations) {
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

        // Create and append title
        const titleElement = document.createElement('h3');
        titleElement.textContent = recommendation.symbol;
        recommendationElement.appendChild(titleElement);

        // Create and append score
        const scoreElement = document.createElement('p');
        scoreElement.textContent = `${(score * 100).toFixed(2)}`;
        recommendationElement.appendChild(scoreElement);

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
    const startColor = { r: 50, g: 30, b: 90 }; // Darker purple (bad score)
    const endColor = { r: 50, g: 150, b: 200 }; // Darker blue (good score)

    const adjustedScore = Math.min(Math.max(score / 0.4, 0), 1);

    const r = Math.floor(startColor.r + adjustedScore * (endColor.r - startColor.r));
    const g = Math.floor(startColor.g + adjustedScore * (endColor.g - startColor.g));
    const b = Math.floor(startColor.b + adjustedScore * (endColor.b - startColor.b));

    return `rgb(${r}, ${g}, ${b})`;
}
