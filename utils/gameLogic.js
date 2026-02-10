export const calculateSessionTotals = (session) => {
    const totals = session.players.map((_, i) => (session.baseline ? parseFloat(session.baseline[i] || 0) : 0));
    session.rounds.forEach(round => {
        round.forEach((val, idx) => {
            if (idx < totals.length) {
                const num = parseFloat(val || 0);
                totals[idx] += isNaN(num) ? 0 : num;
            }
        });
    });
    return totals;
};

export const calculateAdjustedTotals = (session, rawTotals, isUyenMode) => {
    if (!isUyenMode) return rawTotals;

    let adjusted = [...rawTotals];
    let debt = 0;

    // 1. Calculate Debt from Uyen
    session.players.forEach((p, i) => {
        if (p.toLowerCase().includes('uyên') && adjusted[i] < 0) {
            debt += Math.abs(adjusted[i]) * 2;
            adjusted[i] = Math.abs(adjusted[i]);
        }
    });

    // 2. Assign Debt to Khoa or Dealer
    if (debt > 0) {
        let targetIdx = session.players.findIndex(p => p.toLowerCase().includes('khoa'));
        if (targetIdx === -1) {
            targetIdx = session.dealerIndex;
        }

        if (targetIdx !== -1 && targetIdx !== null) {
            adjusted[targetIdx] -= debt;
        }
    }

    return adjusted;
};
