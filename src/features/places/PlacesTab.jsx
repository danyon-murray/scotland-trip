import { useState } from "react";
import { PLACES_DATA } from "../../data/places";
import { PlaceRow } from "./PlaceRow";
import { SaveIndicator } from "../../components/SaveIndicator";

const EMPTY_FORM = { name: '', type: 'attraction', cost: '', url: '' };

function AddPlaceForm({ onAdd, onCancel }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return;
    onAdd({ name: form.name.trim(), type: form.type, cost: form.cost.trim(),
      url: form.url.trim(), notes: '', visited: false, rating: 0 });
  };

  return (
    <div style={{marginTop:'0.6rem',padding:'0.75rem',background:'#f5ede0',borderRadius:6,
      border:'1px solid #d4c4a0'}}>
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.5rem'}}>
        <div style={{flex:'2 1 160px',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
          <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Name *</span>
          <input value={form.name} onChange={e => set('name', e.target.value)} autoFocus
            style={{padding:'0.4rem 0.6rem',border:'1px solid #d4c4a0',borderRadius:5,
              fontSize:'0.82rem',background:'#fdfaf6',width:'100%',boxSizing:'border-box'}} />
        </div>
        <div style={{flex:'1 1 120px',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
          <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Type</span>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            style={{padding:'0.4rem 0.5rem',border:'1px solid #d4c4a0',borderRadius:5,
              fontSize:'0.82rem',background:'#fdfaf6',color:'#3a2a1a',width:'100%',boxSizing:'border-box'}}>
            <option value="attraction">🌍 Attraction</option>
            <option value="food">🍽 Eat & Drink</option>
          </select>
        </div>
      </div>
      <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.6rem'}}>
        <div style={{flex:'1 1 120px',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
          <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Cost</span>
          <input value={form.cost} onChange={e => set('cost', e.target.value)}
            style={{padding:'0.4rem 0.6rem',border:'1px solid #d4c4a0',borderRadius:5,
              fontSize:'0.82rem',background:'#fdfaf6',width:'100%',boxSizing:'border-box'}} />
        </div>
        <div style={{flex:'2 1 180px',display:'flex',flexDirection:'column',gap:'0.15rem'}}>
          <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>URL</span>
          <input value={form.url} onChange={e => set('url', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            style={{padding:'0.4rem 0.6rem',border:'1px solid #d4c4a0',borderRadius:5,
              fontSize:'0.82rem',background:'#fdfaf6',width:'100%',boxSizing:'border-box'}} />
        </div>
      </div>
      <div style={{display:'flex',gap:'0.5rem'}}>
        <button onClick={submit}
          style={{padding:'0.4rem 0.9rem',background:'#8a6a3a',color:'#fff',border:'none',
            borderRadius:5,fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>
          + Add
        </button>
        <button onClick={onCancel}
          style={{padding:'0.4rem 0.8rem',background:'none',border:'1px solid #d4c4a0',
            borderRadius:5,fontSize:'0.82rem',color:'#9a8870',cursor:'pointer'}}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function PlacesTab({ places, updatePlace, addPlace, removePlace, saving, synced, filter, onFilterChange, itinerary, addEvent, onNavigate, user }) {
  const [addingToDi, setAddingToDi] = useState(null);
  const filtered = filter === 'all' ? places : places.filter(d => d.day === filter);

  return (
    <div>
      {/* Filter pills */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.8rem',flexWrap:'wrap',gap:'0.5rem'}}>
        <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
          {['all', ...PLACES_DATA.map(d => d.day)].map(f => (
            <button key={f} onClick={() => onFilterChange(f)}
              style={{padding:'0.25rem 0.7rem',border:`1px solid ${filter===f?'#8a6a3a':'#d4c4a0'}`,
                borderRadius:20,background: filter===f ? '#8a6a3a' : 'transparent',
                color: filter===f ? '#fff' : '#8a7a5a',fontSize:'0.75rem',fontWeight:600,cursor:'pointer'}}>
              {f === 'all' ? 'All Days' : f}
            </button>
          ))}
        </div>
        <SaveIndicator saving={saving} synced={synced} />
      </div>

      {/* Legend */}
      <div style={{display:'flex',gap:'1rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        {[['#1d6fa8','🌍 Attractions'],['#7c3aed','🍽 Eat & Drink']].map(([color,label]) => (
          <span key={label} style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.75rem',color:'#9a8870'}}>
            <span style={{width:10,height:10,borderRadius:'50%',background:color,display:'inline-block'}} />
            {label}
          </span>
        ))}
      </div>

      {/* Day sections */}
      {filtered.map((dayGroup) => {
        const realDi = places.indexOf(dayGroup);
        const sorted = [...dayGroup.places].map((p,pi) => ({p, pi}))
          .sort((a,b) => {
            if (a.p.type !== b.p.type) return a.p.type === 'attraction' ? -1 : 1;
            return a.p.name.localeCompare(b.p.name);
          });

        let lastType = null;
        return (
          <div key={dayGroup.day} style={{marginBottom:'1.5rem'}}>
            <div style={{display:'flex',alignItems:'baseline',gap:'0.6rem',borderBottom:'2px solid #e8ddd0',paddingBottom:'0.5rem',marginBottom:'0.4rem'}}>
              <span style={{fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',
                padding:'0.2rem 0.55rem',borderRadius:3,background:'#8a7a65',color:'#fff',whiteSpace:'nowrap'}}>
                {dayGroup.day}
              </span>
              <span style={{fontFamily:'Georgia,serif',fontSize:'0.95rem',color:'#3a2a1a'}}>{dayGroup.date}</span>
            </div>

            {sorted.map(({p, pi}) => {
              const isFood = p.type === 'food';
              const header = p.type !== lastType;
              lastType = p.type;
              const itinDay = itinerary && itinerary.find(d => d.num === dayGroup.day);
              return (
                <div key={pi}>
                  {header && (
                    <div style={{fontSize:'0.68rem',fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',
                      color: isFood ? '#7c3aed' : '#1d6fa8',padding:'0.5rem 0 0.3rem 0.1rem',
                      marginTop: isFood ? '0.4rem' : 0}}>
                      {isFood ? '🍽 Eat & Drink' : '🌍 Attractions'}
                    </div>
                  )}
                  <PlaceRow
                    place={p}
                    user={user}
                    onRate={r => updatePlace(realDi, pi, {rating:r})}
                    onVisit={v => updatePlace(realDi, pi, {visited:v})}
                    onUpdate={patch => updatePlace(realDi, pi, patch)}
                    onVote={v => updatePlace(realDi, pi, { votes: { ...(p.votes || {}), [user]: v } })}
                    onRemove={() => removePlace(realDi, pi)}
                    onAddAsEvent={itinDay && addEvent && !itinDay.events.some(e => e.title === p.name) ? () => {
                      addEvent(itinDay.id, { time: '', title: p.name, location: '', cost: p.cost || '', notes: p.notes || '', tips: [] });
                      localStorage.setItem('trip_active_day', itinDay.id);
                      onNavigate('itinerary');
                    } : null}
                  />
                </div>
              );
            })}

            {addingToDi === realDi ? (
              <AddPlaceForm
                onAdd={p => { addPlace(realDi, p); setAddingToDi(null); }}
                onCancel={() => setAddingToDi(null)}
              />
            ) : (
              <button onClick={() => setAddingToDi(realDi)}
                style={{marginTop:'0.4rem',padding:'0.3rem 0.8rem',background:'none',
                  border:'1px dashed #c4a96e',borderRadius:5,fontSize:'0.78rem',
                  color:'#8a6a3a',cursor:'pointer',fontWeight:500}}>
                + Add place
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
