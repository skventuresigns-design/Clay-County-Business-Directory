/**
 * LAYOUT.JS - Refactored Engine
 */
let masterData = [];

document.addEventListener('DOMContentLoaded', () => {
    initDirectory();
});

/**
 * 1. Refactored Data Handling & Error Catching
 */
function initDirectory() {
    const grid = document.getElementById('directory-grid');
    
    // Safety check for PapaParse and CSV URL
    if (typeof Papa === 'undefined') {
        console.error('CRITICAL: PapaParse library not detected.');
        return;
    }
    if (!baseCsvUrl) {
        console.error('CRITICAL: baseCsvUrl is missing in config.js');
        return;
    }

    // Optional: Show loading state
    if (grid) grid.innerHTML = '<p style="text-align:center;">Loading Clay County Businesses...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy', // Better data handling for messy CSVs
        complete: function(results) {
            // Clean data: Ensure it has a name and isn't just a blank row
            masterData = results.data.filter(row => row.name && row.name.trim().length > 0);
            
            if (masterData.length === 0) {
                if (grid) grid.innerHTML = '<p>No business data found. Check your Google Sheet "Publish" settings.</p>';
                return;
            }

            populateCategoryFilter(masterData);
            displayData(masterData);
            if (typeof setupModalClose === 'function') setupModalClose();
        },
        error: function(err) {
            console.error('NETWORK ERROR: Could not reach the Google Sheet.', err);
            if (grid) grid.innerHTML = '<p>Error loading data. Please refresh the page.</p>';
        }
    });
}

/**
 * 2. Improved Image Handling
 * Updated to support both Google Profile IDs and direct URLs
 */
function getSmartImage(id) {
    if (!id || id === "N/A" || id.trim() === "") {
        return `<img src="${placeholderImg}" alt="Logo" loading="lazy">`;
    }

    // If it's already a full link (http), use it directly
    if (id.startsWith('http')) {
        return `<img src="${id}" alt="Logo" loading="lazy">`;
    }

    // Refactored Google Image Logic
    // Using the 'lh3' standard which is more reliable for Google-hosted profile images
    const googleImageUrl = `https://lh3.googleusercontent.com/d/${id.trim()}`;
    
    return `<img src="${googleImageUrl}" alt="Logo" loading="lazy" onerror="this.src='${placeholderImg}'">`;
}

function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const rawTown = (biz.town || "Clay County");
        const town = rawTown.trim().split(',')[0].replace(" IL", "").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        
        const card = document.createElement('div');
        const tier = (biz.tier || 'basic').toLowerCase();
        card.className = `card ${tier}`;
        
        if (tier === 'premium' && typeof openFullModal === 'function') {
            card.onclick = () => openFullModal(biz.name);
        }

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name}</h3>
            <div class="town-bar ${townClass}-bar">${town}</div>
            <p>${biz.phone || ''}</p>
        `;
        grid.appendChild(card);
    });
}

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
    if (townVal !== 'All') filtered = filtered.filter(b => b.town && b.town.includes(townVal));
    if (catVal !== 'All') filtered = filtered.filter(b => b.category === catVal);
    displayData(filtered);
}
