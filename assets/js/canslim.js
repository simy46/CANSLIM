export function updateCanslimScores(overallScore, bigRockScores) {
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