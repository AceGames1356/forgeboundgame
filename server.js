'use strict';
// Forgebound server: static files, accounts, saves, and co-op tower rooms.
// No npm dependencies. Needs Node 18+.
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
// Game data + rules shared by the server and the browser (served to the browser at /shared.js)
const SHARED = String.raw`(function(root){
const P=[
{s:'h',n:'Worn Grip',def:1,c:'#8a6d4b',t:0},{s:'h',n:'Leather Wrap',def:2,spd:.2,c:'#a5683a',t:1},
{s:'h',n:'Spider Silk',def:1,spd:.5,c:'#cfd5e0',t:1},{s:'h',n:'Bone Hilt',atk:3,def:1,c:'#e8e0c8',t:2},
{s:'h',n:'Iron Haft',atk:2,def:4,spd:-.2,c:'#6b7482',t:2},{s:'h',n:'Obsidian Shaft',atk:4,def:4,c:'#3a3160',t:3},
{s:'b',n:'Rust Blade',atk:6,c:'#9a6a4a',p:'M30 8L38 120L22 120Z',t:0},{s:'b',n:'Steel Edge',atk:9,spd:.1,c:'#b9c4d3',p:'M30 6L40 24L38 120L22 120L20 24Z',t:1},
{s:'b',n:'Rapier',atk:7,spd:.6,c:'#d5dde8',p:'M30 4L33 120L27 120Z',t:1},{s:'b',n:'Cleaver',atk:15,spd:-.3,c:'#8f9aab',p:'M30 20L52 40L44 120L18 120L18 40Z',t:2},
{s:'b',n:'Reaper Scythe',atk:13,crit:.1,c:'#9a86cc',p:'M22 120L26 30Q40 5 56 20Q38 22 36 50L38 120Z',t:3},
{s:'b',n:'Glass Fang',atk:19,def:-2,c:'#9fe9ff',p:'M30 6L40 60L34 120L26 120L20 60Z',t:3},{s:'b',n:'Greatblade',atk:24,spd:-.5,c:'#c9d2df',p:'M30 2L46 20L42 120L18 120L14 20Z',t:4},
{s:'g',n:'Bare Guard',w:14,c:'#777',t:0},{s:'g',n:'Buckler',def:3,w:24,c:'#8b93a0',t:1},{s:'g',n:'Spiked Guard',atk:3,def:1,w:26,c:'#b05555',t:2},
{s:'g',n:'Wing Guard',spd:.3,def:2,w:28,c:'#d6c27a',t:3},{s:'g',n:'Bulwark Guard',def:6,w:30,c:'#5d80a8',t:4},
{s:'c',n:'Dull Stone',e:'none',t:0},{s:'c',n:'Ember Core',e:'fire',atk:3,t:1},{s:'c',n:'Frost Core',e:'ice',def:2,t:1},
{s:'c',n:'Volt Core',e:'shock',spd:.4,t:2},{s:'c',n:'Vein Core',e:'blood',life:.2,t:2},{s:'c',n:'Void Core',e:'void',crit:.25,t:3}];

const A=(s,t,n,c,o)=>P.push(Object.assign({s,n,t,c},o));
A('h',1,'Oak Grip','#8a5a2b',{def:2,atk:1});A('h',1,'Rope Wrap','#c9b48a',{spd:.3,def:1});
A('h',2,'Wolf Fang Hilt','#d8d2c0',{atk:4,spd:.2});A('h',2,'Steel Tang','#7d8797',{def:3,atk:2,spd:.1});
A('h',3,'Dragonbone Haft','#e6dcc0',{atk:5,def:3,spd:.2});A('h',3,'Shadow Silk','#3b3552',{spd:.7,def:2,crit:.05});
A('h',4,'Sunforged Grip','#e0a63a',{atk:6,def:5,spd:.3});A('h',4,'Void Wrapped','#4a2b7a',{atk:5,def:4,crit:.1,spd:.2});
A('h',5,'Crimson Wyrmhide','#b3202f',{atk:9,def:7,spd:.4,life:.05});A('h',5,'Blood Moon Grip','#8c1230',{atk:8,def:6,spd:.6,crit:.1});
A('h',6,'Halo Shaft','#fff0a8',{atk:13,def:10,spd:.8,crit:.1,life:.08});A('h',6,'Aether Hilt','#fffbe0',{atk:12,def:11,spd:1,crit:.08});
A('b',0,'Bronze Dagger','#b98a52',{atk:5,spd:.4,sh:[18,2,3]});A('b',1,'Iron Sabre','#aab4c2',{atk:11,spd:.1,sh:[28,3,5]});
A('b',1,"Hunter's Knife",'#c3ccd8',{atk:8,spd:.5,sh:[20,2,4]});A('b',2,'Katana','#dfe6f0',{atk:14,spd:.3,crit:.05,sh:[30,2,6]});
A('b',2,'Bone Saw','#e8e0c8',{atk:16,spd:-.1,life:.05,sh:[26,4,3]});A('b',3,'Executioner','#8a94a6',{atk:24,spd:-.4,crit:.1,sh:[32,5,4]});
A('b',3,'Moonlit Edge','#b8c8ff',{atk:17,spd:.4,crit:.08,sh:[30,3,6]});A('b',4,'Dragonslayer','#9fb0c8',{atk:30,spd:-.5,def:1,sh:[36,6,5]});
A('b',4,'Stormcaller','#7fd6ff',{atk:22,spd:.5,crit:.1,sh:[32,3,7]});A('b',4,'Soul Reaver','#8be0a8',{atk:24,spd:.1,life:.1,sh:[34,4,6]});
A('b',5,'Crimson Ruin','#ff4a4a',{atk:38,spd:-.2,crit:.12,life:.06,sh:[36,5,5]});A('b',5,'Nightfall','#d02a3c',{atk:33,spd:.5,crit:.15,sh:[34,3,7]});
A('b',6,'Solaris','#fff3b0',{atk:50,spd:.2,crit:.15,life:.08,sh:[36,5,6]});A('b',6,'Worldsplitter','#fffbe0',{atk:58,spd:-.2,crit:.1,def:3,sh:[37,7,5]});
A('g',1,'Iron Cross','#8a919c',{def:2,atk:1,w:20});A('g',1,'Round Guard','#a06a3a',{def:4,spd:-.1,w:26});
A('g',2,'Hawk Wings','#c9b48a',{spd:.4,def:1,w:28,dc:'wing'});A('g',2,"Knight's Guard",'#6f7f95',{def:5,w:26});
A('g',3,'Thorn Guard','#4d8a4a',{atk:5,def:3,w:26,dc:'spike'});A('g',3,'Storm Wings','#7fd6ff',{spd:.6,def:2,w:30,dc:'wing'});
A('g',4,'Dragon Aegis','#c98a2a',{def:9,atk:2,w:30});A('g',4,'Blade Wings','#b9c4d3',{atk:5,spd:.5,def:3,w:30,dc:'wing'});
A('g',5,'Crimson Bastion','#b3202f',{def:13,atk:4,life:.05,w:30,dc:'spike'});A('g',5,'Reaper Wings','#8c1230',{atk:8,spd:.7,def:6,w:30,dc:'wing'});
A('g',6,'Halo Guard','#fff0a8',{def:18,atk:6,spd:.4,w:30});A('g',6,'Seraph Wings','#fffbe0',{atk:8,spd:.9,def:12,w:30,dc:'wing'});
A('c',1,'Toxic Core','',{e:'toxic',def:1,atk:2});A('c',2,'Magma Core','',{e:'fire',atk:5});A('c',2,'Glacier Core','',{e:'ice',def:3,atk:2});
A('c',2,'Viper Core','',{e:'toxic',atk:3,crit:.08});A('c',3,'Tempest Core','',{e:'shock',atk:4,spd:.5});A('c',3,'Wraith Core','',{e:'void',crit:.15,atk:3});
A('c',3,'Leech Core','',{e:'blood',life:.15,atk:3});A('c',4,'Inferno Heart','',{e:'fire',atk:9,crit:.1});A('c',4,'Absolute Zero','',{e:'ice',atk:6,def:5,spd:.2});
A('c',4,'Plague Heart','',{e:'toxic',atk:7,life:.1,crit:.1});A('c',5,'Bloodstar','',{e:'blood',atk:11,life:.2,crit:.1});A('c',5,'Abyss Eye','',{e:'void',atk:10,crit:.3});
A('c',5,'Dragon Heart','',{e:'fire',atk:14,def:4,spd:.2});A('c',5,'Stormheart','',{e:'shock',atk:11,spd:.6,crit:.08});A('c',5,'Permafrost Heart','',{e:'ice',atk:9,def:8,spd:.3});
A('c',5,'Blight Heart','',{e:'toxic',atk:12,life:.12,crit:.1});A('c',6,'Sunheart','',{e:'holy',atk:16,crit:.2,life:.1});A('c',6,'Genesis Core','',{e:'holy',atk:14,def:8,spd:.6,life:.08});

const Z=(s,t,n,c,o)=>P.push(Object.assign({s,n,t,c,wd:1},o));
Z('h',2,'Dune Wrap','#d9b36a',{atk:7,def:6,spd:.2});Z('h',2,'Sand Cord','#c9b48a',{atk:5,def:5,spd:.5});
Z('h',3,'Cactus Grip','#4d8a4a',{atk:10,def:8,spd:.2});Z('h',3,'Frost Hide','#cfe6ff',{atk:8,def:10,spd:.3,life:.04});
Z('h',4,'Magma Haft','#c2491d',{atk:14,def:12,spd:.3});Z('h',4,'Storm Silk','#7a8cff',{atk:12,def:10,spd:.8,crit:.06});
Z('h',5,'Ashen Grip','#ff4a4a',{atk:20,def:16,spd:.5,life:.05});Z('h',5,'Rift Wrap','#d02a3c',{atk:18,def:14,spd:.9,crit:.1});
Z('h',6,'Eclipse Haft','#ffffff',{atk:28,def:22,spd:1,crit:.1,life:.08});
Z('b',2,'Scimitar','#e0d2a8',{atk:30,spd:.3,sh:[30,3,6]});Z('b',2,'Desert Fang','#d9c08a',{atk:34,spd:.1,crit:.06,sh:[28,4,5]});
Z('b',3,'Bone Cleaver','#e8e0c8',{atk:46,spd:-.2,sh:[30,6,3]});Z('b',3,'Frostbrand','#9fd8ff',{atk:40,spd:.3,crit:.08,sh:[34,3,6]});
Z('b',4,'Magma Greatsword','#ff7a3d',{atk:62,spd:-.3,sh:[37,7,5]});Z('b',4,'Tempest Blade','#7fd6ff',{atk:50,spd:.5,crit:.1,sh:[34,3,7]});
Z('b',5,'Rift Reaver','#ff4a4a',{atk:82,spd:.1,crit:.15,life:.08,sh:[36,5,6]});Z('b',5,'Starfall','#d02a3c',{atk:74,spd:.6,crit:.18,sh:[35,3,7]});
Z('b',6,'Eternity Edge','#ffffff',{atk:120,spd:.3,crit:.2,life:.1,def:4,sh:[37,6,6]});
Z('g',2,'Scarab Guard','#c9a23a',{def:9,atk:2,w:26});Z('g',2,'Sand Wings','#e0d2a8',{def:4,spd:.4,w:28,dc:'wing'});
Z('g',3,'Frost Aegis','#9fd8ff',{def:14,w:28});Z('g',3,'Thorn Crown','#4d8a4a',{def:9,atk:8,w:26,dc:'spike'});
Z('g',4,'Magma Bulwark','#c2491d',{def:20,atk:4,w:30});Z('g',4,'Storm Wings','#7a8cff',{def:12,spd:.7,atk:6,w:30,dc:'wing'});
Z('g',5,'Rift Bastion','#b3202f',{def:28,atk:8,life:.05,w:30,dc:'spike'});Z('g',5,'Void Wings','#8c1230',{def:18,atk:12,spd:.9,w:30,dc:'wing'});
Z('g',6,'Eclipse Aegis','#ffffff',{def:38,atk:12,spd:.5,w:30});
Z('c',2,'Sand Heart','',{e:'fire',atk:10});Z('c',2,'Rime Shard','',{e:'ice',atk:5,def:5});
Z('c',3,'Thunder Shard','',{e:'shock',atk:9,spd:.5});Z('c',3,'Venom Shard','',{e:'toxic',atk:8,crit:.1});
Z('c',4,'Blood Shard','',{e:'blood',atk:14,life:.15,crit:.08});Z('c',4,'Null Shard','',{e:'void',atk:12,crit:.3});
Z('c',5,'Ruin Heart','',{e:'fire',atk:24,def:6,spd:.3});Z('c',5,'Absolute Rime','',{e:'ice',atk:16,def:14,spd:.3});
Z('c',6,'Oblivion Heart','',{e:'holy',atk:30,crit:.2,life:.1,spd:.5,def:10});
const Y=(s,n,c,o)=>P.push(Object.assign({s,n,t:4,c,an:1},o));
Y('h','Party Popper Grip','#ff7ac8',{atk:6,def:5,spd:.3});Y('b','Confetti Cutter','#ffe14d',{atk:30,spd:.2,crit:.1,sh:[34,4,6]});
Y('g','Cake Guard','#fff0a8',{def:9,atk:3,spd:.2,w:28,dc:'wing'});Y('c','Sparkler Core','',{e:'fire',atk:9,crit:.12,spd:.2});
P.forEach((p,i)=>p.id=i);
const TW=[{n:'Gloom Wraith',w:'fire',k:'#a97cf0'},{n:'Bone Colossus',w:'blood',k:'#e8e2c8'},{n:'Ember Drake',w:'ice',k:'#ff8a2b'},{n:'Tower Sentinel',w:'shock',k:'#9a9fae'}];
const SB=[{n:'Crystal Lich',w:'fire',k:'#5ff0e0'},{n:'Magma Golem',w:'ice',k:'#ff6b1a'},{n:'Clockwork Reaper',w:'shock',k:'#d9b24a'},{n:'Celestial Warden',w:'void',k:'#f4eec8'},{n:'Aether Titan',w:'toxic',k:'#4fe0c8'}];

const hpCost=l=>l<5?40*(l+1):null,hpCostD=l=>l>=5&&l<10?10*(l-3):null,maxHp=l=>100+10*Math.min(l||0,5)+15*Math.max(0,(l||0)-5);
const VERSION='2.0.0';
const BOSSES=[
{n:'Slime King',k:'#4fd06a',hp:70,r:4,w:'fire'},{n:'Frost Warden',k:'#7fd6ff',hp:130,r:7,w:'shock'},
{n:'Hollow Knight',k:'#9aa3b5',hp:210,r:10,w:'blood'},{n:'Storm Wyrm',k:'#ffe14d',hp:300,r:13,w:'ice'},{n:'Anvil God',k:'#ff6b3d',hp:420,r:16,w:'void'},
{n:'Venom Hydra',k:'#4fb04a',hp:560,r:19,w:'toxic'},{n:'Crimson Warlord',k:'#e0455a',hp:760,r:23,w:'blood'},
{n:'Abyss Leviathan',k:'#2d6fa8',hp:1000,r:28,w:'shock'},{n:'Solar Titan',k:'#e8b73a',hp:1350,r:34,w:'ice'},
{n:'Void Emperor',k:'#7a4be0',hp:1800,r:39,w:'fire'},{n:'Seraph Sentinel',k:'#f4eec8',hp:2500,r:43,w:'void'},{n:'The Final God',k:'#fff3b0',hp:3500,r:49,w:'toxic'}];

const WORLD2=[
{n:'Sand Golem',k:'#d9b36a',w:'ice'},{n:'Dune Stalker',k:'#c9a23a',w:'shock'},{n:'Scarab Matriarch',k:'#4fb04a',w:'fire'},{n:'Mirage Wraith',k:'#b99cff',w:'void'},{n:'Cactus King',k:'#4d8a4a',w:'fire'},
{n:'Thornback Boar',k:'#8a5a2b',w:'fire'},{n:'Elder Treant',k:'#3f7a3a',w:'fire'},{n:'Moss Hydra',k:'#6fbf5a',w:'shock'},{n:'Fae Queen',k:'#ff7ac8',w:'blood'},
{n:'Frost Yeti',k:'#cfe6ff',w:'fire'},{n:'Ice Drake',k:'#7fd6ff',w:'shock'},{n:'Blizzard Witch',k:'#8fa8ff',w:'blood'},{n:'Glacier Titan',k:'#9fd8ff',w:'toxic'},
{n:'Magma Serpent',k:'#ff6b1a',w:'ice'},{n:'Ash Colossus',k:'#6b6b78',w:'ice'},{n:'Cinder Lord',k:'#e0455a',w:'toxic'},{n:'Obsidian Dragon',k:'#3a3160',w:'ice'},
{n:'Void Walker',k:'#7a4be0',w:'blood'},{n:'Rift Devourer',k:'#5f6bff',w:'shock'},{n:'Dark Sovereign',k:'#3b2a6b',w:'toxic'},
{n:'ViLocity',k:'#fff3b0',w:'holy'}];
const R2=[20, 18, 19, 17, 18, 20, 20, 20, 19, 20, 20, 20, 20, 20, 20, 27, 28, 25, 26, 30, 20],AGPW=32;
const W2HP=[3900,4300,4700,5100,5500,5900,6300,6700,7100,7500,7900,8300,8700,9100,9500,13000,13600,14200,14800,20400,30800];
WORLD2.forEach((b,i)=>{b.hp=W2HP[i];b.r=R2[i];b.fl=.1;b.coin=i==20?3000:300+60*i;b.dia=i==20?250:6+2*i});
WORLD2[20].aggr={pw:AGPW,every:3200,tele:1000};
const PRICE2=[null,null,10,25,60,150,null],CAP2=[3,3,3,3,3,4,4,4,4,4,4,4,5,5,5,5,5,5,6,6,6],MG_UNLOCK=[5,9,13];
function dropPool2(bi,owned){const cap=CAP2[bi],want=bi>=18?6:0;
const pool=P.filter(p=>p.wd&&!owned.includes(p.id)&&p.t<=cap).sort((a,b)=>(b.t+Math.random()*2.2)-(a.t+Math.random()*2.2));
const hi=want?pool.filter(p=>p.t>=want).sort(()=>Math.random()-.5)[0]:null;
return (hi?[hi,...pool.filter(x=>x!==hi).slice(0,2)]:pool.slice(0,3)).map(p=>p.id)}
const annYear=ms=>{const y=new Date(ms).getUTCFullYear();return ms>=Date.UTC(y,8,29,10)&&ms<Date.UTC(y,9,2,12)?y:0};
const ANN={coins:1000,dia:100};
const RN=['Common','Uncommon','Rare','Epic','Legendary','Mythic','God'];
const PRICE=[10,30,70,130,220,600,null],BOSS_COIN=[30,50,70,90,150,200,260,340,440,600,800,1200];
const CAP=[2,3,3,4,4,4,5,5,5,6,6,6];
function dropPool(bi,owned){const cap=CAP[bi],want=bi>=9?6:bi>=6?5:0;
const pool=P.filter(p=>!p.cu&&!p.wd&&!p.an&&!owned.includes(p.id)&&p.t<=cap).sort((a,b)=>(b.t+Math.random()*2.2)-(a.t+Math.random()*2.2));
const hi=want?pool.filter(p=>p.t>=want).sort(()=>Math.random()-.5)[0]:null;
return (hi?[hi,...pool.filter(x=>x!==hi).slice(0,2)]:pool.slice(0,3)).map(p=>p.id)}
function towerPool(f,sp,owned){const cap=f>=10?5:f>=5?4:Math.min(3,1+Math.ceil(f/2)),god=sp&&f>=20;
const pool=P.filter(p=>!p.cu&&!p.wd&&!p.an&&!owned.includes(p.id)&&(p.t<=cap||(god&&p.t==6))).sort((a,b)=>(b.t+Math.random()*2.2)-(a.t+Math.random()*2.2));
const hi=god?pool.filter(p=>p.t==6).sort(()=>Math.random()-.5)[0]:null;
return (hi?[hi,...pool.filter(x=>x!==hi).slice(0,2)]:pool.slice(0,3)).map(p=>p.id)}
function addCustom(d){const p={cu:1,id:d.id,s:d.s,n:String(d.n).slice(0,24),t:Math.max(0,Math.min(6,d.t|0)),c:/^#[0-9a-f]{6}$/i.test(d.c)?d.c:'#cccccc'};
for(const k of ['atk','spd','def','crit','life'])if(+d[k])p[k]=+d[k];if(d.e&&d.s=='c')p.e=d.e;if(d.s=='g'){p.w=Math.max(14,Math.min(30,+d.w||24));if(d.dc)p.dc=d.dc}if(d.s=='b')p.sh=Array.isArray(d.sh)?d.sh.map(Number):[30,3,5];P[p.id]=p;return p}
const DEFAULT_EQ={h:0,b:6,g:13,c:18};
function stats(eq){const o={atk:0,spd:1,def:0,crit:0,life:0,e:'none'};for(const k in eq){const p=P[eq[k]];if(!p)continue;o.atk+=p.atk||0;o.spd+=p.spd||0;o.def+=p.def||0;o.crit+=p.crit||0;o.life+=p.life||0;if(p.e)o.e=p.e}o.spd=Math.max(.3,o.spd);return o}
function bossFor(f,n){const sp=f%5==0,i=sp?(f/5-1)%SB.length:(f-1)%TW.length,m=sp?SB[i]:TW[i];return{n:m.n,i,sp,set:sp?1:2,w:m.w,k:m.k,hp0:Math.round((70+55*f)*(sp?2:1)*(1+.85*(n-1))),r:Math.round((4+1.3*f)*(sp?1.2:1)*(1+.15*(n-1)))}}
const recoil=(r,d,f)=>Math.max(Math.ceil(r*(f||.25)),r-d);
function dmg(s,weak,rnd){let d=s.atk*(.85+rnd()*.3),t=0;if(rnd()<s.crit){d*=2;t=1}if(s.e===weak){d*=1.8;t=1}return{d:Math.round(d),t}}
function validEq(eq,owned){const E={};for(const k in DEFAULT_EQ){const id=eq&&eq[k],p=P[id];E[k]=p&&p.s===k&&owned.includes(id)?id:DEFAULT_EQ[k]}return E}
const api={VERSION,WORLD2,PRICE2,CAP2,MG_UNLOCK,dropPool2,annYear,ANN,hpCostD,recoil,BOSSES,RN,CAP,dropPool,towerPool,addCustom,PRICE,BOSS_COIN,hpCost,maxHp,P,SB,TW,DEFAULT_EQ,stats,bossFor,dmg,validEq};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Game=api;
})(typeof window!=='undefined'?window:globalThis);
`;
const G = (() => { const m = { exports: {} }; new Function('module', 'window', SHARED)(m, undefined); return m.exports; })();

