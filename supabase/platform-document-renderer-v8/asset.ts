export const CANONICAL_SOURCE_SHA256='ac0f5611990cb0acb55ae4a73df0e7c95a778be0abdeef8716e6d9c37b770080';
export const CANONICAL_HEADER_SHA256=CANONICAL_SOURCE_SHA256;
export const CANONICAL_TEMPLATE_ID='IDOMED-CANONICAL-EXAM-V2';
export const CANONICAL_LAYOUT_VERSION='2026-08-24-V12-CANONICAL-PNG-VALIDATED';
const BASE='https://raw.githubusercontent.com/raimundotavares-hash/piloto-gis2/fix/canonical-renderer-v11/assets/canonical-header-v2/';
const chunks:string[]=[];
for(let i=0;i<17;i++){
  const name=`part-${String(i).padStart(2,'0')}.b64`;
  const r=await fetch(BASE+name,{cache:'no-store'});
  if(!r.ok)throw new Error(`canonical_header_part_unavailable:${name}:${r.status}`);
  chunks.push((await r.text()).trim());
}
const bin=atob(chunks.join(''));
const source=new Uint8Array(bin.length);
for(let i=0;i<bin.length;i++)source[i]=bin.charCodeAt(i);
async function hexSha(b:Uint8Array){const h=await crypto.subtle.digest('SHA-256',b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('')}
const actual=await hexSha(source);
if(actual!==CANONICAL_HEADER_SHA256)throw new Error(`canonical_header_hash_mismatch:${actual}`);
if(source.length!==48443)throw new Error(`canonical_header_size_mismatch:${source.length}`);
if(source[0]!==137||source[1]!==80||source[2]!==78||source[3]!==71)throw new Error('canonical_header_not_png');
async function validatePng(bytes:Uint8Array){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  let pos=8,width=0,height=0,bitDepth=-1,colorType=-1;
  const idats:Uint8Array[]=[];
  while(pos+12<=bytes.length){
    const length=view.getUint32(pos);
    if(pos+12+length>bytes.length)throw new Error('canonical_header_png_truncated');
    const type=String.fromCharCode(...bytes.slice(pos+4,pos+8));
    const data=bytes.slice(pos+8,pos+8+length);
    if(type==='IHDR'){
      const ihdr=new DataView(data.buffer,data.byteOffset,data.byteLength);
      width=ihdr.getUint32(0);height=ihdr.getUint32(4);bitDepth=data[8];colorType=data[9];
    }else if(type==='IDAT')idats.push(data);
    pos+=12+length;
    if(type==='IEND')break;
  }
  if(width!==1240||height!==152)throw new Error(`canonical_header_dimensions_mismatch:${width}x${height}`);
  if(bitDepth!==8||colorType!==6)throw new Error(`canonical_header_png_format_mismatch:${bitDepth}:${colorType}`);
  let compressedLength=0;for(const part of idats)compressedLength+=part.length;
  const compressed=new Uint8Array(compressedLength);let offset=0;
  for(const part of idats){compressed.set(part,offset);offset+=part.length}
  const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate'));
  const raw=new Uint8Array(await new Response(stream).arrayBuffer());
  const stride=width*4,expected=height*(stride+1);
  if(raw.length!==expected)throw new Error(`canonical_header_scanline_size_mismatch:${raw.length}:${expected}`);
  for(let row=0;row<height;row++){
    const filter=raw[row*(stride+1)];
    if(filter>4)throw new Error(`canonical_header_invalid_filter:${row}:${filter}`);
  }
}
await validatePng(source);
export const RENDERED_HEADER_SHA256=CANONICAL_HEADER_SHA256;
export function headerBytes(){return source.slice()}
export function sourceHeaderBytes(){return source.slice()}
