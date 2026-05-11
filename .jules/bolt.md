## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2025-02-12 - Form Keystrokes Triggering O(N) Array Operations
**Learning:** Found that unmemoized array filtering operations directly inside components with local form state (like `TicketsModule.jsx` capturing input on every keystroke) cause severe performance degradation by running multiple O(N) operations on each keystroke's re-render.
**Action:** Extract inline `.filter().length` count calculations into single-pass aggregate loops and wrap them in `useMemo` so they only recalculate when the underlying data changes, not when unrelated local form state updates.
