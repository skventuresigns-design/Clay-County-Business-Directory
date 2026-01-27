/**
 * LAYOUT.JS - The Directory Engine
 */
let masterData = [];

document.addEventListener('DOMContentLoaded', () => {
    initDirectory();
});

function initDirectory() {
    const grid = document.getElementById('directory-grid');
    if (grid) grid.innerHTML = '<p style="text-align:center;">Loading Local Data...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            // Clean up the data
            masterData = results.data.filter(row => row.name && row.name.trim() !== "");
            
            // If data is found, display it
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                displayData(masterData);
                if (typeof setupModalClose === 'function') setupModalClose();
            } else {
                grid.innerHTML = '<p>No data found in your Google Sheet.</p>';
            }
        },
        error: function(err) {
            console.error("CSV Load Error:", err);
            if (grid) grid.innerHTML = '<p>Error connecting to data source.</p>';
        }
    });
}

function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const town = (biz.town || "Clay County").trim().split(',')[0].replace(" IL", "").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        const card = document.createElement('div');
        const tier = (biz.tier || 'basic').toLowerCase();
        card.className = `card ${tier}`;
        
        // Premium cards link to the profile page
        card.onclick = () => {
            const safeName = encodeURIComponent(biz.name);
            window.location.href = `profile.html?biz=${safeName}`;
        };

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name}</h3>
            <div class="town-bar ${townClass}-bar">${town}</div>
            <p>${biz.phone || ''}</p>
        `;
        grid.appendChild(card);
    });
}

function getSmartImage(id) {
    if (!id || id === "N/A" || id.trim() === "") return `<img src="images/placeholder.png" alt="Logo">`;
    if (id.startsWith('http')) return `<img src="${id}" alt="Logo">`;
    return `<img src="https://lh3.googleusercontent.com/d/${id.trim()}" alt="Logo" onerror="this.src='images/placeholder.png'">`;
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
