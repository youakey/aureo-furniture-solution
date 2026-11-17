import { isValidUsPhone } from "../lib/us-phone.js";
import { isValidUsZip } from "../lib/us-zip.js";
import {PALETTES,findPalette,paletteLabel,STYLE_PALETTES} from './palettes.js';
export {PALETTES} from './palettes.js';
export const SCHEMA_VERSION = 2;
const option = (id, label, detail = '') => ({ id, label, detail });
export const STYLES = [
  { id: 'warm-minimal', label: 'Warm minimal', detail: 'Clean lines. Natural warmth.', image: '/images/warm-minimal.webp', profile: 'slab', palette: ['oak', 'ivory', 'greige'] },
  { id: 'quiet-classic', label: 'Quiet classic', detail: 'Timeless details. Soft neutrals.', image: '/images/quiet-classic.webp', profile: 'shaker', palette: ['ivory', 'greige', 'walnut'] },
  { id: 'natural-character', label: 'Natural character', detail: 'Earthy color. Tactile finishes.', image: '/images/natural-character.webp', profile: 'slab', palette: ['sage', 'oak', 'ivory'] },
  { id: 'bold-modern', label: 'Bold modern', detail: 'Sculptural shapes. Rich contrast.', image: '/images/bold-modern.webp', profile: 'slab', palette: ['charcoal', 'walnut', 'ivory'] },
  { id: 'tailored-transitional', label: 'Tailored transitional', detail: 'A little classic. A little contemporary.', image: '/images/tailored-transitional.webp', profile: 'slim-shaker', palette: ['greige', 'walnut', 'ivory'] },
  { id: 'textural-heritage', label: 'Textural heritage', detail: 'Honest materials. Collected character.', image: '/images/textural-heritage.webp', profile: 'shaker', palette: ['walnut', 'oak', 'ivory'] },
];
export const SECTIONS = ['Your style', 'Daily rituals', 'Your household', 'The details', 'Your investment', 'What’s next'];

