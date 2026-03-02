import { useState } from "react";

export function DeleteButton({ onDelete, style = {} }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',...style}}>
        <span style={{fontSize:'0.7rem',color:'#c4a0a0'}}>Delete?</span>
        <button onClick={onDelete}
          style={{background:'#c4a0a0',border:'none',color:'#fff',cursor:'pointer',
            fontSize:'0.7rem',fontWeight:700,borderRadius:3,padding:'0.1rem 0.35rem',lineHeight:1.4}}>
          Yes
        </button>
        <button onClick={() => setConfirming(false)}
          style={{background:'none',border:'none',color:'#9a8870',cursor:'pointer',
            fontSize:'0.7rem',fontWeight:600,padding:'0.1rem 0.2rem',lineHeight:1.4}}>
          No
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirming(true)}
      style={{background:'none',border:'none',color:'#c4a0a0',cursor:'pointer',
        fontSize:'0.9rem',padding:'0 0.1rem',lineHeight:1,...style}}>
      ✕
    </button>
  );
}
