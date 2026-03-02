import { useState } from "react";
import { TRAVELLERS } from "./data/constants";
import { loadState } from "./lib/supabase";

function Numpad({ pin, error, onDigit, onBack }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1.2rem',width:'100%',maxWidth:280}}>
      <div style={{display:'flex',gap:'0.75rem'}}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{width:16,height:16,borderRadius:'50%',
            background: pin.length > i ? (error ? '#c4404a' : '#3a2a1a') : '#d4c4a0',
            transition:'background 0.15s'}} />
        ))}
      </div>
      {error && <div style={{fontSize:'0.78rem',color:'#c4404a',fontWeight:600}}>Incorrect PIN</div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem',width:'100%'}}>
        {[1,2,3,4,5,6,7,8,9].map(d => (
          <button key={d} onClick={() => onDigit(String(d))}
            style={{padding:'0.9rem',fontSize:'1.2rem',fontWeight:600,color:'#3a2a1a',
              background:'#fdfaf6',border:'2px solid #d4c4a0',borderRadius:8,cursor:'pointer'}}>
            {d}
          </button>
        ))}
        <button onClick={onBack}
          style={{padding:'0.9rem',fontSize:'1rem',color:'#9a8870',
            background:'none',border:'2px solid #e8ddd0',borderRadius:8,cursor:'pointer'}}>
          ←
        </button>
        <button onClick={() => onDigit('0')}
          style={{padding:'0.9rem',fontSize:'1.2rem',fontWeight:600,color:'#3a2a1a',
            background:'#fdfaf6',border:'2px solid #d4c4a0',borderRadius:8,cursor:'pointer'}}>
          0
        </button>
        <div />
      </div>
    </div>
  );
}

export { Numpad };

export function LoginScreen({ onLogin }) {
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [correctPin, setCorrectPin] = useState(null);

  const selectUser = async (name) => {
    setLoading(true);
    setSelected(name);
    setPin('');
    setError(false);
    const saved = await loadState(name, 'pin');
    setCorrectPin(saved);
    setLoading(false);
  };

  const handleDigit = (digit) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === correctPin) {
        localStorage.setItem('trip_user', selected);
        onLogin(selected);
      } else {
        setTimeout(() => { setPin(''); setError(true); }, 300);
      }
    }
  };

  const handleBack = () => {
    if (pin.length > 0) { setPin(p => p.slice(0, -1)); setError(false); }
    else { setSelected(null); setCorrectPin(null); }
  };

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',
      justifyContent:'center',background:'linear-gradient(160deg,#faf6f0 0%,#f5ede0 50%,#ede8f5 100%)',
      fontFamily:"'Segoe UI',system-ui,sans-serif",padding:'2rem'}}>

      <div style={{textAlign:'center',marginBottom:'2rem'}}>
        <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
        <h1 style={{margin:0,fontSize:'1.6rem',fontFamily:'Georgia,serif',color:'#3a2a1a',fontWeight:400}}>
          Scotland &amp; London 2026
        </h1>
        <p style={{color:'#9a8870',fontSize:'0.85rem',marginTop:'0.4rem'}}>
          {selected ? `Enter PIN for ${selected}` : 'Who are you?'}
        </p>
      </div>

      {!selected ? (
        <div style={{display:'flex',flexDirection:'column',gap:'0.6rem',width:'100%',maxWidth:320}}>
          {TRAVELLERS.map(t => (
            <button key={t} onClick={() => selectUser(t)}
              style={{padding:'0.75rem 1.2rem',background:'#fdfaf6',border:'2px solid #d4c4a0',
                borderRadius:8,fontSize:'0.9rem',fontWeight:600,color:'#3a2a1a',cursor:'pointer',
                transition:'all 0.15s',textAlign:'left'}}>
              {t}
            </button>
          ))}
        </div>
      ) : loading ? (
        <div style={{color:'#9a8870',fontSize:'0.85rem'}}>Loading…</div>
      ) : (
        <Numpad pin={pin} error={error} onDigit={handleDigit} onBack={handleBack} />
      )}
    </div>
  );
}