const PORT = process.env.PORT || 3000;
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DATA, 'db.json');
fs.mkdirSync(DATA, { recursive: true });

// ---------- storage (one JSON file, written atomically) ----------
const ADMIN = String(process.env.ADMIN_USER || 'vilocity').toLowerCase();
let DB = { users: {}, sessions: {}, customs: {}, nextCustom: 1000 };
try { DB = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) {}
DB.customs = DB.customs || {}; DB.nextCustom = DB.nextCustom || 1000;
for (const d of Object.values(DB.customs)) G.addCustom(d);
let dirty = false;
const persist = () => { dirty = true; };
function flush() {
  if (!dirty) return; dirty = false;
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(DB)); fs.renameSync(tmp, FILE);
}
setInterval(flush, 2000);
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { flush(); process.exit(0); });

// ---------- helpers ----------
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const scrypt = (pw, salt) => new Promise((res, rej) => crypto.scrypt(pw, salt, 32, (e, k) => e ? rej(e) : res(k)));
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const fail = (res, code, msg) => json(res, code, { error: msg });
function body(req) {
  return new Promise((res, rej) => {
    let b = ''; req.on('data', c => { b += c; if (b.length > 20000) { rej(new Error('too big')); req.destroy(); } });
    req.on('end', () => { try { res(b ? JSON.parse(b) : {}); } catch (e) { rej(e); } });
  });
}
const hits = new Map();
function limited(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim(), now = Date.now();
  const h = (hits.get(ip) || []).filter(t => now - t < 600000); h.push(now); hits.set(ip, h);
  return h.length > 30;
}
function authUser(req, url) {
  const t = (req.headers.authorization || '').replace('Bearer ', '') || url.searchParams.get('token') || '';
  const s = t && DB.sessions[sha(t)];
  if (!s || Date.now() - s.t > 60 * 86400000 || !DB.users[s.u]) return null;
  return { u: s.u, rec: DB.users[s.u], tokenHash: sha(t) };
}
function cleanSave(b, old, inRoom) {
  const P = G.P, base = [0, 6, 13, 18];
  const perm = (old && old.perm) || [];
  if (b.reset) {
    // New run: wipes everything (admin gifts, custom items, coins, diamonds) except permanent anniversary items and records.
    const owned = [...new Set([...base, ...perm])];
    return { owned, eq: G.validEq(null, owned), boss: 0, clears: old ? old.clears || 0 : 0, tb: old ? old.tb || 0 : 0,
      coins: 0, hpup: 0, dia: 0, world: 1, b2: 0, cl1: 0, perm, ann: old ? old.ann || 0 : 0 };
  }
  const oldOwned = old ? old.owned || [] : [];
  const keep = oldOwned.filter(i => P[i]);
  const claim = (Array.isArray(b.owned) ? b.owned : []).map(Number).filter(i => Number.isInteger(i) && P[i] && !P[i].cu && !P[i].an);
  const owned = [...new Set([...base, ...perm, ...keep, ...claim])];
  const eq = G.validEq(b.eq, owned);
  const int = (v, max) => Math.max(0, Math.min(max, Number.isInteger(+v) ? +v : 0));
  const cl1 = (b.cl1 || (old && old.cl1)) ? 1 : 0;
  return { owned, eq, boss: int(b.boss, 12), clears: int(b.clears, 9999), tb: old ? old.tb || 0 : 0,
    coins: inRoom && old ? old.coins || 0 : int(b.coins, 999999), hpup: int(b.hpup, 10), dia: int(b.dia, 999999),
    world: cl1 && b.world == 2 ? 2 : 1, b2: int(b.b2, 21), cl1, perm, ann: old ? old.ann || 0 : 0 };
}
// Anniversary: Sep 30 and Oct 1 (any timezone). Gives permanent parts plus currency, once per year.
function annGift(rec, force) {
  const y = force ? new Date().getUTCFullYear() : G.annYear(Date.now()), sv = rec.save;
  if (!y || (!force && (sv.ann || 0) >= y)) return null;
  const parts = G.P.filter(p => p.an).map(p => p.id);
  sv.perm = [...new Set([...(sv.perm || []), ...parts])];
  sv.owned = [...new Set([...sv.owned, ...parts])];
  sv.coins = (sv.coins || 0) + G.ANN.coins; sv.dia = (sv.dia || 0) + G.ANN.dia; if (!force) sv.ann = y; persist();
  return { year: y, coins: G.ANN.coins, dia: G.ANN.dia, parts };
}

