import React, { useEffect, useState } from 'react'

export default function App() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(import.meta.env.VITE_AUTH_URL || 'http://localhost:3001/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(err => setError(String(err)))
  }, [])

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>E-commerce Web</h1>
      <p>Auth health:</p>
      <pre>{health ? JSON.stringify(health, null, 2) : error || 'Loading...'}</pre>
    </div>
  )
}
