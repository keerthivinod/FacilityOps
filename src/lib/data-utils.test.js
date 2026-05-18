import { test } from 'node:test';
import assert from 'node:assert';
import { generateQRCodeGrid } from './data-utils.js';

test('generateQRCodeGrid - general structure and determinism', () => {
    const data1 = "Asset-123";
    const data2 = "Asset-123";
    const data3 = "Different-Asset";

    const grid1 = generateQRCodeGrid(data1);
    const grid2 = generateQRCodeGrid(data2);
    const grid3 = generateQRCodeGrid(data3);

    // Assert it returns an array
    assert.ok(Array.isArray(grid1));

    // Assert determinism
    assert.deepStrictEqual(grid1, grid2, "Same string should generate the same grid");

    // Assert differing strings result in different grids (highly probable with hashing, but not guaranteed 100% of the time,
    // though the provided strings should result in different grids). We'll test length and first element if lengths differ.
    // However, it's safer to just ensure they're not deeply equal to prevent flaky tests in edge cases where lengths happen to match.
    assert.notDeepStrictEqual(grid1, grid3, "Different strings should generate different grids");
});

test('generateQRCodeGrid - anchor blocks are always present', () => {
    // The anchor blocks correspond to these coordinates regardless of the string:
    // Top-Left: (x < 3 && y < 3)
    // Top-Right: (x > 5 && y < 3)
    // Bottom-Left: (x < 3 && y > 5)

    const randomStrings = ["A", "TestString123", "https://example.com/asset/123", "!@#$%^&*()"];

    for (const str of randomStrings) {
        const grid = generateQRCodeGrid(str);

        const hasCell = (grid, tx, ty) => grid.some(({ x, y }) => x === tx && y === ty);

        // Top-Left anchor
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                assert.ok(hasCell(grid, x, y), `Expected top-left anchor cell at (${x}, ${y}) for "${str}"`);
            }
        }

        // Top-Right anchor
        for (let y = 0; y < 3; y++) {
            for (let x = 6; x < 9; x++) {
                assert.ok(hasCell(grid, x, y), `Expected top-right anchor cell at (${x}, ${y}) for "${str}"`);
            }
        }

        // Bottom-Left anchor
        for (let y = 6; y < 9; y++) {
            for (let x = 0; x < 3; x++) {
                assert.ok(hasCell(grid, x, y), `Expected bottom-left anchor cell at (${x}, ${y}) for "${str}"`);
            }
        }
    }
});

test('generateQRCodeGrid - grid boundaries', () => {
    const grid = generateQRCodeGrid("Test Boundaries");
    for (const { x, y } of grid) {
        assert.ok(x >= 0 && x < 9, `X coordinate out of bounds: ${x}`);
        assert.ok(y >= 0 && y < 9, `Y coordinate out of bounds: ${y}`);
    }
});
