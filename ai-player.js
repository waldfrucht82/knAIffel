async function aiTurn() {
    if (gameOver) return;

    // First roll is automatic if not already done (which it isn't at start of turn)
    rollDice();
    await new Promise(r => setTimeout(r, 1000));

    // Second roll
    if (rollsLeft > 0) {
        evaluateDice();
        updateDiceDisplay();
        await new Promise(r => setTimeout(r, 1000));
        rollDice();
        await new Promise(r => setTimeout(r, 1000));
    }

    // Third roll
    if (rollsLeft > 0) {
        evaluateDice();
        updateDiceDisplay();
        await new Promise(r => setTimeout(r, 1000));
        rollDice();
        await new Promise(r => setTimeout(r, 1000));
    }

    // Final selection
    const bestCategory = findBestCategory();
    if (bestCategory) {
        const cell = scoreTable.querySelector(`tr[data-cat="${bestCategory}"] td[data-player="2"]`);
        if (cell) {
            selectScore(bestCategory, 2, cell);
        }
    }
}

function evaluateDice() {
    // Simple strategy: Keep dice that match the most frequent value
    // Or keep straights if close

    const counts = {};
    for (const value of diceValues) {
        counts[value] = (counts[value] || 0) + 1;
    }

    let maxCount = 0;
    let bestValue = 0;
    for (const value in counts) {
        if (counts[value] > maxCount) {
            maxCount = counts[value];
            bestValue = parseInt(value);
        }
    }

    // If we have a good amount of one number, keep it
    // Unless we are trying for a straight (logic omitted for simplicity in v1, focus on matching)

    for (let i = 0; i < 5; i++) {
        if (diceValues[i] === bestValue) {
            selectedDice[i] = true;
        } else {
            selectedDice[i] = false;
        }
    }
}

function findBestCategory() {
    const availableCategories = [];
    const player = 2;

    // Check all categories
    const categories = ['aces', 'twos', 'threes', 'fours', 'fives', 'sixes',
        'three-of-a-kind', 'four-of-a-kind', 'full-house',
        'small-straight', 'large-straight', 'kniffel', 'chance'];

    let bestCat = null;
    let maxScore = -1;

    for (const cat of categories) {
        if (scores[player][cat] === undefined) {
            const score = calculateScore(cat);
            // Prioritize Kniffel
            if (cat === 'kniffel' && score === 50) return 'kniffel';

            // Simple greedy choice
            if (score > maxScore) {
                maxScore = score;
                bestCat = cat;
            }
        }
    }

    // If no good score, pick the one that hurts the least (e.g. chance or a 0 score)
    // The loop above already picks the max score, so if all are 0, it picks the first one or last one.
    // Let's refine: if maxScore is 0, try to fill 'chance' if available, then 'aces', 'twos' etc to minimize loss
    if (maxScore === 0) {
        if (scores[player]['chance'] === undefined) return 'chance';
        for (const cat of ['aces', 'twos', 'threes', 'fours', 'fives', 'sixes']) {
            if (scores[player][cat] === undefined) return cat;
        }
        // If upper section full, pick any available
        for (const cat of categories) {
            if (scores[player][cat] === undefined) return cat;
        }
    }

    return bestCat;
}
