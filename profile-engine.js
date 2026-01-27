/**
 * PROFILE-ENGINE.JS - Feeds the newspaper layout in profile.html
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Get the business name from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const bizName = decodeURIComponent(urlParams.get('biz') || "");

    if (!bizName) {
        window.location.href = 'index.html'; // Redirect to home if no business specified
        return;
    }

    // 2. Fetch the data from the Google Sheet
    Papa.parse(baseCsvUrl, {
        download: true,
        header: true,
        skipEmptyLines: 'greedy',
        complete: function(results) {
            // Find the specific business that matches the URL
            const biz = results.data.find(b => b.name === bizName);
            
            if (biz) {
                renderProfile(biz);
            } else {
                document.getElementById('profile-wrap').innerHTML = `
                    <div style="text-align:center; padding:50px;">
                        <h2>Business Profile Not Found</h2>
                        <a href="index.html">Return to Directory</a>
                    </div>`;
            }
        }
    });
});

/**
 * 3. INJECT DATA INTO THE LAYOUT
 */
function renderProfile(biz) {
    const wrap = document.getElementById('profile-wrap');
    
    // Construct the Google Maps link based on the sheet data
    const fullAddress = `${biz.address || ''}, ${biz.town || ''}, IL`.trim();
    const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

    // Inject the data into your newspaper container
    wrap.innerHTML = `
        <div class="profile-container">
            <div class="tier-indicator">${biz.tier || 'Basic Member'}</div>
            <a href="index.html" class="back-link">← Return to Directory</a>
            
            <div class="profile-header">
                <div class="profile-logo-box">
                    ${getSmartImage(biz.imageid)}
                </div>
                <div>
                    <h1 class="biz-title">${biz.name}</h1>
                    <p class="biz-meta">${biz.category} | ${biz.town}</p>
                </div>
            </div>

            <div class="details-grid">
                <div class="info-section">
                    <h3>Contact & Location</h3>
                    <div class="info-item"><strong>📞 Phone:</strong> ${biz.phone || 'N/A'}</div>
                    <div class="info-item"><strong>📍 Address:</strong> ${biz.address || 'N/A'}</div>
                    <div class="info-item"><strong>⏰ Hours:</strong> ${biz.hours || 'N/A'}</div>
                    
                    <div style="margin-top:20px;">
                        ${biz.website && biz.website !== "N/A" ? `<a href="${biz.website}" target="_blank" class="action-btn">Visit Website</a>` : ''}
                        ${biz.facebook && biz.facebook !== "N/A" ? `<a href="${biz.facebook}" target="_blank" class="action-btn" style="background:#3b5998; margin-left:10px;">Facebook</a>` : ''}
                    </div>
                </div>

                <div class="info-section">
                    <h3>Our Story</h3>
                    <div class="bio-box">
                        ${biz.bio || "No additional information provided at this time."}
                    </div>
                </div>
            </div>

            <div class="map-box">
                <iframe width="100%" height="100%" frameborder="0" src="${mapUrl}" style="border:0;" allowfullscreen></iframe>
            </div>
        </div>
    `;
}

/**
 * 4. SMART IMAGE LOGIC
 */
function getSmartImage(id) {
    if (!id || id === "N/A" || id.trim() === "") {
        return `<img src="images/placeholder.png" alt="Logo">`;
    }
    
    // If it's a full URL, use it
    if (id.startsWith('http')) {
        return `<img src="${id}" alt="Logo" onerror="this.src='images/placeholder.png'">`;
    }

    // Google Profile Picture ID support
    return `<img src="https://googleusercontent.com/profile/picture/${id.trim()}" alt="Logo" onerror="this.src='images/placeholder.png'">`;
}
