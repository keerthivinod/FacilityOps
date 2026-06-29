## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-16 - Array Filtering Extracted to Reduce
**Learning:** Found multiple `.filter().length` calls inside a `useMemo` block iterating over the same arrays (`P.tickets`, `P.tasks`) in `DashboardModule.jsx`. This caused O(N * M) operations during calculations.
**Action:** Replace multiple filter operations with a single `.reduce()` pass for large arrays inside `useMemo` to prevent multiple traversals and minimize intermediate array allocations.
## 2024-05-19 - Avoid repeated Array.filter().length inside JSX
**Learning:** Found multiple instances where `.filter().length` was called directly inside render maps (e.g., in StaffModule, EscalationModule, VendorsModule). This causes multiple O(N) array traversals on every single render.
**Action:** Replace direct `.filter().length` calls inside JSX loops with a single `useMemo` block using `.reduce()` to calculate all necessary counts in a single O(N) pass, and add clear explanatory comments for these optimizations.
## 2025-02-14 - Replace O(N) array filtering in components with O(1) property lookup
**Learning:** Found `.filter().length` calls nested in JSX maps inside various modules (`DashboardModule`, `ProjectsModule`, `MaintenanceModule`, `ReportsModule`, `page.jsx`). This caused the application to iterate over the entire array for each mapped component on every re-render.
**Action:** Created `useMemo` hooks to pre-calculate all element counts using `.reduce` which computes all statistics in a single `O(N)` pass instead of `O(N*M)` traversals. Replaced nested JSX `.filter` logic with `O(1)` object lookup to the newly computed property.
