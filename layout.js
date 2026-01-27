/**
 * LAYOUT.JS - The Directory Engine
 * Combined version: Fixes Dropdowns, Images, and Weather
 */

let masterData = [];

// 1. STARTUP
document.addEventListener('DOMContentLoaded', () => {
    initDirectory();
    getLocalWeather();
});

// 2. FETCH DATA FROM GOOGLE SHEET
function initDirectory() {
    const grid = document.getElementById('directory-grid');
    if (grid) grid.innerHTML = '<p style="text-align:center;">Loading Community Data...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            // Clean out any rows that don't have a name
            masterData = results.data.filter(row => row.name && row.name.trim() !== "");
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                displayData(masterData);
            } else {
                if (grid) grid.innerHTML = '<p>No listings found.</p>';
            }
        },
        error: function(err) {
            console.error("CSV Load Error:", err);
        }
    });
}

// 3. RENDER THE LISTINGS
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        // Town Formatting for the Card Bar
        const townRaw = (biz.town || "Clay County").trim().split(',')[0];
        const townClean = townRaw.replace(" IL", "").trim();
        const townClass = townClean.toLowerCase().replace(/\s+/g, '-');
        
        const card = document.createElement('div');
        const tier = (biz.tier || 'basic').toLowerCase();
        card.className = `card ${tier}`;
        
        card.onclick = () => {
            window.location.href = `profile.html?biz=${encodeURIComponent(biz.name)}`;
        };

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid)}</div>
            <h3>${biz.name}</h3>
            <div class="town-bar ${townClass}-bar">${townClean}</div>
            <p>${biz.phone || ''}</p>
        `;
        grid.appendChild(card);
    });
}

// 4. THE FILTERING ENGINE (Dropdown Logic)
function applyFilters() {
    // 1. Get the current values from the dropdowns
    const townVal = document.getElementById('town-select').value;
    const catVal = document.getElementById('cat-select').value;
    
    // 2. Start with the full master list of businesses
    let filtered = masterData.filter(biz => {
        
        // --- TOWN FILTER LOGIC ---
        // If 'All' is selected, everyone passes. 
        // Otherwise, check if the town in the sheet includes the selected town.
        const bizTown = (biz.town || "").toLowerCase();
        const selectedTown = townVal.toLowerCase();
        const matchesTown = (townVal === 'All' || bizTown.includes(selectedTown));
        
        // --- CATEGORY FILTER LOGIC ---
        // If 'All' is selected, everyone passes.
        // Otherwise, must be an exact match to the category name.
        const bizCat = (biz.category || "");
        const matchesCat = (catVal === 'All' || bizCat === catVal);
        
        // Both conditions must be true for the card to show
        return matchesTown && matchesCat;
    });
    
    // 3. Re-draw the directory grid with the filtered results
    displayData(filtered);
}

// 5. SMART IMAGE HANDLER (Prevents 404 Errors)
function getSmartImage(id) {
    // If ID is missing, use a web-safe placeholder
    if (!id || id === "N/A" || id.trim() === "") {
        return `<img src="https://via.placeholder.com/150?text=SMLC" alt="Logo">`;
    }
    
    // If it's a direct web link
    if (id.startsWith('http')) {
        return `<img src="${id}" alt="Logo" onerror="this.src='https://via.placeholder.com/150?text=SMLC'">`;
    }

    // Default: Try to pull as a Google ID
    return `<img src="https://googleusercontent.com/profile/picture/${id.trim()}" alt="Logo" onerror="this.src='https://via.placeholder.com/150?text=SMLC'">`;
}

// 6. DYNAMIC CATEGORY DROPDOWN
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

// 7. WEATHER WIDGET
async function getLocalWeather() {
    const weatherBox = document.getElementById('weather-box');
    if (!weatherBox) return;
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-88.48&current_weather=true');
        const data = await response.json();
        if (data.current_weather) {
            weatherBox.innerHTML = ` | 🌡️ Flora: ${Math.round((data.current_weather.temperature * 9/5) + 32)}°F`;
        }
    } catch (e) { console.log("Weather failed"); }
}
