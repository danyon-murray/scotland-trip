import { useState } from "react";
import { Stars } from "../../components/Stars";
import { useIsMobile } from "../../hooks/useIsMobile";
import { DeleteButton } from "../../components/DeleteButton";

const inputStyle = {
  padding:'0.35rem 0.6rem',border:'1px solid #d4c4a0',borderRadius:5,
  fontSize:'0.82rem',background:'#fdfaf6',width:'100%',boxSizing:'border-box',
};

const VOTER_COLORS = ['#e07b39','#4a8fa8','#6a8a4a','#7c3aed','#c4404a','#3a7a5a','#a06030','#1d6fa8'];

function VoteBar({ votes = {}, user, onVote }) {
  const hasVoted = votes[user] === true;
  const voters = Object.entries(votes).filter(([, v]) => v).map(([u]) => u);
  return (
    <div style={{display:'flex',alignItems:'center',gap:'0.3rem'}}>
      <button onClick={() => onVote && onVote(!hasVoted)}
        style={{background:'none',border:'none',cursor:'pointer',padding:'0 0.1rem',
          fontSize:'0.95rem',lineHeight:1,opacity: hasVoted ? 1 : 0.35}}>
        ❤️
      </button>
      {voters.map((u, i) => (
        <span key={u} title={u} style={{
          width:18,height:18,borderRadius:'50%',display:'inline-flex',alignItems:'center',
          justifyContent:'center',fontSize:'0.58rem',fontWeight:700,color:'#fff',flexShrink:0,
          background: VOTER_COLORS[i % VOTER_COLORS.length],
          border: u === user ? '2px solid #3a2a1a' : '2px solid transparent',
        }}>
          {u[0].toUpperCase()}
        </span>
      ))}
    </div>
  );
}

