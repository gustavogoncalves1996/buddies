import { Component } from "react";
import ErrorScreen from "./ErrorScreen";

/**
 * Top-level React error boundary. Catches runtime render errors anywhere in
 * the tree and displays the cozy ErrorScreen ("You are the error, start again!").
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorScreen
          detail={this.state.error?.message}
          onRetry={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}
