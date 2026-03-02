import { REGION_COLORS } from "../../data/constants";
import { Badge } from "../../components/Badge";

export function DayCard({ day, isActive, onClick }) {
  const rc = REGION_COLORS[day.region] || REGION_COLORS.travel;
  return (
    <div onClick={onClick} style={{
      border: `2px solid ${isActive ? rc.badge : '#e8ddd0'}`,
      borderRadius:8, padding:'0.9rem 1.1rem', marginBottom:'0.6rem',
      background: isActive ? rc.bg : '#fdfaf6', cursor:'pointer',
      transition:'all 0.15s',
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'0.5rem'}}>
        <div>
          <span style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.08em',color:rc.accent,textTransform:'uppercase'}}>{day.num}</span>
          <div style={{fontSize:'0.88rem',fontWeight:600,color:'#3a2a1a',marginTop:2}}>{day.summary}</div>
          <div style={{fontSize:'0.7rem',color:'#9a8870',marginTop:2}}>{day.date}</div>
        </div>
        {day.options && <Badge label="Flexible" color={rc.accent} bg={rc.bg} />}
      </div>
    </div>
  );
}
