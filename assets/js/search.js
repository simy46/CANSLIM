import { SERVER_URL } from "./const";


// HELPER FUNCTION 
function printObj(obj) {
    console.log(JSON.parse(JSON.stringify(obj)))
}


export function listenToSearchEvent() {
    const inputElement = document.getElementById('search-input');
    const searchGlass = document.getElementById('search-glass');
    const searchSvg = document.getElementById('search-toggle');
    const searchContainer = document.getElementById('input-container-search');
    const navLinks = document.querySelectorAll('nav .nav-link');
    const searchResults = document.getElementById('search-results');
    const aHome = document.querySelector('a.home');
    const body = document.querySelector('body');
    let debounceTimeout;

    inputElement.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            initiateSearch();
        }, 200); // 500ms delay after user stops typing
    });

    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(debounceTimeout);
            initiateSearch();
        }
    });

    searchGlass.addEventListener('click', initiateSearch);

    searchSvg.addEventListener('click', function(event) {
        if (isMobileScreen()) {
            event.stopPropagation();
    
            navLinks.forEach(link => {
                link.style.display = 'none';
            });

            aHome.style.width = '0';
            searchContainer.style.display = 'flex';
        }
    });

    document.addEventListener('click', function(event) {
        if (!searchContainer.contains(event.target) && !searchSvg.contains(event.target)) {
            if (isMobileScreen()) {
                navLinks.forEach(link => {
                    link.style.display = 'flex';
                });

                aHome.style.width = '100%';
                searchContainer.style.display = 'none';
                body.classList.remove('opac');
            }

            searchResults.style.display = 'none';
        }
    });
}

function isMobileScreen() {
    return window.innerWidth <= 821 || (window.innerHeight >= 350 && window.innerHeight <= 450);
}

function initiateSearch() {
    const inputElement = document.getElementById('search-input');
    const body = document.querySelector('body');
    const inputValue = inputElement.value.trim();
    if (inputValue) {
        searchWithInputValue(inputValue);
    }

    if (isMobileScreen()) {
        body.classList.add('opac');
    }
}

async function searchWithInputValue(inputValue) {
    const searchContainer = document.getElementById('search-results');  
    setLoading();

    const newUrl = `${window.location.pathname}?symbol=${encodeURIComponent(inputValue)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    try {
        const search = await searchStocks(inputValue);
        printObj(search);
        const quotes = search.quotes;
        searchContainer.innerHTML = '';

        if (quotes.length > 0) {
            const initialResults = quotes.slice(0, 2);
            printObj(initialResults);

            const remainingResults = quotes.slice(2);
            printObj(remainingResults);

            initialResults.forEach(quote => createSearchRes(quote, searchContainer));

            if (remainingResults.length > 0) {
                createSeeMoreBtn(searchContainer, remainingResults, initialResults);
            }
        } else {
            noResultFound();
        }
    } catch (error) {
        console.error('Erreur lors de la recherche des stocks:', error);
        noResultFound();
    }
}

function setLoading() {
    const searchContainer = document.getElementById('search-results');
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    searchContainer.innerHTML = '';
    searchContainer.appendChild(spinner);
    searchContainer.style.display = 'block';
}

function createSeeMoreBtn(searchContainer, remainingResults, initialResults) {
    const btnDiv= document.createElement('div');
    btnDiv.classList.add('btnDiv');

    const seeMoreLink = document.createElement('p');
    seeMoreLink.textContent = 'See more';
    seeMoreLink.classList.add('see-more');
    seeMoreLink.addEventListener('click', (event) => toggleSeeMore(seeMoreLink, remainingResults, initialResults, searchContainer, event));
    btnDiv.appendChild(seeMoreLink)

    const clearBtn = document.createElement('p');
    clearBtn.textContent = '×'; 
    clearBtn.classList.add('clear');
    clearBtn.addEventListener('click', () => {
        const search = document.getElementById('search-results');
        search.innerHTML = '';
        search.style.display = 'none';
    });
    btnDiv.appendChild(clearBtn);

    searchContainer.appendChild(btnDiv);
}

function toggleSeeMore(link, remainingResults, initialResults, searchContainer, event) {
    event.stopPropagation();
    if (link.textContent === 'See more') {
        remainingResults.forEach(quote => createSearchRes(quote, searchContainer));
        link.textContent = 'See less';
    } else {
        searchContainer.innerHTML = ''; // Clear the container
        initialResults.forEach(quote => createSearchRes(quote, searchContainer));
        createSeeMoreBtn(searchContainer, remainingResults, initialResults);
    }
}

function createSearchRes(quote, searchContainer) {
    if (quote) {
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');

        const nameAndSymbol = document.createElement('p');
        nameAndSymbol.textContent = `${quote.shortname || quote.longName || quote.name} (${quote.symbol || '-'})`;

        resultItem.appendChild(nameAndSymbol);

        if (quote.industry) {
            const industrySpan = document.createElement('span');
            industrySpan.classList.add('industry');
            industrySpan.textContent = `${quote.industry}`;
            resultItem.appendChild(industrySpan);
        }

        resultItem.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `/canslim-stock?symbol=${quote.symbol}`;
        });

        searchContainer.appendChild(resultItem);
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

function noResultFound() {
    const searchContainer = document.getElementById('search-results');
    const noResult = document.createElement('p');
    noResult.classList.add('no-result');
    noResult.textContent = 'No results found.';
    searchContainer.appendChild(noResult);
}