import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Top-level fallback for unexpected render/effect errors — without this, a
 * thrown error anywhere in the tree unmounts everything and leaves a blank
 * page. Deliberately plain (no i18n/router dependency): the crash it's
 * catching may have come from either of those.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console -- componentDidCatch's documented purpose
    console.error('Unhandled error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">Something went wrong</h1>
          <p className="text-sm text-ink-muted mb-6">
            Please refresh the page. If the problem keeps happening, try again in a few minutes.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-terra text-white rounded-lg text-sm font-medium hover:bg-terra-dark transition-all"
          >
            Back to home
          </a>
        </div>
      </div>
    )
  }
}
