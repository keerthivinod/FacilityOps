## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-17 - Redundant O(N) Array Passes in useMemo
**Learning:** React functional components in this codebase (like `DashboardModule.jsx`) frequently execute 10-15 separate `.filter()` passes over the same large data arrays (like `tickets`, `tasks`) directly inside `useMemo` hooks to compute derived statistics. This causes unnecessary multi-pass iterations that scale poorly.
**Action:** Always consolidate multiple array `.filter()`/`.reduce()` calls on the same dataset into a single imperative `for` loop that computes all required derived metrics concurrently in one O(N) pass.
