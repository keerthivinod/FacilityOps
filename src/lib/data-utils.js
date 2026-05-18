export function generateQRCodeGrid(data) {
    const h = data.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
    const cells = [];
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            if (((h * (x + 1) * (y + 1)) % 3) !== 0 || (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5)) {
                cells.push({ x, y });
            }
        }
    }
    return cells;
}
