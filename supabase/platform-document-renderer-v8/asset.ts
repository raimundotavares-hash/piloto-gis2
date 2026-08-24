export const CANONICAL_HEADER_SHA256='ac0f5611990cb0acb55ae4a73df0e7c95a778be0abdeef8716e6d9c37b770080';
export const CANONICAL_TEMPLATE_ID='IDOMED-CANONICAL-EXAM-V2';
export const CANONICAL_LAYOUT_VERSION='2026-08-23-V11-CANONICAL-LOCKED';
const ASSET_URL='https://raw.githubusercontent.com/raimundotavares-hash/piloto-gis2/fix/canonical-renderer-v11/assets/idomed-header-canonical.b64';
const r=await fetch(ASSET_URL,{cache:'no-store'});
if(!r.ok)throw new Error(`canonical_header_asset_unavailable:${r.status}`);
const b64=(await r.text()).trim();
const bin=atob(b64);
const source=new Uint8Array(bin.length);
for(let i=0;i<bin.length;i++)source[i]=bin.charCodeAt(i);
async function hexSha(b:Uint8Array){const h=await crypto.subtle.digest('SHA-256',b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const actual=await hexSha(source);
if(actual!==CANONICAL_HEADER_SHA256)throw new Error(`canonical_header_hash_mismatch:${actual}`);
if(source.length!==48443)throw new Error(`canonical_header_size_mismatch:${source.length}`);
if(source[0]!==137||source[1]!==80||source[2]!==78||source[3]!==71)throw new Error('canonical_header_not_png');
export const RENDERED_HEADER_SHA256=CANONICAL_HEADER_SHA256;
export function headerBytes(){return source.slice()}
export function sourceHeaderBytes(){return source.slice()}
