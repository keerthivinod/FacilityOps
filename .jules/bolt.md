## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-16 - Array Filtering Extracted to Reduce
**Learning:** Found multiple `.filter().length` calls inside a `useMemo` block iterating over the same arrays (`P.tickets`, `P.tasks`) in `DashboardModule.jsx`. This caused O(N * M) operations during calculations.
**Action:** Replace multiple filter operations with a single `.reduce()` pass for large arrays inside `useMemo` to prevent multiple traversals and minimize intermediate array allocations.
## 2024-05-19 - Avoid repeated Array.filter().length inside JSX
**Learning:** Found multiple instances where `.filter().length` was called directly inside render maps (e.g., in StaffModule, EscalationModule, VendorsModule). This causes multiple O(N) array traversals on every single render.
**Action:** Replace direct `.filter().length` calls inside JSX loops with a single `useMemo` block using `.reduce()` to calculate all necessary counts in a single O(N) pass, and add clear explanatory comments for these optimizations.
## 2024-05-18 - Repeated .filter().length Operations in Component Renders
**Learning:** In React components like `DashboardModule.jsx`, `AIBrainModule.jsx`, and `ReportsModule.jsx`, there were multiple `Array.prototype.filter().length` calls inside `useMemo` hooks or during rendering for stats tracking (e.g., ticket counts by priority, overdue tasks, resolved tickets). This caused unnecessary multiple passes over the same data structures (O(N) operations per criteria instead of a single pass).
**Action:** Replace sequential `.filter()` extractions with a single `Array.prototype.reduce()` pass to gather all required metrics simultaneously, storing counts or arrays in an accumulator object. This reduces the number of full array traversals significantly.
