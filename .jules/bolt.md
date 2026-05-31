## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-31 - Array Filter optimization vs Readability
**Learning:** While replacing multiple `.filter()` and `.reduce()` calls on arrays inside `useMemo` with a single-pass `for` loop technically reduces the Big-O iteration overhead, it often heavily sacrifices readability and maintainability.
**Action:** Do not replace declarative chained `.filter()` operations with complex, imperative multi-variable loops unless dealing with a proven, severe performance bottleneck (e.g. hundreds of thousands of items) as doing so violates core "do not sacrifice code readability" constraints. Consider React.memo or fixing missing dependency array optimizations instead.
