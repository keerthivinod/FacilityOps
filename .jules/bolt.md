## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2024-11-20 - Memoization Hook Bottleneck
**Learning:** Found significant CPU bottleneck inside `useMemo` hooks of large components (like `DashboardModule.jsx`) performing over 15 repeated O(N) array `.filter()` and `.reduce()` operations over the exact same large arrays (`P.tickets`, `P.tasks`). This unnecessarily scaled up computation complexity.
**Action:** Consolidate multiple iterative array methods inside hooks or render bodies into a single-pass loop (e.g. `for` loop) mapping states correctly to avoid iterating over same data sets over and over again.
