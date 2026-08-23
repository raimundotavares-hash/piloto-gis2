export const CANONICAL_HEADER_SHA256='8615d89b8972a768e037645279ca4719664f84bcb4cf685bb41771e14100b951';
export const CANONICAL_TEMPLATE_ID='IDOMED-CANONICAL-EXAM-V2';
export const CANONICAL_LAYOUT_VERSION='2026-08-23-LOCKED';
const ASSET_URL='https://raw.githubusercontent.com/raimundotavares-hash/piloto-gis2/a3323c1295ce79bd11834803b79390bb11b58d57/assets/idomed-header-canonical.b64';
const r=await fetch(ASSET_URL,{cache:'no-store'}); if(!r.ok)throw new Error('canonical_header_asset_unavailable:'+r.status);
const b64=(await r.text()).trim(); const bin=atob(b64); const bytes=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
const h=await crypto.subtle.digest('SHA-256',bytes); const hex=[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join(''); if(hex!==CANONICAL_HEADER_SHA256)throw new Error('canonical_header_hash_mismatch:'+hex);
export function headerBytes(){return bytes.slice()}
