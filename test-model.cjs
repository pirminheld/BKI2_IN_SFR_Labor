const assert=require('node:assert/strict'),m=require('./model.js');
let count=0;
for(const d of [0,4])for(const p of [0,4])for(const type of ['up','down','none'])for(const closed of [false,true]){
 const r=m.switchCircuit(d,p,type,closed),rail=type==='down'?5:0;
 assert.equal(r.fault,!!d&&closed&&(p?5:0)!==rail);if(!r.fault&&closed)assert.equal(r.v,rail);count++;
}
assert.equal(m.switchCircuit(0,0,'none',false).level,'?');
assert.equal(m.switchCircuit(0,4,'down',false).v,1);
assert.equal(m.switchCircuit(0,4,'up',true).fault,false);
assert.equal(m.switchCircuit(4,0,'up',false).fault,false);
assert.equal(m.ledCircuit(1,1,'source',330).light,'an');
assert.equal(m.ledCircuit(1,0,'source',330).light,'aus');
assert.equal(m.ledCircuit(1,0,'sink',330).light,'an');
assert.equal(m.ledCircuit(0,1,'source',330).light,'sehr schwach');
assert.equal(m.ledCircuit(0,0,'source',330).level,'?');
for(let c=0;c<1024;c++){const u=(c+.25)*5/1024;const r=m.convert(u,5,false),l=m.convert(u,5,true);assert.equal(r.code,c);assert.equal(r.high*256+r.low,c);assert.equal(l.high*4+(l.low>>6),c);}
assert.equal(m.adcConfig(0x42).channel,2);assert.equal(m.adcConfig(0x42).ref,5);assert.equal(m.adcConfig(0x82).supported,false);assert.equal(m.convert(5,2.56,false).code,1023);
console.log(`${count} Schalterzustände, LED-Varianten, offene Eingänge, Spannungsteiler und 1024 ADC-Codes in beiden Anordnungen geprüft.`);
