// 11. MODAL LOGIC (Simplified for Lowercase Headers)
function openPremiumModal(encodedName) {
    const name = decodeURIComponent(encodedName);
    const biz = masterData.find(b => b.name === name);

    if (!biz) return;

    // These will now work perfectly because the keys match the sheet exactly
    document.getElementById('modal-name').innerText = biz.name;
    document.getElementById('modal-address').innerText = biz.address || "Contact for address";
    document.getElementById('modal-phone').innerText = biz.phone || "N/A";
    document.getElementById('modal-category').innerText = biz.category || "Local Business";
    
    // Town Bar
    const town = (biz.town || "Clay County").trim();
    const townClass = town.toLowerCase().replace(/\s+/g, '-');
    const townBar = document.getElementById('modal-town-bar');
    if (townBar) {
        townBar.innerText = town;
        townBar.className = `modal-town-bar ${townClass}-bar`;
    }

    // Logo
    const logoBox = document.getElementById('modal-logo');
    if (logoBox) {
        logoBox.innerHTML = getSmartImage(biz.imageid);
    }

    // Call Button
    const callLink = document.getElementById('modal-call-link');
    if (callLink) {
        callLink.href = `tel:${biz.phone ? biz.phone.replace(/\D/g,'') : ''}`;
    }

    document.getElementById('premium-modal').style.display = 'flex';
}
