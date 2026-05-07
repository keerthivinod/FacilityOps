"use client";
// Central React Context for FacilityOps app state.
// Components can read state via useApp() instead of receiving it through P props.
// The Layout in page.jsx still builds the P object for legacy components;
// this context is the forward-compatible layer for any new components.
import { createContext, useContext } from "react";

export const AppContext = createContext(null);

/**
 * Access the full app state from any component in the tree.
 * Must be used inside <AppContext.Provider> (provided by Layout in page.jsx).
 *
 * @returns {object} The same P object passed to all modules
 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside the AppContext.Provider");
  return ctx;
}
