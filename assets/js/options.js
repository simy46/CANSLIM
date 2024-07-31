export function updateOptionsSection(optionsData) {
    if (optionsData && optionsData.expirationDates && optionsData.options.length !== 0) {
        populateUpcomingExpirations(optionsData.expirationDates);
        attachEventListeners(optionsData.options[0]); // Use the first expiration date's options by default
        displayOptionsDetails(optionsData.options[0].calls); // Display the first set of call options by default
    } else {
        document.getElementById('upcoming-expirations-content').innerText = 'No data available';
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