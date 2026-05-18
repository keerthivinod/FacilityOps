export function extractLocation(text) {
    const patterns = [
        /(?:illam|block|building|room|floor|wing|ward)\s*[\d\w\-]+(?:\s+(?:left|right|front|back|north|south|east|west)\s*(?:side)?)?/gi,
        /(?:opd|icu|ot|reception|kitchen|pharmacy|lab|store|parking|generator\s*room|pump\s*house|rooftop|corridor|entrance|lobby)\s*(?:block|area|room|wing)?/gi,
        /(?:main\s+block|block\s+[a-d])/gi
    ];
    const locations = [];
    for (const p of patterns) {
        const matches = text.match(p);
        if (matches) locations.push(...matches);
    }
    return locations.length > 0 ? locations[0].trim() : null;
}
