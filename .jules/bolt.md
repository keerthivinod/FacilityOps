## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2024-05-16 - Asset History O(N) Scan Check
**Learning:** Repeatedly filtering a large array (like `scanLogs`) by a specific ID inside a component render path creates an O(N) bottleneck per call. For many calls or large datasets, this becomes highly inefficient.
**Action:** Create a lookup map keyed by the target ID using `useMemo` to group the logs. This converts the O(N) scan into an O(1) lookup after a one-time O(N) map construction whenever the source data changes.
