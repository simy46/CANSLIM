import { SERVER_URL } from "./const.js";

document.addEventListener('DOMContentLoaded', async () => {
    explanationListener();
    listenToSearchEvent();
});

function explanationListener() {
    const explanations = [
        {
            name: "- C: Current Earnings -",
            description: "Look for companies with strong current earnings growth.",
            path: "/c.png"
        },
        {
            name: "- A: Annual Earnings -",
            description: "Companies should have a record of strong annual earnings growth.",
            path: "/a.png"
        },
        {
            name: "- N: New Products, Services, or Leadership -",
            description: "Companies with new innovations or management.",
            path: "/n.png"
        },
        {
            name: "- S: Supply and Demand -",
            description: "Look at the share demand and supply in the market.",
            path: "/s.png"
        },
        {
            name: "- L: Leader or Laggard -",
            description: "Invest in market leaders, not laggards.",
            path: "/l.png"
        },
        {
            name: "- I: Institutional Sponsorship -",
            description: "Favor stocks with institutional backing.",
            path: "/i.png"
        },
        {
            name: "- M: Market Direction -",
            description: "Consider the direction of the overall market.",
            path: "/m.png"
        }
    ];
    
    let index = 0;
    const explanationElement = document.getElementById("current-explanation-name");
    const explanationDescription = document.getElementById("current-explanation-description")
    const explanationImage = document.getElementById("current-explanation-image");
    
    function updateExplanation() {
        explanationElement.style.opacity = 1;   
        explanationDescription.style.opacity = 0;
        explanationImage.style.opacity = 0;
        setTimeout(() => {
            explanationImage.src = explanations[index].path;
            explanationElement.textContent = explanations[index].name;
            explanationDescription.textContent = explanations[index].description

            explanationImage.style.opacity = 1;
            explanationElement.style.opacity = 1;   
            explanationDescription.style.opacity = 1;
            
            index = (index + 1) % explanations.length;
        }, 10); // Match the transition duration
    }
    
    setInterval(updateExplanation, 5000); // Change every 5 seconds
    updateExplanation(); // Initialize
}

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

    const newUrl = `${window.location.pathname}?search=${encodeURIComponent(inputValue)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    try {
        const quotes = await searchStocks(inputValue);
        searchContainer.innerHTML = '';
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
                industrySpan.textContent = `${quote.industry}`;
                resultItem.appendChild(industrySpan);

                resultItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.location.href = `/canslim-stock?symbol=${quote.symbol}`;
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
    h3.textContent = `Results for ${inputValue}`;
    button.textContent = 'X';

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