"use client";
import { Component } from "react";

// Catches JavaScript errors thrown inside any child component tree.
// Must be a class component — React only supports componentDidCatch in classes.
// Usage: <ErrorBoundary><SomeModule /></ErrorBoundary>
// key={activePage} on the boundary resets it automatically when the user navigates away.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  componentDidCatch(error, info) {
    console.error("Module error:", error, info.componentStack);
  }

  reset() {
    this.setState({ hasError: false, message: "" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          margin: "24px 0",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 16,
          padding: 24,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#dc2626", marginBottom: 6 }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 12, color: "#991b1b", marginBottom: 16, fontFamily: "monospace", background: "#fee2e2", padding: "8px 12px", borderRadius: 8, wordBreak: "break-word" }}>
            {this.state.message}
          </div>
          <button
            onClick={() => this.reset()}
            style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
