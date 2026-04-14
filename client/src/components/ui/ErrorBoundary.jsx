import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', padding: 32, textAlign: 'center',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, marginBottom: 24,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
          }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#E5E7EB', marginBottom: 10 }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24, maxWidth: 360 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            className="btn btn-primary"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
