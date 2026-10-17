/** Stacked logo: animated inline Bolt (supplied brand paths) above the two-colour wordmark. */
export function CoverLogo() {
  const ink = "var(--ink)";
  return <div className="cover-logo" role="img" aria-label="aiventura">
    <div className="cover-campi-wrap">
      <svg aria-hidden="true" className="cover-campi" viewBox="0 0 120 136">
        <g className="cover-flag">
          <line x1="60" y1="22" x2="60" y2="10" stroke={ink} strokeWidth="5" strokeLinecap="round"/>
          <circle cx="60" cy="9" r="6" fill="var(--coral)" stroke={ink} strokeWidth="4"/>
        </g>
        <rect x="12" y="44" width="12" height="20" rx="5" fill="var(--golden)" stroke={ink} strokeWidth="4"/>
        <rect x="96" y="44" width="12" height="20" rx="5" fill="var(--golden)" stroke={ink} strokeWidth="4"/>
        <rect x="20" y="22" width="80" height="64" rx="20" fill="var(--bolt-head)" stroke={ink} strokeWidth="5"/>
        <rect x="31" y="33" width="58" height="42" rx="13" fill={ink}/>
        <g className="cover-eyes">
          <path d="M42 55 q6 -8 12 0" stroke="var(--bolt-eye)" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
          <path d="M66 55 q6 -8 12 0" stroke="var(--bolt-eye)" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
        </g>
        <path d="M53 62 q7 6 14 0" stroke="var(--bolt-eye)" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <circle cx="39" cy="64" r="3.5" fill="#ff9a9a"/>
        <circle cx="81" cy="64" r="3.5" fill="#ff9a9a"/>
        <rect x="51" y="85" width="18" height="9" fill="var(--bolt-steel)" stroke={ink} strokeWidth="4"/>
        <path d="M38 106 L19 119" stroke={ink} strokeWidth="5" strokeLinecap="round"/>
        <path d="M82 106 L101 119" stroke={ink} strokeWidth="5" strokeLinecap="round"/>
        <circle cx="15" cy="122" r="8" fill="var(--bolt-steel)" stroke={ink} strokeWidth="4"/>
        <circle cx="105" cy="122" r="8" fill="var(--bolt-steel)" stroke={ink} strokeWidth="4"/>
        <rect x="34" y="92" width="52" height="40" rx="13" fill="var(--sunny)" stroke={ink} strokeWidth="5"/>
        <circle cx="60" cy="112" r="7" fill="var(--coral)" stroke={ink} strokeWidth="3.5"/>
      </svg>
    </div>
    <div className="cover-wordmark" aria-hidden="true">
      {Array.from("aiventura").map((letter, i) => <span key={i} className={`cover-letter cover-letter-${i} ${i < 2 ? "cover-letter-pink" : "cover-letter-blue"}`}>{letter}</span>)}
    </div>
  </div>;
}