export const QUESTIONS = [
  { id: 'personality', section: 0, kind: 'multi', title: 'First, a little about you.', description: 'Choose up to three words that feel most like you.', min: 1, max: 3,
    options: ['Practical', 'Creative', 'Organized', 'Spontaneous', 'Detail-focused', 'Sociable', 'Independent', 'Thoughtful', 'Adventurous', 'Easygoing', 'Traditional', 'Minimalist'].map(x => option(x.toLowerCase().replaceAll(' ', '-'), x)) },
  { id: 'feeling', section: 0, kind: 'multi', title: 'How should your kitchen feel?', description: 'Choose up to three. A beautiful kitchen can have more than one side.', min: 1, max: 3,
    options: [option('calm', 'Calm & uncluttered'), option('warm', 'Warm & welcoming'), option('social', 'Made for gathering'), option('refined', 'Refined & considered'), option('bold', 'Expressive & unexpected'), option('easy', 'Effortless every day')] },
  { id: 'style', section: 0, kind: 'photo', title: 'Which kitchen feels like you?', description: 'Choose the one you are most drawn to. We’ll refine the details together.', options: STYLES },
  { id: 'palette', section: 0, kind: 'palette', title: 'What colors draw you in?', description: 'Choose up to three tones that draw you in. Your Aureo designer will help you find the right balance with real samples.', min: 1, max: 3, options: PALETTES },
  { id: 'colorPlacement', section: 0, kind: 'single', title: 'One color, or a little contrast?', description: 'Think about the cabinets, not the room around them.', options: [option('one', 'One harmonious finish', 'The same finish throughout.'), option('two-tone', 'Two complementary finishes', 'Different base and upper cabinets, or a contrasting island.'), option('open', 'Show me both', 'I’d like to compare before deciding.')] },
  { id: 'profile', section: 0, kind: 'single', title: 'Let’s look a little closer.', description: 'Which cabinet-door detail feels right?', options: [option('slab', 'Flat & minimal', 'A smooth slab door, with clean, simple lines.'), option('slim-shaker', 'Subtly framed', 'A slim frame for a tailored, understated look.'), option('shaker', 'Classic framed', 'A more defined frame and timeless detailing.'), option('unsure', 'Guide me', 'I’d like to see samples with my designer.')] },
  { id: 'finish', section: 0, kind: 'single', title: 'And the finishing touch?', description: 'Pick the surface you are most drawn to. Samples come later.', options: [option('matte', 'Soft matte', 'A quiet, low-sheen appearance.'), option('satin', 'Gentle satin', 'A little reflection, without a high-gloss look.'), option('wood', 'Visible wood texture', 'Natural grain and a tactile finish.'), option('gloss', 'Polished gloss', 'A smooth, light-reflecting statement.'), option('unsure', 'I’m open to suggestions')] },
  { id: 'cooking', section: 1, kind: 'single', title: 'What’s cooking on a typical week?', description: 'Every kitchen should work for real life.', options: [option('daily', 'We cook almost every day'), option('often', 'A few times a week'), option('weekends', 'Mostly weekends'), option('light', 'Quick meals & takeout')] },
  { id: 'rituals', section: 1, kind: 'multi', title: 'What happens here besides dinner?', description: 'Choose everything you want your kitchen to make room for.', min: 1, max: 6, options: [option('scratch', 'Cooking from scratch'), option('baking', 'Baking & weekend projects'), option('coffee', 'The morning coffee ritual'), option('entertaining', 'Hosting friends & family'), option('work', 'Work, homework & conversation'), option('simple', 'Keeping everyday meals simple')] },
  { id: 'baking', section: 1, kind: 'multi', title: 'A little room for your baking ritual.', description: 'Which would make the biggest difference? Choose up to two.', min: 1, max: 2, when: a => a.rituals?.includes('baking'), options: [option('mixer', 'A home for the stand mixer'), option('trays', 'Upright tray & baking-sheet storage'), option('prep', 'A clear, dedicated prep area'), option('ingredients', 'Ingredients within easy reach')] },
  { id: 'hosting', section: 1, kind: 'single', title: 'When you host, what matters most?', description: 'A space for guests and a space for you.', when: a => a.rituals?.includes('entertaining'), options: [option('seating', 'Guests can sit & stay awhile'), option('serving', 'Room to serve without crowding the cook'), option('drinks', 'A separate drinks or coffee spot'), option('flexible', 'A flexible, open gathering space')] },
  { id: 'household', section: 2, kind: 'household', title: 'Who will call this kitchen home?', description: 'A little context helps us plan storage and everyday flow.' },
  { id: 'cooks', section: 2, kind: 'single', title: 'How many cooks share the kitchen?', description: 'Think about your busiest moments.', options: [option('one', 'Usually one person'), option('two', 'Two people, side by side'), option('many', 'A full house of helpers')] },
  { id: 'familyRoutine', section: 2, kind: 'multi', title: 'What makes busy days run better?', description: 'Choose up to two everyday priorities.', min: 1, max: 2, when: a => Number(a.household?.children) > 0, options: [option('snacks', 'An easy-to-reach snack zone'), option('safe', 'Cooking and family traffic stay separate'), option('cleanup', 'Simple cleanup after meals'), option('homework', 'Space for homework or helping hands')] },
  { id: 'pain', section: 2, kind: 'multi', title: 'What would you love to change?', description: 'Choose your three biggest frustrations.', min: 1, max: 3, options: [option('clutter', 'Cluttered countertops'), option('storage', 'Not enough useful storage'), option('flow', 'An awkward layout'), option('dated', 'An outdated look'), option('cleaning', 'Too much cleaning & upkeep'), option('worn', 'Worn doors, drawers or hardware'), option('light', 'A space that feels dark'), option('none', 'Starting fresh—no existing kitchen')] },
  { id: 'storage', section: 3, kind: 'multi', title: 'A place for everything you use.', description: 'Choose up to four storage priorities.', min: 1, max: 4, options: [option('pantry', 'Pantry & dry goods'), option('drawers', 'Deep drawers for pots & pans'), option('spices', 'Spices & cooking essentials'), option('recycling', 'Concealed trash & recycling'), option('appliances', 'Small appliances off the counter'), option('corners', 'Hard-working corner storage'), option('display', 'A little space to display'), option('guidance', 'Help me plan the storage')] },
  { id: 'needs', section: 3, kind: 'multi', title: 'What should we make easier?', description: 'Choose any that matter. We’ll discuss the details together.', min: 1, max: 5, options: [option('reach', 'Reaching everyday items'), option('grip', 'Opening doors & drawers comfortably'), option('maintenance', 'Wiping surfaces clean'), option('children', 'Keeping little hands safe'), option('pets', 'Living with pets'), option('none', 'No special considerations')] },
  { id: 'scope', section: 3, kind: 'single', title: 'How big a change are you imagining?', description: 'Your designer will confirm what works in your space.', options: [option('keep', 'New cabinets, same basic layout'), option('reconfigure', 'Rethink the layout'), option('new', 'Plan a completely new kitchen'), option('explore', 'Help me understand the possibilities')] },
  { id: 'appliances', section: 3, kind: 'single', title: 'What’s the plan for appliances?', description: 'Their sizes and locations shape the cabinet plan.', options: [option('keep', 'Keep the appliances we have'), option('replace', 'Replace all appliances'), option('some', 'A mix of existing & new'), option('unsure', 'We haven’t decided yet')] },
  { id: 'project', section: 3, kind: 'project', title: 'Tell us a little about the space.', description: 'Rough dimensions are welcome. You can leave them blank if you’re unsure.' },
  { id: 'budget', section: 4, kind: 'single', title: 'Let’s find your comfort zone.', description: 'What investment are you considering for cabinets and their installation? Countertops, appliances and major construction are separate.', options: [option('under10', 'Under $10,000'), option('10to25', '$10,000–$25,000'), option('25to50', '$25,000–$50,000'), option('50plus', '$50,000+'), option('unsure', 'Help me set a realistic budget')] },
  { id: 'investment', section: 4, kind: 'multi', title: 'Where should your investment work hardest?', description: 'Choose up to three priorities.', min: 1, max: 3, options: [option('value', 'A strong overall value'), option('finish', 'The look & feel of the finish'), option('storage', 'Storage that works beautifully'), option('durability', 'Long-term durability'), option('installation', 'Precise, professional installation'), option('sustainability', 'Materials & environmental impact'), option('speed', 'A practical project timeline')] },
  { id: 'timeline', section: 5, kind: 'single', title: 'When would you like to enjoy it?', description: 'This helps us plan the next conversation. Lead times will be confirmed with you.', options: [option('asap', 'As soon as practical'), option('1to3', 'Within 1–3 months'), option('3to6', 'Within 3–6 months'), option('6to12', 'In 6–12 months'), option('exploring', 'I’m exploring, without a set date')] },
  { id: 'stage', section: 5, kind: 'single', title: 'Where are you in the journey?', description: 'We’ll meet you where you are.', options: [option('inspiration', 'Gathering ideas'), option('measuring', 'Taking measurements & making plans'), option('design', 'I already have a design'), option('comparing', 'Comparing designs or quotes'), option('ready', 'Ready to choose the right partner')] },
  { id: 'decision', section: 5, kind: 'single', title: 'Who’s making the decisions?', description: 'We want everyone who matters to feel part of the process.', options: [option('me', 'I’m the main decision-maker'), option('partner', 'My partner & I'), option('family', 'A few family members'), option('professional', 'I’m working with a designer or contractor')] },
  { id: 'decisionDetails', section: 5, kind: 'text', title: 'Who should be part of the conversation?', description: 'First names or roles are enough. Add any different priorities you’d like us to consider.', optional: true, when: a => a.decision && a.decision !== 'me', placeholder: 'For example: Alex prefers a lighter finish; I care most about storage.' },
  { id: 'guidance', section: 5, kind: 'single', title: 'How do you like to make a choice?', description: 'Tell us what makes a design conversation helpful.', options: [option('visual', 'Show me images & real samples'), option('details', 'Walk me through the details'), option('compare', 'Give me a few clear options to compare'), option('recommend', 'Make a thoughtful recommendation')] },
  { id: 'concerns', section: 5, kind: 'multi', title: 'What would you like us to clear up?', description: 'Choose any questions or concerns on your mind.', min: 1, max: 6, options: [option('price', 'Staying within budget'), option('finish', 'Choosing a finish I’ll still love'), option('durability', 'How well the cabinets will hold up'), option('timing', 'Delivery & installation timing'), option('disruption', 'Living through the installation'), option('trust', 'Finding a team I can trust'), option('none', 'Nothing specific right now')] },
  { id: 'nextStep', section: 5, kind: 'single', title: 'What would feel like a good next step?', description: 'Choose the level of help you want.', options: [option('samples', 'See finishes & samples'), option('consult', 'Talk with an AUREO designer'), option('measure', 'Discuss a site measurement'), option('quote', 'Review a design & estimate'), option('results', 'Just explore my recommendations for now')] },
  { id: 'contact', section: 5, kind: 'contact', title: 'Make it yours.', description: 'Leave your details so an Aureo Furniture design consultant in Atlanta can follow up. This does not book an appointment.' },
];

