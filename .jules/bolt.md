## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2024-05-19 - Consolidate O(N) array filtering in DashboardModule
**Learning:** O(N * M) repeated array filtering using `.filter` or `.reduce` within `useMemo` hooks or React render loops is a common bottleneck in this codebase, especially when the same dataset (e.g. `P.tickets`) is iterated multiple times for different states (open, resolved, high priority, etc).
**Action:** When computing multiple derived states from a large array, consolidate the logic into a single `for` loop pass to avoid redundant iteration and compute.
