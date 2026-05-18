## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2024-10-24 - Array Traversal Bottleneck in DashboardModule.jsx
**Learning:** Found a significant pattern of O(N*M) repeated `filter()` and `reduce()` calls inside `useMemo` hooks calculating dashboard metrics from the exact same dataset (`P.tickets`, `P.tasks`, etc). Iterating over an array 12+ times consecutively blocking the main thread when processing potentially large datasets.
**Action:** Always consolidate parallel map/filter/reduce operations across the same dataset into single-pass `for` loops inside `useMemo` to dramatically reduce iteration count from $O(N \cdot M)$ to $O(N)$.