export function getQuestions(answers = {}) { return QUESTIONS.filter(q => !q.when || q.when(answers)); }
export function labelFor(id, value) {
  if(id==='palette')return Array.isArray(value)?value.map(v=>paletteLabel(findPalette(v))).join(', '):paletteLabel(findPalette(value));
  const q = QUESTIONS.find(x => x.id === id);
  if (Array.isArray(value)) return value.map(v => q?.options?.find(o => o.id === v)?.label || v).join(', ');
  return q?.options?.find(o => o.id === value)?.label || (typeof value === 'string' ? value : 'Not specified');
}
export function validateAnswer(q, value) {
  if (q.optional && (value === '' || value == null)) return '';
  if (['multi', 'palette'].includes(q.kind)) {
    if (!Array.isArray(value) || value.length < q.min) return 'Choose at least one option to continue.';
    if (value.length > q.max) return `Choose up to ${q.max} options.`;
    if (value.some(v => q.kind==='palette'?!findPalette(v):!q.options.some(o => o.id === v))) return 'Please choose from the available options.';
    if ((value.includes('none') || value.includes('unsure')) && value.length > 1) return 'Choose a preference or the “not sure / none” option.';
    return '';
  }
  if (['single', 'photo'].includes(q.kind)) return q.options.some(o => o.id === value) ? '' : 'Choose an option to continue.';
  if (q.kind === 'household') return value && Number(value.adults) >= 1 && Number(value.adults) <= 8 && Number(value.children) >= 0 && Number(value.children) <= 8 ? '' : 'Tell us how many adults and children share your home.';
  if (q.kind === 'project') {
    if (value?.zip && !/^\d{5}$/.test(value.zip)) return 'Use a five-digit U.S. ZIP code, or leave it blank.';
    for (const key of ['width','length','ceiling']) if (value?.[key] && (!Number.isFinite(Number(value[key])) || Number(value[key]) <= 0 || Number(value[key]) > 100)) return 'Enter approximate dimensions in feet, between 0 and 100.';
    return '';
  }
  if (q.kind === 'contact') {
    if (!value.name?.trim()) return 'Add your name so we can identify your brief.';
    if (!value.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return 'Add a valid email address.';
    if (!isValidUsPhone(value.phone || '')) return 'Enter a valid 10-digit US phone number.';
    if (!isValidUsZip(value.zip || '')) return 'Enter a five-digit U.S. ZIP code.';
    if (value.smsConsent !== true) return 'Please check the box to agree to SMS updates.';
    return '';
  }
  return '';
}

const textValue = (x, n=1000) => typeof x === 'string' ? x.trim().slice(0,n) : '';
export function sanitizeAnswers(input) {
  const raw = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const out = {};
  for (const q of QUESTIONS) {
    if (q.when && !q.when(out)) continue;
    const v = raw[q.id];
    if (['multi','palette'].includes(q.kind)) out[q.id] = [...new Set(Array.isArray(v) ? v.filter(x=>q.kind==='palette'?Boolean(findPalette(x)):q.options.some(o=>o.id===x)) : [])].slice(0,q.max);
    else if (['single','photo'].includes(q.kind)) out[q.id] = q.options.some(o=>o.id===v) ? v : '';
    else if (q.kind === 'text') out[q.id] = textValue(v);
    else if (q.kind === 'household') out[q.id] = { adults: Number(v?.adults), children: Number(v?.children), pets: Boolean(v?.pets) };
    else if (q.kind === 'project') out[q.id] = Object.fromEntries(['zip','width','length','ceiling','notes'].map(k=>[k,textValue(v?.[k],k==='notes'?1000:20)]));
    else if (q.kind === 'contact') out[q.id] = { name:textValue(v?.name,100), email:textValue(v?.email,254), phone:textValue(v?.phone,25), zip:textValue(v?.zip,10), method:['email','phone','text','none'].includes(v?.method)?v.method:'none', share:v?.share===true, smsConsent:v?.smsConsent===true };
  }
  return out;
}
export function validateComplete(answers) {
  for (const q of getQuestions(answers)) {
    const error=validateAnswer(q,answers[q.id]);
    if(error) return {question:q.id,error};
  }
  return null;
}

export function makeRecommendations(input) {
  const a = sanitizeAnswers(input);
  const primary = STYLES.find(s=>s.id===a.style) || STYLES[0];
  const scores=Object.fromEntries(STYLES.map(s=>[s.id,0]));
  scores[primary.id]+=8;
  for(const s of STYLES) {
    if(s.profile===a.profile) scores[s.id]+=2;
    for(const p of a.palette||[]) if(s.palette.includes(findPalette(p)?.tone||p)) scores[s.id]+=1;
  }
  if(a.feeling?.includes('bold')) scores['bold-modern']+=2;
  if(a.feeling?.includes('calm')) scores['warm-minimal']+=1;
  if(a.personality?.includes('traditional')) scores['quiet-classic']+=1;
  const secondary=STYLES.filter(s=>s.id!==primary.id).sort((x,y)=>scores[y.id]-scores[x.id])[0];
  const palettes=(a.palette?.length && !a.palette.includes('unsure') ? a.palette : STYLE_PALETTES[primary.id]).map(findPalette).filter(Boolean);
  const profile=a.profile && a.profile!=='unsure' ? labelFor('profile',a.profile) : labelFor('profile',primary.profile);
  const finish=a.finish && a.finish!=='unsure' ? labelFor('finish',a.finish) : 'Soft matte or a low-sheen finish to compare in person';
  const functions=[];
  const add=(title,why)=>{if(!functions.some(x=>x.title===title))functions.push({title,why});};
  if(a.storage?.includes('drawers')||['daily','often'].includes(a.cooking)) add('Deep drawers near the cooking zone','You want useful storage and a kitchen that supports regular cooking.');
  if(a.storage?.includes('pantry')) add('A pantry arranged around your groceries','You selected pantry storage as a priority. Compare internal drawers and adjustable shelves.');
  if(a.storage?.includes('appliances')||a.pain?.includes('clutter')) add('A home for small appliances','You want clear counters. Plan appliance storage with appropriate electrical and ventilation coordination.');
  if(a.storage?.includes('spices')) add('Cooking essentials within reach','You selected spice storage. Keep frequently used items close to prep and cooking.');
  if(a.storage?.includes('recycling')) add('Concealed trash & recycling','You selected a dedicated waste zone. Confirm its position with the sink and dishwasher plan.');
  if(a.storage?.includes('corners')) add('A considered corner solution','You selected corner storage. Compare a mechanism with drawers or a simpler adjacent layout before spending.');
  if(a.storage?.includes('display')) add('A small, deliberate display moment','You selected display storage. Compare a glazed cabinet with shelving; keep the rest practical.');
  if(a.cooks==='two'||a.cooks==='many') add('Room for more than one cook','You share prep time. Review traffic, landing areas and appliance-door conflicts in a measured plan.');
  if(a.rituals?.includes('baking')) add(a.baking?.includes('mixer')?'A planned mixer and baking zone':'Baking storage beside a clear prep area',`You bake. Priorities: ${labelFor('baking',a.baking)||'a useful prep area'}.`);
  if(a.rituals?.includes('coffee')) add('A dedicated morning ritual spot','You selected coffee. Group cups and supplies away from the busiest prep area.');
  if(a.rituals?.includes('entertaining')) add('A guest-friendly serving zone',`You host. Your priority: ${labelFor('hosting',a.hosting)}.`);
  if(Number(a.household?.children)>0||a.needs?.includes('children')) add('Everyday family storage','You share the space with children or selected child safety. Discuss snack access, hardware choices and traffic around the cooking zone.');
  if(a.needs?.includes('reach')) add('Everyday items at comfortable heights','You asked for easier reach. Review drawer placement and reach heights together on site.');
  if(a.needs?.includes('grip')) add('Hardware you can try in person','You asked for easier opening. Compare real pulls and drawer mechanisms for comfort.');
  if(a.needs?.includes('maintenance')||a.pain?.includes('cleaning')) add('Finishes selected for everyday care','You want easy upkeep. Compare real samples and the manufacturer’s care instructions.');
  if(!functions.length) add('Storage built around your daily essentials','Bring a short inventory of cookware, small appliances and groceries to your design consultation.');
  const readiness=(a.stage==='ready'||a.stage==='comparing'||a.stage==='design')&&['asap','1to3'].includes(a.timeline)?'Ready for a focused consultation':a.timeline==='exploring'||a.stage==='inspiration'?'Exploring possibilities':'Planning the next step';
  const next={samples:'Compare physical door and finish samples in your home’s light.',consult:'Arrange a design conversation around this brief.',measure:'Confirm the room, openings, services and appliance dimensions at a site measurement.',quote:'Review the measured plan, cabinet schedule and an itemized scope before final pricing.',results:'Keep this direction as a starting point and return when you’re ready.'}[a.nextStep]||'Review this brief with an AUREO designer.';
  const concerns=(a.concerns||[]).filter(x=>x!=='none').map(id=>({id,label:labelFor('concerns',id),response:{price:'Clarify the cabinet and installation scope, then compare a base option and optional upgrades.',finish:'Use real finish samples in the home’s light; record the approved finish before ordering.',durability:'Review the actual construction, hardware, care requirements and manufacturer warranty.',timing:'Confirm supplier lead time, delivery dependencies and installation availability before making a promise.',disruption:'Walk through preparation, protection, working hours and the expected sequence.',trust:'Explain the measurement review, installation process, responsibilities and aftercare.'}[id]}));
  const checkpoints=[];
  if(a.scope==='reconfigure'||a.scope==='new') checkpoints.push('Verify the proposed layout, utility work and any required approvals before ordering.');
  if(a.appliances==='keep'||a.appliances==='some') checkpoints.push('Record exact retained appliance models, sizes and clearances.');
  else checkpoints.push('Confirm appliance models and installation specifications before final cabinet sizing.');
  if(a.budget==='under10') checkpoints.push('Start with essential cabinetry and installation; confirm kitchen size and scope before promising budget fit.');
  if(a.budget==='unsure') checkpoints.push('Build a preliminary scope and investment range before selecting premium upgrades.');
  if(a.timeline==='asap') checkpoints.push('Confirm inventory, site readiness and delivery dates before discussing an installation date.');
  if(a.decision!=='me') checkpoints.push('Include the other decision-makers in the sample and budget review.');
  if(a.palette?.includes('unsure')||a.profile==='unsure'||a.finish==='unsure') checkpoints.push('Resolve the open finish and door choices with physical samples.');
  const reasons=[`You chose ${primary.label.toLowerCase()} as your strongest visual preference.`];
  if(a.feeling?.length) reasons.push(`You want the space to feel ${labelFor('feeling',a.feeling).toLowerCase()}.`);
  if(a.palette?.length&&!a.palette.includes('unsure')) reasons.push(`Your selected colors are ${palettes.map(p=>p.label.toLowerCase()).join(', ')}.`);
  return {version:SCHEMA_VERSION,primary,secondary,palettes,profile,finish,functions,reasons,readiness,next,concerns,checkpoints,
    summary:`${primary.label} cabinetry, ${palettes.map(p=>p.label.toLowerCase()).join(' / ')} finishes, and practical details shaped around ${a.cooking==='light'?'easy everyday living':'the way you cook and gather'}.`,
    budget:labelFor('budget',a.budget),timeline:labelFor('timeline',a.timeline),decision:labelFor('decision',a.decision),guidance:labelFor('guidance',a.guidance),traits:labelFor('personality',a.personality),scope:labelFor('scope',a.scope),appliances:labelFor('appliances',a.appliances)};
}

export function reportText(answers,report,{designer=false}={}) {
  const lines=['AUREO · KITCHEN DNA',answers.contact?.name||'Your personal kitchen brief','',report.primary.label,report.summary,'',`Cabinet doors: ${report.profile}`,`Finish: ${report.finish}`,`Color approach: ${labelFor('colorPlacement',answers.colorPlacement)}`,`Colors / finishes: ${report.palettes.map(paletteLabel).join('; ')}`,'','FUNCTIONAL PRIORITIES',...report.functions.map(x=>`• ${x.title}: ${x.why}`),'',`Cabinetry + installation investment: ${report.budget}`,`Desired timing: ${report.timeline}`,'','NEXT STEP',report.next,'','Inspiration only. Cabinet availability, dimensions, pricing and installation scope require designer verification.'];
  if(designer) lines.push('','PRIVATE DESIGNER NOTES',`Design preferences: ${report.traits}`,`Consultation approach: ${report.guidance}`,`Decision-makers: ${report.decision}`,answers.decisionDetails||'',`Readiness: ${report.readiness}`,`Project scope: ${report.scope}`,`Appliances: ${report.appliances}`,`ZIP: ${answers.project?.zip||'Not provided'}`,'','QUESTIONS & CONCERNS',...report.concerns.map(x=>`${x.label}: ${x.response}`),'','VERIFY BEFORE PROPOSING',...report.checkpoints, '', 'Reported preferences, not a validated psychological assessment.');
  return lines.join('\n');
}
