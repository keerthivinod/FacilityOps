## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2024-05-15 - DashboardModule Array Filtering Bottleneck
**Learning:** Found multiple repeated `Array.prototype.filter()` and `Array.prototype.reduce()` calls inside `useMemo` blocks in `DashboardModule.jsx`, causing $O(N * 16)$ time complexity on every prop change. This specific codebase pattern of chaining/repeating `.filter().length` for counts is highly inefficient for large data sets.
**Action:** Consolidate these multiple passes into single-pass `for` loops within the `useMemo` block. This reduces time complexity to $O(N)$ and execution time from ~2.7s to ~0.5s (measured with Node.js on 100k items).
