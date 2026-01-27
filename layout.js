/**
 * LAYOUT.JS - The Directory Engine
 */
let masterData = [];

document.addEventListener('DOMContentLoaded', () => {
    initDirectory();
    getLocalWeather(); // Starts the weather engine
});

/**
 * 1. INITIALIZATION
 * Fetches data from your Google Sheet and prepares the UI.
 */
function initDirectory() {
    const grid = document.getElementById('directory-grid');
    if (grid) grid.innerHTML = '<p style="text-align:center;">Loading Community Data...</p>';

    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            masterData = results.data.filter(row => row.name && row.name.trim() !== "");
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                displayData(masterData);
                if (typeof setupModalClose === 'function') setupModalClose();
            } else {
                if (grid) grid.innerHTML = '<p>No listings found in the directory.</p>';
            }
        },
        error: function(err) {
            console.error("CSV Load Error:", err);
            if (grid) grid.innerHTML = '<p>Error connecting to the community database.</p>';
        }
    });
}

/**
 * 2. UI RENDERING
 * Generates the business cards and handles the click-to-profile logic.
 */
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        // --- CLEAN TOWN LOGIC ---
        // This strips ", IL" and extra spaces so it matches your CSS classes perfectly
        const townRaw = (biz.town || "Clay County").trim().split(',')[0];
        const townClean = townRaw.replace(" IL", "").trim();
        const townClass = townClean.toLowerCase().replace(/\s+/g, '-');
        
        const card = document.createElement('div');
        const tier = (biz.tier || 'basic').toLowerCase();
        card.className = `card ${tier}`;
        
        card.onclick = () => {
            const safeName = encodeURIComponent(biz.name);
            window.location.href = `profile.html?biz=${safeName}`;
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

/**
 * 3. IMAGE HANDLING
 */
function getSmartImage(id) {
    if (!id || id === "N/A" || id.trim() === "") {
        return `<img src="images/placeholder.png" alt="Logo">`;
    }
    if (id.startsWith('http')) {
        return `<img src="${id}" alt="Logo" onerror="this.src='images/placeholder.png'">`;
    }
    return `<img src="http://googleusercontent.com/profile/picture/${id.trim()}" alt="Logo" onerror="this.src='images/placeholder.png'">`;
}

/**
 * 4. FILTERING
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
    // 1. Grab values from dropdowns
    const townVal = document.getElementById('town-select').value;
    const catVal = document.getElementById('cat-select').value;
    
    console.log("Filtering for:", townVal, catVal); // This helps us troubleshoot

    let filtered = masterData;

    // 2. Filter by Town
    if (townVal !== 'All') {
        filtered = filtered.filter(biz => {
            if (!biz.town) return false;
            // This checks if the town in your sheet contains the dropdown selection
            return biz.town.toLowerCase().includes(townVal.toLowerCase());
        });
    }

    // 3. Filter by Category
    if (catVal !== 'All') {
        filtered = filtered.filter(biz => {
            return biz.category === catVal;
        });
    }

    // 4. Update the grid
    displayData(filtered);
}

/**
 * 5. WEATHER WIDGET
 */
async function getLocalWeather() {
    const weatherBox = document.getElementById('weather-box');
    if (!weatherBox) return;

    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-88.48&current_weather=true');
        const data = await response.json();
        if (data.current_weather) {
            const tempC = data.current_weather.temperature;
            const tempF = Math.round((tempC * 9/5) + 32);
            weatherBox.innerHTML = ` | 🌡️ Flora: ${tempF}°F`;
        }
    } catch (error) {
        console.log("Weather update failed.");
    }
}
