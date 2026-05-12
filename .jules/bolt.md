## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-16 - Array Method O(N*M) within Render Loop
**Learning:** Encountered `tabs.map` containing `tasks.filter` causing an O(N*M) calculation directly inside the render block. Combined with `search.toLowerCase()` in another `tasks.filter` loop running on every keystroke, this severely strained React rendering.
**Action:** Replace nested loops by computing aggregated stats (`counts`) in a single-pass O(N) loop and caching the results with `useMemo`. When checking filter criteria strings, extract invariant operations like `toLowerCase()` outside the filtering loop. Always cache both using `useMemo` with minimal dependency arrays.
