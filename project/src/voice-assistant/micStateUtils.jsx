export function isMicFullyIdle(micOn, isWaitingForResponse) {
    return micOn === false && isWaitingForResponse === false;
}