const customsFor = ids => ids.filter(i => DB.customs[i]).map(i => DB.customs[i]);
const NUM = (v, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(+v) ? +v : 0));
function cleanCustom(d) {
  const s = ['h', 'b', 'g', 'c'].includes(d.s) ? d.s : 'b';
  const o = { s, n: String(d.n || 'Custom item').trim().slice(0, 24) || 'Custom item', t: Math.round(NUM(d.t, 0, 6)), c: /^#[0-9a-f]{6}$/i.test(d.c) ? d.c : '#cccccc',
    atk: NUM(d.atk, -50, 999), spd: NUM(d.spd, -0.5, 3), def: NUM(d.def, -50, 99), crit: NUM(d.crit, 0, 1), life: NUM(d.life, 0, 1) };
  if (s === 'c') o.e = ['fire', 'ice', 'shock', 'blood', 'void', 'toxic', 'holy'].includes(d.e) ? d.e : 'fire';
  if (s === 'g') { o.w = Math.round(NUM(d.w, 14, 30)); if (['spike', 'wing'].includes(d.dc)) o.dc = d.dc; }
  if (s === 'b') { const a = Array.isArray(d.sh) ? d.sh.map(Number) : [30, 3, 5]; o.sh = [Math.round(NUM(a[0], 10, 37)), Math.round(NUM(a[1], 1, 7)), Math.round(NUM(a[2], 1, 8))]; }
  return o;
}
// ---------- co-op rooms ----------
const rooms = new Map(), userRoom = new Map();
const CODE_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';
const newCode = () => { let c; do { c = Array.from({ length: 5 }, () => CODE_CHARS[crypto.randomInt(CODE_CHARS.length)]).join(''); } while (rooms.has(c)); return c; };

