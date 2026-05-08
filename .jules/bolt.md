## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2026-05-08 - Expensive Date Parsing in Render Body
**Learning:** Re-computing expensive variables derived from arrays (like parsing dates inside .filter()) directly inside the component body can cause O(N) re-computations for unrelated state changes (like input typing).
**Action:** Memoize expensive array operations and derivations using `useMemo` and extract them outside of component render if possible.
