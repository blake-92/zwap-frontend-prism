import { Component } from 'react'
import i18n from '@/i18n'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
          <p className="text-lg font-medium">{i18n.t('errors.somethingWrong')}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#561BAF] transition-colors"
          >
            {i18n.t('errors.retry')}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
