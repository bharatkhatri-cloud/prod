/**
 * Client-side helper to expand a sequential range of IDs (e.g. Start ID to End ID)
 * Supports zero-padded numbers and standard prefixes (SB, M, etc.)
 */
export function expandSequentialRange(startId, endId, maxAllowed = 1000) {
    if (!startId || !endId) {
        throw new Error("Both start and end IDs are required.");
    }

    const s = startId.trim();
    const e = endId.trim();

    const startMatch = s.match(/^([A-Za-z_-]*)(\d+)$/);
    const endMatch = e.match(/^([A-Za-z_-]*)(\d+)$/);

    if (!startMatch || !endMatch) {
        throw new Error(`IDs must end with numbers (e.g., SB00100, M00200). Received: "${s}" and "${e}"`);
    }

    const startPrefix = startMatch[1];
    const endPrefix = endMatch[1];

    if (startPrefix.toUpperCase() !== endPrefix.toUpperCase()) {
        throw new Error(`Prefix mismatch: "${startPrefix}" vs "${endPrefix}". Range must share the same prefix.`);
    }

    const startNumStr = startMatch[2];
    const endNumStr = endMatch[2];

    const startNum = parseInt(startNumStr, 10);
    const endNum = parseInt(endNumStr, 10);

    if (isNaN(startNum) || isNaN(endNum)) {
        throw new Error("Invalid number sequence.");
    }

    if (startNum > endNum) {
        throw new Error(`Start number must be <= End number (${s} vs ${e}).`);
    }

    const count = endNum - startNum + 1;
    if (count > maxAllowed) {
        throw new Error(`Range too large (${count} items). Maximum allowed is ${maxAllowed}.`);
    }

    const padLength = Math.max(startNumStr.length, endNumStr.length);

    const generated = [];
    for (let i = startNum; i <= endNum; i++) {
        const paddedNum = String(i).padStart(padLength, '0');
        generated.push(`${startPrefix}${paddedNum}`);
    }

    return generated;
}
