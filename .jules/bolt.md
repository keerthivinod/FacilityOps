## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-16 - Repeated Array Filtering Anti-Pattern
**Learning:** Performing multiple `.filter()` passes on the same large array (e.g., getting total length, resolved count, and TAT sums inside `ReportsModule.jsx`) results in multiple O(N) operations inside render bodies or hooks.
**Action:** Consolidate multiple passes over the same dataset into a single `for` loop that accumulates multiple counts and sums simultaneously to prevent redundant array traversals.
