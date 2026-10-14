'use strict';
const $=id=>document.getElementById(id), M=window.SFR;
const initial=()=>({ddr:1,port:1,pin:2,admux:0x42,volts:[1,2,2.5,3,4,1.5,.5,4.5],led:'source',r:330,pull:'up',closed:false,enabled:false,busy:false,result:null,sample:null,status:'ADC ausgeschaltet. Wählen Sie einen Eingang und schalten Sie den ADC ein.'});
let s=initial();
const f=(v,n=2)=>v==null?'unbestimmt':v.toFixed(n).replace('.',',');
const path=(d,cls='wire')=>`<path d="${d}" class="${cls}"/>`;
const txt=(x,y,t,cls='')=>`<text x="${x}" y="${y}" class="${cls}">${t}</text>`;
const svg=(content,w=620,h=330)=>`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Schaltbild der aktuellen Einstellung">${content}</svg>`;
function register(where,key,label,names){
 const v=s[key];$(where).innerHTML=`<div class="register"><div class="register-title"><b>${label}</b><code>${M.hex(v)} · ${v.toString(2).padStart(8,'0')}</code></div><div class="bits">${Array.from({length:8},(_,i)=>{const n=7-i,b=M.bit(v,n),c=key==='admux'?(n>5?'ref':n===5?'align':'mux'):'';return `<div class="bitcell"><small>Bit ${n}</small><button data-reg="${key}" data-bit="${n}" class="${b?'on ':''}${c}" aria-pressed="${!!b}" aria-label="${label} ${names?names[i]:'Bit '+n}, aktuell ${b}">${b}</button><small>${names?names[i]:'PA'+n}</small></div>`}).join('')}</div></div>`;
}
function redrawRegisters(){
 for(const suffix of ['register','circuit']){register('ddr-'+suffix,'ddr','DDRA');register('port-'+suffix,'port','PORTA');}
 register('admux-register','admux','ADMUX',['REFS1','REFS0','ADLAR','MUX4','MUX3','MUX2','MUX1','MUX0']);
 $('port-code').textContent=`DDRA  = ${M.hex(s.ddr)};\nPORTA = ${M.hex(s.port)};\n// PUD = 0: interne Pull-ups erlaubt`;
}
function pinView(){
 const p=M.pin(s.ddr,s.port,s.pin);$('pin-mode').textContent=p.mode; $('pin-direction').textContent=`PA${s.pin}: ${p.out?'AUSGANG':'EINGANG'}`;
 const high=p.out&&p.high,low=p.out&&!p.high;
 let content=`<rect x="30" y="30" width="390" height="260" rx="16" class="zone"/>${txt(48,60,'ATmega32A · PA'+s.pin)}${txt(65,100,'VCC = 5 V')}${txt(78,275,'GND')}`;
 content+=path('M 105 108 V 132 H 160',high?'active':'wire')+path('M 160 132 H 205',high?'active':'wire')+path('M 205 132 H 320 V 185',high?'active':'wire');
 if(!high)content+=`<rect x="166" y="126" width="32" height="12" fill="#edf4f8"/>${path('M 160 132 L 192 113','wire')}`;
 content+=path('M 105 255 V 237 H 160',low?'active':'wire')+path('M 160 237 H 205',low?'active':'wire')+path('M 205 237 H 320 V 185',low?'active':'wire');
 if(!low)content+=`<rect x="166" y="231" width="32" height="12" fill="#edf4f8"/>${path('M 160 237 L 192 218','wire')}`;
 content+=path('M 320 185 H 535','active')+`<circle cx="320" cy="185" r="5" fill="#005b96"/>${txt(545,172,'PA'+s.pin)}`;
 content+=path('M 105 108 V 78 H 300 V 95',p.pull?'active':'wire')+`<rect x="290" y="95" width="20" height="45" class="part ${p.pull?'':'dim'}"/>`+path('M 300 140 V 185 H 320',p.pull?'active':'wire')+txt(325,113,'Pull-up','tiny');
 if(!p.pull)content+=`<rect x="294" y="150" width="12" height="26" fill="#edf4f8"/>${path('M 300 150 L 283 172','wire')}`;
 content+=path('M 320 185 H 230 V 320 H 65','digital')+txt(68,344,'Zur digitalen Eingangsschaltung → PINA'+s.pin,'tiny');
 content+=txt(430,95,high?'Treiber High aktiv':low?'Treiber Low aktiv':'Treiber getrennt','tiny');
 const cfg=M.adcConfig(s.admux),selected=cfg.channel===s.pin;
 content+=path('M 480 185 H 590 V 405 H 505',selected?'active':'wire');
 content+=`<rect x="365" y="375" width="140" height="80" rx="8" class="zone"/>${txt(380,400,'Analog-MUX')}${txt(380,423,'ADMUX · MUX4:0','tiny')}${txt(380,444,cfg.channel<8?'gewählt: ADC'+cfg.channel:'Sonderauswahl','tiny')}`;
 content+=path('M 365 415 H 310',selected?'active':'wire');
 content+=`<rect x="165" y="375" width="145" height="80" rx="8" class="zone"/>${txt(180,400,'ADC · 10 Bit')}${txt(180,423,'ADCSRA','tiny')}${txt(180,444,!s.enabled?'ausgeschaltet':s.busy?'Wandlung läuft':'eingeschaltet','tiny')}`;
 content+=txt(35,495,selected?'Analoger Pfad: Dieser Pin ist am MUX ausgewählt.':'Analoger Pfad: MUX wählt einen anderen Eingang.','tiny');
 content+=txt(35,520,p.out?'Achtung: Der Ausgangstreiber bleibt trotz MUX-Auswahl aktiv!':p.pull?'Für eine externe Sensormessung den Pull-up ausschalten.':'Eingang ohne Pull-up: für externe Sensorspannung vorbereitet.','tiny');
 content+=txt(35,550,'ADMUX: Referenz '+(cfg.refs===1?'AVCC':cfg.refs===3?'2,56 V':cfg.refs===0?'AREF':'reserviert')+' · ADLAR = '+(+cfg.left),'tiny');
 $('pin-diagram').innerHTML=svg(content,620,575);
 $('pin-explanation').textContent=p.out?(p.high?'Der Ausgangstreiber verbindet den Pin im Modell mit VCC.':'Der Ausgangstreiber verbindet den Pin im Modell mit GND.'):(p.pull?'Der Ausgangstreiber ist getrennt. Ein hochohmiger Pull-up zieht einen sonst offenen Pin Richtung VCC.':'Der Ausgangstreiber und der Pull-up sind getrennt. Die äußere Schaltung muss einen Pegel vorgeben.');
}
function adcView(){
 const cfg=M.adcConfig(s.admux),ch=cfg.channel;
 let content=`<rect x="185" y="20" width="125" height="285" rx="10" class="zone"/>${txt(190,328,'Multiplexer')}`;
 for(let i=0;i<8;i++){const y=35+i*35;content+=txt(5,y+5,`PA${i} / ADC${i}`)+path(`M 110 ${y} H 205`,ch===i?'active':'wire');if(ch===i)content+=path(`M 205 ${y} L 280 160 H 390`,'active');}
 content+=`<rect x="390" y="128" width="125" height="65" rx="9" class="zone"/>${txt(412,156,'ADC')}${txt(412,180,'10 Bit')}`;
 if(ch>7)content+=txt(330,100,'Sonderauswahl','tiny');
 $('mux-diagram').innerHTML=svg(content,540,350);
 const refs=['Externe AREF · nicht simuliert','AVCC = 5 V','Reserviert · keine gültige Auswahl','Intern nominal 2,56 V'];
 $('adc-config').textContent=`REFS1:0 = ${cfg.refs.toString(2).padStart(2,'0')}: ${refs[cfg.refs]}. MUX4:0 = ${ch.toString(2).padStart(5,'0')}: ${ch<8?'ADC'+ch:'Sondercode, nicht simuliert'}. Ergebnis ${cfg.left?'links':'rechts'}bündig.`;
 $('voltage').disabled=ch>7||s.busy;$('voltage').value=ch<8?s.volts[ch]:0;$('voltage-value').textContent=ch<8?f(s.volts[ch])+' V':'–';
 $('adc-enable').textContent=s.enabled?'ADC ausschalten':'ADC einschalten';$('adc-enable').classList.toggle('on',s.enabled);
 $('adc-start').disabled=!s.enabled||s.busy||!cfg.supported;
 $('adc-finish').disabled=!s.busy;
 const adc=6+(s.enabled?128:0)+(s.busy?64:0)+(s.result?16:0);
 $('adc-code').textContent=`ADMUX = ${M.hex(s.admux)};\nADCSRA (Lesewert) = ${M.hex(adc)}\nADEN = ${+s.enabled} · ADSC = ${+s.busy} · Teiler 64`;
 $('adc-status').textContent=s.status;
 if(s.result){const r=s.result,bytes=M.convert(r.u,r.ref,cfg.left);$('adc-result').textContent=`Letzter Messwert: ADC${r.ch}, ${f(r.u)} V → D = ${r.code}. ADCL = ${M.hex(bytes.low)} (${bytes.low}), ADCH = ${M.hex(bytes.high)} (${bytes.high}).`;}
 else $('adc-result').textContent='Noch kein Messwert. Erst einschalten, starten und abschließen.';
 document.querySelectorAll('[data-reg="admux"]').forEach(b=>b.disabled=s.busy);
 const code=s.result?s.result.code:512, bits=code.toString(2).padStart(10,'0');
 const arranged=cfg.left?bits+'000000':'000000'+bits;
 const cells=Array.from(arranged,(bit,i)=>{const used=cfg.left?i<10:i>=6;return `<span class="${used?'data-bit':'zero-bit'}">${bit}<small>${used?'D'+(cfg.left?9-i:15-i):'–'}</small></span>`});
 $('alignment').innerHTML=`<b>ADLAR = ${+cfg.left}: ${cfg.left?'linksbündig':'rechtsbündig'}</b><p>${s.result?'Aktueller Messwert':'Beispiel ohne Messung'}: D = ${code}. Die zehn blauen Bits enthalten den Wert. Grau sind die sechs unbenutzten Stellen.</p><div class="byte-row"><div><b>ADCH · Bit 7 bis 0</b><div class="byte-bits">${cells.slice(0,8).join('')}</div></div><div><b>ADCL · Bit 7 bis 0</b><div class="byte-bits">${cells.slice(8).join('')}</div></div></div><p>ADLAR verschiebt nur die Ablage, nicht den Messwert. Rechtsbündig liegen D9 und D8 in ADCH, D7 bis D0 in ADCL. Linksbündig liegen D9 bis D2 in ADCH, D1 und D0 in den oberen beiden Stellen von ADCL.</p>`;
 pinView();
}
function mini(where,n){$(where).innerHTML=`<button data-reg="ddr" data-bit="${n}" class="${M.bit(s.ddr,n)?'on':''}">DDRA${n} = ${M.bit(s.ddr,n)} · ${M.bit(s.ddr,n)?'Ausgang':'Eingang'}</button><button data-reg="port" data-bit="${n}" class="${M.bit(s.port,n)?'on':''}">PORTA${n} = ${M.bit(s.port,n)}</button>`;}
function ledView(){
 const a=M.ledCircuit(s.ddr,s.port,s.led,s.r),sink=s.led==='sink',active=a.current>0;
 const cls=active?'active':'wire';
 let c=`<rect x="15" y="80" width="190" height="135" rx="12" class="zone"/>${txt(35,110,'ATmega32A')}${txt(35,145,'PA0 · '+(a.out?'Ausgang':'Eingang'))}${txt(35,180,a.high?'PORTA0 = 1':'PORTA0 = 0','tiny')}`;
 c+=path('M 205 150 H 270',cls)+`<rect x="270" y="138" width="65" height="24" class="part"/>${txt(266,120,s.r+' Ω')}`+path('M 335 150 H 380',cls);
 c+=`<circle cx="406" cy="150" r="24" class="part ${a.light==='an'?'ledlit':a.light==='sehr schwach'?'ledweak':'ledoff'}"/>`;
 c+=sink?path('M 417 133 L 390 150 L 417 167 Z','wire')+path('M 390 130 V 170','wire'):path('M 394 133 L 421 150 L 394 167 Z','wire')+path('M 421 130 V 170','wire');
 c+=path('M 430 150 H 500 V '+(sink?60:250),cls)+txt(470,sink?48:276,sink?'VCC':'GND');
 c+=txt(368,205,'LED · 2 V','tiny')+txt(60,300,sink?'Strompfad: VCC → R → LED → Ausgang Low':'Strompfad: Ausgang High → R → LED → GND','tiny');
 $('led-diagram').innerHTML=svg(c,560,325);$('led-pill').textContent=a.mode;
 $('led-result').textContent=`LED ${a.light} · I = ${f(a.current*1000,3)} mA · Pin: ${a.v==null?'kein sicherer Pegel':f(a.v)+' V'}`;
 $('led-explanation').textContent=a.out?(active?'Der Ausgang treibt den Strom durch die LED. Der Vorwiderstand begrenzt ihn.':'Die gewählte Ausgangsspannung liefert in dieser LED-Schaltung keine Vorwärtsspannung zum Leuchten.'):(a.current>0?'Der interne Pull-up ist kein kräftiger LED-Treiber: Er begrenzt den Strom zusätzlich stark. Ob die LED real sichtbar glimmt, hängt vom LED-Typ ab.':'Der Pin ist Eingang. Es fehlt ein aktiver Ausgangstreiber für den gewünschten LED-Strom.');mini('led-bits',0);
}
function switchView(){
 const a=M.switchCircuit(s.ddr,s.port,s.pull,s.closed),down=s.pull==='down',fault=a.fault;
 let c=`<rect x="10" y="100" width="190" height="130" rx="12" class="zone"/>${txt(27,130,'ATmega32A')}${txt(27,165,'PA2 · '+(a.out?'Ausgang':'Eingang'))}${txt(27,195,'PORTA2 = '+(+a.high),'tiny')}`;
 c+=path('M 200 175 H 390',fault?'faultwire':'active')+`<circle cx="340" cy="175" r="5" fill="#005b96"/>`;
 if(s.pull!=='none'){c+=path(`M 340 175 V 90`,'wire')+`<rect x="330" y="55" width="20" height="35" class="part"/>${txt(355,80,'10 kΩ','tiny')}`+path('M 340 55 V 25','wire')+txt(314,18,down?'GND':'VCC');}
 c+=path('M 390 175 H 425',fault?'faultwire':'wire')+path(s.closed?'M 425 175 H 475':'M 425 175 L 468 140',fault?'faultwire':'active')+path('M 475 175 H 515 V 270',fault?'faultwire':'wire')+txt(490,297,down?'VCC':'GND');
 c+=txt(390,120,s.closed?'geschlossen':'offen','tiny');
 if(a.pull)c+=path('M 80 100 V 65 H 200','active')+`<rect x="200" y="55" width="55" height="20" class="part"/>${txt(75,48,'intern: VCC → 40 kΩ','tiny')}`+path('M 255 65 H 285 V 175','active');
 $('switch-diagram').innerHTML=svg(c,560,325);$('smoke').classList.toggle('visible',fault);
 $('switch-pill').textContent=fault?'Kurzschlussgefahr':a.mode;$('switch-pill').className='pill'+(fault?' danger':a.level==='?'?' warn':'');
 $('switch-result').className='result'+(fault?' danger':a.level==='?'?' warn':'');
 $('switch-result').textContent=fault?`KURZSCHLUSS IM MODELL · Ausgang ${a.high?'High':'Low'} direkt gegen ${a.rail===0?'GND':'VCC'}.`:`PA2: ${a.v==null?'offen / unbestimmt':f(a.v)+' V'} · PINA2 = ${a.level} · äußerer Pull: ${f(a.iext*1000,3)} mA · interner Pull: ${f(a.ipull*1000,3)} mA`;
 $('switch-explanation').textContent=fault?'Der geschlossene Schalter verbindet den Ausgang direkt mit der entgegengesetzten Versorgung. Der Pull-Widerstand liegt in einem anderen Zweig und schützt den Ausgang nicht. Öffnen Sie den Schalter oder stellen Sie PA2 auf Eingang.':a.divider?'Interner Pull-up 40 kΩ und äußerer Pull-down 10 kΩ bilden einen Spannungsteiler: 5 V · 10/(40+10) = 1 V. Der gewünschte eindeutige Pull-down wird durch den internen Pull-up abgeschwächt.':a.v==null?'Ohne geschlossenen Schalter oder Pull-Widerstand gibt es keine definierte Spannung. Die Anzeige bleibt „?“ statt einen zufälligen Pegel vorzutäuschen.':a.out?'Der Ausgang bestimmt den Pegel. Ein entgegengesetzter Pull-Widerstand begrenzt den Strom; ein direkter Schalterkontakt zur Gegenversorgung würde dagegen einen Kurzschluss erzeugen.':s.closed?'Der Schalter bestimmt den Pegel. Ströme durch Pull-Widerstände bleiben begrenzt; der Eingang selbst treibt keine Gegenspannung.':'Der Pull-Widerstand legt den Ruhepegel am offenen Schalter fest.';
 $('switch-toggle').textContent=s.closed?'Schalter geschlossen · öffnen':'Schalter offen · schließen';$('switch-toggle').setAttribute('aria-pressed',String(s.closed));$('switch-toggle').classList.toggle('on',s.closed);mini('switch-bits',2);
}
function render(){redrawRegisters();pinView();adcView();ledView();switchView();}
function selectTab(id){for(const tab of ['register','circuit']){$(tab).hidden=tab!==id;$('tab-'+tab).classList.toggle('selected',tab===id);$('tab-'+tab).setAttribute('aria-pressed',String(tab===id));}}
function sync(){ $('selectedPin').value=s.pin;$('led-type').value=s.led;$('led-r').value=s.r;$('pull-type').value=s.pull;render();}
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.reg){const host=b.parentElement.id;const key=b.dataset.reg,n=Number(b.dataset.bit);if(key==='admux'&&s.busy)return;s[key]^=1<<n;render();const match=(document.getElementById(host)||document).querySelector(`[data-reg="${key}"][data-bit="${n}"]`);if(match&&!match.closest('[hidden]'))match.focus({preventScroll:true});}
 if(b.dataset.tab)selectTab(b.dataset.tab);
 if(b.dataset.preset){s=initial();const p=b.dataset.preset;if(p==='short-low'){s.ddr=5;s.port=5;s.closed=true;}if(p==='short-high'){s.ddr=5;s.port=1;s.pull='down';s.closed=true;}if(p==='floating')s.pull='none';sync();}
});
$('select-adc-pin').addEventListener('click',()=>{if(s.busy)return;s.admux=(s.admux&224)|s.pin;render();});
$('selectedPin').addEventListener('change',e=>{s.pin=+e.target.value;pinView();});
$('led-type').addEventListener('change',e=>{s.led=e.target.value;ledView();});
$('led-r').addEventListener('change',e=>{s.r=+e.target.value;ledView();});
$('pull-type').addEventListener('change',e=>{s.pull=e.target.value;switchView();});
$('switch-toggle').addEventListener('click',()=>{s.closed=!s.closed;switchView();});
$('voltage').addEventListener('input',e=>{const ch=s.admux&31;if(ch<8)s.volts[ch]=+e.target.value;adcView();});
$('adc-enable').addEventListener('click',()=>{s.enabled=!s.enabled;s.busy=false;s.sample=null;s.status=s.enabled?'ADC eingeschaltet. Noch keine Wandlung gestartet.':'ADC ausgeschaltet. Eine laufende Wandlung wurde abgebrochen.';adcView();});
$('adc-start').addEventListener('click',()=>{
 const cfg=M.adcConfig(s.admux);if(!s.enabled||s.busy||!cfg.supported)return;
 const p=M.pin(s.ddr,s.port,cfg.channel);
 if(p.out||p.pull){s.status=`PA${cfg.channel} ist ${p.mode.toLowerCase()}. Für den Sensor zunächst DDRA${cfg.channel} = 0 und PORTA${cfg.channel} = 0 einstellen. Das Modell startet keine unplausible Sensormessung.`;adcView();return;}
 const u=s.volts[cfg.channel];if(u>cfg.ref){s.status='Sensorspannung oberhalb der Referenz: höchster Code im idealen Sättigungsmodell. Wandlung läuft.';}else s.status='ADSC = 1: Wandlung läuft. Die Eingangsspannung wird jetzt gehalten; das letzte Ergebnis bleibt stehen.';
 s.sample={u,ref:cfg.ref,ch:cfg.channel};s.busy=true;adcView();
});
$('adc-finish').addEventListener('click',()=>{if(!s.busy)return;s.result={...s.sample,...M.convert(s.sample.u,s.sample.ref,false)};s.busy=false;s.status='ADSC = 0: Wandlung beendet. Ergebnis verfügbar; ADIF = 1. Zuerst ADCL, danach ADCH lesen.';adcView();});
$('reset').addEventListener('click',()=>{s=initial();sync();});
$('projector').addEventListener('click',e=>{const on=document.body.classList.toggle('projector');e.target.setAttribute('aria-pressed',String(on));e.target.textContent=on?'Standardansicht':'Beameransicht';});
sync();
