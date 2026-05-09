// Lightweight inline icons. Stroke-based, currentColor.
const Ic = {
  Asset: (p) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <rect x="2" y="4" width="12" height="9" rx="1.5"/>
      <path d="M2 7h12"/>
      <path d="M5 4V2.5"/><path d="M11 4V2.5"/>
    </svg>
  ),
  Signal: (p) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 12 L5 8 L8 10 L11 4 L14 9"/>
      <circle cx="11" cy="4" r="1.2" fill="currentColor"/>
    </svg>
  ),
  Money: (p) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <rect x="1.5" y="4.5" width="13" height="7" rx="1"/>
      <circle cx="8" cy="8" r="1.6"/>
      <path d="M4 6.5v3M12 6.5v3"/>
    </svg>
  ),
  Play: (p) => (
    <svg viewBox="0 0 16 16" fill="currentColor" {...p}><path d="M5 3.5v9l8-4.5z"/></svg>
  ),
  Reset: (p) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 8a5 5 0 1 0 1.6-3.7"/><path d="M3 3v3h3"/>
    </svg>
  ),
  Info: (p) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <circle cx="8" cy="8" r="6"/>
      <path d="M8 7.5v3.5M8 5.4v.1" strokeLinecap="round"/>
    </svg>
  ),
  Chevron: (p) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 4l4 4-4 4"/>
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <circle cx="7" cy="7" r="4.2"/><path d="M10.5 10.5l3 3" strokeLinecap="round"/>
    </svg>
  ),
  Spark: (p) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 11l3-3 2 2 4-5 3 4"/>
    </svg>
  ),
  Shield: (p) => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" {...p}>
      <path d="M8 1.5 2.5 4v4.5C2.5 11 5 13.5 8 14.5 11 13.5 13.5 11 13.5 8.5V4z"/>
    </svg>
  ),
};

window.Ic = Ic;
