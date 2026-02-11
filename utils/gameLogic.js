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
            debt += Math.abs(adjusted[i]);
            adjusted[i] = 0;
        }
    });

    // 2. Assign Debt to Khoa or Dealer/Citizens (must NOT be Uyen)
    if (debt > 0) {
        let khoaIdx = session.players.findIndex(p => p.trim().toLowerCase() === 'khoa');

        if (khoaIdx !== -1) {
            // Priority 1: Khoa pays everything
            adjusted[khoaIdx] -= debt;
        } else {
            const dealerIdx = session.dealerIndex;
            const isUyenDealer = dealerIdx !== null && dealerIdx !== -1 && session.players[dealerIdx].trim().toLowerCase() === 'uyên';

            if (!isUyenDealer && dealerIdx !== null && dealerIdx !== -1) {
                // Priority 2: Dealer pays everything (must not be Uyen)
                adjusted[dealerIdx] -= debt;
            } else {
                // Priority 3: Shared debt among all non-Uyen players
                const nonUyenIndices = session.players
                    .map((p, i) => i)
                    .filter(i => session.players[i].trim().toLowerCase() !== 'uyên');

                if (nonUyenIndices.length > 0) {
                    const share = Math.round(debt / nonUyenIndices.length);
                    let distributedDebt = 0;

                    nonUyenIndices.forEach((idx, i) => {
                        if (i === nonUyenIndices.length - 1) {
                            // Last person pays the remainder to ensure zero-sum
                            const remainder = debt - distributedDebt;
                            adjusted[idx] -= remainder;
                        } else {
                            adjusted[idx] -= share;
                            distributedDebt += share;
                        }
                    });
                }
            }
        }
    }

    return adjusted;
};
