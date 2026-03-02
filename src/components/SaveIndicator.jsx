export function SaveIndicator({ saving, synced }) {
  if (!synced) return <span style={{fontSize:'0.72rem',color:'#9a8870'}}>⏳ Loading...</span>;
  if (saving)  return <span style={{fontSize:'0.72rem',color:'#c4a96e'}}>💾 Saving...</span>;
  return <span style={{fontSize:'0.72rem',color:'#6a8a4a'}}>✓ Saved</span>;
}
