## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.

## 2024-05-18 - AIBrainModule Local Response Generation Bottleneck
**Learning:** `generateLocalResponse` inside `src/components/AIBrainModule.jsx` performed multiple O(N) `.filter()`, `.map()`, and `.reduce()` operations on arrays like `P.tickets` and `P.vendors` independently.
**Action:** Consolidated iteration into single `for` loops across the respective arrays to construct filtered lists and aggregates simultaneously, vastly improving execution time for this heavily utilized function.
