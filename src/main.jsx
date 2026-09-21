import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import FrogScene from './FrogScene';
import { translations } from './translations';
import { SESSION_KEY, LANGUAGE_KEY, createSession, remainingMs, advanceSession, extendSession, completeSession, restoreSession, formatTime } from './session';
import './styles.css';

function read(key) { try { return localStorage.getItem(key); } catch { return null; } }
function App() {
  const [language, setLanguage] = useState(() => read(LANGUAGE_KEY) === 'zh' ? 'zh' : 'en');
  const [session, setSession] = useState(() => restoreSession(read(SESSION_KEY)));
  const [setup, setSetup] = useState(false);
  const [minutes, setMinutes] = useState(5);
  const [goal, setGoal] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [storageError, setStorageError] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const heading = useRef(null);
  const returnDialog = useRef(null);
  const t = translations[language];
  const stage = session?.stage || (setup ? 'setup' : 'home');
  const activity = ['reading', 'writing', 'looking', 'tea'][Math.floor(Math.max(0, now - (session?.startedAt || now)) / 30000) % 4];
  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    try { localStorage.setItem(LANGUAGE_KEY, language); } catch { setStorageError(true); }
  }, [language]);
  useEffect(() => {
    try { session ? localStorage.setItem(SESSION_KEY, JSON.stringify(session)) : localStorage.removeItem(SESSION_KEY); } catch { setStorageError(true); }
  }, [session]);
  useEffect(() => {
    const tick = () => { const current = Date.now(); setNow(current); setSession(s => advanceSession(s, current)); };
    const interval = setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('pageshow', tick);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', tick); window.removeEventListener('pageshow', tick); };
  }, []);
  useEffect(() => {
    if (session?.wandering && returnDialog.current) {
      returnDialog.current.showModal();
      returnDialog.current.querySelector('button')?.focus();
    } else heading.current?.focus();
  }, [stage, session?.wandering]);
  useEffect(() => { document.title = stage === 'desk' ? `${formatTime(remainingMs(session, now))} · ${t.brand}` : t.brand; }, [stage, now, session, t]);
  useEffect(() => { const sync = () => setFullscreen(Boolean(document.fullscreenElement)); document.addEventListener('fullscreenchange', sync); return () => document.removeEventListener('fullscreenchange', sync); }, []);
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else throw new Error('Unavailable');
      setFullscreenError(false);
    } catch { setFullscreenError(true); }
  }
  function start() { const current = Date.now(); setNow(current); setSession(createSession(minutes, goal, current)); setSetup(false); }
  function extend(amount) { const current = Date.now(); setNow(current); setSession(s => extendSession(s, amount, current)); }
  function reset() { setSession(null); setSetup(false); setConfirmed(false); setGoal(''); setFullscreenError(false); }
  const title = (text) => <h1 ref={heading} tabIndex={-1}>{text}</h1>;
  const scene = <FrogScene label={t.scene} activity={stage === 'desk' ? activity : 'reading'} />;
  return <div className={`app stage-${stage}`}>
    <a className="skip" href="#main">{t.skip}</a>
    <header><a className="brand" href="./" onClick={e => { e.preventDefault(); if (!session) { setSetup(false); setConfirmed(false); } }} aria-label={t.brand}><span className="brand-icon" aria-hidden="true">♧</span>{t.brand}<span className="brand-dot">.</span></a><span className="header-note">{t.tagline}</span><button className="language" onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} aria-label={t.languageLabel}><span aria-hidden="true">◎</span> {t.language}</button></header>
    {storageError && <p className="notice" role="status">{t.storageWarning}</p>}
    <main id="main">
      {stage === 'home' && <div className="home-grid"><section className="intro"><p className="eyebrow"><span />{t.eyebrow}</p>{title(t.headline)}<p className="description">{t.intro}</p><form onSubmit={e => { e.preventDefault(); setSetup(true); }}><fieldset><legend>{t.choose}</legend><div className="duration-options">{[5,10,20].map(value => <label className={`duration ${minutes === value ? 'selected' : ''}`} key={value}><input type="radio" name="duration" value={value} checked={minutes === value} onChange={() => setMinutes(value)} /><strong>{value}</strong><span>{t.minute}</span></label>)}</div></fieldset><label className="goal-label" htmlFor="goal">{t.goal} <span>{t.optional}</span></label><input id="goal" className="goal-input" value={goal} onChange={e => setGoal(e.target.value)} placeholder={t.placeholder} maxLength={120}/><button className="primary start" type="submit">{t.start}<span aria-hidden="true">↗</span></button><p className="small-hint">{t.hint}</p></form></section><aside className="home-scene">{scene}<p className="scene-caption"><span aria-hidden="true">✳</span> {t.note}</p><p className="scene-privacy">{t.privacy}</p></aside></div>}
      {stage === 'setup' && <div className="flow-grid"><section><p className="eyebrow">{t.setupEyebrow}</p>{title(t.setupTitle)}<p className="description">{t.setupIntro}</p><div className="setup-item"><span className="step-number">01</span><div><h2>{t.rotateTitle}</h2><p>{t.rotateBody}</p></div></div><div className="setup-item"><span className="step-number">02</span><div><h2>{t.dndTitle}</h2><p>{t.dndBody}</p></div></div><label className="check"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/>{t.confirm}</label><button className="primary" disabled={!confirmed} onClick={start}>{t.ready}<span aria-hidden="true">→</span></button><button className="text-button" onClick={() => setSetup(false)}>{t.back}</button></section>{scene}</div>}
      {stage === 'desk' && <section className="desk"><div className="desk-heading"><div><p className="eyebrow">{t.deskEyebrow}</p>{title(t.deskTitle)}</div><button className="secondary" onClick={toggleFullscreen}>{fullscreen ? t.exitFullscreen : t.fullscreen}</button></div>{fullscreenError && <p role="status" className="notice">{t.fullscreenUnavailable}</p>}<div className="desk-grid">{scene}<div className="timer-panel"><p className="timer" role="timer" aria-label={t.timeRemaining}>{formatTime(remainingMs(session, now))}</p><p className="desk-goal">{session.goal || t.noGoal}</p><p className="activity">{t[activity]}</p><div className="desk-controls"><button className="secondary" onClick={() => setSession(s => ({ ...s, wandering: true }))}>{t.wander}</button><button className="text-button" onClick={() => setSession(s => completeSession(s))}>{t.finishEarly}</button></div></div></div>{session.wandering && <dialog className="return-card" ref={returnDialog} aria-labelledby="return-title" onCancel={e => { e.preventDefault(); setSession(s => ({ ...s, wandering: false, returns: s.returns + 1 })); }}><p className="eyebrow">{t.noGoal}</p><h2 id="return-title">{t.returnTitle}</h2><p>{t.returnBody}</p><blockquote>{session.goal || t.noGoal}</blockquote><button autoFocus className="primary" onClick={() => setSession(s => ({ ...s, wandering: false, returns: s.returns + 1 }))}>{t.returnButton}<span aria-hidden="true">→</span></button><p className="small-hint">{t.returnHint}</p></dialog>}</section>}
      {stage === 'timesup' && <div className="flow-grid finish-grid"><section><p className="eyebrow">{t.upEyebrow}</p>{title(t.upTitle)}<p className="description">{t.upBody}</p><div className="extend-options"><button className="secondary" onClick={() => extend(5)}>{t.add5}</button><button className="secondary" onClick={() => extend(10)}>{t.add10}</button></div><button className="primary" onClick={() => setSession(s => completeSession(s))}>{t.finish}<span aria-hidden="true">✓</span></button></section>{scene}</div>}
      {stage === 'complete' && <div className="flow-grid finish-grid"><section><p className="eyebrow">{t.completeEyebrow}</p>{title(t.completeTitle)}<p className="description">{t.completeBody}</p><div className="stats"><div><strong>{formatTime(session.elapsedMs)}</strong><span>{t.timeLabel}</span></div><div><strong>{session.returns}</strong><span>{t.returnsLabel}</span></div></div><p className="small-hint elapsed-note">{t.elapsedNote}</p><button className="primary" onClick={reset}>{t.again}<span aria-hidden="true">↗</span></button></section>{scene}</div>}
    </main><footer><span>{t.footer}</span><span>Yue Yin <span aria-hidden="true">·</span> 2026</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
