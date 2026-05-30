## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-30 - O(N) optimizations in DashboardModule useMemo hook
**Learning:** O(N) array filtering operations are often repeated on large arrays in useMemo hooks (e.g. 10 passes over the same dataset for different metrics).
**Action:** Consolidate these multiple `.filter()` and `.reduce()` chains into single-pass `for` loops across the arrays to drastically improve performance from O(N*M) to O(N).
