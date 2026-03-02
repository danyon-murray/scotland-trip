export function Stars({ rating, onChange }) {
  return (
    <span style={{display:'flex',gap:3}}>
      {[1,2,3,4,5].map(s => (
        <span key={s} onClick={() => onChange(s)}
          style={{cursor:'pointer',fontSize:'1rem',color: rating >= s ? '#e6a817' : '#d4c4a0',
            padding:'0.1rem', lineHeight:1}}>★</span>
      ))}
    </span>
  );
}
