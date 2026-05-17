## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2024-11-20 - Array Filtering Repeated Over Multiple Passes Extracted
**Learning:** Found multiple array filtering processes iterating independently over the same list (e.g. `tickets`, `tasks`, `assets`) within `useMemo` in components like `DashboardModule.jsx`. This leads to O(M * N) complexity instead of O(N).
**Action:** Extract repeated iterations into single-pass `for` or `.reduce()` loops, accumulating all necessary metrics into separate variables or a single object.
