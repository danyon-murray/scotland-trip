import { useIsMobile } from "../hooks/useIsMobile";

export function TabBar({ tabs, active, onChange }) {
  const isMobile = useIsMobile();
  return (
    <div style={{display:'flex',gap:0,borderBottom:'2px solid #e8ddd0',marginBottom:'1.2rem',overflowX:'auto',paddingBottom:0}}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{
            border:'none',cursor:'pointer',
            padding: isMobile ? '0.75rem 0.85rem' : '0.6rem 1.1rem',
            fontSize: isMobile ? '0.78rem' : '0.82rem',
            fontWeight:600,letterSpacing:'0.03em',whiteSpace:'nowrap',
            borderBottom: active === t.id ? '2px solid #8a6a3a' : '2px solid transparent',
            color: active === t.id ? '#5a3e1b' : '#9a8a78',
            background: active === t.id ? 'rgba(138,106,58,0.13)' : 'none',
            borderRadius: active === t.id ? '6px 6px 0 0' : 0,
            marginBottom:-2,transition:'color 0.15s, background 0.15s',
            flex: isMobile ? '1 0 auto' : 'none',
          }}>
          {t.icon}{isMobile ? '' : ` ${t.label}`}
          {isMobile && <div style={{fontSize:'0.6rem',marginTop:2,fontWeight:500}}>{t.label}</div>}
        </button>
      ))}
    </div>
  );
}
