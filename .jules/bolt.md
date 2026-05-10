## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-15 - Extracted Invariants Outside Loops
**Learning:** In components like `MaintenanceModule.jsx`, it was found that `.toLowerCase()` string operations were occurring inside O(N) filtering logic.
**Action:** Lift `.toLowerCase()` and equivalent invariants outside `useMemo` filter loops to save computation cycles.
