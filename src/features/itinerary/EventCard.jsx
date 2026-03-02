import { useState } from "react";
import { DeleteButton } from "../../components/DeleteButton";

const inputStyle = {
  padding:'0.35rem 0.6rem', border:'1px solid #d4c4a0', borderRadius:5,
  fontSize:'0.82rem', background:'#fdfaf6', width:'100%', boxSizing:'border-box',
};

export function EventCard({ event, dayDate, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    time: event.time, title: event.title, location: event.location || '',
    cost: event.cost || '', notes: event.notes || '',
    tipsText: (event.tips || []).join('\n'),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.title.trim()) return;
    onUpdate({
      time: form.time.trim(), title: form.title.trim(),
      location: form.location.trim(), cost: form.cost.trim(),
      notes: form.notes.trim(),
      tips: form.tipsText.split('\n').map(t => t.trim()).filter(Boolean),
    });
    setEditing(false);
  };

  const cancel = () => {
    setForm({
      time: event.time, title: event.title, location: event.location || '',
      cost: event.cost || '', notes: event.notes || '',
      tipsText: (event.tips || []).join('\n'),
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{borderLeft:'3px solid #c4a96e',paddingLeft:'1rem',marginBottom:'0.9rem'}}>
        <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
          <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
            <div style={{flex:'1 1 100px',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Time</span>
              <input value={form.time} onChange={e => set('time', e.target.value)} style={inputStyle} />
            </div>
            <div style={{flex:'3 1 180px',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Title *</span>
              <input value={form.title} onChange={e => set('title', e.target.value)} autoFocus style={inputStyle} />
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.15rem'}}>
            <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Location</span>
            <input value={form.location} onChange={e => set('location', e.target.value)} style={inputStyle} />
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.15rem'}}>
            <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Cost</span>
            <input value={form.cost} onChange={e => set('cost', e.target.value)} style={inputStyle} />
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.15rem'}}>
            <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Notes</span>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              rows={3} style={{...inputStyle, resize:'vertical', fontFamily:'inherit'}} />
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'0.15rem'}}>
            <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Tips (one per line)</span>
            <textarea value={form.tipsText} onChange={e => set('tipsText', e.target.value)}
              rows={2} style={{...inputStyle, resize:'vertical', fontFamily:'inherit'}} />
          </div>
          <div style={{display:'flex',gap:'0.5rem',marginTop:'0.1rem'}}>
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
      </div>
    );
  }

  return (
    <div style={{borderLeft:'3px solid #d4c4a0',paddingLeft:'1rem',marginBottom:'0.9rem'}}>
      <div style={{display:'flex',gap:'0.7rem',alignItems:'flex-start'}}>
        <div style={{display:'flex',gap:'0.7rem',alignItems:'flex-start',flex:1,cursor:'pointer'}}
          onClick={() => setOpen(o => !o)}>
          <span style={{fontSize:'0.7rem',fontWeight:600,color:'#9a8870',whiteSpace:'nowrap',
            background:'#f5f0e8',padding:'0.2rem 0.5rem',borderRadius:3,marginTop:2,flexShrink:0}}>
            {event.time}
          </span>
          <div style={{flex:1}}>
            <div style={{fontSize:'0.9rem',fontWeight:600,color:'#3a2a1a'}}>{event.title}</div>
            {event.location && <div style={{fontSize:'0.72rem',color:'#9a8870',marginTop:2}}>📍 {event.location}</div>}
            {event.cost && <div style={{fontSize:'0.72rem',color:'#6a8a4a',marginTop:2}}>💷 {event.cost}</div>}
          </div>
          <span style={{color:'#c4a96e',fontSize:'0.75rem',flexShrink:0}}>{open ? '▲' : '▼'}</span>
        </div>
        {/* Edit / Delete */}
        <div style={{display:'flex',gap:'0.25rem',flexShrink:0,paddingTop:2}}>
          <button onClick={() => { setEditing(true); setOpen(false); }}
            style={{background:'none',border:'none',color:'#9a8870',cursor:'pointer',
              fontSize:'0.85rem',padding:'0 0.15rem',lineHeight:1}}>✏️</button>
          <DeleteButton onDelete={onDelete} />
        </div>
      </div>
      {open && (
        <div style={{marginTop:'0.6rem',paddingLeft:'0.2rem'}}>
          {event.notes && <p style={{fontSize:'0.8rem',color:'#6a5a4a',lineHeight:1.55,margin:'0 0 0.5rem',whiteSpace:'pre-wrap'}}>{event.notes}</p>}
          {event.tips && event.tips.length > 0 && (
            <ul style={{margin:0,paddingLeft:'1.2rem'}}>
              {event.tips.map((t,i) => <li key={i} style={{fontSize:'0.78rem',color:'#8a7a5a',marginBottom:3}}>💡 {t}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
