(() => {
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

/* ---------- Content ---------- */
const MODULES = [
  {t:'Talking to AI', d:'Give clear instructions. Today: the sandwich challenge.'},
  {t:'Thinking critically', d:'AI can be wrong or make things up.'},
  {t:'When to stop asking AI', d:'Some things need your own thinking.'},
  {t:'Staying safe', d:'What you should never tell an AI.'},
  {t:'When to ask an adult', d:'Some situations need a real person.'},
  {t:'Behaving well with AI', d:'Respect, consent and kindness.'}
];

const GAMES = [
  {t:'Sandwich Game', s:'Prompt It Clearly', icon:'sandwich', ready:true},
  {t:'Mistake Hunt', s:'Coming soon', icon:'search', ready:false},
  {t:'Spot the Secret', s:'Coming soon', icon:'shield', ready:false}
];
const ICONS = {
  sandwich:'<path d="M3 11 L12 5 L21 11 Z"/><path d="M3 11h18v3H3z"/><path d="M4 14l2.5 3.5h11L20 14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
};
const icon = (n, size=24) => `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
const ROOM = '405 167';

const TEAMS = [
  {id:'pink', name:'Pink Tents', ex:['Brave Fox','Swift Otter','Calm Koala','Bright Comet']},
  {id:'blue', name:'Blue Rockets', ex:['Jolly Panda','Quick Lynx','Tiny Whale','Lucky Moth']},
  {id:'sunny', name:'Sunny Stars', ex:['Happy Yak','Clever Crab','Mighty Ant','Rocket Hare']}
];
const NICKS = ['Brave Fox','Jolly Panda','Happy Yak','Swift Otter','Quick Lynx','Clever Crab','Calm Koala','Tiny Whale','Mighty Ant',
  'Bright Comet','Lucky Moth','Rocket Hare','Sunny Seal','Wise Owl','Zippy Bee','Cozy Bear','Bold Robin','Merry Mole',
  'Snappy Turtle','Gentle Deer','Dizzy Duck','Proud Puffin','Fuzzy Llama'];
const ME_NICK = 'Cheery Kiwi';
const teamPlayers = ti => NICKS.slice(0, S.joined).filter((_, i) => i % TEAMS.length === ti);
const players = n => `${n} player${n===1?'':'s'}`;
function teamHtml(t, ti){
  const real = teamPlayers(ti), me = ti === 0 && S.userJoined;
  const has = real.length || me;
  const chips = has
    ? real.map(n => `<span class="nick">${n}</span>`).join('') + (me ? `<span class="nick me">You · ${ME_NICK}</span>` : '')
    : t.ex.map(n => `<span class="nick ex">${n}</span>`).join('');
  return `<div class="team team-${t.id}">
    <div class="team-head"><h3>${t.name}</h3><span class="count" id="cnt-${t.id}">${players(has ? real.length + (me?1:0) : t.ex.length)}</span></div>
    <div class="nicks" id="nicks-${t.id}">${chips}</div>
    <p class="ex-note" id="note-${t.id}" ${has?'hidden':''}>Example players until your students join</p>
  </div>`;
}
const joinStatus = () => `${players(S.joined + (S.userJoined?1:0))} joined + 1 live team`;

const CATS = {
  1:{title:'Too vague', did:'The computer doesn’t know what a “sandwich” is. It waits… and does nothing.',
     ask:'What does the computer need to know before it can start?', fix:'Break it into small steps: what to pick up first, and what to do with it.',
     ex:'Make a peanut butter and jelly sandwich.'},
  2:{title:'Forgot to open things', did:'You said “put peanut butter on the bread”, so it put the whole closed jar on the closed bag.',
     ask:'What did we forget to tell it?', fix:'Open the bread bag, take out two slices, and open the jars.',
     ex:'Put peanut butter on the bread and then the jelly.'},
  3:{title:'No tool', did:'Nobody said how to spread it, so it scooped the peanut butter with its hand.',
     ask:'What should it use, and how?', fix:'Pick up the knife and use it to spread.',
     ex:'Open the bag and the jars. Put peanut butter on one slice and jelly on the other.'},
  4:{title:'Steps in the wrong order', did:'It followed your order exactly, so the jelly landed on the plate before the bread arrived.',
     ask:'Which step should come first?', fix:'Bread first, then the spreads. Computers do things in the order you say.',
     ex:'Open the jelly and spread it with the knife. Then take out the bread.'},
  5:{title:'Almost there', did:'Great steps! But nobody said to close it, so it stopped with two open slices.',
     ask:'What’s the very last step?', fix:'Put one slice on top of the other.',
     ex:'Open the bag, take two slices, open both jars, use the knife to spread peanut butter on one slice and jelly on the other.'},
  6:{title:'Clear and complete', did:'Every step was clear and in order. Here’s your sandwich!',
     ask:'What made these instructions work?', fix:'They were specific, in order, and said what the result should be.',
     ex:'Open the bread bag and take out 2 slices. Open the peanut butter. Use the knife to spread it on one slice. Open the jelly and spread it on the other slice. Put the slices together.'}
};

/* 23 example classmates (simulated) with their category */
const SIM = [
 ['Make a sandwich.',1],['Put peanut butter on the bread and jelly on top',2],['Open the bag and the jars and put peanut butter on a slice',3],
 ['do a peanut butter sandwich',1],['Peanut butter on bread, then jelly, then eat it',2],['Take two slices out, open the jars, put the peanut butter and the jelly on',3],
 ['Put bread on a plate and add peanut butter',2],['Open everything, take the bread, use the knife for peanut butter and jelly on each slice',5],
 ['Spread jelly with the knife then get the bread out',4],['sandwich with jelly pls',1],['Add peanut butter to one slice and jelly to the other',2],
 ['Open the jars, take bread, put the stuff on it',3],['Open the bag, take 2 slices, open the jars, knife: peanut butter on one, jelly on the other',5],
 ['Take bread, put peanut butter and jelly',2],['Open the jars and the bag, then add peanut butter and jelly to the bread',3],
 ['Make a PB&J',1],['Peanut butter + jelly + bread',2],['Open the bag, take slices, open both jars, spread with the knife on each slice',5],
 ['Open jelly, spread on the plate with knife, then put the bread',4],['Open the bag and take two slices out and open the jars and put it on',3],
 ['Put the peanut butter and jelly on the bread',2],['Take out 2 slices, open jars, use the knife to spread peanut butter on one and jelly on the other',5],
 ['Open the bread bag and take 2 slices. Open the peanut butter and use the knife to spread it on one slice. Open the jelly and spread it on the other. Put the slices together.',6]
];
const CLASS = 23;

/* Stand-in for the AI step: a simple keyword rule */
function categorize(text){
  const t = ' ' + text.toLowerCase() + ' ';
  const words = t.trim().split(/\s+/).length;
  const food = /bread|slice|pan |pane|rebanada|fetta|peanut|cacahuete|mantequilla|jelly|jam|mermelada|marmellata/.test(t);
  if (words < 5 || !food) return 1;
  if (!/open|abr|apri|take out|saca|unscrew|desenrosc/.test(t)) return 2;
  if (!/knife|cuchillo|coltello|spoon|cuchara|cucchiaio/.test(t)) return 3;
  const sp = t.search(/spread|unta|extiend|spalm/), br = t.search(/bread|slice|pan |rebanada|pane|fetta/);
  if (sp >= 0 && br >= 0 && sp < br) return 4;
  if (!/together|on top|top of|close|cover|junta|encima|cierra|tapa|chiudi|sopra|insieme/.test(t)) return 5;
  return 6;
}

/* ---------- Illustrations (Bolt's kitchen) ---------- */
const INK = '#1F2340';
const sign = (x) => `<g transform="translate(${x} 9)"><rect width="100" height="25" rx="7" fill="#fff" stroke="${INK}" stroke-width="3"/><text x="50" y="17.5" text-anchor="middle" class="s-label" font-size="11" textLength="84" lengthAdjust="spacingAndGlyphs">BOLT'S KITCHEN</text></g>`;
function bag(x, y){
  return `<g transform="translate(${x} ${y})">
    <path d="M22 4 L17 0 M46 4 L51 0" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M8 92 Q2 92 2 86 L4 30 Q5 20 18 17 L25 10 L43 10 L50 17 Q63 20 64 30 L66 86 Q66 92 60 92 Z" fill="#E3F0FC" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="9" y="26" width="50" height="60" rx="10" fill="#E8B460" stroke="#B87A30" stroke-width="2"/>
    <path d="M14 38H54M14 49H54M14 60H54" stroke="#B87A30" stroke-width="1.6"/>
    <rect x="23" y="2" width="22" height="9" rx="3.5" fill="#FFC83D" stroke="${INK}" stroke-width="2.5"/>
    <rect x="4" y="71" width="60" height="15" rx="4" fill="#3D4363" stroke="${INK}" stroke-width="2.5"/>
    <text x="34" y="82.5" text-anchor="middle" class="s-label" font-size="10" style="fill:#fff" textLength="40" lengthAdjust="spacingAndGlyphs">BREAD</text></g>`;
}
function jar(x, y, kind, open){
  const pb = kind === 'pb';
  const body = pb ? '#C27A3A' : '#8C3FC4', neck = pb ? '#A86428' : '#7432A8', lidC = pb ? '#FF6B6B' : '#FFC83D';
  const lid = (lx, ly) => `<rect x="${lx}" y="${ly}" width="46" height="13" rx="4" fill="${lidC}" stroke="${INK}" stroke-width="2.5"/>`
    + [8,15,22,29,36].map(r => `<path d="M${lx+r+1} ${ly+3.5}V${ly+9.5}" stroke="${INK}" stroke-opacity=".45" stroke-width="1.3"/>`).join('');
  return `<g transform="translate(${x} ${y})">
    <rect x="7" y="12" width="32" height="7" fill="${neck}" stroke="${INK}" stroke-width="2"/>
    <rect x="2" y="17" width="42" height="53" rx="10" fill="${body}" stroke="${INK}" stroke-width="2.5"/>
    <rect x="7" y="24" width="4" height="30" rx="2" fill="#fff" fill-opacity=".35"/>
    <rect x="7" y="35" width="32" height="17" rx="3.5" fill="#fff" stroke="${INK}" stroke-width="2"/>
    <text x="23" y="${pb ? 48 : 47.5}" text-anchor="middle" class="s-label" font-size="${pb ? 11 : 8}" ${pb ? '' : 'textLength="26" lengthAdjust="spacingAndGlyphs"'}>${pb ? 'PB' : 'JELLY'}</text>
    ${open ? lid(-50, 57) : lid(0, 0)}</g>`;
}
const breadPath = (x,y,w,h) => `M${x} ${y+h} L${x} ${y+18} Q${x} ${y} ${x+14} ${y+4} Q${x+w/2} ${y-9} ${x+w-14} ${y+4} Q${x+w} ${y} ${x+w} ${y+18} L${x+w} ${y+h} Z`;
function slice(x,y,w,h,spread){
  let s = `<path d="${breadPath(x,y,w,h)}" fill="#C98A3E" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="${breadPath(x+5,y+6,w-10,h-10)}" fill="#F0C27A"/>`;
  if (spread) s += `<ellipse cx="${x+w/2}" cy="${y+h/2+4}" rx="${w/2-12}" ry="${h/2-13}" fill="${spread==='pb'?'#C27A3A':'#8C3FC4'}" stroke="${INK}" stroke-width="2"/>`;
  return s;
}
const plate = (cx=197, rx=78) => `<ellipse cx="${cx}" cy="170" rx="${rx}" ry="21" fill="#fff" stroke="${INK}" stroke-width="3"/><ellipse cx="${cx}" cy="169" rx="${rx-22}" ry="12.5" fill="none" stroke="#C7E1F7" stroke-width="2"/>`;
const knife = (x=267, y=192) => `<g transform="translate(${x} ${y}) rotate(-4)"><path d="M26 0 L72 -2 Q80 0 72 5 L26 6 Z" fill="#DFE7F1" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="0" y="-2" width="28" height="10" rx="4" fill="#3D4363" stroke="${INK}" stroke-width="2.5"/></g>`;
const star = (cx,cy,r) => `<path d="M${cx} ${cy-r} Q${cx} ${cy} ${cx+r} ${cy} Q${cx} ${cy} ${cx} ${cy+r} Q${cx} ${cy} ${cx-r} ${cy} Q${cx} ${cy} ${cx} ${cy-r}Z" fill="#FFC83D" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
const tiles = Array.from({length:16},(_,i)=>`M${i*26} 0V146`).join('') + Array.from({length:6},(_,i)=>`M0 ${i*26+12}H400`).join('');
const kitchen = `<rect width="400" height="220" fill="#EAF4FF"/><path d="${tiles}" stroke="#9FD3FF" stroke-width="1.5"/>`
  + `<rect x="-4" y="142" width="408" height="8" fill="#FFF1C4" stroke="${INK}" stroke-width="3"/>`
  + `<rect x="-4" y="150" width="408" height="74" fill="#FFD23F" stroke="${INK}" stroke-width="3"/>`
  + `<path d="M0 170H400M0 196H400" stroke="${INK}" stroke-opacity=".35" stroke-width="2"/>`;
const svg = (inner,label) => `<svg class="scene" viewBox="0 0 400 220" role="img" aria-label="${esc(label)}">${kitchen}${inner}</svg>`;
const hand = `<rect x="204" y="-4" width="22" height="66" rx="7" fill="#C9CFDD" stroke="${INK}" stroke-width="3"/>
  <rect x="186" y="56" width="58" height="32" rx="10" fill="#C9CFDD" stroke="${INK}" stroke-width="3"/>
  ${[0,1,2].map(i=>`<rect x="${191+i*17}" y="82" width="13" height="26" rx="6" fill="#C9CFDD" stroke="${INK}" stroke-width="2.5"/><rect x="${192.5+i*17}" y="97" width="10" height="10" rx="4" fill="#C27A3A"/>`).join('')}`;

function scene(cat){
  switch(cat){
    case 'task': return svg(sign(150)+bag(18,56)+plate()+jar(292,78,'pb')+jar(343,78,'jelly')+knife(),
      'Bolt’s kitchen: bread bag, empty plate, peanut butter and jelly jars, and a knife');
    case 1: return svg(sign(150)+bag(18,56)+plate()+jar(292,78,'pb')+jar(343,78,'jelly')+knife()
      +`<text x="197" y="128" text-anchor="middle" font-size="72" class="s-mark">?</text>`,'The computer is confused and nothing happens');
    case 2: return svg(sign(14)+plate()+bag(163,76)+jar(173,8,'pb')+jar(343,78,'jelly')+knife(),
      'A closed peanut butter jar placed on top of the closed bread bag, on the plate');
    case 3: return svg(sign(14)+plate()+slice(160,124,74,48)
      +`<path d="M176 146 q8 -11 20 -5 q11 -9 21 2 q9 8 1 17 q-5 10 -18 6 q-12 6 -20 -3 q-11 -6 -4 -17z" fill="#C27A3A" stroke="${INK}" stroke-width="2"/>`
      +hand+jar(292,78,'pb',true)+jar(343,78,'jelly')+knife(),'Bolt’s hand scooping peanut butter onto the bread');
    case 4: return svg(sign(150)+bag(18,56)+plate()+`<ellipse cx="197" cy="169" rx="48" ry="10" fill="#8C3FC4" stroke="${INK}" stroke-width="2"/>`
      +jar(343,78,'jelly',true)+knife(),'Jelly spread on the empty plate, bread still in the bag');
    case 5: return svg(sign(150)+plate(197,96)+slice(124,128,68,46,'pb')+slice(202,128,68,46,'jelly')+knife(),
      'Two open slices side by side on the plate, one with peanut butter and one with jelly');
    case 6: return svg(sign(150)+plate()
      +`<rect x="137" y="152" width="120" height="20" rx="8" fill="#C98A3E" stroke="${INK}" stroke-width="2.5"/><rect x="142" y="155" width="110" height="13" rx="6" fill="#F0C27A"/>`
      +`<rect x="140" y="144" width="114" height="10" rx="5" fill="#8C3FC4" stroke="${INK}" stroke-width="2"/><rect x="140" y="135" width="114" height="10" rx="5" fill="#C27A3A" stroke="${INK}" stroke-width="2"/>`
      +`<path d="M137 138 Q137 110 162 108 L232 108 Q257 110 257 138 Z" fill="#C98A3E" stroke="${INK}" stroke-width="2.5"/><path d="M142 134 Q144 115 164 113 L230 113 Q250 115 252 134 Z" fill="#F0C27A"/>`
      +star(100,104,12)+star(300,96,14)+star(318,126,9)+star(80,128,8),'A finished sandwich on the plate');
  }
}

/* Bolt's head, for avatars */
const boltHead = `<svg viewBox="0 0 120 92" aria-hidden="true"><line x1="60" y1="22" x2="60" y2="10" stroke="#1F2340" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="9" r="7" fill="#FF6B6B" stroke="#1F2340" stroke-width="4"/><rect x="12" y="44" width="12" height="20" rx="5" fill="#FFC83D" stroke="#1F2340" stroke-width="4"/><rect x="96" y="44" width="12" height="20" rx="5" fill="#FFC83D" stroke="#1F2340" stroke-width="4"/><rect x="20" y="22" width="80" height="64" rx="20" fill="#EEF1F7" stroke="#1F2340" stroke-width="5"/><rect x="31" y="33" width="58" height="42" rx="13" fill="#1F2340"/><path d="M42 55 q6 -8 12 0 M66 55 q6 -8 12 0" stroke="#FFE27A" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M53 62 q7 6 14 0" stroke="#FFE27A" stroke-width="4.5" fill="none" stroke-linecap="round"/></svg>`;
const avatar = (i, extra='') => `<span class="av c${i%4} ${extra}">${boltHead}</span>`;

function qrSvg(){
  let seed = 482913, rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
  const n=25, cells=[];
  const finder = (r,c) => (r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    let on;
    if(finder(r,c)){const rr=r>=n-7?r-(n-7):r, cc=c>=n-7?c-(n-7):c; on = rr===0||rr===6||cc===0||cc===6||(rr>=2&&rr<=4&&cc>=2&&cc<=4);}
    else if((r<8&&c<8)||(r<8&&c>=n-8)||(r>=n-8&&c<8)) on=false;
    else on = rnd()>0.52;
    if(on) cells.push(`<rect x="${c}" y="${r}" width="1.02" height="1.02"/>`);
  }
  return `<svg class="qr" viewBox="0 0 ${n} ${n}" role="img" aria-label="QR code to join (illustration)">${cells.join('')}</svg>`;
}

/* Progress chart markup: ids let the ticks update it in place */
const meter = (id, label, done, tot, fillClass='') => `<div class="meter">
  <div class="meter-head"><span>${label}</span><b id="${id}Num">${done} / ${tot}</b></div>
  <div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${done}" id="${id}Track"><i id="${id}Bar" class="${fillClass}${done>=tot?' full':''}" style="width:${pct(done,tot)}%"></i></div>
  <div class="ticks"><span>0</span><span id="${id}Mid">${Math.round(tot/2)}</span><span id="${id}Max">${tot}</span></div></div>`;
function setMeter(id, done, tot){
  const n = $(id+'Num'), b = $(id+'Bar'), t = $(id+'Track');
  if (!n || !b) return false;
  n.textContent = `${done} / ${tot}`;
  b.style.width = pct(done,tot) + '%';
  b.classList.toggle('full', done >= tot);
  if (t){ t.setAttribute('aria-valuenow', done); t.setAttribute('aria-valuemax', tot); }
  const mid = $(id+'Mid'), max = $(id+'Max');
  if (mid) mid.textContent = Math.round(tot/2);
  if (max) max.textContent = tot;
  return true;
}

/* ---------- State ---------- */
const S = {mode:'devices', step:'library', joined:0, userJoined:false, answered:0, userAnswer:'', userCat:null,
           groups:[], idx:0, hands:{1:0,2:0,3:0,4:0,5:0,6:0}, phone:'join', fixShown:false, timer:180, draft:''};
let timers = [];
const clearTimers = () => { timers.forEach(t => {clearInterval(t); clearTimeout(t);}); timers = []; };
const total = () => CLASS + (S.userJoined ? 1 : 0);
let lastKey = '';

/* Live ticks: update only the numbers and bars, never redraw the screen */
/* Lobby tick: drop new nicknames into their team, in place */
let placed = 0;
function addNick(ti, html){
  const t = TEAMS[ti], box = $('nicks-'+t.id); if (!box) return;
  box.querySelectorAll('.ex').forEach(e => e.remove());
  const note = $('note-'+t.id); if (note) note.hidden = true;
  box.insertAdjacentHTML('beforeend', html);
  $('cnt-'+t.id).textContent = players(box.querySelectorAll('.nick').length);
}
function tickLobby(){
  const st = $('joinStatus'); if (!st) return;
  st.textContent = joinStatus();
  setMeter('join', S.joined + (S.userJoined?1:0), total());
  while (placed < S.joined){ addNick(placed % TEAMS.length, `<span class="nick new">${NICKS[placed]}</span>`); placed++; }
  if (S.userJoined && !document.querySelector('.nick.me')) addNick(0, `<span class="nick me new">You · ${ME_NICK}</span>`);
}
function tickTask(){ setMeter('done', S.answered + (S.userAnswer?1:0), total()); }
function tickTimer(){
  const el = $('timer'); if (!el) return;
  el.textContent = `${Math.floor(S.timer/60)}:${String(S.timer%60).padStart(2,'0')}`;
}

function go(step){
  clearTimers(); S.step = step; S.fixShown = false;
  if (step === 'lobby' && S.mode === 'devices'){
    timers.push(setInterval(() => { if (S.joined < CLASS){ S.joined++; tickLobby(); } }, 90));
  }
  if (step === 'task'){
    if (S.mode === 'devices'){
      S.answered = 0; S.userAnswer=''; S.userCat=null;
      if (S.userJoined) S.phone = 'answer';
      timers.push(setInterval(() => { if (S.answered < CLASS){ S.answered++; tickTask(); } }, 420));
    } else {
      S.timer = 180;
      timers.push(setInterval(() => { if (S.timer > 0){ S.timer--; tickTimer(); } }, 1000));
    }
  }
  if (step === 'sorting'){
    timers.push(setTimeout(() => { buildGroups(); S.idx = 0; go('scenario'); }, 2900));
  }
  if (step === 'scenario' && S.mode === 'paper' && !S.groups.length){ buildGroups(); }
  render();
}

function buildGroups(){
  if (S.mode === 'paper'){
    S.groups = [1,2,3,4,5,6].map(c => ({cat:c, count:null, example:CATS[c].ex, mine:false}));
    return;
  }
  const answers = SIM.slice(0, Math.max(S.answered, 0)).map(([t,c]) => ({t,c,mine:false}));
  if (S.userAnswer) answers.push({t:S.userAnswer, c:S.userCat, mine:true});
  const groups = [];
  for (let c=1;c<=6;c++){
    const inCat = answers.filter(a => a.c === c);
    if (!inCat.length && c !== 6) continue;
    const mine = inCat.find(a => a.mine);
    const pick = mine || inCat.slice().sort((a,b)=>a.t.length-b.t.length)[0];
    groups.push({cat:c, count:inCat.length, example: pick ? pick.t : CATS[c].ex, mine: !!mine});
  }
  S.groups = groups;
}

function restart(){
  clearTimers();
  Object.assign(S, {step:'library', joined:0, userJoined:false, answered:0, userAnswer:'', userCat:null, groups:[], idx:0,
                    hands:{1:0,2:0,3:0,4:0,5:0,6:0}, phone:'join', fixShown:false, timer:180, draft:''});
  lastKey = '';
  render();
}
function setMode(m){ S.mode = m; restart(); }

/* ---------- Render: classroom screen ---------- */
function renderScreen(){
  const el = $('screen'); let h = '';
  const st = S.step, dev = S.mode === 'devices';

  if (st === 'library'){
    h = `<div><div class="eyebrow">Teacher view</div><h2>Choose a game</h2></div>
    <div class="games">${GAMES.map(g=>`
      <div class="game ${g.ready?'ready':'soon'}" ${g.ready?'aria-current="true"':''}>
        <div class="game-top">${icon(g.icon,40)}${icon(g.ready?'check':'lock',28)}</div>
        <h3>${g.t}</h3><p>${g.s}</p></div>`).join('')}</div>
    <div class="settings">
      <label class="field">Age<select id="age"><option>10–12</option></select></label>
      <label class="field">Language<select id="lang"><option>Español</option><option selected>English</option><option>Italiano</option></select></label>
      <label class="field">Classroom<select id="modeSel"><option value="devices" ${dev?'selected':''}>Students have devices</option><option value="paper" ${!dev?'selected':''}>Paper only</option></select></label>
      <span class="spacer"></span>
      <button class="btn" id="startLesson">Start Sandwich Game</button>
    </div>`;
  }

  if (st === 'lobby'){
    if (dev){
      placed = S.joined;
      h = `<div class="room">
        <div class="joincard">
          <h2>Join the room</h2>
          <p class="joinhelp">Scan the code, or go to <b>aiventura.app/play/join</b> and type the room code.</p>
          <div class="qrbox">${qrSvg()}</div>
          <div class="roomcode"><span>Room code</span><b>${ROOM}</b></div>
        </div>
        <div class="teamscard">
          <h2>Teams are forming</h2>
          <div class="status"><span class="dot" aria-hidden="true"></span><span id="joinStatus">${joinStatus()}</span></div>
          ${meter('join','Players in the room', S.joined + (S.userJoined?1:0), total())}
          <div class="privacy">${icon('lock',22)}<span>Everyone plays with a fun nickname. No real names, ever.</span></div>
          <div class="teams">${TEAMS.map(teamHtml).join('')}
            <div class="team team-live">
              <div class="team-head"><h3>Lilac Explorers</h3><span class="count">Live team</span></div>
              <p class="live-note">This team plays together with the class.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-bar"><span class="small">Tip: join on the phone on the right with code ${ROOM}.</span><span class="spacer"></span><button class="btn" id="toTask">Start the challenge</button></div>`;
    } else {
      h = `<div><div class="eyebrow">Module 1 · Talking to AI · Paper mode</div><h2>Hand out the worksheets</h2></div>
      <p class="lead">Each student gets a printed sheet that looks like a chat with an AI. They write their instructions by hand. No phones or tablets needed.</p>
      <div class="bottom-bar"><span class="spacer"></span><button class="btn" id="toTask">Show the challenge</button></div>`;
    }
  }

  if (st === 'task'){
    h = `<div class="eyebrow">The challenge</div>
    <div class="task"><div class="prompt-card">Give the computer instructions to make a peanut butter and jelly sandwich.</div>${scene('task')}</div>
    <p class="lead">Pretend the computer has never made a sandwich. It will do <em>exactly</em> what you write.</p>`;
    if (dev){
      h += `<div class="bottom-bar">${meter('done','Answers in', S.answered + (S.userAnswer?1:0), total(), 'go')}
      <button class="btn" id="reveal">See what the computer understood</button></div>`;
    } else {
      const m = Math.floor(S.timer/60), s = String(S.timer%60).padStart(2,'0');
      h += `<div class="bottom-bar"><div><div class="timer" id="timer">${m}:${s}</div><span class="small">Writing time on paper</span></div><span class="spacer"></span><button class="btn" id="reveal">Everyone’s done: show what could happen</button></div>`;
    }
  }

  if (st === 'sorting'){
    const n = S.answered + (S.userAnswer?1:0);
    h = `<div><div class="eyebrow">One moment</div><h2>Bolt is reading your answers</h2></div>
    <div class="sorting"><img src="assets/bolt-mark.svg" alt="Bolt" width="120" height="136">
      ${meter('sort','Answers sorted into groups', 0, n || 1, 'go')}</div>
    <p class="lead">Every answer goes into a group. Nobody's name is shown, only what the groups have in common.</p>`;
  }

  if (st === 'scenario'){
    const g = S.groups[S.idx], c = CATS[g.cat], n = S.groups.length;
    const countLine = dev
      ? (g.count ? `<div class="big-count"><em>${g.count}</em> of you wrote something like this</div>` : `<div class="big-count">Nobody got here yet. Here’s what clear instructions look like</div>`)
      : `<div class="row"><div class="big-count">If you wrote something like this…</div><span class="spacer"></span>
         <div class="hands" aria-label="Raised hands"><span class="small">Hands up:</span><button id="hMinus" aria-label="One fewer">−</button><span class="n" id="handsN">${S.hands[g.cat]}</span><button id="hPlus" aria-label="One more">+</button></div></div>`;
    h = `<div class="scen-head"><span class="pill">${S.idx+1} of ${n}</span><span class="pill ${g.cat===6?'good':''}">${c.title}</span>
      ${g.mine?'<span class="pill you">Your answer is in this group</span>':''}</div>
    ${countLine}
    <div class="scen">
      <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
        <div class="bubble"><small>${dev && g.count ? 'One answer from this group' : 'Example answer'}</small>${esc(g.example)}</div>
        <p class="did"><strong>What the computer did:</strong> ${c.did}</p>
      </div>
      <div>${scene(g.cat)}</div>
    </div>
    <div class="ask" id="askBox"><p><span class="k">Ask the class</span>${c.ask}</p>
      ${S.fixShown ? `<div class="fix"><b>${g.cat===6?'Why it worked:':'The fix:'}</b> ${c.fix}</div>` : `<button class="btn secondary" id="showFix">Show the fix</button>`}</div>
    <div class="bottom-bar"><button class="btn secondary" id="prev" ${S.idx===0?'disabled':''}>Back</button><span class="spacer"></span>
      <button class="btn" id="next">${S.idx===n-1?'Wrap up':'Next group'}</button></div>`;
  }

  if (st === 'wrap'){
    h = `<div><div class="eyebrow">What we learned</div><h2>Computers do exactly what we say. So say it clearly.</h2></div>
    <div class="tips">
      <div class="tip"><h3>Be specific</h3><p>Say exactly what to pick up and what to do with it.</p></div>
      <div class="tip"><h3>Put steps in order</h3><p>The computer follows your order, even when it makes no sense.</p></div>
      <div class="tip"><h3>Say what you want at the end</h3><p>“Put the slices together” finishes the job.</p></div>
    </div>
    <p class="lead">Next lesson: <b>Thinking critically</b>. What if the computer sounds sure, but it’s wrong?</p>
    <div class="bottom-bar"><button class="btn secondary" id="toLib">Back to lessons</button><span class="spacer"></span><button class="btn" id="again">Try again with better instructions</button></div>`;
  }

  /* Animate only when the view really changes (new step, mode or group), never on live updates */
  const key = `${st}|${S.mode}|${S.idx}`;
  const animate = key !== lastKey; lastKey = key;
  el.innerHTML = `<div class="${animate?'fade':''}" style="display:flex;flex-direction:column;gap:18px;flex:1">${h}</div>`;

  if (st === 'sorting') startSortChart();

  const on = (id, fn) => { const b = $(id); if (b) b.onclick = fn; };
  on('startLesson', () => go('lobby'));
  const ms = $('modeSel'); if (ms) ms.onchange = e => { setMode(e.target.value); };
  on('toTask', () => go('task'));
  on('reveal', () => { if (S.mode==='devices') go('sorting'); else { buildGroups(); S.idx=0; go('scenario'); } });
  on('showFix', () => { S.fixShown = true; renderFix(); });
  on('prev', () => { S.idx--; S.fixShown=false; render(); });
  on('next', () => { if (S.idx < S.groups.length-1){ S.idx++; S.fixShown=false; render(); } else go('wrap'); });
  on('hPlus', () => { const c=S.groups[S.idx].cat; S.hands[c]++; $('handsN').textContent = S.hands[c]; });
  on('hMinus', () => { const c=S.groups[S.idx].cat; S.hands[c]=Math.max(0,S.hands[c]-1); $('handsN').textContent = S.hands[c]; });
  on('toLib', () => restart());
  on('again', () => { S.groups=[]; go('task'); });
}

/* Show the fix without redrawing the scenario */
function renderFix(){
  const btn = $('showFix'); if (!btn) return;
  const g = S.groups[S.idx], c = CATS[g.cat];
  const div = document.createElement('div'); div.className = 'fix';
  div.innerHTML = `<b>${g.cat===6?'Why it worked:':'The fix:'}</b> ${c.fix}`;
  btn.replaceWith(div);
}

/* Sorting: a progress chart fills while the three stages light up */
function startSortChart(){
  const n = S.answered + (S.userAnswer?1:0) || 1, dur = 2600, t0 = performance.now();
  const step = () => {
    if (S.step !== 'sorting') return;
    const p = Math.min(1, (performance.now() - t0) / dur);
    setMeter('sort', Math.round(p * n), n);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Render: phone / worksheet ---------- */
function renderSide(){
  const side = $('side');
  if (S.mode === 'paper'){
    $('sideLabel').textContent = 'Printed worksheet (paper mode)';
    side.innerHTML = `<div class="worksheet a4ws">
      <div class="ws-top"><span class="ws-mark"><span class="ai">ai</span><span class="ventura">ventura</span></span><span class="ws-team">Team name: <i></i></span></div>
      <div class="ws-head"><img src="assets/bolt-mark.svg" alt=""><div><h3>Prompt it clearly</h3><p>Use only your team name. Never write real names on this sheet!</p></div></div>
      <section class="ws-box"><h4>Task 1 · Read Bolt's message</h4><div class="msg bot">Give me instructions to make a peanut butter and jelly sandwich. I will do exactly what you write!</div></section>
      <section class="ws-box"><h4>Task 2 · Write your steps</h4><div class="lines">${'<span></span>'.repeat(6)}</div></section>
      <section class="ws-check"><h4>Team check</h4><div><i></i>Every step says exactly what to do</div><div><i></i>Nothing is missing</div><div><i></i>Nothing private or unkind</div></section>
      <div class="ws-foot">aiventura · Module 1 · Prompt it clearly · look at the big screen when done</div>
    </div>`;
    return;
  }
  $('sideLabel').textContent = 'Student phone (try it)';
  let h = '';
  const st = S.step;
  if (S.phone === 'join'){
    const open = st === 'lobby' || st === 'task';
    h = `<div class="ph-title mark"><span class="ai">ai</span><span class="ventura">ventura</span></div>
    <div class="ph-center">
      <label for="code" class="small">Type the code on the big screen</label>
      <input class="ph-input" id="code" inputmode="numeric" maxlength="7" placeholder="${ROOM}" value="${open?ROOM:''}">
      <button class="ph-btn" id="join" ${open?'':'disabled'}>Join</button>
      <p class="hint">${open ? 'No name, no account. Just the code.' : 'The teacher hasn’t started a lesson yet. Click “Start Sandwich Game” on the big screen.'}</p>
    </div>`;
  } else if (S.phone === 'waiting'){
    h = `<div class="ph-center"><img class="ph-bolt" src="assets/bolt-mark.svg" alt="Bolt"><div class="ph-title" style="margin:0">You’re in!</div><p class="hint">Look at the big screen. The challenge starts soon.</p></div>`;
  } else if (S.phone === 'answer'){
    h = `<div class="chat"><div class="msg bot">Give me instructions to make a peanut butter and jelly sandwich. I will do <b>exactly</b> what you write!</div></div>
    <div class="composer"><label for="ans" class="small">Your instructions</label>
      <textarea id="ans" maxlength="400" placeholder="Step 1: ...">${esc(S.draft)}</textarea>
      <button class="ph-btn" id="send">Send</button>
      <p class="hint">Pretend the computer has never made a sandwich.</p></div>`;
  } else if (S.phone === 'sent'){
    h = `<div class="chat"><div class="msg bot">Give me instructions to make a peanut butter and jelly sandwich.</div><div class="msg me">${esc(S.userAnswer)}</div></div>
    <div class="ph-center" style="flex:0"><div class="ph-title" style="margin:0">Sent!</div><p class="hint">${st==='task'?'Wait for your classmates, then look at the big screen.':'Look at the big screen and join the discussion.'}</p></div>`;
  }
  side.innerHTML = `<div class="phone"><div class="phone-screen"><span class="notch"></span>${h}</div></div>`;

  const j = $('join'); if (j) j.onclick = () => {
    S.userJoined = true; S.phone = (S.step==='task') ? 'answer' : 'waiting';
    renderSide();
    // update the classroom screen in place: add "me" to the room, bump totals
    if (S.step === 'lobby') tickLobby();
    if (S.step === 'task') tickTask();
  };
  const ta = $('ans'); if (ta) ta.oninput = e => { S.draft = e.target.value; };
  const sd = $('send'); if (sd) sd.onclick = () => {
    const v = (S.draft || '').trim(); if (!v) { ta && ta.focus(); return; }
    S.userAnswer = v; S.userCat = categorize(v); S.draft=''; S.phone = 'sent';
    renderSide(); tickTask();
  };
}

function renderSteps(){
  const list = S.mode === 'devices'
    ? [['library','Choose game'],['lobby','Teams join'],['task','Write answers'],['sorting','AI sorts'],['scenario','Discuss groups'],['wrap','Wrap up']]
    : [['library','Choose game'],['lobby','Hand out sheets'],['task','Write on paper'],['scenario','Discuss scenarios'],['wrap','Wrap up']];
  $('steps').innerHTML = list.map(([k,l]) => `<span class="${k===S.step?'on':''}" ${k===S.step?'aria-current="step"':''}>${l}</span>`).join('');
}

function render(){
  if (S.mode==='devices' && S.userJoined && S.step==='task' && S.phone==='waiting') S.phone='answer';
  if (S.mode==='devices' && !S.userJoined) S.phone='join';
  renderScreen(); renderSide(); renderSteps();
  $('modeDevices').setAttribute('aria-pressed', S.mode==='devices'); $('modePaper').setAttribute('aria-pressed', S.mode==='paper');
}

$('modeDevices').onclick = () => setMode('devices');
$('modePaper').onclick = () => setMode('paper');
$('restart').onclick = restart;
render();

/* ---------- Loading: show a progress chart until fonts and Bolt are ready, then reveal once ---------- */
(function boot(){
  const items = [
    ['Title font', () => document.fonts ? document.fonts.load('400 1em "Luckiest Guy"') : Promise.resolve()],
    ['Text font', () => document.fonts ? Promise.all([document.fonts.load('500 1em Fredoka'), document.fonts.load('700 1em Fredoka')]) : Promise.resolve()],
    ['Bolt', () => new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = 'assets/bolt-mark.svg'; })],
    ['Kitchen', () => new Promise(res => requestAnimationFrame(() => res()))]
  ];
  const list = $('ldList'), fill = $('ldFill'), pctEl = $('ldPct');
  list.innerHTML = items.map(([l],i) => `<li id="ld${i}">${l}</li>`).join('');
  let done = 0, finished = false;
  const update = () => { const p = pct(done, items.length); fill.style.width = p + '%'; pctEl.textContent = p + '%'; };
  const finish = () => {
    if (finished) return; finished = true;
    done = items.length; update();
    setTimeout(() => {
      document.body.classList.add('ready');
      setTimeout(() => { const l = $('loader'); if (l) l.remove(); }, 400);
    }, 250);
  };
  items.forEach(([, task], i) => {
    Promise.resolve().then(task).catch(() => {}).then(() => {
      if (finished) return;
      done++; const li = $('ld'+i); if (li) li.classList.add('done'); update();
      if (done === items.length) finish();
    });
  });
  setTimeout(finish, 4000); // never block the page if a font is slow
})();
})();
