import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1C1917] flex items-center justify-center px-6">
          <div className="text-center max-w-[320px]">
            <h1 className="font-serif text-[22px] font-semibold text-[#E8E0D4] mb-2">
              Something went wrong
            </h1>
            <p className="text-[13px] text-[#7A6F63] mb-6">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-[#E7C76A] text-[#1C1917] text-sm font-bold tracking-wide hover:bg-[#EDD07E] transition-colors shadow-[0_0_16px_rgba(231,199,106,0.2)]"
            >
              Refresh
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
