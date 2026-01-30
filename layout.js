/**
 * LAYOUT.JS - The Directory Engine (Master V2)
 */

let masterData = [];

// 1. STARTUP
document.addEventListener('DOMContentLoaded', () => {
    if (typeof updateMastheadDate === 'function') updateMastheadDate();
    if (typeof getLocalWeather === 'function') getLocalWeather();
    if (typeof baseCsvUrl !== 'undefined') initDirectory();

    // Close modal if user clicks the dark background
    const modal = document.getElementById('premium-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePremiumModal();
        });
    }
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
            masterData = results.data.filter(row => {
                const n = row.name || row.Name;
                return n && n.trim() !== "";
            });
            
            if (masterData.length > 0) {
                populateCategoryFilter(masterData);
                populateTownFilter(masterData);
                displayData(masterData);
                updateListingCount(masterData.length);
            }
        }
    });
}


// 3. RENDER LISTINGS (Simplified for better Premium matching)
function displayData(data) {
    const grid = document.getElementById('directory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach(biz => {
        const tier = (biz.tier || biz.Tier || 'basic').toLowerCase().trim();
        const bizName = (biz.name || biz.Name || "Unnamed Business").trim();
        const town = (biz.town || biz.Town || "Clay County").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        const phone = biz.phone || biz.Phone || "";
        const phoneHtml = tier !== 'basic' ? `<p class="phone">${phone}</p>` : '';

        // We use encodeURIComponent to make symbols like & and ' safe!
        const safeName = encodeURIComponent(bizName);

        const card = document.createElement('div');
        card.className = `card ${tier}`;

        card.innerHTML = `
            <div class="logo-box">${getSmartImage(biz.imageid || biz.ImageID)}</div>
            <h3>${bizName}</h3>
            <div class="town-bar ${townClass}-bar">${town}</div>
            ${phoneHtml} 
            <p class="category-tag"><i>${biz.category || biz.Category || ""}</i></p>
            ${tier === 'premium' ? `<button class="read-more-btn" onclick="openPremiumModal('${safeName}')">Read More</button>` : ''}
        `;
        grid.appendChild(card);
    });
}


// 4. THE PREMIUM POP-OUT (Town Bar & Website Link Fix)
function openPremiumModal(safeName) {
    // 1. Decode the name (e.g., change 'S%26K' back to 'S&K')
    const nameToFind = decodeURIComponent(safeName).toLowerCase().trim();
    
    // 2. Find the business in the MASTER list, not the filtered screen list
    const biz = masterData.find(b => {
        const currentName = (b.name || b.Name || "").toLowerCase().trim();
        return currentName === nameToFind;
    });
    
    if (!biz) {
        console.error("Could not find:", nameToFind);
        return;
    }

    const modal = document.getElementById('premium-modal');
    const modalContainer = document.querySelector('#premium-modal .modal-content');
    
    if (modalContainer) {
        // Website Protocol Fix (Adds https:// if missing)
        let rawWeb = (biz.website || biz.Website || "").trim();
        let websiteUrl = (rawWeb && !rawWeb.startsWith('http')) ? `https://${rawWeb}` : rawWeb;
        
        const address = biz.address || biz.Address || "Contact for Address";
        const town = (biz.town || biz.Town || "Clay County").trim();
        const townClass = town.toLowerCase().replace(/\s+/g, '-');
        const phone = biz.phone || biz.Phone || "N/A";
        const category = biz.category || biz.Category || "Local Business";
        const hours = biz.hours || biz.Hours || "Mon-Fri: 8am - 5pm<br>Sat-Sun: Closed";
        const mapAddress = encodeURIComponent(`${address}, ${town}, IL`);

        modalContainer.innerHTML = `
            <span onclick="closePremiumModal()" 
                  style="position:absolute; top:15px; right:20px; font-size:45px; cursor:pointer; color:#222; font-weight:bold; z-index:999999; line-height:0.8;">×</span>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 10px;">
                <div style="text-align: center;">
                    <div style="height: 100px; margin-bottom: 12px; display:flex; align-items:center; justify-content:center;">
                        ${getSmartImage(biz.imageid || biz.ImageID).replace('<img', '<img style="max-height:100%; max-width:100%;"')}
                    </div>
                    <h2 style="font-family:serif; font-size: 1.4rem; margin: 0;">${biz.name || biz.Name}</h2>
                </div>

                <div style="border-left: 1px solid #ccc; padding-left: 20px; text-align: left; font-size: 0.95rem;">
                    <p style="margin: 12px 0;"><strong>📂 Category:</strong><br>${category}</p>
                    <p style="margin: 12px 0;"><strong>📍 Address:</strong><br>${address}</p>
                    <p style="margin: 12px 0;"><strong>📞 Phone:</strong><br>${phone}</p>
                    <p style="margin: 12px 0;">${websiteUrl ? `<strong>🌐 Website:</strong><br><a href="${websiteUrl}" target="_blank" style="color:#0044cc; text-decoration:underline;">Visit Website</a>` : ''}</p>
                </div>
            </div>

            <div class="town-bar ${townClass}-bar" style="margin: 15px -40px; border-radius: 0; width: calc(100% + 80px); text-align: center; padding: 10px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">
                ${town}
            </div>

            <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; margin-bottom: 25px; margin-top: 20px;">
                <div style="height: 180px; border: 1px solid #222;">
                    <iframe width="100%" height="100%" frameborder="0" src="https://maps.google.com/maps?q=${mapAddress}&output=embed"></iframe>
                </div>
                <div style="background:#fff; border: 1px solid #222; padding: 15px; font-size: 0.85rem;">
                    <h4 style="margin:0 0 10px 0; border-bottom:1px solid #ccc;">HOURS OF OPERATION</h4>
                    <div style="line-height:1.4;">${hours}</div>
                </div>
            </div>

            <div style="border: 3px dashed #cc0000; background: #fff; padding: 25px; text-align: center; position:relative;">
                <span style="position:absolute; top:-15px; left:10px; font-size:20px;">✂️</span>
                <p style="color:#cc0000; font-weight:bold; font-size:1.2rem; margin:0;">DIGITAL COMMUNITY COUPON</p>
                <p style="margin:8px 0 0 0; font-size:0.95rem;">Show this screen to the merchant to redeem!</p>
            </div>
        `;
        modal.style.display = 'flex';
    }
}