function snapshot(room, u) {
  return {
    code: room.code, cap: room.cap, host: room.host, phase: room.phase, floor: room.floor, n: room.n,
    boss: room.boss, bossHp: room.bossHp, bossMax: room.bossMax,
    players: room.players.map(p => ({ u: p.u, nm: p.nm, eq: p.eq, hp: p.hp, mx: p.mx, dead: p.dead, dealt: p.dealt, off: p.off, picked: p.picked })),
    cu: customsFor([...new Set(room.players.flatMap(p => Object.values(p.eq)))]), ev: room.ev, gain: room.gain || 0, coins: (DB.users[u] && DB.users[u].save.coins) || 0, rew: room.rew[u] || [], best: (DB.users[u] || {}).save ? DB.users[u].save.tb || 0 : 0
  };
}
function broadcast(room) {
  room.ts = Date.now();
  for (const p of room.players) if (p.res && !p.off) p.res.write('data: ' + JSON.stringify(snapshot(room, p.u)) + '\n\n');
}
function startFloor(room, f) {
  room.floor = f; room.boss = G.bossFor(f, room.n); room.bossMax = room.bossHp = room.boss.hp0;
  room.players.forEach(p => { p.hp = p.mx; p.dead = 0; p.dealt = 0; p.picked = false; });
  room.rew = {}; room.phase = 'fight';
}
function rollRewards(room) {
  room.gain = (20 + 8 * room.floor) * (room.boss.sp ? 2 : 1);
  for (const p of room.players) {
    const owned = DB.users[p.u].save.owned;
    room.rew[p.u] = G.towerPool(room.floor, room.boss.sp, owned);
    const sv = DB.users[p.u].save; sv.tb = Math.max(sv.tb || 0, room.floor); sv.coins = (sv.coins || 0) + room.gain;
  }
  persist();
}
function checkReward(room) {
  const active = room.players.filter(p => !p.off);
  if (room.phase === 'reward' && active.length && active.every(p => p.picked)) { startFloor(room, room.floor + 1); }
}
function removePlayer(room, u) {
  const i = room.players.findIndex(p => p.u === u); if (i < 0) return;
  const p = room.players[i]; if (p.res) { try { p.res.end(); } catch (e) {} } clearTimeout(p.timer);
  room.players.splice(i, 1); userRoom.delete(u);
  if (!room.players.length) { rooms.delete(room.code); return; }
  if (room.host === u) room.host = room.players[0].u;
  if (room.phase === 'fight' && room.players.every(q => q.dead || q.off)) room.phase = 'over';
  checkReward(room); broadcast(room);
}
function roomOf(user, res) {
  const room = rooms.get(userRoom.get(user.u));
  if (!room) { fail(res, 404, 'You are not in a room.'); return null; }
  return room;
}
setInterval(() => { for (const r of rooms.values()) if (Date.now() - r.ts > 3600000) { r.players.slice().forEach(p => removePlayer(r, p.u)); } }, 60000);

