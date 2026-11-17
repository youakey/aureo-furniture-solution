import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Check, DownloadSimple, X, ArrowUpRight, WarningCircle } from './components/Icons.jsx';
import { PaletteChoices } from './components/PalettePicker.jsx';
import { paletteLabel } from './components/palettes.js';
import {
  QUESTIONS, STYLES, SECTIONS, getQuestions, validateAnswer, makeRecommendations, labelFor, reportText, sanitizeAnswers,
} from './components/assessment.js';
import { shareKitchenDnaLead } from './lib/shareLead.js';
import { handleUsPhoneInputChange } from './lib/us-phone.js';

export const BRAND = {
  name: 'AUREO',
  full: 'Aureo Furniture',
  phone: '+1 (943) 238-9384',
  tel: '+19432389384',
  email: 'aureofur@gmail.com',
  site: 'aureofur.com',
  url: 'https://aureofur.com',
};

const DRAFT_KEY = 'aureo-kitchen-dna-v1';
const uuid = () =>
  crypto.randomUUID?.() ||
  Array.from(crypto.getRandomValues(new Uint8Array(20))).map(x => x.toString(16).padStart(2, '0')).join('');
const fresh = () => ({ answers: {}, current: QUESTIONS[0].id, started: false, complete: false, submissionKey: uuid(), sharedId: null });

function readDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY));
    return d && d.submissionKey && d.answers ? d : fresh();
  } catch {
    return fresh();
  }
}

const defaults = q =>
  q.kind === 'household' ? { adults: 2, children: 0, pets: false }
  : q.kind === 'project' ? {}
  : q.kind === 'contact' ? { name: '', email: '', phone: '', zip: '', method: 'email', share: false, smsConsent: false }
  : q.kind === 'text' ? ''
  : undefined;

