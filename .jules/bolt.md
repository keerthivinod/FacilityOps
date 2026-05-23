## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2024-05-16 - Consolidation of Multiple Filters in Render State
**Learning:** Found multiple chained `.filter()` operations processing the same large datasets (`P.tickets`, `P.tasks`) to compute derived stats (like counts by status/priority) inside `useMemo` hooks. Although memoized, when dependencies change, this causes O(N*M) operations, executing a full iteration of the array for every metric.
**Action:** Consolidate multiple `.filter()` passes into a single O(N) `for` loop that computes all required metrics at once, extracting data in a single traversal.
