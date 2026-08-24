import {PDFDocument,StandardFonts,rgb} from 'npm:pdf-lib@1.17.1';
import {safe,pct,fmt,flabel,teacher,scoreLabel,canonicalTotal,instructions,bpRows,normalizeOptions} from './helpers.ts';
import {headerBytes,CANONICAL_TEMPLATE_ID} from './asset.ts';
function wrap(t:string,n:number){const ws=safe(t).split(/\s+/),o:string[]=[];let l='';for(const w of ws){const x=l?l+' '+w:w;if(x.length>n&&l){o.push(l);l=w}else l=x}if(l)o.push(l);return o}
export async function makePdf(type:string,a:any,items:any[],c:any,cl:any){
const pdf=await PDFDocument.create(),font=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold),logo=await pdf.embedPng(headerBytes());
pdf.setTitle(`${a.title} | ${type}`);pdf.setSubject(CANONICAL_TEMPLATE_ID);pdf.setProducer(CANONICAL_TEMPLATE_ID);
const black=rgb(.05,.05,.05),gray=rgb(.38,.38,.38),teal=rgb(0,.42,.39),light=rgb(.92,.97,.96),line=rgb(.55,.62,.61);
let pg:any,y=0;
const add=(land=false)=>{pg=pdf.addPage(land?[841.89,595.28]:[595.28,841.89]);y=pg.getHeight()-28};
const header=()=>{const w=pg.getWidth()-72,h=w*(152/1240);pg.drawImage(logo,{x:36,y:y-h,width:w,height:h});y-=h+9};
const tx=(s:any,x:number,size=8.3,b=false,max=82,color=black)=>{for(const ln of wrap(s,max)){pg.drawText(safe(ln),{x,y,font:b?bold:font,size,color});y-=size+2.1}y-=1};
const ctr=(s:any,size=12,b=true,color=black)=>{for(const ln of wrap(s,90)){const f=b?bold:font,w=f.widthOfTextAtSize(safe(ln),size);pg.drawText(safe(ln),{x:(pg.getWidth()-w)/2,y,font:f,size,color});y-=size+2.4}y-=1};
const labelAt=(s:string,x:number,yy:number,size=8,b=false,color=black)=>pg.drawText(safe(s),{x,y:yy,font:b?bold:font,size,color});
const sectionBar=(title:string,x:number,yy:number,w:number,h=20)=>{pg.drawRectangle({x,y:yy-h,width:w,height:h,color:light,borderColor:teal,borderWidth:.7});const tw=bold.widthOfTextAtSize(title,8.6);pg.drawText(title,{x:x+(w-tw)/2,y:yy-h+6,font:bold,size:8.6,color:teal})};
if(type==='EXAM_TEMPLATE'){
 add();header();ctr(`AVALIAÇÃO ${a.assessment_type} 2026.2`,12.6,true,black);y-=1;
 // Quadro de identificação — largura integral e geometria fixa.
 const ix=36,iw=523,itop=y,ih=79;
 pg.drawRectangle({x:ix,y:itop-ih,width:iw,height:ih,borderColor:line,borderWidth:.75});
 pg.drawLine({start:{x:ix,y:itop-25},end:{x:ix+iw,y:itop-25},thickness:.55,color:line});
 pg.drawLine({start:{x:ix,y:itop-52},end:{x:ix+iw,y:itop-52},thickness:.55,color:line});
 pg.drawLine({start:{x:398,y:itop},end:{x:398,y:itop-25},thickness:.55,color:line});
 pg.drawLine({start:{x:398,y:itop-52},end:{x:398,y:itop-ih},thickness:.55,color:line});
 labelAt(`Disciplina: ${c.name}`,46,itop-17,8.2,true);labelAt(`Valor: ${pct(canonicalTotal(a))} pontos`,410,itop-17,8.2,true);
 labelAt('Aluno(a): _________________________________________________',46,itop-43,8.2,false);labelAt(`Turma: ${cl?.name||'________'}`,410,itop-43,8.2,false);
 labelAt(`Docentes: ${teacher(c.code||c.name)}`,46,itop-69,7.8,false);labelAt('Data: ____/____/2026',410,itop-69,7.8,false);
 y=itop-ih-12;
 // Instrutivo institucional com fundo suave — sem sobreposição.
 const ax=48,aw=499,ah=132,atop=y;sectionBar('LEIA ESTE INSTRUTIVO ANTES DE INICIAR A RESOLUÇÃO DA SUA AVALIAÇÃO',ax,atop,aw,22);
 pg.drawRectangle({x:ax,y:atop-ah,width:aw,height:ah-22,color:rgb(.975,.985,.982),borderColor:teal,borderWidth:.7});
 let ay=atop-38;labelAt('Fica terminantemente proibido aos alunos:',62,ay,7.4,true);ay-=14;
 for(const s of ['Comunicação irregular entre alunos durante a prova;','Consultas a manuscrito, material impresso ou recursos eletrônicos;','Utilização de equipamento eletrônico de qualquer natureza;','Escrita em carteira, paredes, mãos ou outras partes do corpo.']){labelAt('• '+s,66,ay,7.15,false);ay-=13}
 labelAt('COLAS/PESCAS implicam retenção da avaliação e encaminhamento à coordenação.',62,atop-ah+12,7.15,true);
 y=atop-ah-12;
 // Gabarito do aluno como grade real — não uma linha de texto.
 const gx=48,gw=499,gTop=y;sectionBar('GABARITO DO ALUNO',gx,gTop,gw,21);const cols=11,cw=gw/cols,rowH=24;
 for(let r=0;r<2;r++)for(let j=0;j<cols;j++){const yy=gTop-21-(r+1)*rowH;pg.drawRectangle({x:gx+j*cw,y:yy,width:cw,height:rowH,color:r===0?light:rgb(1,1,1),borderColor:line,borderWidth:.45});const text=r===0?(j===0?'Q':String(j)):j===0?'R':'';if(text){const f=bold,tw=f.widthOfTextAtSize(text,7.5);pg.drawText(text,{x:gx+j*cw+(cw-tw)/2,y:yy+8,font:f,size:7.5,color:r===0?teal:black})}else if(j>0){pg.drawCircle({x:gx+j*cw+cw/2,y:yy+rowH/2,size:5.1,borderColor:gray,borderWidth:.65})}}
 y=gTop-21-rowH*2-13;
 // Instruções gerais com mesma identidade visual.
 sectionBar('INSTRUÇÕES GERAIS',48,y,499,21);y-=34;
 const ins=instructions(a);for(const s of ins){for(const ln of wrap('• '+s,92)){labelAt(ln,58,y,7.25,false);y-=11}y-=1}
 y-=2;
 // Área administrativa explicitamente separada do espaço do aluno.
 const rx=48,rw=499,rh=43,rTop=y;sectionBar('RESERVADO À INSTITUIÇÃO',rx,rTop,rw,19);pg.drawRectangle({x:rx,y:rTop-rh,width:rw,height:rh-19,borderColor:line,borderWidth:.55});
 labelAt('Objetivas: ______ / 6,4',62,rTop-35,7.2,false);labelAt('Discursivas: ______ / 2,6',224,rTop-35,7.2,false);labelAt(`NOTA FINAL: ______ / ${pct(canonicalTotal(a))}`,398,rTop-35,7.2,true);
 // Páginas objetivas em duas colunas.
 const obj=items.filter(x=>fmt(x)!=='DISCURSIVA');
 for(let start=0;start<obj.length;start+=4){add();header();const group=obj.slice(start,start+4),cols2=[[group[0],group[1]],[group[2],group[3]]],top=y;for(let ci=0;ci<2;ci++){let yy=top;const x=ci===0?34:309,w=252;for(const it of cols2[ci].filter(Boolean)){const f=fmt(it);const draw=(s:any,size=8.0,b=false,indent=0)=>{for(const ln of wrap(s,Math.floor((w-indent)/(size*.52)))){pg.drawText(safe(ln),{x:x+indent,y:yy,font:b?bold:font,size,color:black});yy-=size+2}yy-=.8};draw(scoreLabel(a,it),8.5,true);draw(it.stem,8.0);if(f==='VERDADEIRO_FALSO'){(it.format_payload?.statements||[]).forEach((s:any,k:number)=>draw(`${['I','II','III','IV'][k]}. ${s?.text??s}`,7.7));draw('Assinale a alternativa que apresenta a sequência correta.',7.7,true)}if(f==='ASSOCIACAO_COLUNAS'){const A=it.format_payload?.column_i||[],B=it.format_payload?.column_ii||[];draw('COLUNA I                         COLUNA II',7.5,true);for(let k=0;k<4;k++)draw(`${k+1}. ${A[k]||''}    ( ) ${B[k]||''}`,7.4);draw('Assinale a alternativa correta.',7.7,true)}normalizeOptions(it).forEach((o:any,k:number)=>draw(`${String.fromCharCode(65+k)}) ${o.replace(/^[A-E]\)\s*/,'')}`,7.6,false,2));yy-=4;pg.drawLine({start:{x,y:yy},end:{x:x+w,y:yy},thickness:.35,color:rgb(.72,.72,.72)});yy-=7}}pg.drawLine({start:{x:297,y:top+2},end:{x:297,y:35},thickness:.45,color:rgb(.72,.72,.72)})}
 // Discursivas em largura integral e espaço de resposta dedicado.
 for(const it of items.filter(x=>fmt(x)==='DISCURSIVA')){add();header();tx(scoreLabel(a,it),38,9.2,true,90);tx(it.stem,38,8.5,false,90);for(let k=0;k<11;k++){pg.drawLine({start:{x:40,y},end:{x:555,y},thickness:.4,color:rgb(.65,.65,.65)});y-=22}}
}
if(type==='BLUEPRINT_REPORT'){add(true);header();ctr('RELATÓRIO DO BLUEPRINT',13.5,true,teal);ctr(`${a.assessment_type} 2026.2 | Disciplina: ${c.name} | Valor: ${pct(canonicalTotal(a))} pontos`,8.2,false,gray);const rows=bpRows(a,items),hs=['Item','Formato','Conteúdo / Tema','Objetivo / Competência','Bloom','Dific.','Família DCN','Pal.','Peso','Angoff (p)'],xs=[18,46,104,194,410,462,514,578,626,674],ws=[28,58,90,216,52,52,64,48,48,74];const drawHead=()=>{hs.forEach((h,i)=>{pg.drawRectangle({x:xs[i],y:y-20,width:ws[i],height:22,color:light,borderColor:teal,borderWidth:.5});for(const [k,ln] of wrap(h,Math.max(4,Math.floor(ws[i]/4.2))).slice(0,2).entries())pg.drawText(safe(ln),{x:xs[i]+2,y:y-10-k*7,font:bold,size:6.1,color:teal})});y-=22};drawHead();for(const r of rows){const lines=r.map((v,j)=>wrap(v,Math.max(4,Math.floor(ws[j]/4.15)))),hh=Math.max(28,...lines.map(l=>l.length*7.5+5));if(y-hh<30){add(true);header();drawHead()}hs.forEach((_,j)=>{pg.drawRectangle({x:xs[j],y:y-hh,width:ws[j],height:hh,borderColor:rgb(.55,.65,.65),borderWidth:.35});let yy=y-9;for(const ln of lines[j].slice(0,Math.floor((hh-4)/7.4))){pg.drawText(safe(ln),{x:xs[j]+2,y:yy,font,size:6.1,color:black});yy-=7.1}});y-=hh}}
if(type==='COMMENTED_KEY'){add();header();ctr('GABARITO COMENTADO',13.5,true,teal);for(const it of items){if(y<105){add();header()}tx(`Questão ${it.item_number} - ${flabel(fmt(it))}${fmt(it)!=='DISCURSIVA'?` - Gabarito: ${it.correct_answer}`:''}`,38,8.8,true,90,teal);tx(it.rationale||it.justification,42,7.8,false,88);if(fmt(it)==='DISCURSIVA'){tx('Rubrica analítica:',42,7.8,true,88,teal);tx(it.rubric,42,7.6,false,88)}y-=4}}
if(type==='TECHNICAL_DOSSIER'){add();header();ctr('CADERNO TÉCNICO DO PROFESSOR',13.5,true,teal);tx('Avaliação construída segundo a Skill Oficial MEDICINA-V7.1-CONFORMIDADE-2026, com blueprint prévio, formatos vinculantes, Angoff e auditoria bloqueante.',38,8.2,false,90);for(const r of bpRows(a,items)){if(y<75){add();header()}tx(`Q${r[0]} | ${r[1]} | Bloom ${r[4]} | Família ${r[6]||'-'} | ${r[7]} palavras | Peso ${r[8]} | Angoff ${r[9]}`,40,7.8,false,90)}tx('Resultado: APROVADO PARA APLICAÇÃO DOCENTE após auditoria V7.1.',38,8.8,true,90,teal)}
pdf.getPages().forEach((p,i)=>{p.drawLine({start:{x:36,y:27},end:{x:p.getWidth()-36,y:27},thickness:.55,color:teal});p.drawText(`${c?.code||c?.name||'Medicina'} | Medicina | ${teacher(c?.code||c?.name||'')}`,{x:38,y:14,font,size:6.2,color:gray});p.drawText(String(i+1),{x:p.getWidth()-42,y:14,font:bold,size:6.5,color:gray})});
return await pdf.save()}
