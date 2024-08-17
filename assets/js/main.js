import { SERVER_URL } from "./const";

document.addEventListener('DOMContentLoaded', async () => {
    explanationListener();
    listenToSearchEvent();
    listenToFAQEvent();
    listenToBuyingCheckListEvent();
});

function listenToBuyingCheckListEvent() {
    let currentStep = 1;
    const totalSteps = 4;
    let hoverTimeout;

    document.getElementById("next-button").addEventListener("click", function() {
        hideAllExplanations();
        document.getElementById(`step${currentStep}`).style.display = "none";
        currentStep++;
        document.getElementById(`step${currentStep}`).style.display = "block";
        updateNavButtons();
    });

    document.getElementById("prev-button").addEventListener("click", function() {
        hideAllExplanations();
        document.getElementById(`step${currentStep}`).style.display = "none";
        currentStep--;
        document.getElementById(`step${currentStep}`).style.display = "block";
        updateNavButtons();
    });

    function updateNavButtons() {
        document.getElementById("prev-button").style.display = currentStep > 1 ? "inline-block" : "none";
        document.getElementById("next-button").style.display = currentStep < totalSteps ? "inline-block" : "none";
    }

    function showExplanation(id) {
        clearTimeout(hoverTimeout);
        const explanation = document.getElementById(id);
        hoverTimeout = setTimeout(() => {
            explanation.style.display = 'block';
            explanation.style.opacity = '1';
            explanation.style.transform = 'translateY(0)';
        }, 100); 
    }

    function hideAllExplanations() {
        const explanations = document.querySelectorAll('.criteria-explanation');
        explanations.forEach(explanation => {
            explanation.style.opacity = '0';
            explanation.style.transform = 'translateY(-10px)';
            explanation.style.display = 'none';
        });
    }

    function hideExplanation(id) {
        clearTimeout(hoverTimeout);
        const explanation = document.getElementById(id);
        hoverTimeout = setTimeout(() => {
            explanation.style.opacity = '0';
            explanation.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                explanation.style.display = 'none';
            }, 300);
        }, 100);
    }

    document.querySelectorAll('.checklist-hover').forEach((item, idx) => {
        const explanationId = `exp${idx + 1}`;
        
        item.addEventListener('mouseover', function() {
            showExplanation(explanationId);
        });
        
        item.addEventListener('mouseout', function() {
            hideExplanation(explanationId);
        });

        item.addEventListener('click', function() {
            const explanation = document.getElementById(explanationId);
            if (explanation.style.display === 'block') {
                hideExplanation(explanationId);
            } else {
                showExplanation(explanationId);
            }
        });
    });

    updateNavButtons();
}

function listenToFAQEvent() {
    document.querySelectorAll('.faq-question').forEach(item => {
        item.addEventListener('click', event => {
            const parent = event.target.closest('.faq-item');
            parent.classList.toggle('active');
        });
    });
}

function explanationListener() {
    const explanations = [
        {
            name: "CANSLIM Calculator",
            description: "A powerful and FREE tool built on the time-tested CANSLIM investment strategy.",
            path: "/2.png"
        },
        {
            name: "C: Current Earnings",
            description: "Look for companies with strong current earnings growth.",
            path: "/c.png"
        },
        {
            name: "A: Annual Earnings",
            description: "Companies should have a record of strong annual earnings growth.",
            path: "/a.png"
        },
        {
            name: "N: New Products, Services, or Leadership",
            description: "Companies with new innovations or management.",
            path: "/n.png"
        },
        {
            name: "S: Supply and Demand",
            description: "Look at the share demand and supply in the market.",
            path: "/s.png"
        },
        {
            name: "L: Leader or Laggard",
            description: "Invest in market leaders, not laggards.",
            path: "/l.png"
        },
        {
            name: "I: Institutional Sponsorship",
            description: "Favor stocks with institutional backing.",
            path: "/i.png"
        },
        {
            name: "M: Market Direction",
            description: "Consider the direction of the overall market.",
            path: "/m.png"
        }
    ];
    
    let index = 0;
    const explanationElement = document.getElementById("current-explanation-name");
    const explanationDescription = document.getElementById("current-explanation-description");
    const explanationImage = document.getElementById("current-explanation-image");
    
    function updateExplanation() {
        explanationElement.style.opacity = 0;   
        explanationElement.style.transform = "translateY(-10px)";
        explanationDescription.style.opacity = 0;
        explanationDescription.style.transform = "translateY(10px)";
        explanationImage.style.opacity = 0;

        setTimeout(() => {
            explanationImage.src = explanations[index].path;
            explanationElement.textContent = explanations[index].name;
            explanationDescription.textContent = explanations[index].description;

            explanationImage.style.opacity = 1;
            explanationElement.style.opacity = 1;   
            explanationElement.style.transform = "translateY(0)";
            explanationDescription.style.opacity = 1;
            explanationDescription.style.transform = "translateY(0)";
            
            index = (index + 1) % explanations.length;
        }, 500);
    }
    
    setInterval(updateExplanation, 5000);
    updateExplanation();
}

// SEARCH EVENT
function printObj(obj) {
    console.log(JSON.parse(JSON.stringify(obj)))
}

function setLoading() {
    const searchContainer = document.getElementById('search-results');
    const spinner = document.createElement('div');
    spinner.classList.add('spinner');
    searchContainer.innerHTML = '';
    searchContainer.appendChild(spinner);
    searchContainer.style.display = 'block';
}

function listenToSearchEvent() {
    const inputElement = document.getElementById('search-input');
    const searchGlass = document.getElementById('search-glass');
    let debounceTimeout;

    inputElement.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            initiateSearch();
        }, 500);
    });

    inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(debounceTimeout);
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

