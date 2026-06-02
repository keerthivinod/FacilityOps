## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2025-05-18 - Single-Pass O(N) Array Operations in Client Render

**Learning:** Repeated array filtering inside client-side renders (like the `buildContext` and `generateLocalResponse` functions in `AIBrainModule.jsx`) can cause severe performance bottlenecks on large data sets because each `.filter()` or `.reduce()` creates a new array and makes a full pass over the source array.

**Action:** Consolidate these multiple passes into single-pass `for` loops wherever arrays are filtered by different conditions. This optimization takes execution time from O(N*M) to O(N) and significantly reduces allocations.
