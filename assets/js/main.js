import { SERVER_URL, SELECTED_SYMBOL } from "./const";

document.addEventListener('DOMContentLoaded', async () => {
    listenToSearchEvent();
});

function listenToSearchEvent() {
    const inputElement = document.getElementById('search-input');
    const searchGlass = document.getElementById('search-glass');

    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            initiateSearch();
        }
    });

    searchGlass.addEventListener('click', initiateSearch);
}

function initiateSearch() {
    const inputElement = document.getElementById('search-input');
    const inputValue = inputElement.value.trim();
    if (inputValue) {
        searchWithInputValue(inputValue);
        inputElement.value = '';
    }
}

async function searchWithInputValue(inputValue) {
    const searchContainer = document.getElementById('search-results');
    const quotes = await searchStocks(inputValue);
    searchContainer.innerHTML = '';
    createSearchResults(inputValue);

    if (quotes.length > 0) {
        quotes.forEach((quote) => {
            if (!quote.industry) {
                return
            }
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            

            const nameAndSymbol = document.createElement('p');
            nameAndSymbol.textContent = `${quote.shortname} (${quote.symbol})`;

            resultItem.appendChild(nameAndSymbol);

            const industrySpan = document.createElement('span');
            industrySpan.classList.add('industry');
            industrySpan.textContent = `Industry: ${quote.industry}`;
            resultItem.appendChild(industrySpan);
            resultItem.addEventListener('click', () => {
                sessionStorage.setItem(SELECTED_SYMBOL, quote.symbol);
                window.location.href = '/stock';
            });

            searchContainer.appendChild(resultItem);
        });
        searchContainer.style.display = 'block';
    } else {
        const noResult = document.createElement('p');
        noResult.classList.add('no-result');
        noResult.textContent = 'No results found.';
        searchContainer.appendChild(noResult);
        searchContainer.style.display = 'block';
    }
}

async function searchStocks(input) {
    try {
        const url = `${SERVER_URL}/api/search?q=${encodeURIComponent(input)}`;
        console.log(url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Erreur lors de la recherche des stocks');
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la recherche des stocks:', error);
        return [];
    }
}


function createSearchResults(inputValue) {
    const searchContainer = document.getElementById('search-results');
    const div = document.createElement('div');
    const h3 = document.createElement('h3');
    const button = document.createElement('button');

    button.id = 'clear-button';
    button.onclick = () => {
        searchContainer.style.display = 'none';
        searchContainer.innerHTML = '';
    };

    div.classList.add('search-title-container');
    h3.textContent = `Search result for: ${inputValue}`;
    button.textContent = 'clear';

    div.appendChild(h3);
    div.appendChild(button);
    searchContainer.appendChild(div);
}
