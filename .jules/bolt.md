## 2024-05-15 - Array Filtering Extracted Invariants
**Learning:** Found string operations like `.toLowerCase()` inside `Array.prototype.filter()` loops checking for matches. In components like `AssetsModule.jsx`, this resulted in executing O(N) operations inside O(N) loops during re-renders.
**Action:** Extract loop invariants (`search.toLowerCase()`) out of the filter callback and wrap the filtered list in `useMemo` to prevent re-computation on unrelated state changes.
## 2024-05-16 - Array Filtering Extracted to Reduce
**Learning:** Found multiple `.filter().length` calls inside a `useMemo` block iterating over the same arrays (`P.tickets`, `P.tasks`) in `DashboardModule.jsx`. This caused O(N * M) operations during calculations.
**Action:** Replace multiple filter operations with a single `.reduce()` pass for large arrays inside `useMemo` to prevent multiple traversals and minimize intermediate array allocations.
## 2024-05-19 - Avoid repeated Array.filter().length inside JSX
**Learning:** Found multiple instances where `.filter().length` was called directly inside render maps (e.g., in StaffModule, EscalationModule, VendorsModule). This causes multiple O(N) array traversals on every single render.
**Action:** Replace direct `.filter().length` calls inside JSX loops with a single `useMemo` block using `.reduce()` to calculate all necessary counts in a single O(N) pass, and add clear explanatory comments for these optimizations.
## 2024-05-20 - Avoid repeated Array.filter().length inside JSX (Part 2)
**Learning:** Found multiple instances where `.filter(n => !n.read).length` was called directly inside render maps in `src/app/page.jsx`, triggering multiple O(N) evaluations of the array on every re-render. Also found overlapping `P.tickets.filter` calls iterating repeatedly over large arrays in `src/components/AIBrainModule.jsx`.
**Action:** Replace inline `.filter()` counts with `useMemo` blocks and condense overlapping array filtering over the same array into a single `.reduce()` pass.
## 2024-05-20 - Avoid array spread operator in reduce
**Learning:** Found that using the spread operator inside a `.reduce()` loop (`[...acc, item]`) is a performance anti-pattern. It degrades an O(N) operation to O(N²) because it creates a new array and copies all existing elements on every match.
**Action:** When extracting arrays, use native `.filter()` for simple checks, or use `.push()` with a mutable accumulator inside `.reduce()` when doing multiple extractions in a single pass. Never use the spread operator in a reduce accumulator.
