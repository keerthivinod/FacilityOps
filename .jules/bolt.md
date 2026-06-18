## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-16 - Array Filtering Extracted to Reduce
**Learning:** Found multiple `.filter().length` calls inside a `useMemo` block iterating over the same arrays (`P.tickets`, `P.tasks`) in `DashboardModule.jsx`. This caused O(N * M) operations during calculations.
**Action:** Replace multiple filter operations with a single `.reduce()` pass for large arrays inside `useMemo` to prevent multiple traversals and minimize intermediate array allocations.
## 2024-05-19 - Avoid repeated Array.filter().length inside JSX
**Learning:** Found multiple instances where `.filter().length` was called directly inside render maps (e.g., in StaffModule, EscalationModule, VendorsModule). This causes multiple O(N) array traversals on every single render.
**Action:** Replace direct `.filter().length` calls inside JSX loops with a single `useMemo` block using `.reduce()` to calculate all necessary counts in a single O(N) pass, and add clear explanatory comments for these optimizations.

## 2024-05-18 - Avoid array iteration inside render functions when counting status categories
**Learning:** In `MaintenanceModule.jsx`, multiple tabs mapped over an array and called `.filter(x => x.status === t.k).length` to compute counts on every render. Because this occurred inside the JSX return, it turned an O(N) rendering path into O(N * T) (where N is tasks, T is tabs). In a large list of tasks, this repeatedly caused unnecessary CPU burn.
**Action:** Always refactor multiple parallel `.filter().length` checks in render methods into a single `.reduce()` pass. Wrap the `.reduce()` in a `useMemo` hook, then reference the precomputed counts mapping in the JSX map to ensure it runs in O(N) only when the underlying data changes, not on every render.
