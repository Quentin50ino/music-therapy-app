import React from 'react';

const SpotifyPlayer = ({ trackId }) => {
<<<<<<< HEAD
  if (!trackId) return null;

  return (
    <div className="spotify-player-shell">
=======
  const style = {
    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
    width: '90%', maxWidth: '400px', zIndex: 25
  };

  if (!trackId) return null;

  return (
    <div style={style}>
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
      <iframe 
        title="Spotify" 
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`} 
        width="100%" 
        height="80" 
        frameBorder="0" 
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
        loading="lazy" 
<<<<<<< HEAD
        className="spotify-player-frame"
=======
        style={{borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)'}}
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
      ></iframe>
    </div>
  );
};

<<<<<<< HEAD
export default SpotifyPlayer;
=======
export default SpotifyPlayer;
>>>>>>> b59b2208e1e3c44fd5f2eb56e1c0d8b244bb918e
