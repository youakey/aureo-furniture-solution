import React from 'react';
import { Check } from './Icons.jsx';
import { LEGACY_PALETTES, HELP_PALETTE } from './palettes.js';

export function PaletteChoices({ question, value = [], onChange }) {
  const atLimit = value.length >= question.max && !value.includes('unsure');

  const toggle = id => {
    if (id === 'unsure') return onChange(value.includes(id) ? [] : [id]);
    const current = value.filter(x => x !== 'unsure');
    if (current.includes(id)) onChange(current.filter(x => x !== id));
    else if (current.length < question.max) onChange([...current, id]);
  };

  return (
    <section className="tone-palette" aria-label="Cabinet color tones">
      <div className="palette-selection-summary" aria-live="polite">
        <span>
          {value.filter(v => v !== 'unsure').length} of {question.max} selected
          {atLimit ? ' · Deselect one to try another.' : ''}
        </span>
        {value.length > 0 && (
          <button className="text-button" type="button" onClick={() => onChange([])}>
            Clear selections
          </button>
        )}
      </div>

      <div className="tone-grid" role="group" aria-label="Cabinet color preferences">
        {LEGACY_PALETTES.map(p => {
          const selected = value.includes(p.id);
          return (
            <button
              type="button"
              key={p.id}
              aria-pressed={selected}
              aria-label={`${p.label}, ${p.color}`}
              className={`tone-option ${selected ? 'is-selected' : ''} ${atLimit && !selected ? 'at-limit' : ''}`}
              onClick={() => toggle(p.id)}
            >
              <span className="tone-swatch" style={{ backgroundColor: p.color }}>
                <span className={`selection-mark ${selected ? 'selected' : ''}`} aria-hidden="true">
                  {selected && <Check size={15} />}
                </span>
              </span>
              <span className="tone-name">{p.label}</span>
              <span className="tone-hex">{p.color.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={`palette-guidance ${value.includes('unsure') ? 'is-selected' : ''}`}
        aria-pressed={value.includes('unsure')}
        onClick={() => toggle('unsure')}
      >
        <span>
          <strong>{HELP_PALETTE.label}</strong>
          <small>I’d like to compare physical samples with my designer.</small>
        </span>
        <span className={`selection-mark ${value.includes('unsure') ? 'selected' : ''}`} aria-hidden="true">
          {value.includes('unsure') && <Check size={15} />}
        </span>
      </button>

      <p className="subtle-note palette-note">
        Screen colors are approximate. Your Aureo designer will confirm finishes with physical samples in your home’s light.
      </p>
    </section>
  );
}
