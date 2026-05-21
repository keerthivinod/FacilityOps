## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-22 - O(N) Multi-pass Filter Elimination inside useMemo
**Learning:** Found multiple instances where large arrays (like tickets, tasks, assets) were iterated over numerous times using chained `.filter()` and `.reduce()` operations inside React component `useMemo` hooks. This resulted in O(M * N) complexity (where M is the number of filters) on every re-computation.
**Action:** Refactor multiple `.filter()` and `.reduce()` operations on the same array into a single-pass `for` loop to achieve O(N) time complexity, saving ~70-80% execution time as measured in standalone Node.js scripts.
