import { useState, useEffect } from "react";
import { loadState } from "../../lib/supabase";
import { useDebouncedSave } from "../../hooks/useDebouncedSave";
import { INITIAL_PACK } from "../../data/defaults";
import { PACK_CATS, PACK_LABELS } from "../../data/constants";
import { SaveIndicator } from "../../components/SaveIndicator";
import { DeleteButton } from "../../components/DeleteButton";

export function PackingTab({ user }) {
  const [items, setItems] = useState(INITIAL_PACK);
  const [filterCat, setFilterCat] = useState('all');
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('clothing');
  const [nextId, setNextId] = useState(200);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    loadState(user, 'packing').then(saved => {
      if (saved) { setItems(saved.items); setNextId(saved.nextId || 200); }
      setSynced(true);
    });
  }, [user]);

  const { saving } = useDebouncedSave(user, 'packing', { items, nextId }, synced);

  const toggle = id => setItems(prev => prev.map(i => i.id === id ? {...i,checked:!i.checked} : i));
  const remove = id => setItems(prev => prev.filter(i => i.id !== id));
  const addItem = () => {
    if (!newName.trim()) return;
    setItems(prev => [...prev, {id:nextId,name:newName.trim(),cat:newCat,checked:false}]);
    setNextId(n => n+1);
    setNewName('');
  };

  const visible = filterCat === 'all' ? items : items.filter(i => i.cat === filterCat);
  const grouped = PACK_CATS.reduce((acc,cat) => {
    const catItems = visible.filter(i => i.cat === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});

  const total = items.length;
  const checked = items.filter(i => i.checked).length;

  return (
    <div>
      {/* Progress */}
      <div style={{marginBottom:'1.2rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.78rem',color:'#9a8870',marginBottom:6}}>
          <span>Packing progress</span>
          <div style={{display:'flex',gap:'0.8rem',alignItems:'center'}}>
            <SaveIndicator saving={saving} synced={synced} />
            <span style={{fontWeight:600,color:'#6a8a4a'}}>{checked}/{total} packed</span>
          </div>
        </div>
        <div style={{height:6,background:'#e8ddd0',borderRadius:3,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${(checked/total)*100}%`,background:'#6a8a4a',borderRadius:3,transition:'width 0.3s'}} />
        </div>
      </div>

      {/* Filter */}
      <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',marginBottom:'1rem'}}>
        {['all',...PACK_CATS].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            style={{padding:'0.22rem 0.65rem',border:`1px solid ${filterCat===c?'#8a6a3a':'#d4c4a0'}`,
              borderRadius:20,background:filterCat===c?'#8a6a3a':'transparent',
              color:filterCat===c?'#fff':'#8a7a5a',fontSize:'0.72rem',fontWeight:600,cursor:'pointer'}}>
            {c === 'all' ? 'All' : PACK_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Add item */}
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1.2rem',flexWrap:'wrap'}}>
        <input value={newName} onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="Add item..." style={{flex:1,minWidth:150,padding:'0.4rem 0.7rem',
            border:'1px solid #d4c4a0',borderRadius:5,fontSize:'0.82rem',background:'#fdfaf6'}} />
        <select value={newCat} onChange={e => setNewCat(e.target.value)}
          style={{padding:'0.4rem 0.6rem',border:'1px solid #d4c4a0',borderRadius:5,fontSize:'0.82rem',background:'#fdfaf6'}}>
          {PACK_CATS.map(c => <option key={c} value={c}>{PACK_LABELS[c]}</option>)}
        </select>
        <button onClick={addItem}
          style={{padding:'0.4rem 0.9rem',background:'#8a6a3a',color:'#fff',border:'none',
            borderRadius:5,fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>+ Add</button>
      </div>

      {/* Items */}
      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat} style={{marginBottom:'1.1rem'}}>
          <div style={{fontSize:'0.72rem',fontWeight:700,letterSpacing:'0.07em',color:'#8a7a65',
            textTransform:'uppercase',marginBottom:'0.4rem'}}>{PACK_LABELS[cat]}</div>
          {catItems.map(item => (
            <div key={item.id} style={{display:'flex',alignItems:'center',gap:'0.6rem',
              padding:'0.4rem 0.6rem',borderRadius:4,marginBottom:3,
              background: item.checked ? '#f5f5f0' : 'transparent'}}>
              <input type="checkbox" checked={item.checked} onChange={() => toggle(item.id)}
                style={{accentColor:'#6a8a4a',flexShrink:0,cursor:'pointer'}} />
              <span style={{fontSize:'0.84rem',flex:1,cursor:'pointer',
                color: item.checked ? '#b0a090' : '#3a2a1a',
                textDecoration: item.checked ? 'line-through' : 'none'}}
                onClick={() => toggle(item.id)}>
                {item.name}
              </span>
              <DeleteButton onDelete={() => remove(item.id)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
