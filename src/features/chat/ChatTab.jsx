import { useState, useRef, useEffect } from "react";
import { loadState, saveState } from "../../lib/supabase";
import { useDebouncedSave } from "../../hooks/useDebouncedSave";
import { useIsMobile } from "../../hooks/useIsMobile";

const PLACES_RE = /<!--PLACES:([\s\S]*?)-->/;

function parseSuggestions(text) {
  const match = text.match(PLACES_RE);
  if (!match) return [];
  try { return JSON.parse(match[1]); } catch { return []; }
}

function displayText(text) {
  let cleaned = text.replace(PLACES_RE, '').trim();
  // Strip any incomplete block if the response was truncated before the closing -->
  const incomplete = cleaned.indexOf('<!--PLACES:');
  if (incomplete !== -1) cleaned = cleaned.slice(0, incomplete).trim();
  return cleaned;
}

function PlaceSuggestions({ suggestions, places, addPlace }) {
  const [adding, setAdding] = useState(null);
  const [dayIdx, setDayIdx] = useState(0);
  const [added, setAdded] = useState(new Set());

  const alreadyExists = (s, di) =>
    places[di]?.places.some(p => p.name.toLowerCase() === s.name.toLowerCase());

  const handleAdd = (s, i) => {
    if (alreadyExists(s, dayIdx)) { setAdding(null); return; }
    addPlace(dayIdx, {
      name: s.name, notes: s.notes || '', cost: s.cost || '',
      url: '', type: s.type === 'food' ? 'food' : 'attraction',
      visited: false, rating: 0, votes: {},
    });
    setAdded(prev => new Set([...prev, i]));
    setAdding(null);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
      {suggestions.map((s, i) => {
        const isDone = added.has(i);
        return (
          <div key={i}>
            {adding === i ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', border: '1px solid #c4a96e', borderRadius: 20, padding: '0.25rem 0.5rem' }}>
                <select
                  value={dayIdx}
                  onChange={e => setDayIdx(Number(e.target.value))}
                  style={{ fontSize: '0.72rem', border: 'none', background: 'transparent', color: '#3a2a1a', cursor: 'pointer' }}
                >
                  {places.map((d, di) => (
                    <option key={di} value={di}>{d.day}</option>
                  ))}
                </select>
                {alreadyExists(s, dayIdx) ? (
                  <span style={{ fontSize: '0.72rem', color: '#9a8870', fontStyle: 'italic' }}>Already on list</span>
                ) : (
                  <button onClick={() => handleAdd(s, i)}
                    style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', background: '#8a6a3a', border: 'none', borderRadius: 12, padding: '0.15rem 0.5rem', cursor: 'pointer' }}>
                    Add
                  </button>
                )}
                <button onClick={() => setAdding(null)}
                  style={{ fontSize: '0.72rem', color: '#9a8870', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => !isDone && setAdding(i)}
                style={{
                  fontSize: '0.72rem', padding: '0.25rem 0.6rem', borderRadius: 20, cursor: isDone ? 'default' : 'pointer',
                  background: isDone ? '#e8f0e8' : 'none',
                  border: `1px solid ${isDone ? '#8aaa6a' : '#c4a96e'}`,
                  color: isDone ? '#4a7a3a' : '#8a6a3a',
                  fontWeight: 500,
                }}>
                {isDone ? '✓ ' : '+ '}{s.name}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function buildSystemPrompt(itinerary, places) {
  const days = itinerary.map(d => {
    const events = d.events.map(e =>
      `    - ${e.time ? e.time + ': ' : ''}${e.title}${e.location ? ' @ ' + e.location : ''}${e.cost ? ' (' + e.cost + ')' : ''}${e.notes ? ' — ' + e.notes : ''}`
    ).join('\n');
    return `  ${d.num} (${d.date}): ${d.summary}\n${events}`;
  }).join('\n');

  const placesText = places.map(d => {
    const ps = d.places.map(p =>
      `    - ${p.name}${p.address ? ' @ ' + p.address : ''}${p.cost ? ' (' + p.cost + ')' : ''}${p.notes ? ': ' + p.notes : ''}`
    ).join('\n');
    return `  ${d.day}:\n${ps}`;
  }).join('\n');

  return `You are a helpful travel assistant for a Scotland & London trip taking place May 25 – June 5, 2026. There are 6 travelers: Carter, Clyde, Danyon, Isabel, Linda, and Melissa.

Here is the current itinerary:
${days}

Here are the places of interest by day:
${placesText}

Help the travelers find things to do, eat, and see. You can suggest activities near their planned locations, restaurants, hidden gems, tips for specific sites, or answer questions about logistics. Keep responses focused and practical. If asked about a specific day, reference what they already have planned and build on it.

When you recommend specific places, restaurants, or attractions worth visiting, append a structured block at the very end of your message in exactly this format (do not include it if you have no specific recommendations):
<!--PLACES:[{"name":"Place Name","notes":"Brief description","cost":"estimated cost or empty string","type":"attraction"}]-->
Use "attraction" for sights/activities and "food" for restaurants, cafes, pubs, and bars.`;
}

export function ChatTab({ itinerary, places, addPlace, user }) {
  const isMobile = useIsMobile();
  const [apiKey, setApiKey] = useState(null);
  const [messages, setMessages] = useState([]);
  const [synced, setSynced] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    loadState('config', 'anthropic_key').then(k => setApiKey(k));
    loadState(user, 'chat').then(saved => {
      if (saved) setMessages(saved);
      setSynced(true);
    });
  }, [user]);

  useDebouncedSave(user, 'chat', messages, synced);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !apiKey) return;

    let userText = trimmed;
    if (selectedDay) {
      const day = itinerary.find(d => d.id === Number(selectedDay));
      if (day) userText = `[${day.num}: ${day.summary}] ${trimmed}`;
    }

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          system: buildSystemPrompt(itinerary, places),
          messages: newMessages,
        }),
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || 'Sorry, I couldn\'t get a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: could not reach the API. Check your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const suggestPrompts = selectedDay
    ? (() => {
        const day = itinerary.find(d => d.id === Number(selectedDay));
        return day
          ? [`What else can we do in ${day.summary.split(' ').slice(-2).join(' ')}?`, `Best restaurants near our ${day.num} stops?`, `Tips for visiting ${day.summary}?`]
          : [];
      })()
    : ['What should we know about traveling in Scotland?', 'Best traditional Scottish foods to try?', 'Tips for driving on the left?'];

  if (!apiKey) {
    return <div style={{ color: '#9a8870', fontSize: '0.85rem', padding: '2rem', textAlign: 'center' }}>Loading…</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 200px)', maxHeight: 700 }}>
      {/* Day selector */}
      <div style={{ background: '#fdfaf6', border: '1px solid #e0d4c0', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9a8870', whiteSpace: 'nowrap' }}>Focus on day:</span>
        <select
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          style={{ fontSize: '0.82rem', padding: '0.3rem 0.5rem', border: '1px solid #d4c4a0', borderRadius: 5, background: '#fdfaf6', color: '#3a2a1a', flex: 1, minWidth: 160 }}
        >
          <option value="">All days</option>
          {itinerary.map(d => (
            <option key={d.id} value={d.id}>{d.num} — {d.summary}</option>
          ))}
        </select>
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); saveState(user, 'chat', []); }}
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', background: 'none', border: '1px solid #d4c4a0', borderRadius: 5, color: '#9a8870', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#fdfaf6', border: '1px solid #e0d4c0', borderRadius: 8, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {messages.length === 0 && (
          <div style={{ color: '#9a8870', fontSize: '0.82rem', textAlign: 'center', marginTop: '1rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏴󠁧󠁢󠁳󠁣󠁴󠁿</div>
            <div style={{ fontWeight: 600, marginBottom: '0.3rem', color: '#5a4a3a' }}>Scotland Trip Assistant</div>
            <div>Ask me anything about your trip — activities, restaurants, tips, or what to do near your planned stops.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
              {suggestPrompts.map((p, i) => (
                <button key={i} onClick={() => send(p)}
                  style={{ padding: '0.35rem 0.75rem', background: 'none', border: '1px solid #c4a96e', borderRadius: 20, fontSize: '0.76rem', color: '#8a6a3a', cursor: 'pointer' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const suggestions = m.role === 'assistant' ? parseSuggestions(m.content) : [];
          return (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '82%',
                padding: '0.6rem 0.9rem',
                borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: m.role === 'user' ? '#8a6a3a' : '#f5f0e8',
                color: m.role === 'user' ? '#fff' : '#3a2a1a',
                fontSize: '0.84rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                border: m.role === 'assistant' ? '1px solid #e0d4c0' : 'none',
              }}>
                {displayText(m.content)}
                {suggestions.length > 0 && (
                  <PlaceSuggestions suggestions={suggestions} places={places} addPlace={addPlace} />
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '0.6rem 0.9rem', borderRadius: '12px 12px 12px 4px', background: '#f5f0e8', border: '1px solid #e0d4c0', fontSize: '0.84rem', color: '#9a8870' }}>
              Thinking…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about things to do, eat, or see…"
          rows={2}
          style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #d4c4a0', borderRadius: 8, fontSize: '0.84rem', background: '#fdfaf6', resize: 'none', fontFamily: 'inherit', lineHeight: 1.45 }}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          style={{ padding: '0.5rem 1rem', background: loading || !input.trim() ? '#c4a96e88' : '#8a6a3a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.84rem', fontWeight: 600, cursor: loading || !input.trim() ? 'default' : 'pointer', alignSelf: 'stretch' }}
        >
          Send
        </button>
      </div>
      <div style={{ fontSize: '0.68rem', color: '#b0a090', marginTop: '0.3rem', textAlign: 'right' }}>
        Press Enter to send · Shift+Enter for new line
      </div>
    </div>
  );
}
