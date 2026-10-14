/**
 * Expands a sequential range of IDs, preserving prefix and zero-padding.
 * Example: ("SB00100", "SB00114") -> ["SB00100", "SB00101", ..., "SB00114"]
 * Example: ("M00200", "M00227") -> ["M00200", ..., "M00227"]
 */
function expandSequentialRange(startId, endId, maxAllowed = 1000) {
    if (!startId || !endId) {
        throw new Error("Both start and end IDs are required for range expansion.");
    }

    const s = startId.trim();
    const e = endId.trim();

    // Match leading non-digits (prefix) and trailing digits (number)
    const startMatch = s.match(/^([A-Za-z_-]*)(\d+)$/);
    const endMatch = e.match(/^([A-Za-z_-]*)(\d+)$/);

    if (!startMatch || !endMatch) {
        throw new Error(`IDs must end with numeric sequences (e.g., SB00100, M00200). Received: "${s}" and "${e}"`);
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
        throw new Error("Invalid numeric sequence in range.");
    }

    if (startNum > endNum) {
        throw new Error(`Start ID (${s}) must be less than or equal to End ID (${e}).`);
    }

    const count = endNum - startNum + 1;
    if (count > maxAllowed) {
        throw new Error(`Range span (${count}) exceeds maximum allowed of ${maxAllowed}.`);
    }

    // Determine padding length from the original string
    const padLength = Math.max(startNumStr.length, endNumStr.length);

    const generated = [];
    for (let i = startNum; i <= endNum; i++) {
        const paddedNum = String(i).padStart(padLength, '0');
        generated.push(`${startPrefix}${paddedNum}`);
    }

    return generated;
}

module.exports = { expandSequentialRange };
