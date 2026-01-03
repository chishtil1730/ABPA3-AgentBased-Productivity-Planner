let currentCards = [];

/**
 * Called by CustomKanban whenever cards change
 */
export function updateKanbanCards(cards) {
    currentCards = Array.isArray(cards) ? cards : [];
}

/**
 * Called by TaskTracker (polling)
 */
export function getTaskProgress() {
    if (!currentCards.length) return 0;

    let done = 0;
    let doing = 0;

    for (const card of currentCards) {
        if (card.column === "done") done += 1;
        else if (card.column === "doing") doing += 1;
    }

    const total = currentCards.length;
    const progress = (done + doing / 3) / total;

    return Math.round(progress * 100);
}
