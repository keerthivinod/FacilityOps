## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-16 - Array Filtering Extracted to Reduce
**Learning:** Found multiple `.filter().length` calls inside a `useMemo` block iterating over the same arrays (`P.tickets`, `P.tasks`) in `DashboardModule.jsx`. This caused O(N * M) operations during calculations.
**Action:** Replace multiple filter operations with a single `.reduce()` pass for large arrays inside `useMemo` to prevent multiple traversals and minimize intermediate array allocations.
## 2024-05-19 - Avoid repeated Array.filter().length inside JSX
**Learning:** Found multiple instances where `.filter().length` was called directly inside render maps (e.g., in StaffModule, EscalationModule, VendorsModule). This causes multiple O(N) array traversals on every single render.
**Action:** Replace direct `.filter().length` calls inside JSX loops with a single `useMemo` block using `.reduce()` to calculate all necessary counts in a single O(N) pass, and add clear explanatory comments for these optimizations.
## 2024-05-19 - Extracted repetitive `.filter().length` within `.map()` functions
**Learning:** In components rendering filtered arrays iteratively using `.map()` (e.g. `src/components/ProjectsModule.jsx`, `src/components/MaintenanceModule.jsx`), repeated `.filter().length` operations nested inside the map loop compute counts multiple times (time complexity O(N*M), where M is the number of tabs/categories mapped over and N is items array). This is computationally wasteful during renders.
**Action:** Lift the array traversal up above the loop with a single `.reduce()` that tallies counts for all statuses wrapped inside `useMemo()`. Read the pre-calculated mapped counts inside the `.map()` loop (O(N+M)), heavily saving execution time during re-renders. Ensure components use exact matches where required and fallbacks for unknown categories (e.g., `(projectCounts[v] || 0)`).
