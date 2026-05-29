## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-29 - O(N) Array Consolidation in React useMemo
**Learning:** React `useMemo` hooks often contain dozens of chained `.filter()` and `.reduce()` operations over the same large prop arrays (like `P.tickets` or `P.tasks`). This triggers a new `O(N)` pass for every calculation, causing massive performance drops on large datasets.
**Action:** Consolidate these multiple passes into single-pass `for` loops inside the `useMemo`. This pattern should be standard practice when deriving multiple metrics from the same large array in React components.
