## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-15 - Dashboard Analytics Repeated Arrays Filter
**Learning:** In `DashboardModule.jsx`, numerous derived states (`openT`, `inProgress`, `resolved`, `criticalT`, etc.) were computed using 16 separate `Array.prototype.filter()` and `.reduce()` passes over the same dataset (e.g., `P.tickets`, `P.tasks`). This caused an $O(k \cdot N)$ operation (where $k$ is the number of metrics) inside `useMemo`. For large lists of tickets/tasks, these repeated traversals create a notable CPU bottleneck.
**Action:** Consolidate multiple derived metrics into a single $O(N)$ `for` loop traversal. Group the counts and aggregations inside a single pass to eliminate redundant array iterations.
