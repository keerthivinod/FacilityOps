## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2024-05-17 - Consolidating Repeated Array Filters
**Learning:** In data-heavy UI components (like `DashboardModule` and `ReportsModule`), running multiple O(N) `Array.prototype.filter()` and `reduce()` calls sequentially inside a `useMemo` block creates significant overhead, especially for large datasets.
**Action:** Replace multiple sequential filtering passes with a single `for` loop that computes all required statistics simultaneously. This drastically reduces array traversals (from O(N*k) to O(N)) and prevents CPU bottlenecks during re-renders.
