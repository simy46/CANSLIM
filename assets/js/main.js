import { SERVER_URL } from "./const.js";
import { listenToButtonEvent } from "./header.js";

document.addEventListener('DOMContentLoaded', async () => {
    listenToSearchEvent();
    listenToButtonEvent();
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
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    searchContainer.innerHTML = '';
    searchContainer.appendChild(spinner);
    searchContainer.style.display = 'block';

    // Mettre à jour l'URL avec le paramètre de recherche
    const newUrl = `${window.location.pathname}?search=${encodeURIComponent(inputValue)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    try {
        const quotes = await searchStocks(inputValue);
        searchContainer.innerHTML = '';
        searchContainer.style.paddingTop = 0;
        createSearchResults(inputValue);

        if (quotes.length > 0) {
            quotes.forEach((quote) => {
                if (!quote.industry) {
                    return;
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

                const popUp = document.createElement('div');
                popUp.classList.add('popup');

                const calculateButton = document.createElement('button');
                calculateButton.textContent = 'CAN SLIM Stock';
                calculateButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.href = `/stock?symbol=${quote.symbol}`;
                });

                const infoButton = document.createElement('button');
                infoButton.textContent = 'Stock Info';
                infoButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.href = `/stock-info?symbol=${quote.symbol}`;
                });

                popUp.appendChild(calculateButton);
                popUp.appendChild(infoButton);

                resultItem.appendChild(popUp);

                resultItem.addEventListener('click', () => {
                    popUp.classList.toggle('show');
                });

                searchContainer.appendChild(resultItem);
            });
        } else {
            noResultFound();
        }
    } catch (error) {
        console.error('Erreur lors de la recherche des stocks:', error);
        noResultFound();
    }
}

async function searchStocks(input) {
    try {
        const url = `${SERVER_URL}/api/search?q=${encodeURIComponent(input)}`;
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
    const h3 = document.createElement('h4');
    const button = document.createElement('button');

    button.id = 'clear-button';
    button.onclick = () => {
        searchContainer.style.display = 'none';
        searchContainer.innerHTML = '';
    };

    div.classList.add('search-title-container');
    h3.textContent = `Search result for: ${inputValue}`;
    button.textContent = 'x';

    div.appendChild(h3);
    div.appendChild(button);
    searchContainer.appendChild(div);
}

function noResultFound() {
    const searchContainer = document.getElementById('search-results');
    const noResult = document.createElement('p');
    noResult.classList.add('no-result');
    noResult.textContent = 'No results found.';
    searchContainer.appendChild(noResult);
}