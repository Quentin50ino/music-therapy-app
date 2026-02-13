import React from 'react';
import { BsChatDotsFill } from 'react-icons/bs';

const Fab = ({ onClick }) => {
  const style = {
    position: 'absolute', bottom: '30px', right: '30px',
    width: '60px', height: '60px', borderRadius: '50%',
    backgroundColor: '#4da6ff', color: 'white', border: 'none',
    boxShadow: '0 4px 15px rgba(77, 166, 255, 0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: 30, transition: 'transform 0.2s',
    fontSize: '1.5rem'
  };

  return (
    <button style={style} onClick={onClick}>
      <BsChatDotsFill />
    </button>
  );
};

export default Fab;