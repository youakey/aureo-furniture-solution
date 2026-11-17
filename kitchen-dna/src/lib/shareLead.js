import { getQuestions, labelFor, makeRecommendations, sanitizeAnswers } from '../components/assessment.js';
import { toUsE164 } from './us-phone.js';

const SEND_ERROR = 'Could not send your brief. Please try again or call (943) 238-9384.';

function describe(question, answers) {
  const value = answers[question.id];
  if (question.kind === 'household') {
    return `${value.adults} adult(s), ${value.children} child(ren)${value.pets ? ', pets' : ''}`;
  }
  if (question.kind === 'project') {
    const { width, length, ceiling, notes } = value;
    const dimensions = width || length || ceiling
      ? `W ${width || '?'} × L ${length || '?'} × H ${ceiling || '?'} ft`
      : '';
    return [dimensions, notes].filter(Boolean).join(' · ');
  }
  if (question.kind === 'text') return value;
  return labelFor(question.id, value);
}

export async function shareKitchenDnaLead(draft) {
  const answers = sanitizeAnswers(draft.answers);
  const contact = answers.contact;
  const report = makeRecommendations(answers);
  const params = new URLSearchParams(window.location.search);
  const attribution = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']
    .filter(key => params.get(key))
    .map(key => `${key}: ${params.get(key).slice(0, 120)}`)
    .join(' · ')
    .slice(0, 400);

  const summary = getQuestions(answers)
    .filter(question => question.kind !== 'contact')
    .map(question => {
      const answer = describe(question, answers);
      return answer ? `${question.title.replace(/\s+/g, ' ')}: ${answer.slice(0, 250)}` : '';
    })
    .filter(Boolean)
    .join('\n');

  const heading = [
    'Kitchen DNA advertising lead',
    `ZIP: ${contact.zip || answers.project?.zip || 'Not provided'} · Preferred contact: ${contact.method} · SMS consent: ${contact.smsConsent ? 'Yes' : 'No'}`,
    `Style: ${report.primary.label} · Budget: ${report.budget} · Timeline: ${report.timeline}`,
    `Submission ID: ${draft.submissionKey}`,
    attribution,
  ].filter(Boolean).join('\n');

  const message = `${heading}\n\n${summary}`;
  const payload = {
    name: contact.name,
    email: contact.email,
    phone: toUsE164(contact.phone) ?? contact.phone,
    message: message.length > 2000 ? `${message.slice(0, 1999)}…` : message,
  };

  let response;
  try {
    response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(SEND_ERROR);
  }

  const result = await response.json().catch(() => null);
  if (!response.ok || result?.ok !== true) throw new Error(SEND_ERROR);
  return { id: draft.submissionKey };
}
