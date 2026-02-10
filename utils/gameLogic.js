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
        if (p.trim().toLowerCase() === 'uyên' && adjusted[i] < 0) {
            debt += Math.abs(adjusted[i]) * 2;
            adjusted[i] = Math.abs(adjusted[i]);
        }
    });

    // 2. Assign Debt to Khoa or Dealer/Citizens (must NOT be Uyen)
    if (debt > 0) {
        let khoaIdx = session.players.findIndex(p => p.trim().toLowerCase() === 'khoa');

        if (khoaIdx !== -1) {
            // Khoa pays the full debt
            adjusted[khoaIdx] -= debt;
        } else {
            const dealerIdx = session.dealerIndex;
            const isUyenDealer = dealerIdx !== null && dealerIdx !== -1 && session.players[dealerIdx].trim().toLowerCase() === 'uyên';

            if (isUyenDealer) {
                // Distributed debt: All non-Uyen players share the burden
                const nonUyenIndices = session.players
                    .map((p, i) => i)
                    .filter(i => session.players[i].trim().toLowerCase() !== 'uyên');

                if (nonUyenIndices.length > 0) {
                    const share = debt / nonUyenIndices.length;
                    nonUyenIndices.forEach(idx => {
                        adjusted[idx] = Math.round((adjusted[idx] - share) * 10) / 10;
                    });
                }
            } else if (dealerIdx !== null && dealerIdx !== -1) {
                // Dealer is not Uyen, dealer pays
                adjusted[dealerIdx] -= debt;
            } else {
                // Fallback: Find the first person who is NOT Uyen
                const fallbackIdx = session.players.findIndex(p => p.trim().toLowerCase() !== 'uyên');
                if (fallbackIdx !== -1) adjusted[fallbackIdx] -= debt;
            }
        }
    }

    return adjusted;
};
