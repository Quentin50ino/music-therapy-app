import React from 'react';

const SpotifyPlayer = ({ trackId }) => {
  if (!trackId) return null;

  return (
    <div className="spotify-player-shell">
      <iframe 
        title="Spotify" 
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`} 
        width="100%" 
        height="80" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy" 
        className="spotify-player-frame"
      ></iframe>
    </div>
  );
};

export default SpotifyPlayer;
