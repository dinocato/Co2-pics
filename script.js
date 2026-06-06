// Rating Thresholds
const RATING_THRESHOLDS = [
    { rating: 'A+', maxTransferKB: 272.51 },
    { rating: 'A', maxTransferKB: 531.15 },
    { rating: 'B', maxTransferKB: 975.85 },
    { rating: 'C', maxTransferKB: 1410.39 },
    { rating: 'D', maxTransferKB: 1875.01 },
    { rating: 'E', maxTransferKB: 2419.56 },
    { rating: 'F', maxTransferKB: Infinity }
];

// Event Listeners
document.getElementById('calculateBtn').addEventListener('click', calculateEmissions);
document.getElementById('domainInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') calculateEmissions();
});

/**
 * Calculate emissions based on domain
 */
async function calculateEmissions() {
    let domain = document.getElementById('domainInput').value.trim();
    const resultDiv = document.getElementById('result');

    if (!domain) {
        resultDiv.innerHTML = '<div class="error">❌ Bitte gib eine Domain ein.</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="loading">⏳ Berechne...</div>';

    domain = domain.replace(/^https?:\/\//, '');

    try {
        // Fetch Green Hosting Data
        const greenRes = await fetch(`https://api.thegreenwebfoundation.org/api/v3/greencheck/${encodeURIComponent(domain)}`);
        const greenData = await greenRes.json();
        const isGreen = greenData.green;
        const hostedBy = greenData.hostedby || 'Unbekannt';
        const greenHostingFactor = isGreen ? 1 : 0;

        // Estimate total KB (simplified - in reality you'd measure actual page size)
        const totalKB = Math.random() * 2000 + 500; // 500-2500 KB simulation
        const totalEmissionsPer10kViews = (totalKB / 1024) * 1.956 * greenHostingFactor;

        // Get Carbon Rating
        const carbonRating = getDigitalCarbonRating(totalKB);

        // Build Result HTML
        resultDiv.innerHTML = `
            <div class="result-container">
                <!-- Green Hosting Check -->
                <div class="result-box ${isGreen ? 'green' : 'red'}">
                    <h4>🌱 Green Hosting</h4>
                    <div class="value">${isGreen ? '✓' : '✗'}</div>
                    <div class="description">${isGreen ? 'Green Hosting' : 'Kein Green Hosting'}</div>
                </div>

                <!-- CO2 Emissions -->
                <div class="emissions-box">
                    <h4>CO₂ Emissionen</h4>
                    <div class="value">${totalEmissionsPer10kViews.toFixed(2)}</div>
                    <div class="unit">kg / 10k Besuche</div>
                </div>

                <!-- Digital Carbon Rating -->
                <div class="rating-box">
                    <h4>💚 Digital Carbon Rating</h4>
                    <div class="rating-bar">${generateRatingBar(carbonRating)}</div>
                    <p class="rating-message">${getRatingMessage(carbonRating)}</p>
                </div>
            </div>
        `;

        // Show Environmental Impact
        displayEnvironmentalImpact(domain, totalEmissionsPer10kViews);

    } catch (error) {
        resultDiv.innerHTML = '<div class="error">❌ Fehler bei der Berechnung.</div>';
        console.error(error);
    }
}

/**
 * Get digital carbon rating based on total KB
 */
function getDigitalCarbonRating(totalKB) {
    for (let i = 0; i < RATING_THRESHOLDS.length; i++) {
        if (totalKB <= RATING_THRESHOLDS[i].maxTransferKB) {
            return RATING_THRESHOLDS[i].rating;
        }
    }
    return 'F';
}

/**
 * Get color for rating
 */
function getRatingColor(rating) {
    const colors = {
        'A+': '#08A925',
        'A': '#2FC518',
        'B': '#72C518',
        'C': '#B0E416',
        'D': '#E6B224',
        'E': '#C55C16',
        'F': '#AA2608'
    };
    return colors[rating] || 'gray';
}

/**
 * Generate rating bar HTML
 */
function generateRatingBar(currentRating) {
    const ratings = ['A+', 'A', 'B', 'C', 'D', 'E', 'F'];
    return ratings.map(rating => `
        <div style="
            width: 20px;
            height: 12px;
            background: ${getRatingColor(rating)};
            border-radius: ${rating === 'A+' ? '2px 0 0 2px' : rating === 'F' ? '0 2px 2px 0' : '0'};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: 600;
        ">${rating}</div>
    `).join('');
}

/**
 * Get rating message
 */
function getRatingMessage(rating) {
    const messages = {
        'A+': '🌟 Herzlichen Glückwunsch! Diese Website ist super umweltfreundlich! Sehr niedrige CO₂-Emissionen pro Besuch.',
        'A': '✅ Gut gemacht! Diese Website ist gut für die Umwelt - der CO₂-Ausstoß pro Besuch ist niedrig.',
        'B': '📊 Okay, aber es gibt noch Raum für Verbesserungen. Deine Website hat ein B Rating, mit mäßigen CO₂-Emissionen.',
        'C': '⚠️ Es gibt Potenzial, den CO₂-Ausstoß dieser Website zu verringern.',
        'D': '🔴 Die CO₂-Emissionen dieser Website sind überdurchschnittlich hoch.',
        'E': '📈 Es gibt viel Raum zur Verbesserung.',
        'F': '❌ Die Emissionen dieser Website sind sehr hoch.'
    };
    return messages[rating] || 'Keine Daten verfügbar.';
}

/**
 * Display environmental impact
 */
function displayEnvironmentalImpact(domain, totalEmissionsPer10kViews) {
    const umweltfolgenDiv = document.getElementById('umweltfolgen');
    
    // Update emissions summary
    document.getElementById('emissionsSummary').innerHTML = `
        Über ein Jahr hinweg verursacht <strong>${domain}</strong> mit
        <strong>10.000</strong> Seitenaufrufen pro Monat <strong>${totalEmissionsPer10kViews.toFixed(2)}</strong> kg CO₂-Äquivalente.
    `;

    // Update environmental impacts
    document.getElementById('rainforest').textContent = (totalEmissionsPer10kViews * 0.6).toFixed(2);
    document.getElementById('arctic').textContent = (totalEmissionsPer10kViews * 0.3).toFixed(2);
    document.getElementById('ocean').textContent = (totalEmissionsPer10kViews * 0.05).toFixed(2);

    // Show container
    umweltfolgenDiv.style.display = 'block';
}
