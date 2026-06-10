import { useState } from 'react'

function App() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      setShortUrl(data.shortUrl);
      setOriginalUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Helvetica, sans-serif', maxWidth: '600px', margin: '100px auto', textAlign: 'center' }}>
      <h1 style={{ color: '#2d3436' }}>Link Shortener</h1>
      <p style={{ color: '#636e72', marginBottom: '30px' }}>A full-stack URL shortening service with redirect routing and PostgreSQL</p>
      
      <form onSubmit={handleShorten} style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Paste your long URL here..."
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
          style={{ width: '70%', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#0984e3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>

      {error && <p style={{ color: '#d63031', marginTop: '20px' }}>{error}</p>}

      {shortUrl && (
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#0984e3' }}>Success! Here is your short link:</h3>
          <a href={shortUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '20px', fontWeight: 'bold', color: '#2d3436' }}>
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  )
}

export default App