export function PlaceRow({ place, user, onRate, onVisit, onRemove, onUpdate, onVote, onAddAsEvent }) {
  const isMobile = useIsMobile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: place.name, type: place.type,
    cost: place.cost || '', url: place.url || '', notes: place.notes || '' });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) return;
    onUpdate({ name: form.name.trim(), type: form.type, cost: form.cost.trim(),
      url: form.url.trim(), notes: form.notes.trim() });
    setEditing(false);
  };

  const cancel = () => {
    setForm({ name: place.name, type: place.type, cost: place.cost || '',
      url: place.url || '', notes: place.notes || '' });
    setEditing(false);
  };

  const isFood = place.type === 'food';
  const dotColor = isFood ? '#7c3aed' : '#1d6fa8';
  const bgColor  = isFood ? 'rgba(124,58,237,0.07)' : 'rgba(29,111,168,0.07)';
  const borderColor = isFood ? 'rgba(124,58,237,0.35)' : 'rgba(29,111,168,0.35)';

  if (editing) {
    return (
      <div style={{padding:'0.75rem',borderRadius:4,marginBottom:'0.35rem',
        background:'#f5ede0',borderLeft:`3px solid ${borderColor}`,border:'1px solid #d4c4a0'}}>
        <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.4rem'}}>
          <div style={{flex:'2 1 160px',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
            <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Name *</span>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              autoFocus style={inputStyle} />
          </div>
          <div style={{flex:'1 1 120px',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
            <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Type</span>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              style={{...inputStyle,color:'#3a2a1a'}}>
              <option value="attraction">🌍 Attraction</option>
              <option value="food">🍽 Eat & Drink</option>
            </select>
          </div>
        </div>
        <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.4rem'}}>
          <div style={{flex:'1 1 100px',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
            <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Cost</span>
            <input value={form.cost} onChange={e => set('cost', e.target.value)} style={inputStyle} />
          </div>
          <div style={{flex:'2 1 160px',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
            <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>URL</span>
            <input value={form.url} onChange={e => set('url', e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'0.15rem',marginBottom:'0.4rem'}}>
          <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Notes</span>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
            rows={2} style={{...inputStyle,resize:'vertical',fontFamily:'inherit'}} />
        </div>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button onClick={save}
            style={{padding:'0.35rem 0.85rem',background:'#8a6a3a',color:'#fff',border:'none',
              borderRadius:5,fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>
            Save
          </button>
          <button onClick={cancel}
            style={{padding:'0.35rem 0.75rem',background:'none',border:'1px solid #d4c4a0',
              borderRadius:5,fontSize:'0.82rem',color:'#9a8870',cursor:'pointer'}}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: isMobile ? '0.6rem 0.7rem' : '0.55rem 0.7rem',
      borderRadius:4,marginBottom:'0.35rem',background:bgColor,
      borderLeft:`3px solid ${borderColor}`,
    }}>
      <div style={{display:'flex',alignItems:'flex-start',gap:'0.6rem'}}>
        <div style={{width:9,height:9,borderRadius:'50%',background:dotColor,flexShrink:0,marginTop:4}} />
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
            <span style={{fontSize: isMobile ? '0.9rem' : '0.88rem',fontWeight:600,color:'#3a2a1a'}}>
              {place.name}
            </span>
            {place.url && (
              <a href={place.url} target="_blank" rel="noopener noreferrer"
                style={{fontSize:'0.65rem',color:'#8a6a3a',border:'1px solid #c4a96e',
                  borderRadius:2,padding:'0.1rem 0.35rem',textDecoration:'none',whiteSpace:'nowrap'}}>
                ↗ Link
              </a>
            )}
          </div>
          {place.notes && <div style={{fontSize:'0.74rem',color:'#9a8870',marginTop:2,lineHeight:1.45,whiteSpace:'pre-wrap'}}>{place.notes}</div>}
          {isMobile && (
            <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginTop:'0.4rem',flexWrap:'wrap'}}>
              {place.cost && (
                <span style={{fontSize:'0.72rem',fontWeight:500,color:'#6a8a4a',
                  background:'#f0f4ea',borderRadius:2,padding:'0.15rem 0.4rem'}}>
                  {place.cost}
                </span>
              )}
              <VoteBar votes={place.votes} user={user} onVote={onVote} />
              <div style={{display:'flex',gap:'0.4rem',marginLeft:'auto',alignItems:'center'}}>
                {onAddAsEvent && (
                  <button onClick={onAddAsEvent}
                    style={{fontSize:'0.68rem',background:'none',border:'1px solid #c4a96e',borderRadius:4,
                      padding:'0.15rem 0.45rem',color:'#8a6a3a',cursor:'pointer',fontWeight:600,whiteSpace:'nowrap'}}>
                    + event
                  </button>
                )}
                <button onClick={() => setEditing(true)}
                  style={{background:'none',border:'none',color:'#9a8870',cursor:'pointer',
                    fontSize:'0.85rem',padding:0,lineHeight:1}}>✏️</button>
                {onRemove && <DeleteButton onDelete={onRemove} />}
              </div>
            </div>
          )}
        </div>
        {!isMobile && (
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexShrink:0}}>
            {place.cost && (
              <span style={{fontSize:'0.7rem',fontWeight:500,color:'#6a8a4a',
                background:'#f0f4ea',borderRadius:2,padding:'0.1rem 0.4rem',whiteSpace:'nowrap'}}>
                {place.cost}
              </span>
            )}
            <VoteBar votes={place.votes} user={user} onVote={onVote} />
            {onAddAsEvent && (
              <button onClick={onAddAsEvent}
                style={{fontSize:'0.68rem',background:'none',border:'1px solid #c4a96e',borderRadius:4,
                  padding:'0.15rem 0.45rem',color:'#8a6a3a',cursor:'pointer',fontWeight:600,whiteSpace:'nowrap'}}>
                + event
              </button>
            )}
            <button onClick={() => setEditing(true)}
              style={{background:'none',border:'none',color:'#9a8870',cursor:'pointer',
                fontSize:'0.85rem',padding:'0 0.1rem',lineHeight:1}}>✏️</button>
            {onRemove && <DeleteButton onDelete={onRemove} />}
          </div>
        )}
      </div>
    </div>
  );
}
