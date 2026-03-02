import { useState, useEffect } from "react";
import { loadState } from "../../lib/supabase";
import { useDebouncedSave } from "../../hooks/useDebouncedSave";
import { INITIAL_NOTES } from "../../data/defaults";
import { DAYS_DATA } from "../../data/days";
import { SaveIndicator } from "../../components/SaveIndicator";
import { DeleteButton } from "../../components/DeleteButton";

const DAY_OPTIONS = [
  { value: '', label: 'General' },
  ...DAYS_DATA.map(d => ({ value: d.id, label: `${d.num} — ${d.summary}` })),
];

function journalKey(dayId) {
  return dayId === null ? 'general' : String(dayId);
}

function NoteItem({ n, onToggle, onRemove }) {
  return (
    <div style={{display:'flex',alignItems:'flex-start',gap:'0.6rem',
      padding:'0.55rem 0.7rem',background: n.done ? 'transparent' : '#fdfaf6',
      borderRadius:5,marginBottom:4,border: n.done ? 'none' : '1px solid #ede5d8',
      opacity: n.done ? 0.6 : 1}}>
      <input type="checkbox" checked={!!n.done} onChange={() => onToggle(n.id)}
        style={{accentColor:'#6a8a4a',flexShrink:0,marginTop:2}} />
      <span style={{flex:1,fontSize:'0.85rem',color: n.done ? '#9a8870' : '#3a2a1a',
        textDecoration: n.done ? 'line-through' : 'none',lineHeight:1.4}}>{n.text}</span>
      <DeleteButton onDelete={() => onRemove(n.id)} />
    </div>
  );
}

