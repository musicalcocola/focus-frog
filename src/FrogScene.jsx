import React from 'react';

export default function FrogScene({ label, activity = 'reading' }) {
  return <div className={`scene scene-${activity}`}><svg viewBox="0 0 720 540" role="img" aria-label={label}>
    <defs>
      <pattern id="wall" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M0 32L32 0" stroke="#e7e6d8" strokeWidth=".6" /></pattern>
      <linearGradient id="sky" x2="0" y2="1"><stop stopColor="#cfdfda"/><stop offset="1" stopColor="#edf0d9"/></linearGradient>
    </defs>
    <rect width="720" height="540" rx="28" fill="#eeeddf"/><rect width="720" height="540" rx="28" fill="url(#wall)"/>
    <path d="M420 80H652V328H420Z" fill="#c6baa0"/><path d="M430 90H642V316H430Z" fill="url(#sky)"/>
    <circle cx="587" cy="136" r="29" fill="#f7e8ac"/>
    <path d="M430 269Q460 202 497 262Q545 190 586 262Q621 221 642 248V316H430" fill="#afc2a3"/>
    <path d="M430 290Q500 240 565 289Q609 255 642 275V316H430" fill="#819b7c"/>
    <path d="M537 88V320M427 204H644" stroke="#faf4df" strokeWidth="11"/>
    <path d="M411 325H659" stroke="#b5a184" strokeWidth="13" strokeLinecap="round"/>
    <path d="M98 92L154 77L170 135L114 151Z" fill="#fbf7e9" stroke="#d7c9ac"/><path d="M114 110L151 100M117 120L142 113" stroke="#a6b293" strokeWidth="3"/>
    <path d="M164 203Q138 120 181 71" fill="none" stroke="#a0ae89" strokeWidth="5"/><ellipse cx="162" cy="159" rx="10" ry="23" transform="rotate(-35 162 159)" fill="#a0ae89"/><ellipse cx="170" cy="115" rx="10" ry="23" transform="rotate(30 170 115)" fill="#a0ae89"/>
    <rect x="237" y="325" width="200" height="153" rx="54" fill="#ab9d7b"/>
    <g className="frog-body">
      <ellipse cx="337" cy="350" rx="94" ry="103" fill="#8ba66c" stroke="#526a43" strokeWidth="3"/>
      <ellipse cx="338" cy="358" rx="58" ry="69" fill="#cbd49a"/>
      <path d="M238 255Q230 214 263 207Q282 182 306 212Q337 201 365 212Q390 183 415 210Q447 221 431 263Q433 313 337 317Q241 315 238 255Z" fill="#a2b87a" stroke="#526a43" strokeWidth="3"/>
      <g className="frog-eyes"><ellipse cx="282" cy="240" rx="9" ry="13" fill="#354737"/><ellipse cx="389" cy="240" rx="9" ry="13" fill="#354737"/><circle cx="285" cy="236" r="3" fill="#fff"/><circle cx="392" cy="236" r="3" fill="#fff"/></g>
      <ellipse cx="267" cy="264" rx="15" ry="8" fill="#d8b496" opacity=".8"/><ellipse cx="405" cy="264" rx="15" ry="8" fill="#d8b496" opacity=".8"/>
      <path d="M319 266Q337 281 355 266" fill="none" stroke="#526a43" strokeWidth="3" strokeLinecap="round"/>
    </g>
    <path d="M64 393H659L692 435H32Z" fill="#d1b58e" stroke="#a58b69" strokeWidth="2"/><path d="M32 435H692V453H32Z" fill="#b89a74"/><path d="M76 453V540M647 453V540" stroke="#a58b69" strokeWidth="18"/>
    <path d="M248 392L334 401L416 392L433 427L337 438L236 424Z" fill="#758975"/>
    <path d="M251 382Q295 378 337 398Q375 378 413 382L422 418Q377 414 337 430Q291 415 244 416Z" fill="#fcf5df" stroke="#b1a58a" strokeWidth="2"/><path d="M337 399V428M265 393L317 405M263 402L317 413M355 405L400 394M355 414L404 403" stroke="#c9c4ad" strokeWidth="2"/>
    <path d="M257 346Q229 368 271 392M413 345Q442 372 403 395" fill="none" stroke="#526a43" strokeWidth="24" strokeLinecap="round"/><path d="M257 346Q229 368 271 392M413 345Q442 372 403 395" fill="none" stroke="#a2b87a" strokeWidth="19" strokeLinecap="round"/>
    {activity === 'writing' && <path d="M393 405L416 354" stroke="#b5814b" strokeWidth="7" strokeLinecap="round"/>}
    <ellipse cx="510" cy="420" rx="37" ry="9" fill="#a99170" opacity=".3"/><path d="M528 382Q555 377 547 398Q542 407 528 403" fill="none" stroke="#a58159" strokeWidth="7"/><path d="M486 379H531V408Q510 425 490 408Z" fill="#bf9470"/><ellipse cx="509" cy="379" rx="23" ry="7" fill="#8e7154"/>
    <g className="steam" fill="none" stroke="#acb4a1" strokeWidth="3" strokeLinecap="round"><path d="M500 359Q490 348 502 334"/><path d="M517 359Q529 341 517 327"/></g>
    <path d="M108 359H159L152 398H116Z" fill="#c69c7c"/><path d="M133 360V292" stroke="#6e8758" strokeWidth="4"/><ellipse cx="119" cy="326" rx="12" ry="24" transform="rotate(-40 119 326)" fill="#849d64"/><ellipse cx="148" cy="311" rx="12" ry="25" transform="rotate(40 148 311)" fill="#91a873"/>
    <path d="M581 404H642M587 395H634M589 387H639" stroke="#7e8d78" strokeWidth="8" strokeLinecap="round"/>
  </svg></div>;
}
