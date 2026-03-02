function pad(n) { return String(n).padStart(2, '0'); }

function formatDateTime(date) {
  return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function formatDateOnly(date) {
  return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}`;
}

function escapeICS(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function parseTime(timeStr, baseDate) {
  const cleaned = (timeStr || '').replace(/^~/, '').trim();
  const match = cleaned.match(/^(\d+)(?::(\d+))?\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2] || '0');
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  const dt = new Date(baseDate);
  dt.setHours(hours, minutes, 0, 0);
  return dt;
}

function buildVEvent(event, dayDate) {
  const base = new Date(dayDate.split(' — ')[0]);
  const startDt = parseTime(event.time, base);
  let dtStart, dtEnd, allDay;

  if (startDt) {
    allDay = false;
    dtStart = formatDateTime(startDt);
    const end = new Date(startDt);
    end.setHours(end.getHours() + 1);
    dtEnd = formatDateTime(end);
  } else {
    allDay = true;
    dtStart = formatDateOnly(base);
    const next = new Date(base);
    next.setDate(next.getDate() + 1);
    dtEnd = formatDateOnly(next);
  }

  const descParts = [];
  if (event.notes) descParts.push(event.notes);
  if (event.cost)  descParts.push(`Cost: ${event.cost}`);
  if (event.tips && event.tips.length) descParts.push(event.tips.map(t => `• ${t}`).join('\n'));

  const lines = [
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@scotland-trip`,
    `SUMMARY:${escapeICS(event.title)}`,
    allDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    allDay ? `DTEND;VALUE=DATE:${dtEnd}`     : `DTEND:${dtEnd}`,
  ];
  if (event.location) lines.push(`LOCATION:${escapeICS(event.location)}`);
  if (descParts.length) lines.push(`DESCRIPTION:${escapeICS(descParts.join('\n\n'))}`);
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

function buildICS(vevents) {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Scotland Trip 2026//EN',
    ...vevents, 'END:VCALENDAR'].join('\r\n');
}

function triggerDownload(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadICS(event, dayDate) {
  const content = buildICS([buildVEvent(event, dayDate)]);
  triggerDownload(content, `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`);
}

export function downloadDayICS(day) {
  const content = buildICS(day.events.map(e => buildVEvent(e, day.date)));
  const filename = `${day.num.replace(' ', '_')}_${day.date.split(' — ')[0].replace(/[^a-z0-9]/gi, '_')}.ics`;
  triggerDownload(content, filename);
}