async function searchWithInputValue(inputValue) {
    setLoading();

    const newUrl = `${window.location.pathname}?search=${encodeURIComponent(inputValue)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    try {
        const searchContainer = document.getElementById('search-results');
        const search = await searchStocks(inputValue);
        searchContainer.innerHTML = '';

        createTabNav();
        processResults(search.quotes, 'results-results', createSearchRes);
        processResults(search.news, 'news-results', createNewsRes);
    } catch (error) {
        console.error('Erreur lors de la recherche des stocks:', error);
        noResultFound();
    }
}

function processResults(items, containerId, createItemFn) {
    const container = document.getElementById(containerId);

    if (items.length > 0) {
        const initialItems = items.slice(0, 2); // Show the first 2 items initially
        const remainingItems = items.slice(2); // Store the remaining items

        initialItems.forEach(item => createItemFn(item, container));

        if (remainingItems.length > 0) {
            createSeeMoreBtn(container, remainingItems, initialItems, createItemFn);
        }
    } else {
        noResultFound();
    }
}

function createSeeMoreBtn(container, remainingResults, initialResults, createItemFn) {
    const btnDiv = document.createElement('div');
    btnDiv.classList.add('btnDiv');

    const seeMoreLink = document.createElement('p');
    seeMoreLink.textContent = 'See more';
    seeMoreLink.classList.add('see-more');
    seeMoreLink.addEventListener('click', () => toggleSeeMore(seeMoreLink, remainingResults, initialResults, container, createItemFn));
    btnDiv.appendChild(seeMoreLink);

    const clearBtn = document.createElement('p');
    clearBtn.textContent = '×';
    clearBtn.classList.add('clear');
    clearBtn.addEventListener('click', () => {
        const search = document.getElementById('search-results');
        search.innerHTML = '';
        search.style.display = 'none';
    });
    btnDiv.appendChild(clearBtn);

    container.appendChild(btnDiv);
}

function toggleSeeMore(link, remainingResults, initialResults, container, createItemFn) {
    if (link.textContent === 'See more') {
        remainingResults.forEach(item => createItemFn(item, container));
        link.textContent = 'See less';
    } else {
        container.innerHTML = ''; // Clear the container
        initialResults.forEach(item => createItemFn(item, container));
        createSeeMoreBtn(container, remainingResults, initialResults, createItemFn);
    }
}

// Creators //
function createSearchRes(quote, resContainer) {
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

        resContainer.appendChild(resultItem);
    }
}

function createNewsRes(news, newsContainer) {
    const newsItem = document.createElement('div');
    newsItem.classList.add('news-item');

    // Thumbnail
    if (news.thumbnail) {
        const thumbnail = document.createElement('img');
        thumbnail.src = news.thumbnail.resolutions[1].url;
        thumbnail.alt = news.title;
        thumbnail.classList.add('news-thumbnail');
        newsItem.appendChild(thumbnail);
    }


    // News details container
    const newsDetails = document.createElement('div');
    newsDetails.classList.add('news-details');

    // Title
    const title = document.createElement('a');
    title.href = news.link;
    title.target = '_blank';
    title.textContent = news.title;
    title.classList.add('news-title');
    newsDetails.appendChild(title);

    // Publisher
    const publisher = document.createElement('p');
    publisher.textContent = `By ${news.publisher}`;
    publisher.classList.add('news-publisher');
    newsDetails.appendChild(publisher);

    // Date
    const date = new Date(news.providerPublishTime);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    const dateElement = document.createElement('p');
    dateElement.textContent = formattedDate;
    dateElement.classList.add('news-date');
    newsDetails.appendChild(dateElement);

    newsItem.appendChild(newsDetails);
    newsContainer.appendChild(newsItem);
}

// No results //
function noResultFound() {
    const searchContainer = document.getElementById('search-results');
    const noResult = document.createElement('p');
    noResult.classList.add('no-result');
    noResult.textContent = 'No results found.';
    searchContainer.appendChild(noResult);
}


// Tab Nav //
function createTabNav() {
    const searchContainer = document.getElementById('search-results');

    // Create the tab navigation
    const nav = document.createElement('nav');
    nav.classList.add('tab-nav');

    const resBtn = document.createElement('button');
    resBtn.classList.add('tab-btn', 'active');
    resBtn.textContent = 'Results';
    resBtn.dataset.tab = 'results';

    const newsBtn = document.createElement('button');
    newsBtn.classList.add('tab-btn');
    newsBtn.textContent = 'News';
    newsBtn.dataset.tab = 'news';

    nav.appendChild(resBtn);
    nav.appendChild(newsBtn);
    searchContainer.appendChild(nav);

    // Create the content sections
    const resSection = document.createElement('div');
    resSection.id = 'results-results';
    resSection.classList.add('tab-content', 'active');

    const newsSection = document.createElement('div');
    newsSection.id = 'news-results';
    newsSection.classList.add('tab-content');

    searchContainer.appendChild(resSection);
    searchContainer.appendChild(newsSection);

    // Attach event listeners to the tab buttons
    resBtn.addEventListener('click', () => toggleTab('results', resBtn, newsBtn));
    newsBtn.addEventListener('click', () => toggleTab('news', newsBtn, resBtn));
}

function toggleTab(tabName, activeBtn, inactiveBtn) {
    // Toggle active class on buttons
    activeBtn.classList.add('active');
    inactiveBtn.classList.remove('active');

    // Toggle active class on content sections
    const activeSection = document.getElementById(`${tabName}-results`);
    const inactiveSection = document.getElementById(`${inactiveBtn.dataset.tab}-results`);
    
    activeSection.classList.add('active');
    inactiveSection.classList.remove('active');
}
