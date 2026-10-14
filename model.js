(function(root){
'use strict';
const bit=(v,n)=>(v>>n)&1;
const hex=v=>'0x'+v.toString(16).toUpperCase().padStart(2,'0');
function logic(v){return v==null?'?':v<=1?'0':v>=3?'1':'?';}
function pin(ddr,port,n){const out=!!bit(ddr,n),high=!!bit(port,n);return {out,high,pull:!out&&high,mode:out?(high?'Ausgang High':'Ausgang Low'):(high?'Eingang mit Pull-up':'Eingang ohne Pull-up')};}
function switchCircuit(ddr,port,type,closed){
 const p=pin(ddr,port,2),up=type==='up',down=type==='down',rail=down?5:0;
 const fault=p.out&&closed&&Number(p.high)*5!==rail;
 let v=null;
 if(fault)v=null;
 else if(p.out)v=p.high?5:0;
 else if(closed)v=rail;
 else {const gu=(up?1/10000:0)+(p.pull?1/40000:0),gd=down?1/10000:0;if(gu+gd)v=5*gu/(gu+gd);}
 const ipull=v==null?0:(p.pull?(5-v)/40000:0);
 const iext=v==null?0:up?(5-v)/10000:down?v/10000:0;
 return {...p,v,level:logic(v),fault,rail,ipull,iext,divider:!p.out&&!closed&&p.pull&&down};
}
function ledCircuit(ddr,port,type,r){
 const p=pin(ddr,port,0),sink=type==='sink',vf=2;
 let current=0,v=null;
 if(p.out){v=p.high?5:0;if(sink&&!p.high||!sink&&p.high)current=(5-vf)/r;}
 else if(p.pull){if(sink)v=5;else {current=(5-vf)/(r+40000);v=5-current*40000;}}
 // Ohne treibende Quelle ist eine LED kein sicherer Pull-up/Pull-down.
 return {...p,current,v,level:logic(v),light:current>=0.001?'an':current>0?'sehr schwach':'aus'};
}
function adcConfig(admux){const refs=(admux>>6)&3,channel=admux&31;return {refs,channel,left:!!(admux&32),ref:[null,5,null,2.56][refs],supported:(refs===1||refs===3)&&channel<8};}
function convert(u,ref,left){const code=Math.min(1023,Math.max(0,Math.floor(u/ref*1024)));return {code,low:left?(code&3)<<6:code&255,high:left?code>>2:code>>8};}
const api={bit,hex,pin,logic,switchCircuit,ledCircuit,adcConfig,convert};
if(typeof module!=='undefined')module.exports=api;else root.SFR=api;
})(typeof window!=='undefined'?window:globalThis);
