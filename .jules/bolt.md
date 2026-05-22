## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-16 - O(N) Array Filters Consolidations
**Learning:** Found multiple repeated `Array.prototype.filter()` and `Array.prototype.reduce()` calls mapping over the same datasets (like `P.tickets` or `P.tasks`) to compute metrics inside `useMemo` hooks (e.g., in `DashboardModule.jsx`). This leads to doing 10x the work required on re-renders, looping O(N * 10) instead of O(N).
**Action:** Always consolidate multiple array loops targeting the same dataset into a single-pass `for` loop inside `useMemo` hooks to calculate all metrics, variables, and arrays simultaneously.
