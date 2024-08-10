export async function updateProfileSection(quoteSummary) {
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
    updateRiskMetrics(assetProfile);
}

function updateRiskMetrics(assetProfile) {
    const risks = [
        { id: 'audit-risk-gauge', value: assetProfile.auditRisk, textId: 'audit-risk', className: 'audit-risk' },
        { id: 'board-risk-gauge', value: assetProfile.boardRisk, textId: 'board-risk', className: 'board-risk' },
        { id: 'compensation-risk-gauge', value: assetProfile.compensationRisk, textId: 'compensation-risk', className: 'compensation-risk' },
        { id: 'shareholder-rights-gauge', value: assetProfile.shareHolderRightsRisk, textId: 'shareholder-rights-risk', className: 'shareholder-rights-risk' },
        { id: 'overall-risk-gauge', value: assetProfile.overallRisk, textId: 'overall-risk', className: 'overall-risk' },
    ];

    risks.forEach(risk => {
        drawGauge(risk.id, risk.value);
        document.getElementById(risk.textId).textContent = risk.value || '-';

        const riskElement = document.getElementById(risk.textId).closest('.profile-detail').querySelector('.risk.attribute');

        riskElement.classList.remove('risk-low', 'risk-medium', 'risk-high');

        if (risk.value <= 3) {
            riskElement.classList.add('risk-low');
        } else if (risk.value <= 7) {
            riskElement.classList.add('risk-medium');
        } else {
            riskElement.classList.add('risk-high');
        }
    });
}

function drawGauge(id, value) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2 - 20;
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 10;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const maxValue = 10;

    // Déterminer l'angle de l'aiguille
    const needleAngle = startAngle + (value / maxValue) * (endAngle - startAngle);

    // Couleurs plus vives
    let color;
    if (value <= 3) {
        color = '#4CAF50';  // Vert pour un faible risque
    } else if (value <= 7) {
        color = '#ffff4c';  // Jaune pour un risque modéré
    } else {
        color = '#ff3b3b';  // Rouge pour un risque élevé
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner l'arc de fond
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Dessiner l'arc coloré en fonction du risque
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, needleAngle, false);
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.stroke();

    // Dessiner l'aiguille
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius * Math.cos(needleAngle), centerY + radius * Math.sin(needleAngle));
    ctx.strokeStyle = '#333333';  // Couleur de l'aiguille plus sombre
    ctx.lineWidth = 3;  // Aiguille plus fine
    ctx.stroke();

    // Cercle à la base de l'aiguille
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#333333';  // Cercle plus sombre à la base
    ctx.fill();

    // Dessiner les graduations
    for (let i = 0; i <= maxValue; i++) {
        const angle = startAngle + (i / maxValue) * (endAngle - startAngle);
        const startX = centerX + Math.cos(angle) * (radius - 12);
        const startY = centerY + Math.sin(angle) * (radius - 12);
        const endX = centerX + Math.cos(angle) * radius;
        const endY = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#333333';  // Couleur des graduations
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function applyRiskStyles() {
    const risks = {
        'audit-risk': parseInt(document.getElementById('audit-risk').textContent, 10),
        'board-risk': parseInt(document.getElementById('board-risk').textContent, 10),
        'compensation-risk': parseInt(document.getElementById('compensation-risk').textContent, 10),
        'shareholder-rights-risk': parseInt(document.getElementById('shareholder-rights-risk').textContent, 10),
        'overall-risk': parseInt(document.getElementById('overall-risk').textContent, 10)
    };

    for (const [id, value] of Object.entries(risks)) {
        const element = document.getElementById(id).parentElement; // Get the parent containing the text
        element.classList.remove('risk-low', 'risk-medium', 'risk-high'); // Remove all previous classes

        if (value <= 3) {
            element.classList.add('risk-low');
        } else if (value <= 7) {
            element.classList.add('risk-medium');
        } else {
            element.classList.add('risk-high');
        }
    }
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