// 5. GLOBAL HELPERS
function closePremiumModal() {
    const modal = document.getElementById('premium-modal');
    if (modal) modal.style.display = 'none';
}

function getSmartImage(id) {
    const placeholder = "https://placehold.co/150?text=SMLC";
    const repo = (typeof mediaRepoBase !== 'undefined') ? mediaRepoBase : "";
    if (!id || id === "N/A" || id === "") return `<img src="${placeholder}" alt="Logo">`;
    if (id.toString().startsWith('http')) return `<img src="${id}" alt="Logo" onerror="this.src='${placeholder}'">`;
    return `<img src="${repo}${id.toString().trim()}" alt="Logo" onerror="this.src='${placeholder}'">`;
}

// 6. FILTERS & COUNT (Remaining code as before...)
function applyFilters() {
    const selectedTown = document.getElementById('town-select').value;
    const selectedCat = document.getElementById('cat-select').value;
    const filtered = masterData.filter(biz => {
        const bTown = biz.town || biz.Town || "";
        const bCat = biz.category || biz.Category || "";
        return (selectedTown === "All" || bTown === selectedTown) && (selectedCat === "All" || bCat === selectedCat);
    });
    displayData(filtered);
    updateListingCount(filtered.length);
}
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
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.66&longitude=-88.48&current_weather=true');
        const data = await response.json();
        if (data.current_weather) el.innerHTML = ` | 🌡️ Flora: ${Math.round((data.current_weather.temperature * 9/5) + 32)}°F`;
    } catch (e) {}
}
function populateCategoryFilter(data) {
    const select = document.getElementById('cat-select');
    if (!select) return;
    const categories = [...new Set(data.map(item => item.category || item.Category))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📂 All Industries</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = `📁 ${cat}`;
        select.appendChild(opt);
    });
}
function populateTownFilter(data) {
    const select = document.getElementById('town-select');
    if (!select) return;
    const towns = [...new Set(data.map(item => item.town || item.Town))].filter(Boolean).sort();
    select.innerHTML = '<option value="All">📍 All Towns</option>';
    towns.forEach(town => {
        const opt = document.createElement('option');
        opt.value = town;
        opt.textContent = town;
        select.appendChild(opt);
    });
}
