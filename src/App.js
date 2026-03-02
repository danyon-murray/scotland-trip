import { useState, useEffect } from "react";
import { useIsMobile } from "./hooks/useIsMobile";
import { TABS } from "./data/constants";
import { PLACES_DATA } from "./data/places";
import { DAYS_DATA } from "./data/days";
import { TabBar } from "./components/TabBar";
import { LoginScreen, Numpad } from "./LoginScreen";
import { loadState, saveState } from "./lib/supabase";
import { ItineraryTab } from "./features/itinerary/ItineraryTab";
import { PlacesTab } from "./features/places/PlacesTab";
import { PackingTab } from "./features/packing/PackingTab";
import { BudgetTab } from "./features/budget/BudgetTab";
import { NotesTab } from "./features/notes/NotesTab";
import { ChatTab } from "./features/chat/ChatTab";
import { useDebouncedSave } from "./hooks/useDebouncedSave";

const DEFAULT_PLACES = PLACES_DATA.map(d => ({
  ...d, places: d.places.map(p => ({...p, visited: false, rating: p.rating || 0}))
}));

function ChangePinModal({ user, onClose }) {
  const [step, setStep] = useState('current'); // current | new | confirm
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState(false);
  const [correctPin, setCorrectPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadState(user, 'pin').then(p => {
      setCorrectPin(p);
      setLoading(false);
    });
  }, [user]);

  const activePin = step === 'current' ? currentPin : step === 'new' ? newPin : confirmPin;

  const handleDigit = (digit) => {
    const setter = step === 'current' ? setCurrentPin : step === 'new' ? setNewPin : setConfirmPin;
    const current = step === 'current' ? currentPin : step === 'new' ? newPin : confirmPin;
    if (current.length >= 4) return;
    const next = current + digit;
    setter(next);
    setError(false);

    if (next.length === 4) {
      if (step === 'current') {
        if (next === correctPin) setTimeout(() => { setStep('new'); setCurrentPin(next); }, 300);
        else setTimeout(() => { setCurrentPin(''); setError(true); }, 300);
      } else if (step === 'new') {
        setTimeout(() => { setStep('confirm'); }, 300);
      } else {
        if (next === newPin) {
          saveState(user, 'pin', newPin).then(() => setSaved(true));
        } else {
          setTimeout(() => { setConfirmPin(''); setError(true); }, 300);
        }
      }
    }
  };

  const handleBack = () => {
    setError(false);
    if (step === 'current') { if (currentPin.length > 0) setCurrentPin(p => p.slice(0,-1)); else onClose(); }
    if (step === 'new') { if (newPin.length > 0) setNewPin(p => p.slice(0,-1)); else { setStep('current'); setCurrentPin(''); } }
    if (step === 'confirm') { if (confirmPin.length > 0) setConfirmPin(p => p.slice(0,-1)); else { setStep('new'); setNewPin(''); } }
  };

  const label = step === 'current' ? 'Enter current PIN' : step === 'new' ? 'Enter new PIN' : 'Confirm new PIN';

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',
      alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem'}}>
      <div style={{background:'#fdfaf6',borderRadius:12,padding:'2rem',width:'100%',maxWidth:320,
        boxShadow:'0 8px 32px rgba(0,0,0,0.2)',textAlign:'center'}}>
        {saved ? (
          <>
            <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>✅</div>
            <div style={{fontWeight:700,color:'#3a2a1a',marginBottom:'0.4rem'}}>PIN updated!</div>
            <button onClick={onClose}
              style={{marginTop:'1rem',padding:'0.5rem 1.5rem',background:'#8a6a3a',color:'#fff',
                border:'none',borderRadius:6,fontWeight:600,cursor:'pointer'}}>Done</button>
          </>
        ) : loading ? (
          <div style={{color:'#9a8870'}}>Loading…</div>
        ) : (
          <>
            <div style={{fontWeight:700,color:'#3a2a1a',marginBottom:'1.2rem'}}>{label}</div>
            <Numpad pin={activePin} error={error} onDigit={handleDigit} onBack={handleBack} />
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [tab, setTabState] = useState(() => localStorage.getItem('trip_tab') || 'itinerary');
  const setTab = t => { localStorage.setItem('trip_tab', t); setTabState(t); };
  const [placesFilter, setPlacesFilter] = useState('all');
  const [changingPin, setChangingPin] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem('trip_user') || null);
  const [places, setPlaces] = useState(DEFAULT_PLACES);
  const [placesSynced, setPlacesSynced] = useState(false);
  const [itinerary, setItinerary] = useState(DAYS_DATA);
  const [itinerarySynced, setItinerarySynced] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadState('shared', 'places').then(saved => {
      if (saved) setPlaces(saved);
      setPlacesSynced(true);
    });
    loadState('shared', 'itinerary').then(saved => {
      if (saved) setItinerary(saved);
      setItinerarySynced(true);
    });
  }, [user]);

  const { saving: placesSaving } = useDebouncedSave('shared', 'places', places, placesSynced);
  const { saving: itinerarySaving } = useDebouncedSave('shared', 'itinerary', itinerary, itinerarySynced);

  const updatePlace = (di, pi, patch) => {
    const dayNum = places[di].day;
    const originalName = places[di].places[pi].name;
    setPlaces(prev => prev.map((d, i) => i !== di ? d : {
      ...d, places: d.places.map((p, j) => j !== pi ? p : {...p, ...patch})
    }));
    // Sync matching fields to any itinerary event with the same title on the same day
    const eventPatch = {};
    if ('name'  in patch) eventPatch.title = patch.name;
    if ('cost'  in patch) eventPatch.cost   = patch.cost;
    if ('notes' in patch) eventPatch.notes  = patch.notes;
    if (Object.keys(eventPatch).length > 0) {
      setItinerary(prev => prev.map(d => d.num !== dayNum ? d : {
        ...d, events: d.events.map(e => e.title !== originalName ? e : {...e, ...eventPatch})
      }));
    }
  };

  const addPlace = (di, newPlace) => {
    setPlaces(prev => prev.map((d, i) => i !== di ? d : {
      ...d, places: [...d.places, newPlace]
    }));
  };

  const removePlace = (di, pi) => {
    setPlaces(prev => prev.map((d, i) => i !== di ? d : {
      ...d, places: d.places.filter((_, j) => j !== pi)
    }));
  };

  const updateEvent = (dayId, ei, patch) => {
    const day = itinerary.find(d => d.id === dayId);
    const originalTitle = day?.events[ei]?.title;
    setItinerary(prev => prev.map(d => d.id !== dayId ? d : {
      ...d, events: d.events.map((e, i) => i !== ei ? e : {...e, ...patch})
    }));
    // Sync matching fields to any place with the same name on the same day
    if (day && originalTitle) {
      const placePatch = {};
      if ('title' in patch) placePatch.name  = patch.title;
      if ('cost'  in patch) placePatch.cost  = patch.cost;
      if ('notes' in patch) placePatch.notes = patch.notes;
      if (Object.keys(placePatch).length > 0) {
        setPlaces(prev => prev.map(d => d.day !== day.num ? d : {
          ...d, places: d.places.map(p => p.name !== originalTitle ? p : {...p, ...placePatch})
        }));
      }
    }
  };

  const addEvent = (dayId, event) =>
    setItinerary(prev => prev.map(d => d.id !== dayId ? d : {
      ...d, events: [...d.events, event]
    }));

  const deleteEvent = (dayId, ei) =>
    setItinerary(prev => prev.map(d => d.id !== dayId ? d : {
      ...d, events: d.events.filter((_, i) => i !== ei)
    }));

  const updateDay = (dayId, patch) =>
    setItinerary(prev => prev.map(d => d.id !== dayId ? d : {...d, ...patch}));

  const navigateTo = (newTab, opts = {}) => {
    if (opts.placesFilter !== undefined) setPlacesFilter(opts.placesFilter);
    setTab(newTab);
  };

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(160deg, #faf6f0 0%, #f5ede0 50%, #ede8f5 100%)',
      fontFamily:"'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg, #3a2a1a 0%, #5a4030 60%, #4a3a5a 100%)',
        padding: isMobile ? '0.8rem 1rem 0.7rem' : '1.2rem 2rem 1rem',
        boxShadow:'0 4px 20px rgba(0,0,0,0.25)',
      }}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'0.5rem'}}>
          <div>
            <div style={{display:'flex',alignItems:'baseline',gap:'0.6rem',flexWrap:'wrap'}}>
              <h1 style={{margin:0,fontSize: isMobile ? '1.1rem' : '1.4rem',color:'#f5e8d0',fontFamily:'Georgia,serif',fontWeight:400}}>
                🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland &amp; London
              </h1>
              {!isMobile && <span style={{fontSize:'0.78rem',color:'#c4a97a',fontWeight:500}}>May 25 – June 5, 2026 · 6 People</span>}
            </div>
            {!isMobile && (
              <p style={{margin:'0.2rem 0 0',fontSize:'0.75rem',color:'#a09080'}}>
                12 Days · London · Inverness · Isle of Skye · Edinburgh · Falkirk
              </p>
            )}
            {isMobile && <p style={{margin:'0.1rem 0 0',fontSize:'0.7rem',color:'#c4a97a'}}>May 25 – June 5, 2026</p>}
          </div>
          <div style={{display:'flex',gap:'0.4rem',flexShrink:0}}>
            <button onClick={() => setChangingPin(true)}
              style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:6,padding:'0.35rem 0.7rem',color:'#c4a97a',
                fontSize: isMobile ? '0.7rem' : '0.75rem',cursor:'pointer',fontWeight:500}}>
              👤 {user}
            </button>
            <button onClick={() => { localStorage.removeItem('trip_user'); setUser(null); }}
              style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:6,padding:'0.35rem 0.7rem',color:'#c4a97a',
                fontSize: isMobile ? '0.7rem' : '0.75rem',cursor:'pointer',fontWeight:500}}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {changingPin && <ChangePinModal user={user} onClose={() => setChangingPin(false)} />}

      {/* Main */}
      <div style={{maxWidth:1100,margin:'0 auto',padding: isMobile ? '0.75rem 0.75rem 3rem' : '1.5rem 1.5rem 3rem'}}>
        <TabBar tabs={TABS} active={tab} onChange={setTab} />
        {tab === 'itinerary' && <ItineraryTab onNavigate={navigateTo} itinerary={itinerary} places={places} updateEvent={updateEvent} addEvent={addEvent} deleteEvent={deleteEvent} updateDay={updateDay} saving={itinerarySaving} synced={itinerarySynced} />}
        {tab === 'places'    && <PlacesTab places={places} updatePlace={updatePlace} addPlace={addPlace} removePlace={removePlace} saving={placesSaving} synced={placesSynced} filter={placesFilter} onFilterChange={setPlacesFilter} itinerary={itinerary} addEvent={addEvent} onNavigate={navigateTo} user={user} />}
        {tab === 'packing'   && <PackingTab user={user} />}
        {tab === 'budget'    && <BudgetTab user={user} />}
        {tab === 'notes'     && <NotesTab user={user} />}
        {tab === 'chat'      && <ChatTab itinerary={itinerary} places={places} addPlace={addPlace} user={user} />}
      </div>
    </div>
  );
}
