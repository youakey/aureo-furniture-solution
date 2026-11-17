// Simple tone palettes (hex + label). Samples are confirmed in person with an Aureo designer.

export const HELP_PALETTE = { id: 'unsure', label: 'Help me choose', color: '#2a2722' };

export const LEGACY_PALETTES = [
  { id: 'ivory', label: 'Warm white', color: '#ece6da', tone: 'ivory', legacy: true },
  { id: 'greige', label: 'Soft greige', color: '#b7ac9c', tone: 'greige', legacy: true },
  { id: 'oak', label: 'Natural oak', color: '#c19a67', tone: 'oak', legacy: true },
  { id: 'sage', label: 'Earthy green', color: '#777e64', tone: 'sage', legacy: true },
  { id: 'navy', label: 'Deep blue', color: '#354855', tone: 'navy', legacy: true },
  { id: 'charcoal', label: 'Charcoal', color: '#393a36', tone: 'charcoal', legacy: true },
  { id: 'walnut', label: 'Warm wood', color: '#70543d', tone: 'walnut', legacy: true },
];

export const PALETTES = [...LEGACY_PALETTES, HELP_PALETTE];

export function findPalette(id) {
  return PALETTES.find(p => p.id === id);
}

export function paletteLabel(p) {
  return p?.label || 'Not specified';
}

// Suggested tones per style when the guest is unsure.
export const STYLE_PALETTES = {
  'warm-minimal': ['oak', 'ivory', 'greige'],
  'quiet-classic': ['ivory', 'greige', 'walnut'],
  'natural-character': ['sage', 'oak', 'ivory'],
  'bold-modern': ['charcoal', 'walnut', 'ivory'],
  'tailored-transitional': ['greige', 'walnut', 'ivory'],
  'textural-heritage': ['walnut', 'oak', 'ivory'],
};
