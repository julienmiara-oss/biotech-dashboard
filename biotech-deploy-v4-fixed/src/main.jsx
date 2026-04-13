import React from 'react'
import ReactDOM from 'react-dom/client'
import BioTechDashboard from './BioTech_Dashboard.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('Dashboard crash:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'system-ui', maxWidth: 600, margin: '40px auto' }}>
          <h1 style={{ color: '#E74C3C' }}>Erreur de chargement</h1>
          <p style={{ color: '#666' }}>Le tableau de bord a rencontré une erreur. Cela peut être dû à des données sauvegardées incompatibles.</p>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13 }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => this.setState({ hasError: false, error: null })} style={{ marginTop: 16, padding: '10px 20px', background: '#2E5090', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            Réessayer
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BioTechDashboard />
    </ErrorBoundary>
  </React.StrictMode>,
)