function DaySection({ dayId, notes, journalText, onToggle, onRemove, onJournalChange }) {
  const hasContent = notes.length > 0 || journalText.trim().length > 0;
  const [collapsed, setCollapsed] = useState(!hasContent);
  const open = notes.filter(n => !n.done);
  const done = notes.filter(n => n.done);

  let dayNum, dateLabel, summary;
  if (dayId === null) {
    dayNum = null;
    dateLabel = 'General';
    summary = '';
  } else {
    const day = DAYS_DATA.find(d => d.id === dayId);
    dayNum = day ? day.num : `Day ${dayId}`;
    // e.g. "May 29, 2026 — Friday" → "May 29, 2026"
    dateLabel = day ? day.date.split(' — ')[0] : '';
    summary = day ? day.summary : '';
  }

  return (
    <div style={{marginBottom:'1.2rem',borderRadius:6,border:'1px solid #e8ddd0',overflow:'hidden'}}>
      <button onClick={() => setCollapsed(c => !c)}
        style={{display:'flex',alignItems:'center',gap:'0.5rem',width:'100%',
          background:'#f5ede0',border:'none',cursor:'pointer',
          padding:'0.55rem 0.75rem',textAlign:'left'}}>
        <span style={{fontSize:'0.6rem',color:'#9a8870',transition:'transform 0.15s',
          display:'inline-block',transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
        {dayNum && (
          <span style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.06em',
            background:'#8a7a65',color:'#fff',padding:'0.1rem 0.4rem',borderRadius:3,flexShrink:0}}>
            {dayNum}
          </span>
        )}
        <span style={{fontSize:'0.82rem',fontWeight:700,color:'#5a3e1b'}}>{dateLabel}</span>
        {summary && <span style={{fontSize:'0.72rem',color:'#9a8870',fontWeight:400}}>— {summary}</span>}
        <span style={{marginLeft:'auto',fontSize:'0.7rem',color:'#9a8870',fontWeight:400,flexShrink:0}}>
          {open.length > 0 ? `${open.length} remaining` : done.length > 0 ? '✓ all done' : ''}
        </span>
      </button>

      {!collapsed && (
        <div style={{padding:'0.75rem',background:'#fffdf9'}}>
          {open.map(n => <NoteItem key={n.id} n={n} onToggle={onToggle} onRemove={onRemove} />)}
          {done.length > 0 && (
            <div style={{marginTop:'0.5rem'}}>
              <div style={{fontSize:'0.65rem',fontWeight:700,letterSpacing:'0.08em',
                textTransform:'uppercase',color:'#9a8870',marginBottom:'0.3rem',paddingLeft:'0.2rem'}}>
                ✓ Done ({done.length})
              </div>
              {done.map(n => <NoteItem key={n.id} n={n} onToggle={onToggle} onRemove={onRemove} />)}
            </div>
          )}
          {open.length === 0 && done.length === 0 && (
            <div style={{fontSize:'0.78rem',color:'#b8a88a',padding:'0.2rem 0.2rem 0.5rem',fontStyle:'italic'}}>
              No reminders yet.
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export function NotesTab({ user }) {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [journal, setJournal] = useState({});
  const [newText, setNewText] = useState('');
  const [newDay, setNewDay] = useState('');
  const [nextId, setNextId] = useState(100);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    loadState('shared', 'notes').then(saved => {
      if (saved) {
        // Migrate notes saved before the `day` field existed
        const migrated = saved.notes.map(n => {
          if (n.day === undefined) {
            const match = INITIAL_NOTES.find(i => i.id === n.id);
            return { ...n, day: match ? match.day : null };
          }
          return n;
        });
        setNotes(migrated);
        setNextId(saved.nextId || 100);
        setJournal(saved.journal || {});
      }
      setSynced(true);
    });
  }, [user]);

  const { saving } = useDebouncedSave('shared', 'notes', { notes, nextId, journal }, synced);

  const toggle = id => setNotes(prev => prev.map(n => n.id===id ? {...n,done:!n.done} : n));
  const addNote = () => {
    if (!newText.trim()) return;
    const day = newDay === '' ? null : Number(newDay);
    setNotes(prev => [...prev, {id:nextId,text:newText.trim(),done:false,day}]);
    setNextId(n=>n+1); setNewText('');
  };
  const remove = id => setNotes(prev => prev.filter(n => n.id !== id));

  const handleJournalChange = (dayId, text) => {
    setJournal(prev => ({ ...prev, [journalKey(dayId)]: text }));
  };

  const orderedDayIds = [null, ...DAYS_DATA.map(d => d.id)];
  const totalOpen = notes.filter(n => !n.done).length;

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <h3 style={{margin:0,fontFamily:'Georgia,serif',color:'#3a2a1a',fontSize:'1.1rem'}}>
          To-Do &amp; Reminders
          <span style={{marginLeft:'0.6rem',fontSize:'0.75rem',fontWeight:400,color:'#9a8870'}}>
            {totalOpen} remaining
          </span>
        </h3>
        <SaveIndicator saving={saving} synced={synced} />
      </div>

      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.4rem',flexWrap:'wrap'}}>
        <select value={newDay} onChange={e => setNewDay(e.target.value)}
          style={{padding:'0.4rem 0.5rem',border:'1px solid #d4c4a0',borderRadius:5,
            fontSize:'0.78rem',background:'#fdfaf6',color:'#5a3e1b',flexShrink:0,maxWidth:220}}>
          {DAY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input value={newText} onChange={e=>setNewText(e.target.value)}
          onKeyDown={e => e.key==='Enter' && addNote()}
          placeholder="Add a reminder..." style={{flex:1,minWidth:140,padding:'0.4rem 0.7rem',
            border:'1px solid #d4c4a0',borderRadius:5,fontSize:'0.82rem',background:'#fdfaf6'}} />
        <button onClick={addNote}
          style={{padding:'0.4rem 0.9rem',background:'#8a6a3a',color:'#fff',border:'none',
            borderRadius:5,fontSize:'0.82rem',fontWeight:600,cursor:'pointer',flexShrink:0}}>+ Add</button>
      </div>

      {orderedDayIds.map(dayId => (
        <DaySection
          key={dayId ?? 'general'}
          dayId={dayId}
          notes={notes.filter(n => (n.day ?? null) === dayId)}
          journalText={journal[journalKey(dayId)] || ''}
          onToggle={toggle}
          onRemove={remove}
          onJournalChange={handleJournalChange}
        />
      ))}
    </div>
  );
}
