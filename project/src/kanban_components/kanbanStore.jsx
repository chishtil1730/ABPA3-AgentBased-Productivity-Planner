// This persists ONLY while the app is running (no reload persistence)
export let runtimeCards = null;

export function setRuntimeCards(cards) {
    runtimeCards = cards;
}