async function handleApi(req, res, url) {
  const route = url.pathname;
  if (route === '/api/signup' || route === '/api/login') {
    if (limited(req)) return fail(res, 429, 'Too many attempts. Wait a few minutes.');
    const b = await body(req), u = String(b.username || '').toLowerCase(), pw = String(b.password || '');
    if (!/^[a-z0-9_]{3,16}$/.test(u)) return fail(res, 400, 'Username: 3 to 16 letters, numbers or underscores.');
    if (pw.length < 6 || pw.length > 100) return fail(res, 400, 'Password needs at least 6 characters.');
    let rec = DB.users[u];
    if (route === '/api/signup') {
      const name = String(b.name || '').trim().slice(0, 20);
      if (!name) return fail(res, 400, 'Enter your name.');
      if (rec) return fail(res, 409, 'That username is taken.');
      const salt = crypto.randomBytes(16).toString('hex');
      rec = DB.users[u] = { name, salt, hash: (await scrypt(pw, salt)).toString('hex'), save: cleanSave(b.save || {}, null) };
    } else {
      const ok = rec && crypto.timingSafeEqual(await scrypt(pw, rec.salt), Buffer.from(rec.hash, 'hex'));
      if (!ok) return fail(res, 401, 'Wrong username or password.');
    }
    const token = crypto.randomBytes(24).toString('hex');
    DB.sessions[sha(token)] = { u, t: Date.now() }; persist();
    const gift = annGift(rec);
    return json(res, 200, { token, user: { username: u, name: rec.name }, save: rec.save, customs: customsFor(rec.save.owned), gift });
  }
  const user = authUser(req, url);
  if (!user) return fail(res, 401, 'Please log in.');
  const rec = user.rec;

  if (route === '/api/me') { const gift = annGift(rec); return json(res, 200, { user: { username: user.u, name: rec.name }, save: rec.save, customs: customsFor(rec.save.owned), gift }); }
  if (route === '/api/logout') { delete DB.sessions[user.tokenHash]; persist(); return json(res, 200, {}); }
  if (route === '/api/save') { rec.save = cleanSave(await body(req), rec.save, userRoom.has(user.u)); persist(); return json(res, 200, { save: rec.save }); }

  if (route.startsWith('/api/admin/')) {
    if (user.u !== ADMIN) return fail(res, 403, 'Admins only.');
    if (route === '/api/admin/users') return json(res, 200, { users: Object.entries(DB.users).map(([u, r]) => ({ u, name: r.name })) });
    const b = await body(req), target = DB.users[String(b.username || '').toLowerCase()];
    if (!target) return fail(res, 404, 'No such player.');
    const tu = String(b.username).toLowerCase();
    const inRoom = userRoom.has(tu);
    if (route === '/api/admin/give') {
      const id = +b.part; if (!G.P[id]) return fail(res, 400, 'No such part.');
      if (!target.save.owned.includes(id)) target.save.owned.push(id);
      persist(); return json(res, 200, { ok: true });
    }
    if (route === '/api/admin/custom') {
      const d = cleanCustom(b.part || {}); d.id = DB.nextCustom++;
      const p = G.addCustom(d); DB.customs[d.id] = p;
      target.save.owned.push(d.id); persist(); return json(res, 200, { part: p });
    }
    if (route === '/api/admin/diamonds') {
      target.save.dia = Math.max(0, Math.min(999999, (target.save.dia || 0) + Math.round(NUM(b.amount, -999999, 999999))));
      persist(); return json(res, 200, { dia: target.save.dia });
    }
    if (route === '/api/admin/anniversary') { annGift(target, true); return json(res, 200, { ok: true }); }
    if (route === '/api/admin/world') { target.save.cl1 = 1; persist(); return json(res, 200, { ok: true }); }
    if (route === '/api/admin/coins') {
      target.save.coins = Math.max(0, Math.min(999999, (target.save.coins || 0) + Math.round(NUM(b.amount, -999999, 999999))));
      persist(); return json(res, 200, { coins: target.save.coins, inRoom });
    }
    return fail(res, 404, 'Unknown route.');
  }

  if (route === '/api/room/events') {
    const room = rooms.get(String(url.searchParams.get('code') || '').toLowerCase());
    const p = room && room.players.find(x => x.u === user.u);
    if (!p) return fail(res, 404, 'Room not found.');
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    if (p.res) { try { p.res.end(); } catch (e) {} }
    p.res = res; p.off = false; clearTimeout(p.timer);
    res.write('retry: 2000\n\n');
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => {
      clearInterval(ping);
      if (p.res !== res) return;
      p.off = true; p.res = null;
      p.timer = setTimeout(() => removePlayer(room, user.u), 20000);
      if (room.phase === 'fight' && room.players.every(q => q.dead || q.off)) room.phase = 'over';
      checkReward(room); broadcast(room);
    });
    broadcast(room); return;
  }

  if (route === '/api/room/create' || route === '/api/room/join') {
    const b = await body(req);
    const old = rooms.get(userRoom.get(user.u)); if (old) removePlayer(old, user.u);
    let room;
    if (route === '/api/room/create') {
      const cap = [2, 3, 4].includes(+b.cap) ? +b.cap : 2;
      room = { code: newCode(), cap, host: user.u, phase: 'wait', players: [], floor: 0, n: 2, boss: null, bossHp: 0, bossMax: 0, seq: 0, ev: null, rew: {}, ts: Date.now() };
      rooms.set(room.code, room);
    } else {
      room = rooms.get(String(b.code || '').toLowerCase());
      if (!room) return fail(res, 404, 'No room with that code.');
      if (room.phase !== 'wait') return fail(res, 409, 'That tower already started.');
      if (room.players.length >= room.cap) return fail(res, 409, 'That room is full.');
    }
    const sv = rec.save;
    room.players.push({ u: user.u, nm: rec.name, eq: G.validEq(sv.eq, sv.owned), mx: G.maxHp(sv.hpup), hp: G.maxHp(sv.hpup), dead: 0, dealt: 0, last: 0, picked: false, res: null, off: false, timer: null });
    userRoom.set(user.u, room.code); broadcast(room);
    return json(res, 200, { code: room.code });
  }

  const room = roomOf(user, res); if (!room) return;
  const me = room.players.find(p => p.u === user.u);
  if (route === '/api/room/leave') { removePlayer(room, user.u); return json(res, 200, {}); }
  if (route === '/api/room/start') {
    if (room.host !== user.u || room.phase !== 'wait') return fail(res, 403, 'Only the host can start.');
    if (room.players.length < 2) return fail(res, 400, 'Need at least 2 players.');
    room.n = room.players.length; startFloor(room, 1); broadcast(room); return json(res, 200, {});
  }
  if (route === '/api/room/swing') {
    if (room.phase !== 'fight' || me.dead) return fail(res, 409, 'You cannot swing right now.');
    const s = G.stats(me.eq), now = Date.now();
    if (now - me.last < Math.max(650, 1000 / s.spd) - 150) return fail(res, 429, 'Too fast.');
    me.last = now;
    const { d, t } = G.dmg(s, room.boss.w, Math.random), rec2 = G.recoil(room.boss.r, s.def);
    room.bossHp = Math.max(0, room.bossHp - d); me.dealt += d;
    if (s.life) me.hp = Math.min(me.mx, me.hp + Math.min(Math.round(d * s.life), Math.floor(rec2 * 0.6)));
    me.hp -= rec2; if (me.hp <= 0) { me.hp = 0; me.dead = 1; }
    room.ev = { seq: ++room.seq, by: me.u, d, t, rec: rec2 };
    if (room.bossHp <= 0) { room.phase = 'reward'; rollRewards(room); }
    else if (room.players.every(p => p.dead || p.off)) room.phase = 'over';
    broadcast(room); return json(res, 200, {});
  }
  if (route === '/api/room/reward') {
    const b = await body(req), id = +b.id;
    if (room.phase !== 'reward' || me.picked) return fail(res, 409, 'Nothing to pick.');
    if (id !== -1 && !(room.rew[me.u] || []).includes(id)) return fail(res, 400, 'Invalid reward.');
    if (id !== -1 && !rec.save.owned.includes(id)) rec.save.owned.push(id);
    me.picked = true; persist(); checkReward(room); broadcast(room);
    return json(res, 200, { owned: rec.save.owned });
  }
  return fail(res, 404, 'Unknown route.');
}

// ---------- static files (just index.html and the shared code) ----------
function serveStatic(req, res, url) {
  if (url.pathname === '/shared.js') { res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache' }); return res.end(SHARED); }
  if (url.pathname !== '/' && url.pathname !== '/index.html') return fail(res, 404, 'Not found');
  fs.readFile(path.join(__dirname, 'index.html'), (e, data) => {
    if (e) return fail(res, 500, 'index.html is missing. Put it in the same folder as server.js.');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }); res.end(data);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) await handleApi(req, res, url);
    else serveStatic(req, res, url);
  } catch (e) { if (!res.headersSent) fail(res, 400, 'Bad request.'); }
}).listen(PORT, () => console.log('Forgebound running on port ' + PORT));
