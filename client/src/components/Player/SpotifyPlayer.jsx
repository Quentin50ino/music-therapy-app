import React from 'react';

const SpotifyPlayer = ({ trackId }) => {
  const style = {
    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
    width: '90%', maxWidth: '400px', zIndex: 25
  };

  if (!trackId) return null;

  return (
    <div style={style}>
      <iframe 
        title="Spotify" 
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`} 
        width="100%" 
        height="80" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy" 
        style={{borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)'}}
      ></iframe>
    </div>
  );
};

export default SpotifyPlayer;