import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
const g=globalThis;
if(!g.window){g.window=g;g.self=g;}
if(!g.navigator)g.navigator={userAgent:'node',language:'en-US',languages:['en-US']};
if(!g.document)g.document={createElement:()=>({style:{},setAttribute(){},appendChild(){}}),createElementNS:()=>({style:{}}),querySelector:()=>null,head:{appendChild(){}}};
if(!g.localStorage)g.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
if(!g.location)g.location={href:'http://localhost/',origin:'http://localhost',protocol:'http:'};
const vite=await createServer({logLevel:'error',server:{middlewareMode:true},appType:'custom'});
try{
  const mod=await vite.ssrLoadModule('/src/App.jsx');
  const P=mod.__panels;
  const session={id:1,week:1,date:'2026-10-25',weekday:'Sunday',start:'09:00',end:'10:30',name:'Test Session',type:'Team Culture',pillarIds:[],mode:'Sync',facilitators:[],roomIds:[],rooms:[],resources:[{id:'r1',label:'Deck',url:'https://x.dev'}],outcomes:['Outcome A'],notes:'Some notes',fellowNotes:'',afaGroup:'AFA 1',calendared:true};
  const auth={email:'test@user.dev',role:'superadmin',access:'full'};
  const rooms=[{id:'r1',name:'Room A',facilitator:'Nusrat',locationType:'physical'}];
  const roster=[{id:'fe1',name:'Fellow One',email:'f1@x.dev',track:'Secondary',afaGroup:'AFA 1',placementCity:'Dhaka',roomIds:['r1']}];
  const planners=[{id:'p1',name:'Nusrat Jahan',email:'n@x.dev',role:'afa',group:'AFA 1',access:'full'}];
  const noop=()=>{};
  const cases={
    'ViewPanel-normal': ()=>P.ViewPanel({session,auth,rooms,sessionTypes:null,pillarTags:null,modes:null,onAssign:noop,onRequestUpdate:noop,onClose:noop,staff:planners,onEdit:noop}),
    'ViewPanel-unscheduled': ()=>P.ViewPanel({session:{...session,date:'',weekday:'',start:'',end:'',week:0,calendared:false},auth,rooms,sessionTypes:null,pillarTags:null,modes:null,onAssign:noop,onRequestUpdate:noop,onClose:noop,staff:planners,onEdit:noop}),
    'ViewPanel-fellow': ()=>P.ViewPanel({session,auth:{...auth,role:'fellow'},rooms,sessionTypes:null,pillarTags:null,modes:null,onAssign:noop,onRequestUpdate:noop,onClose:noop,staff:planners,onEdit:null}),
  };
  let fail=0;
  for(const [name,factory] of Object.entries(cases)){
    try{ const h=renderToString(factory()); console.log('OK   ',name,'('+h.length+' chars)'); }catch(e){ fail++; console.log('FAIL ',name,e.message); console.log(String(e.stack).split('\n').slice(1,4).join('\n')); }
  }
  console.log(fail===0?'VIEWPANEL CLICK PATH OK':fail+' FAILED');
}catch(e){ console.log('LOAD FAIL:',e.message); }
await vite.close(); process.exit(0);