## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2026-05-24 - Array Filtering Extracted Invariants in Render Loops
**Learning:** Repeated calls to `.filter().length` inside component map loops during render cause massive performance bottlenecks. In `TicketsModule.jsx`, executing `tickets.filter()` repeatedly inside the render loop for the filter buttons mapped array caused an O(N^2) explosion during frequent rerenders.
**Action:** Use a single `for` loop wrapped in `useMemo` to iterate through the data array once, performing all filtering and counting simultaneously. Save the resulting subsets and counts to variables and reference those variables in the render block instead.
