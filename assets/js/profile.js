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