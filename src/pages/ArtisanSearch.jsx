import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { searchArtisans, createServiceRequest } from '../services/api';

function ArtisanSearch() {
  const { user } = useAuth();
  const [artisans, setArtisans] = useState([]);
  const [skill, setSkill] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await searchArtisans({ skill, includeNearby: false });
      setArtisans(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleHire = async (artisanId) => {
    try {
      await createServiceRequest({
        category: skill,
        description: `I need a ${skill} for urgent repair`,
        location: 'Agbowo',
        budget: 2000,
      });
      alert('Request sent! The artisan will contact you.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create request');
    }
  };

  return (
    <div>
      <h2>Find {user?.school} Artisans</h2>
      <input 
        placeholder="Skill (plumbing, electrical...)" 
        value={skill} 
        onChange={(e) => setSkill(e.target.value)} 
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {artisans.map((artisan) => (
        <div key={artisan.id}>
          <h3>{artisan.name}</h3>
          <p>⭐ {artisan.rating} ({artisan.reviewCount} reviews)</p>
          <p>📍 {artisan.location}</p>
          <p>🔧 {artisan.skills.join(', ')}</p>
          <button onClick={() => handleHire(artisan.id)}>Hire</button>
        </div>
        
<button className="bg-[var(--color-primary)] text-white rounded-lg px-4 py-2">
  Find Artisans
</button>

<span className="text-[var(--color-accent)]">PADI</span>

      ))}
    </div>
  );
}

export default ArtisanSearch;