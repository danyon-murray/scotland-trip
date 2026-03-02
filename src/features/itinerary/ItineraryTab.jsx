import { useState } from "react";
import { REGION_COLORS } from "../../data/constants";
import { Badge } from "../../components/Badge";
import { EventCard } from "./EventCard";
import { DayCard } from "./DayCard";
import { SaveIndicator } from "../../components/SaveIndicator";
import { useIsMobile } from "../../hooks/useIsMobile";
import { downloadDayICS } from "../../lib/ics";

const inputStyle = {
  padding:'0.35rem 0.6rem', border:'1px solid #d4c4a0', borderRadius:5,
  fontSize:'0.82rem', background:'#fdfaf6', width:'100%', boxSizing:'border-box',
};

const EMPTY_EVENT = { time:'', title:'', location:'', cost:'', notes:'', tipsText:'' };

function AddEventForm({ onAdd, onCancel, initial = {} }) {
  const [form, setForm] = useState({ ...EMPTY_EVENT, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.title.trim()) return;
    onAdd({
      time: form.time.trim(), title: form.title.trim(),
      location: form.location.trim(), cost: form.cost.trim(),
      notes: form.notes.trim(),
      tips: form.tipsText.split('\n').map(t => t.trim()).filter(Boolean),
    });
  };
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
            rows={2} style={{...inputStyle, resize:'vertical', fontFamily:'inherit'}} />
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'0.15rem'}}>
          <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Tips (one per line)</span>
          <textarea value={form.tipsText} onChange={e => set('tipsText', e.target.value)}
            rows={2} style={{...inputStyle, resize:'vertical', fontFamily:'inherit'}} />
        </div>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button onClick={submit}
            style={{padding:'0.35rem 0.85rem',background:'#8a6a3a',color:'#fff',border:'none',
              borderRadius:5,fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>
            + Add
          </button>
          <button onClick={onCancel}
            style={{padding:'0.35rem 0.75rem',background:'none',border:'1px solid #d4c4a0',
              borderRadius:5,fontSize:'0.82rem',color:'#9a8870',cursor:'pointer'}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function ItineraryTab({ onNavigate, itinerary, places, updateEvent, addEvent, deleteEvent, updateDay, saving, synced }) {
  const [activeDay, setActiveDayState] = useState(() => Number(localStorage.getItem('trip_active_day')) || 1);
  const setActiveDay = id => { localStorage.setItem('trip_active_day', id); setActiveDayState(id); };
  const [addingEvent, setAddingEvent] = useState(false);
  const [eventInitial, setEventInitial] = useState({});
  const [editingDay, setEditingDay] = useState(false);
  const [dayForm, setDayForm] = useState({});
  const [dragFromIdx, setDragFromIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const isMobile = useIsMobile();

  const day = itinerary.find(d => d.id === activeDay);
  const rc = REGION_COLORS[day.region] || REGION_COLORS.travel;
  const dayPlacesGroup = places.find(d => d.day === day.num);
  const hasPlaces = dayPlacesGroup && dayPlacesGroup.places.length > 0;

  const shortDate = d => d.date.split(',')[0];

  const timeToMinutes = (str) => {
    const cleaned = (str || '').replace(/^~/, '').trim();
    const m = cleaned.match(/^(\d+)(?::(\d+))?\s*(AM|PM)$/i);
    if (!m) return Infinity;
    let h = parseInt(m[1]);
    const min = parseInt(m[2] || '0');
    const ampm = m[3].toUpperCase();
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  };

  const sortedEvents = day.events
    .map((e, i) => ({ e, i }))
    .sort((a, b) => timeToMinutes(a.e.time) - timeToMinutes(b.e.time));

  const timedEvents    = sortedEvents.filter(({ e }) => e.time && e.time.trim());
  const timelessEvents = sortedEvents.filter(({ e }) => !e.time || !e.time.trim());

  const handleDrop = (toOrigIdx) => {
    if (dragFromIdx === null || dragFromIdx === toOrigIdx) {
      setDragFromIdx(null); setDragOverIdx(null); return;
    }
    const newTimeless = [...timelessEvents];
    const from = newTimeless.findIndex(({ i }) => i === dragFromIdx);
    const to   = newTimeless.findIndex(({ i }) => i === toOrigIdx);
    const [moved] = newTimeless.splice(from, 1);
    newTimeless.splice(to, 0, moved);
    updateDay(day.id, { events: [...timedEvents, ...newTimeless].map(({ e }) => e) });
    setDragFromIdx(null); setDragOverIdx(null);
  };

  const moveTimeless = (origIdx, direction) => {
    const newTimeless = [...timelessEvents];
    const pos = newTimeless.findIndex(({ i }) => i === origIdx);
    const target = pos + direction;
    if (target < 0 || target >= newTimeless.length) return;
    [newTimeless[pos], newTimeless[target]] = [newTimeless[target], newTimeless[pos]];
    updateDay(day.id, { events: [...timedEvents, ...newTimeless].map(({ e }) => e) });
  };

  const startEditDay = () => {
    setDayForm({ summary: day.summary, notes: day.notes || '' });
    setEditingDay(true);
  };
  const saveDay = () => {
    updateDay(day.id, { summary: dayForm.summary.trim(), notes: dayForm.notes.trim() });
    setEditingDay(false);
  };

  const detail = (
    <div style={{background:'#fdfaf6',border:`2px solid ${rc.badge}`,borderRadius:10,padding: isMobile ? '1rem' : '1.4rem'}}>
      {/* Day header */}
      <div style={{marginBottom:'1.1rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'0.3rem'}}>
          <span style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',
            background:rc.badge,color:'#fff',padding:'0.2rem 0.55rem',borderRadius:3}}>
            {day.num}
          </span>
          {day.options && <Badge label="Flexible Day" color={rc.accent} bg={rc.bg} />}
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <button onClick={() => downloadDayICS(day)} title="Add all events to calendar"
              style={{background:'none',border:'1px solid #d4c4a0',borderRadius:5,cursor:'pointer',
                fontSize:'0.75rem',padding:'0.2rem 0.5rem',color:'#8a6a3a',fontWeight:500}}>
              📅 Add day to calendar
            </button>
            <SaveIndicator saving={saving} synced={synced} />
          </div>
        </div>

        {editingDay ? (
          <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'0.15rem'}}>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Summary</span>
              <input value={dayForm.summary} onChange={e => setDayForm(f => ({...f, summary: e.target.value}))}
                autoFocus style={inputStyle} />
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.15rem'}}>
              <span style={{fontSize:'0.65rem',fontWeight:700,color:'#9a8870'}}>Notes / Tip</span>
              <textarea value={dayForm.notes} onChange={e => setDayForm(f => ({...f, notes: e.target.value}))}
                rows={2} style={{...inputStyle, resize:'vertical', fontFamily:'inherit'}} />
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <button onClick={saveDay}
                style={{padding:'0.3rem 0.75rem',background:'#8a6a3a',color:'#fff',border:'none',
                  borderRadius:5,fontSize:'0.8rem',fontWeight:600,cursor:'pointer'}}>Save</button>
              <button onClick={() => setEditingDay(false)}
                style={{padding:'0.3rem 0.65rem',background:'none',border:'1px solid #d4c4a0',
                  borderRadius:5,fontSize:'0.8rem',color:'#9a8870',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        ) : (
          <div style={{display:'flex',alignItems:'flex-start',gap:'0.5rem'}}>
            <div style={{flex:1}}>
              <h2 style={{margin:0,fontSize: isMobile ? '1rem' : '1.15rem',color:'#3a2a1a',fontFamily:'Georgia,serif'}}>{day.summary}</h2>
              <div style={{fontSize:'0.75rem',color:'#9a8870',marginTop:4}}>{day.date}</div>
              {day.notes && (
                <div style={{marginTop:'0.7rem',padding:'0.6rem 0.8rem',background:'#f5f0e8',
                  borderRadius:5,fontSize:'0.78rem',color:'#6a5a4a',lineHeight:1.5}}>
                  💡 {day.notes}
                </div>
              )}
            </div>
            <button onClick={startEditDay}
              style={{background:'none',border:'none',color:'#9a8870',cursor:'pointer',
                fontSize:'0.85rem',padding:'0.1rem',flexShrink:0}}>✏️</button>
          </div>
        )}
      </div>

      {/* Events */}
      <div>
        {timedEvents.map(({ e, i }) => (
          <EventCard key={i} event={e} dayDate={day.date}
            onUpdate={patch => updateEvent(day.id, i, patch)}
            onDelete={() => deleteEvent(day.id, i)}
          />
        ))}
        {timelessEvents.map(({ e, i }, pos) => (
          <div key={i}
            draggable={!isMobile}
            onDragStart={() => !isMobile && setDragFromIdx(i)}
            onDragOver={ev => { if (!isMobile) { ev.preventDefault(); setDragOverIdx(i); } }}
            onDragLeave={() => !isMobile && setDragOverIdx(null)}
            onDrop={() => !isMobile && handleDrop(i)}
            onDragEnd={() => { if (!isMobile) { setDragFromIdx(null); setDragOverIdx(null); } }}
            style={{
              opacity: dragFromIdx === i ? 0.4 : 1,
              borderTop: dragOverIdx === i && dragFromIdx !== i ? '2px solid #c4a96e' : '2px solid transparent',
              cursor: isMobile ? 'default' : 'grab',
              display: 'flex', alignItems: 'flex-start', gap: '0.25rem',
            }}
          >
            {isMobile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', paddingTop: '0.25rem', flexShrink: 0 }}>
                <button onClick={() => moveTimeless(i, -1)} disabled={pos === 0}
                  style={{ background: 'none', border: 'none', cursor: pos === 0 ? 'default' : 'pointer',
                    color: pos === 0 ? '#d4c4a0' : '#9a8870', fontSize: '0.75rem', padding: '0.1rem', lineHeight: 1 }}>▲</button>
                <button onClick={() => moveTimeless(i, 1)} disabled={pos === timelessEvents.length - 1}
                  style={{ background: 'none', border: 'none', cursor: pos === timelessEvents.length - 1 ? 'default' : 'pointer',
                    color: pos === timelessEvents.length - 1 ? '#d4c4a0' : '#9a8870', fontSize: '0.75rem', padding: '0.1rem', lineHeight: 1 }}>▼</button>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <EventCard event={e} dayDate={day.date}
                onUpdate={patch => updateEvent(day.id, i, patch)}
                onDelete={() => deleteEvent(day.id, i)}
              />
            </div>
          </div>
        ))}
        {addingEvent ? (
          <AddEventForm
            initial={eventInitial}
            onAdd={e => { addEvent(day.id, e); setAddingEvent(false); setEventInitial({}); }}
            onCancel={() => { setAddingEvent(false); setEventInitial({}); }}
          />
        ) : (
          <button onClick={() => { setEventInitial({}); setAddingEvent(true); }}
            style={{padding:'0.3rem 0.8rem',background:'none',border:'1px dashed #c4a96e',
              borderRadius:5,fontSize:'0.78rem',color:'#8a6a3a',cursor:'pointer',fontWeight:500}}>
            + Add event
          </button>
        )}
      </div>

      {/* Quick links */}
      <div style={{display:'flex',gap:'0.5rem',marginTop:'1.1rem',paddingTop:'1rem',borderTop:`1px solid ${rc.badge}33`}}>
        {hasPlaces && (
          <button onClick={() => onNavigate('places', { placesFilter: day.num })}
            style={{padding:'0.45rem 1rem',background:'#fdfaf6',border:'1px solid #c4a96e',
              borderRadius:6,fontSize:'0.8rem',fontWeight:600,color:'#8a6a3a',cursor:'pointer'}}>
            📍 Places
          </button>
        )}
        <button onClick={() => onNavigate('notes')}
          style={{padding:'0.45rem 1rem',background:'#fdfaf6',border:'1px solid #c4a96e',
            borderRadius:6,fontSize:'0.8rem',fontWeight:600,color:'#8a6a3a',cursor:'pointer'}}>
          📋 Notes
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div>
        <div style={{display:'flex',gap:'0.4rem',overflowX:'auto',paddingBottom:'0.75rem',marginBottom:'0.75rem',
          scrollbarWidth:'none'}}>
          {itinerary.map(d => {
            const drc = REGION_COLORS[d.region] || REGION_COLORS.travel;
            const isActive = d.id === activeDay;
            return (
              <button key={d.id} onClick={() => { setActiveDay(d.id); setAddingEvent(false); setEditingDay(false); }}
                style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',
                  padding:'0.45rem 0.6rem',borderRadius:8,border:`2px solid ${isActive ? drc.badge : '#e0d4c0'}`,
                  background: isActive ? drc.badge : '#fdfaf6',
                  color: isActive ? '#fff' : '#6a5a4a',cursor:'pointer',minWidth:56}}>
                <span style={{fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.04em',
                  opacity: isActive ? 1 : 0.7}}>{d.num}</span>
                <span style={{fontSize:'0.68rem',fontWeight:600,marginTop:1}}>{shortDate(d)}</span>
              </button>
            );
          })}
        </div>
        {detail}
      </div>
    );
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:'1.5rem',alignItems:'start'}}>
      <div style={{maxHeight:'80vh',overflowY:'auto',paddingRight:'0.5rem'}}>
        {itinerary.map(d => (
          <DayCard key={d.id} day={d} isActive={d.id === activeDay}
            onClick={() => { setActiveDay(d.id); setAddingEvent(false); setEditingDay(false); }} />
        ))}
      </div>
      {detail}
    </div>
  );
}
