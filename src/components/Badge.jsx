export function Badge({ label, color, bg }) {
  return (
    <span style={{fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',
      padding:'0.15rem 0.45rem',borderRadius:3,background:bg,color}}>
      {label}
    </span>
  );
}