function saveText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function radioKeys(e) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
  const buttons = [...e.currentTarget.querySelectorAll('[role=radio]')];
  const i = buttons.indexOf(e.target.closest('[role=radio]'));
  if (i < 0) return;
  e.preventDefault();
  const next = e.key === 'Home' ? 0
    : e.key === 'End' ? buttons.length - 1
    : (i + (['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : -1) + buttons.length) % buttons.length;
  buttons[next].focus();
  buttons[next].click();
}

function Header({ onHome, onSave }) {
  return (
    <div className="header">
      <button className="brandmark" onClick={onHome} aria-label="AUREO Kitchen DNA home">
        <img src="/images/aureo-logo.webp" alt="" className="brandmark-logo" width="40" height="40" />
        <span className="brandmark-text">
          <span className="brandmark-name">AUREO</span>
          <span className="brandmark-product">Kitchen DNA</span>
        </span>
      </button>
      {onSave ? <button className="text-button" onClick={onSave}>Save &amp; exit</button> : <a className="header-phone" href={`tel:${BRAND.tel}`}>{BRAND.phone}</a>}
    </div>
  );
}

function Button({ children, secondary = false, className = '', ...props }) {
  return <button className={`${secondary ? 'secondary-button' : 'primary-button'} ${className}`} {...props}>{children}</button>;
}

function ErrorMessage({ children }) {
  return children ? <div className="error-message" role="alert"><WarningCircle size={19} /><span>{children}</span></div> : null;
}

function Progress({ question, index, total }) {
  return (
    <div className="progress-block">
      <div className="eyebrow">{SECTIONS[question.section].toUpperCase()} <span>/</span> {String(index + 1).padStart(2, '0')} OF {total}</div>
      <div className="progress-track" role="progressbar" aria-label="Discovery progress" aria-valuenow={index + 1} aria-valuemin={0} aria-valuemax={total}>
        <span style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}

function SelectionMark({ selected }) {
  return <span className={`selection-mark ${selected ? 'selected' : ''}`} aria-hidden="true">{selected && <Check size={15} />}</span>;
}

function PhotoChoices({ value, onChange, intro = false }) {
  const [more, setMore] = useState(STYLES.findIndex(s => s.id === value) > 2);
  const styles = intro ? STYLES.slice(0, 3) : STYLES.slice(more ? 3 : 0, more ? 6 : 3);
  return (
    <>
      <div
        className={`photo-grid ${intro ? 'intro-grid' : ''}`}
        role={intro ? undefined : 'radiogroup'}
        onKeyDown={intro ? undefined : radioKeys}
        aria-label={intro ? undefined : 'Kitchen style'}
      >
        {styles.map((s, i) =>
          intro ? (
            <div className="photo-option" key={s.id}>
              <img src={s.image} alt={`${s.label} kitchen inspiration`} fetchPriority={i === 0 ? 'high' : 'auto'} />
              <span className="photo-label">{s.label}</span>
            </div>
          ) : (
            <button
              type="button" role="radio" aria-checked={value === s.id}
              className={`photo-option ${value === s.id ? 'is-selected' : ''}`}
              key={s.id} onClick={() => onChange(s.id)}
            >
              <span className="photo-wrap">
                <img src={s.image} alt={`${s.label}: ${s.detail}`} fetchPriority={i === 0 ? 'high' : 'auto'} />
                <SelectionMark selected={value === s.id} />
              </span>
              <span className="photo-label">{s.label}</span>
            </button>
          ),
        )}
      </div>
      {!intro && (
        <div className="gallery-tools">
          <span>Inspiration images. Your space will be designed individually.</span>
          <button className="text-button" onClick={() => setMore(x => !x)}>
            {more ? 'Back to first styles' : 'Explore more styles'}<ArrowRight size={15} />
          </button>
        </div>
      )}
    </>
  );
}

function ToggleChoices({ question, value, onChange }) {
  const multi = question.kind === 'multi';
  const current = Array.isArray(value) ? value : [];
  const toggle = id => {
    if (!multi) return onChange(id);
    if (id === 'none' || id === 'unsure') return onChange(current.includes(id) ? [] : [id]);
    const clean = current.filter(x => x !== 'none' && x !== 'unsure');
    if (clean.includes(id)) onChange(clean.filter(x => x !== id));
    else if (clean.length < question.max) onChange([...clean, id]);
  };
  return (
    <>
      <div
        className={`choice-grid ${question.id === 'personality' ? 'word-grid' : ''}`}
        role={multi ? 'group' : 'radiogroup'}
        onKeyDown={multi ? undefined : radioKeys}
        aria-label={question.title}
      >
        {question.options.map(o => {
          const selected = multi ? current.includes(o.id) : value === o.id;
          return (
            <button
              type="button" key={o.id}
              className={`choice ${selected ? 'is-selected' : ''} ${multi && !selected && current.length >= question.max ? 'at-limit' : ''}`}
              {...(multi ? { 'aria-pressed': selected } : { role: 'radio', 'aria-checked': selected })}
              onClick={() => toggle(o.id)}
            >
              <span>
                <span className="choice-title">{o.label}</span>
                {o.detail && <span className="choice-detail">{o.detail}</span>}
              </span>
              <SelectionMark selected={selected} />
            </button>
          );
        })}
      </div>
      {multi && (
        <p className="selection-hint" aria-live="polite">
          {current.length} of {question.max} selected{current.length >= question.max ? ' · Deselect one to choose another.' : ''}
        </p>
      )}
    </>
  );
}

function Field({ label, id, helper, ...props }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...props} />
      {helper && <small>{helper}</small>}
    </label>
  );
}

function QuestionBody({ q, value, onChange }) {
  if (q.kind === 'photo') return <PhotoChoices value={value} onChange={onChange} />;
  if (['multi', 'single'].includes(q.kind)) return <ToggleChoices question={q} value={value} onChange={onChange} />;
  if (q.kind === 'palette') return <PaletteChoices question={q} value={value} onChange={onChange} />;
  if (q.kind === 'text') {
    return (
      <div className="form-body">
        <label className="field">
          <span>Anything your designer should know <em>(optional)</em></span>
          <textarea value={value || ''} onChange={e => onChange(e.target.value)} maxLength={1000} rows={5} placeholder={q.placeholder} />
          <small>{(value || '').length}/1,000 characters</small>
        </label>
      </div>
    );
  }

  const v = value || defaults(q);
  const set = (key, x) => onChange({ ...v, [key]: x });

  if (q.kind === 'household') {
    return (
      <div className="form-body household-form">
        <div className="form-row">
          <label className="field">
            <span>Adults</span>
            <select value={v.adults} onChange={e => set('adults', Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(x => <option value={x} key={x}>{x}{x === 8 ? ' or more' : ''}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Children</span>
            <select value={v.children} onChange={e => set('children', Number(e.target.value))}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(x => <option value={x} key={x}>{x}{x === 8 ? ' or more' : ''}</option>)}
            </select>
          </label>
        </div>
        <label className="checkbox-label">
          <input type="checkbox" checked={v.pets} onChange={e => set('pets', e.target.checked)} />
          <span>We share our home with pets.</span>
        </label>
        <p className="subtle-note">We use this to plan how the kitchen works for your household.</p>
      </div>
    );
  }

  if (q.kind === 'project') {
    return (
      <div className="form-body">
        <div className="form-row">
          <Field
            label="Project ZIP code" id="zip" inputMode="numeric" autoComplete="postal-code" maxLength={5}
            value={v.zip || ''} onChange={e => set('zip', e.target.value.replace(/\D/g, ''))}
            placeholder="e.g. 30041 or 30305" helper="Optional · Atlanta metro, Cumming, Alpharetta & nearby"
          />
          <div />
        </div>
        <p className="field-section-label">Approximate room dimensions <em>(optional, in feet)</em></p>
        <div className="form-row thirds">
          {[['width', 'Width'], ['length', 'Length'], ['ceiling', 'Ceiling height']].map(([key, label]) => (
            <Field
              label={label} key={key} id={key} type="number" min="0.1" max="100" step="0.1"
              value={v[key] || ''} onChange={e => set(key, e.target.value)} placeholder="e.g. 12"
            />
          ))}
        </div>
        <label className="field">
          <span>Anything about the room we should know? <em>(optional)</em></span>
          <textarea rows={3} value={v.notes || ''} onChange={e => set('notes', e.target.value)} maxLength={1000} placeholder="Windows, an island you’re hoping for, or a layout detail…" />
        </label>
        <p className="subtle-note">These are planning notes. Final cabinetry requires a verified site measurement.</p>
      </div>
    );
  }

  if (q.kind === 'contact') {
    return (
      <div className="form-body contact-form">
        <div className="form-row">
          <Field label="Your name" id="name" autoComplete="name" value={v.name || ''} onChange={e => set('name', e.target.value)} maxLength={100} placeholder="Your name" />
          <Field label="Email" id="email" type="email" autoComplete="email" value={v.email || ''} onChange={e => set('email', e.target.value)} maxLength={254} placeholder="you@example.com" />
        </div>
        <div className="form-row">
          <Field label="US phone" id="phone" type="tel" inputMode="tel" autoComplete="tel" value={v.phone || ''} onChange={e => set('phone', handleUsPhoneInputChange(e.target.value))} placeholder="(404) 555-0123" />
          <Field
            label="Project ZIP code" id="contact-zip" inputMode="numeric" autoComplete="postal-code" maxLength={5}
            value={v.zip || ''} onChange={e => set('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="30305" helper="Atlanta, GA metro · e.g. 30041, 30305"
          />
        </div>
        <label className="field">
          <span>Preferred contact method</span>
          <select value={v.method || 'email'} onChange={e => set('method', e.target.value)}>
            <option value="email">Email</option>
            <option value="phone">Phone call</option>
            <option value="text">Text message</option>
            <option value="none">No follow-up for now</option>
          </select>
        </label>
        <label className="checkbox-label consent-label">
          <input type="checkbox" checked={!!v.smsConsent} onChange={e => set('smsConsent', e.target.checked)} />
          <span>
            I agree to receive SMS texts from Aureo Furniture about my kitchen remodel inquiry (appointment reminders, follow-ups, and project updates).
            Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of purchase.
          </span>
        </label>
        <p className="subtle-note">Submitting this page sends your brief to Aureo Furniture. An AUREO designer will follow up. It does not book an appointment.</p>
      </div>
    );
  }
  return null;
}

function Recommendations({ draft, onEdit, onShare, onRemove, shareState }) {
  const a = sanitizeAnswers(draft.answers);
  const r = makeRecommendations(a);
  const firstName = a.contact?.name?.trim().split(' ')[0];
  return (
    <main className="results-main">
      {draft.sharedId && (
        <section className="thank-you" role="status">
          <span className="thank-icon"><Check size={22} /></span>
          <div>
            <h2>Thank you{firstName ? `, ${firstName}` : ''}.</h2>
            <p>Your Kitchen DNA brief is with Aureo Furniture. An AUREO designer will follow up using your preferred contact method.</p>
            <p className="thank-contact">
              Prefer to talk now? <a href={`tel:${BRAND.tel}`}>{BRAND.phone}</a> · <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            </p>
          </div>
        </section>
      )}
      <div className="results-kicker eyebrow">AUREO · YOUR PERSONAL KITCHEN DIRECTION</div>
      <div className="results-heading">
        <div>
          <p className="small-serif">{firstName ? `${firstName}, your kitchen DNA is` : 'Your kitchen DNA is'}</p>
          <h1>{r.primary.label}.</h1>
          <p className="lead">{r.summary}</p>
        </div>
        <button className="text-button" onClick={() => saveText('AUREO_Kitchen_DNA_Brief.txt', reportText(a, r))}>
          <DownloadSimple size={18} />Download my brief
        </button>
      </div>

      <div className="result-hero">
        <img src={r.primary.image} alt={`${r.primary.label} kitchen inspiration`} />
        <div className="result-direction">
          <div className="eyebrow">A DIRECTION THAT FEELS LIKE YOU</div>
          <h2>Beauty, with a purpose.</h2>
          {r.reasons.map(x => <p key={x}>{x}</p>)}
          <dl className="spec-list">
            <div><dt>Cabinet doors</dt><dd>{r.profile}</dd></div>
            <div><dt>Finish to explore</dt><dd>{r.finish}</dd></div>
            <div><dt>Color approach</dt><dd>{labelFor('colorPlacement', a.colorPlacement)}</dd></div>
          </dl>
          <div className="mini-palettes">
            {r.palettes.map(p => (
              <div key={p.id}>
                <span className="result-color-swatch" style={{ backgroundColor: p.color }} />
                <small>{paletteLabel(p)}</small>
              </div>
            ))}
          </div>
          <p className="subtle-note">Also worth exploring: {r.secondary.label.toLowerCase()}. Real finish samples will help refine your direction.</p>
        </div>
      </div>

      <section className="result-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">DESIGNED AROUND YOUR EVERYDAY</div>
            <h2>The details that make it yours.</h2>
          </div>
          <span className="subtle-note">Based on the priorities you selected</span>
        </div>
        <div className="functional-grid">
          {r.functions.map((f, i) => (
            <article key={f.title}>
              <span className="detail-number">{String(i + 1).padStart(2, '0')}</span>
              <h3>{f.title}</h3>
              <p>{f.why}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="investment-summary">
        <div><span className="eyebrow">YOUR COMFORT ZONE</span><h3>{r.budget}</h3><p>Cabinetry + installation</p></div>
        <div><span className="eyebrow">YOUR IDEAL TIMING</span><h3>{r.timeline}</h3><p>Supplier and installation dates to be confirmed</p></div>
      </section>

      <section className="next-section">
        <div>
          <div className="eyebrow">YOUR NEXT CHAPTER</div>
          <h2>Let’s make it feel like home.</h2>
          <p>{r.next}</p>
          <p className="subtle-note">This is an inspiration and planning brief. Cabinet availability, exact dimensions, pricing and installation scope require designer verification.</p>
        </div>
        <div className="result-actions">
          {shareState === 'loading' ? (
            <p role="status">Sending your brief to AUREO…</p>
          ) : draft.sharedId ? (
            <>
              <p className="success-message"><Check size={18} />Your brief is with AUREO. A designer will follow up.</p>
              <button className="text-button" onClick={onRemove}>Remove my shared confirmation</button>
            </>
          ) : (
            <Button onClick={onShare}>Send my brief to AUREO<ArrowRight size={19} /></Button>
          )}
          <button className="text-button" onClick={onEdit} disabled={shareState === 'loading'}>Refine my answers<ArrowUpRight size={16} /></button>
        </div>
      </section>

      <ErrorMessage>{shareState && shareState !== 'loading' && shareState !== 'success' ? shareState : null}</ErrorMessage>
      <Footer />
    </main>
  );
}

function Footer() {
  return (
    <footer className="page-footer">
      <span>AUREO FURNITURE · Cumming &amp; Atlanta, GA · Custom kitchen cabinetry</span>
      <span className="footer-links">
        <a href={`tel:${BRAND.tel}`}>{BRAND.phone}</a>
        <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
        <a href={BRAND.url} target="_blank" rel="noopener noreferrer">{BRAND.site}</a>
      </span>
    </footer>
  );
}

export default function App() {
  const [draft, setDraft] = useState(readDraft);
  const [screen, setScreen] = useState(() => (readDraft().complete ? 'results' : 'landing'));
  const [error, setError] = useState('');
  const [shareState, setShareState] = useState('');
  const sharing = useRef(false);
  const [resetOpen, setResetOpen] = useState(false);
  const heading = useRef(null);
  const dialogRef = useRef(null);

  const questions = getQuestions(draft.answers);
  const index = Math.max(0, questions.findIndex(q => q.id === draft.current));
  const q = questions[index];

  useEffect(() => {
    if (!resetOpen) return undefined;
    const previous = document.activeElement;
    const root = dialogRef.current;
    root?.querySelector('button')?.focus();
    const keys = e => {
      if (e.key === 'Escape') { e.preventDefault(); setResetOpen(false); }
      if (e.key === 'Tab') {
        const items = [...root.querySelectorAll('button,a,input,select,textarea')].filter(x => !x.disabled);
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keys);
    return () => {
      document.removeEventListener('keydown', keys);
      if (previous?.isConnected) previous.focus();
    };
  }, [resetOpen]);

  const setAnswer = value => {
    setError('');
    setDraft(d => ({ ...d, answers: { ...d.answers, [q.id]: value } }));
  };

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }
    catch { setError('This browser cannot save progress on this device. Keep this tab open to finish.'); }
  }, [draft]);

  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  }, [screen, draft.current]);

  const route = s => { setError(''); setScreen(s); };
  const start = () => { setDraft(d => ({ ...d, started: true })); route('question'); };

  const share = async d => {
    if (sharing.current) return;
    sharing.current = true;
    setShareState('loading');
    try {
      const res = await shareKitchenDnaLead(d);
      setDraft(x => x.submissionKey === d.submissionKey ? { ...x, sharedId: res.id } : x);
      setShareState('success');
    } catch (e) {
      setShareState(e.message);
    } finally {
      sharing.current = false;
    }
  };

  const next = async () => {
    let value = draft.answers[q.id] ?? defaults(q);
    if (q.kind === 'contact') value = { ...defaults(q), ...value, share: true, zip: value.zip || draft.answers.project?.zip || '' };
    const invalid = validateAnswer(q, value);
    if (invalid) { setError(invalid); return; }
    const updated = { ...draft, answers: { ...draft.answers, [q.id]: value }, started: true };
    if (index === questions.length - 1) {
      updated.complete = true;
      setDraft(updated);
      route('results');
      if (!updated.sharedId) await share(updated);
      return;
    }
    const plan = getQuestions(updated.answers);
    updated.current = plan[plan.findIndex(x => x.id === q.id) + 1].id;
    setDraft(updated);
    setError('');
  };

  const back = () => {
    setError('');
    if (index > 0) setDraft(d => ({ ...d, current: questions[index - 1].id }));
    else route('landing');
  };

  const reset = () => { setDraft(fresh()); setShareState(''); setResetOpen(false); route('landing'); };

  const removeShared = () => {
    if (!window.confirm('Clear the shared confirmation on this device? Aureo Furniture already has your brief.')) return;
    setDraft(d => ({ ...d, sharedId: null, answers: { ...d.answers, contact: { ...d.answers.contact, share: false } } }));
    setShareState('');
  };

  return (
    <div className={`app-shell screen-${screen}`}>
      <Header onHome={() => route('landing')} onSave={screen === 'question' ? () => route('paused') : null} />

      {screen === 'landing' ? (
        <main className="landing-main">
          <section className="hero">
            <img className="hero-logo" src="/images/aureo-logo.webp" alt="AUREO" width="620" height="636" fetchPriority="high" />
            <div className="hero-product"><span /><div className="eyebrow">KITCHEN DNA</div><span /></div>
            <h1 ref={heading} tabIndex={-1}>A kitchen that feels like you.</h1>
            <p className="question-description">A few thoughtful choices. A direction that’s yours.</p>
            <div className="hero-cta">
              <Button onClick={draft.complete ? () => route('results') : start}>
                {draft.complete ? 'See my Kitchen DNA' : draft.started ? 'Continue my discovery' : 'Discover my Kitchen DNA'}
                <ArrowRight size={20} />
              </Button>
              {draft.started && <button className="text-button" onClick={() => setResetOpen(true)} disabled={shareState === 'loading'}>Start fresh</button>}
            </div>
            <p className="hero-meta">6–8 minutes · At your pace · Atlanta, GA custom cabinetry</p>
          </section>
          <PhotoChoices intro />
          <div className="landing-footer">
            <p>Made for how you live.<br /><span>Designed for Atlanta homes.</span></p>
          </div>
          <p className="intro-privacy">Your choices shape personal design suggestions. When you leave your contact details, your brief is sent to Aureo Furniture.</p>
          <Footer />
        </main>
      ) : screen === 'paused' ? (
        <main className="paused-main">
          <div className="eyebrow">SAVED ON THIS DEVICE</div>
          <h1 ref={heading} tabIndex={-1}>Good things take<br />a little thought.</h1>
          <p>Your answers are saved in this browser. Come back to the same device whenever you’re ready to pick up where you left off.</p>
          <Button onClick={() => route('question')}>Continue my discovery<ArrowRight size={19} /></Button>
          <button className="text-button" onClick={() => route('landing')}>Back to the beginning</button>
          <p className="subtle-note">{draft.sharedId ? 'Aureo Furniture has received your brief.' : 'Your answers have not been sent to Aureo Furniture.'}</p>
        </main>
      ) : screen === 'results' ? (
        <Recommendations
          draft={draft} shareState={shareState} onShare={() => share(draft)} onRemove={removeShared}
          onEdit={() => { setDraft(d => ({ ...d, current: QUESTIONS[0].id, complete: false })); route('question'); }}
        />
      ) : (
        <main className={`question-main question-${q.kind}`}>
          <Progress question={q} index={index} total={questions.length} />
          <div className="question-heading">
            <h1 ref={heading} tabIndex={-1}>{q.title}</h1>
            <p className="question-description">{q.description}</p>
          </div>
          <div className="question-content" key={q.id}>
            <QuestionBody
              q={q}
              value={draft.answers[q.id] ?? (q.kind === 'contact' ? { ...defaults(q), zip: draft.answers.project?.zip || '' } : defaults(q))}
              onChange={setAnswer}
            />
          </div>
          <ErrorMessage>{error}</ErrorMessage>
          <div className="question-footer">
            <button className="text-button" onClick={back}><ArrowLeft size={17} />Back</button>
            <p className="footer-motto">A kitchen designed around you.</p>
            <Button onClick={next}>{index === questions.length - 1 ? 'See my Kitchen DNA' : 'Continue'}<ArrowRight size={19} /></Button>
          </div>
        </main>
      )}

      {resetOpen && (
        <div className="modal-backdrop">
          <section ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <button className="dialog-close text-button" onClick={() => setResetOpen(false)} aria-label="Close"><X size={20} /></button>
            <h2 id="reset-title">Start with a fresh page?</h2>
            <p>This clears the answers saved in this browser. Starting fresh does not remove a brief you already shared with Aureo Furniture. You can remove that confirmation from your current results before starting over.</p>
            <div>
              <Button onClick={reset}>Start fresh</Button>
              <Button secondary onClick={() => setResetOpen(false)}>Keep my answers</Button>
            </div>
            {draft.sharedId && <button className="text-button" onClick={() => { setResetOpen(false); route('results'); }}>Review my shared brief</button>}
          </section>
        </div>
      )}
    </div>
  );
}
