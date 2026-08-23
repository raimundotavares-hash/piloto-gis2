export const CANONICAL_HEADER_SHA256='ac0f5611990cb0acb55ae4a73df0e7c95a778be0abdeef8716e6d9c37b770080';
export const CANONICAL_TEMPLATE_ID='IDOMED-CANONICAL-EXAM-V2';
export const CANONICAL_LAYOUT_VERSION='2026-08-23-LOCKED';
const base=Deno.env.get('SUPABASE_URL')!, key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const u=base+'/rest/v1/platform_canonical_document_assets?template_id=eq.'+CANONICAL_TEMPLATE_ID+'&asset_kind=eq.official_header_png&select=asset_b64,sha256';
const r=await fetch(u,{headers:{apikey:key,Authorization:'Bearer '+key}}); if(!r.ok)throw new Error('canonical_header_asset_unavailable:'+r.status);
const rows=await r.json(); const row=rows?.[0]; if(!row?.asset_b64||row.sha256!==CANONICAL_HEADER_SHA256)throw new Error('canonical_header_metadata_mismatch');
const bin=atob(row.asset_b64); const bytes=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
const h=await crypto.subtle.digest('SHA-256',bytes); const hex=[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join(''); if(hex!==CANONICAL_HEADER_SHA256)throw new Error('canonical_header_hash_mismatch');
export function headerBytes(){return bytes.slice()}
