/**
 * LAYOUT.JS - Production Version
 * Handles data fetching, filtering, and UI rendering for the Business Directory.
 */

let masterData = [];

document.addEventListener('DOMContentLoaded', () => {
    initDirectory();
});

/**
 * 1. INITIALIZATION & DATA FETCHING
 * Fetches CSV data from Google Sheets and validates the response.
 */
function initDirectory() {
    const grid = document.getElementById('directory-grid');
    
    // Validate required libraries and config variables
    if (typeof Papa === 'undefined') {
        console.error('Configuration Error: PapaParse library is missing in index.html.');
        return;
    }
    if (typeof baseCsvUrl === 'undefined' || !baseCsvUrl) {
        console.error('Configuration Error: baseCsvUrl is not defined in config.js.');
        return;
    }

    if (grid) grid.innerHTML = '<p class="status-msg">Loading the Clay County Directory...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy', 
        complete: function(results) {
            // DATA VALIDATION: Ensure rows have at least a business name
            masterData = results.data.filter(row => row.name && row.name.trim().length > 0);
            
            if (masterData.length === 0) {
                console.warn('Data Validation: The Google Sheet appears to be empty.');
                if (grid) grid.innerHTML = '<p>No listings currently available. Please check back later.</p>';
                return;
            }

            // Successfully loaded data -> Build UI
            populateCategoryFilter(masterData);
            displayData(masterData);
            if (typeof setupModalClose === 'function') setupModalClose();
        },
        error: function(err) {
            console.error('Fetch Error: Unable to access the Google Sheet CSV. Check "Publish to Web" settings.', err);
            if (grid) grid.innerHTML = '<p>Sorry, there was a problem loading the directory. Please refresh the page.</p>';
        }
    });
}

/**
 * 2. IMAGE HANDLING LOGIC
 * Safely processes Google Profile IDs and direct URL links.
 */
function getSmartImage(id) {
    // Return placeholder if ID is missing or explicitly 'N/A'
    if (!id || id === "N/A" || id.trim() === "") {
        return `<img src="${placeholderImg}" alt="Business Logo" loading="lazy">`;
    }

    // Direct Link Support: If id starts with http, use it as is
    if (id.startsWith('http')) {
        return `<img src="${id}" alt="Business Logo" loading="lazy" onerror="this.src='${placeholderImg}'">`;
    }

    // Google Profile ID Support
    const googleImageUrl = `https://lh3.googleusercontent.com/d/${id.trim()}`;
    
    return `<img src="${googleImageUrl}" alt="Business Logo" loading="lazy" onerror="this.src='${placeholderImg}'">`;
}

/**
 * 3. UI RENDERING
 */
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        // Formatting town names for display and CSS classes
        const rawTown = (biz.town || "Clay County");
        const townName = rawTown.trim().split(',')[0].replace(" IL", "").trim();
        const townClass = townName.toLowerCase().replace(/\s+/g, '-');
        
        const card = document.createElement('div');
        const tier = (biz.tier || 'basic').toLowerCase();
        card.className = `card ${tier}`;
        
        // Premium members get the modal pop-up interaction
        if (tier === 'premium' && typeof openFullModal === 'function') {
            card.onclick = () => openFullModal(biz.name);
        }

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name}</h3>
            <div class="town-bar ${townClass}-bar">${townName}</div>
            <p>${biz.phone || ''}</p>
        `;
        grid.appendChild(card);
    });
}

/**
 * 4. FILTERING LOGIC
 */
function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    
    const categories = [...new Set(data.map(item => item.category))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📂 All Industries</option>';
    
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = `${catEmojis[cat] || '📁'} ${cat}`;
        select.appendChild(opt);
    });
}

function applyFilters() {
    const townVal = document.getElementById('town-select').value;
    const catVal = document.getElementById('cat-select').value;
    
    let filtered = masterData;
    
    if (townVal !== 'All') {
        filtered = filtered.filter(b => b.town && b.town.includes(townVal));
    }
    if (catVal !== 'All') {
        filtered = filtered.filter(b => b.category === catVal);
    }

    displayData(filtered);
}
