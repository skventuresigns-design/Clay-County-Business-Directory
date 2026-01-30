/**
 * LAYOUT.JS - The Directory Engine (Support My Local Community Edition)
 */

let masterData = [];

// 1. STARTUP
document.addEventListener('DOMContentLoaded', () => {
    updateMastheadDate();
    if (typeof baseCsvUrl === 'undefined') {
        console.error("CRITICAL: baseCsvUrl is missing from config.js");
    } else {
        initDirectory();
    }
    getLocalWeather();
});

// 2. FETCH DATA
function initDirectory() {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '<p style="text-align:center;">Loading Community Data...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            // Filters out empty rows, assumes lowercase 'name' header
            masterData = results.data.filter(row => row.name && row.name.trim() !== "");
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                populateTownFilter(masterData);
                displayData(masterData);
                updateListingCount(masterData.length);
            } else {
                grid.innerHTML = '<p>No listings found in the spreadsheet.</p>';
            }
        }
    });
}

// 3. RENDER LISTINGS
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const tier = (biz.tier || 'basic').toLowerCase();
        const townClean = (biz.town || "Clay County").trim();
        const townClass = townClean.toLowerCase().replace(/\s+/g, '-');

        const card = document.createElement('div');
        card.className = `card ${tier}`;
        card.style.backgroundColor = "#fcf6de"; // Your preferred cream color

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name || 'Unnamed'}</h3>
            <div class="town-bar ${townClass}-bar">${townClean}</div>
            <p class="phone">${biz.phone || ''}</p>
            <p class="category-tag"><i>${biz.category || ''}</i></p>
            ${tier === 'premium' ? `<button class="read-more-btn" onclick="openPremiumModal('${encodeURIComponent(biz.name)}')">Read More</button>` : ''}
        `;
        grid.appendChild(card);
    });
}

// 4. IMAGE HANDLER
function getSmartImage(id) {
    const placeholder = "https://placehold.co/150?text=SMLC";
    const repo = (typeof mediaRepoBase !== 'undefined') ? mediaRepoBase : "";
    if (!id || id === "N/A" || id.trim() === "") return `<img src="${placeholder}" alt="Logo">`;
    if (id.toString().startsWith('http')) return `<img src="${id}" alt="Logo" onerror="this.src='${placeholder}'">`;
    return `<img src="${repo}${id.trim()}" alt="Logo" onerror="this.src='${placeholder}'">`;
}

// 5. THE FILTER ENGINE
function applyFilters() {
    const selectedTown = document.getElementById('town-select').value;
    const selectedCat = document.getElementById('cat-select').value;

    const filteredData = masterData.filter(biz => {
        const townMatch = (selectedTown === "All" || biz.town === selectedTown);
        const catMatch = (selectedCat === "All" || biz.category === selectedCat);
        return townMatch && catMatch;
    });

    displayData(filteredData);
    updateListingCount(filteredData.length);
}

// 6. DROPDOWN GENERATORS
function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    const categories = [...new Set(data.map(item => item.category))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📂 All Industries</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        const emoji = (typeof catEmojis !== 'undefined' && catEmojis[cat]) ? catEmojis[cat] : '📁';
        opt.textContent = `${emoji} ${cat}`;
        select.appendChild(opt);
    });
}

function populateTownFilter(data) {
    const select = document.getElementById('town-select');
    if (!select) return;
    const towns = [...new Set(data.map(item => item.town))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📍 All Towns</option>';
    towns.forEach(town => {
        const opt = document.createElement('option');
        opt.value = town;
        opt.textContent = town;
        select.appendChild(opt);
    });
}

// 7. PREMIUM MODAL LOGIC
function openPremiumModal(encodedName) {
    try {
        const name = decodeURIComponent(encodedName);
        console.log("Attempting to open modal for:", name);

        // Find the business. We use .toLowerCase() on both sides to be 100% safe
        const biz = masterData.find(b => b.name.toLowerCase() === name.toLowerCase());

        if (!biz) {
            console.error("Data Error: Could not find " + name + " in masterData.");
            return;
        }

        // 1. Fill the simple text fields
        document.getElementById('modal-name').innerText = biz.name;
        document.getElementById('modal-address').innerText = biz.address || "No address listed";
        document.getElementById('modal-phone').innerText = biz.phone || "No phone listed";
        document.getElementById('modal-category').innerText = biz.category || "General";

        // 2. Handle the Town Bar and Color
        const town = (biz.town || "Clay County").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        const townBar = document.getElementById('modal-town-bar');
        townBar.innerText = town;
        townBar.className = `modal-town-bar ${townClass}-bar`;

        // 3. Handle the Logo
        const logoBox = document.getElementById('modal-logo');
        logoBox.innerHTML = getSmartImage(biz.imageid);

        // 4. Handle the Call Button
        const callLink = document.getElementById('modal-call-link');
        const cleanPhone = (biz.phone || "").replace(/\D/g, '');
        callLink.href = `tel:${cleanPhone}`;

        // 5. FINALLY - Show the modal
        document.getElementById('premium-modal').style.display = 'flex';
        console.log("Success: Modal is now visible.");

    } catch (error) {
        console.error("CRITICAL MODAL ERROR:", error);
    }
}

// 8. HELPERS (Date, Weather, Count)
function updateListingCount(count) {
    const el = document.getElementById('listing-count');
    if (el) el.innerText = `${count} Listings Found`;
}

function updateMastheadDate() {
    const el = document.getElementById('masthead-date');
    if (el) el.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

async function getLocalWeather() {
    const el = document.getElementById('weather-box');
    if (!el) return;
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-88.48&current_weather=true');
        const d = await res.json();
        if (d.current_weather) el.innerHTML = ` | 🌡️ Flora: ${Math.round((d.current_weather.temperature * 9/5) + 32)}°F`;
    } catch (e) { console.log("Weather unreachable"); }
}
