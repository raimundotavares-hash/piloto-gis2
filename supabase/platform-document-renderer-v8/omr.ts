import {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,WidthType,AlignmentType,ImageRun,Footer,PageNumber,BorderStyle,ShadingType} from 'npm:docx@9.5.1';
import {PDFDocument,StandardFonts,rgb} from 'npm:pdf-lib@1.17.1';
import {headerBytes} from './asset.ts';
import {clean,teacher,canonicalTotal,pct} from './helpers.ts';
const BLACK='111111',TEAL='006B63',LIGHT='EAF5F3',GRAY='666666';
const run=(t:any,b=false,s=20,c=BLACK)=>new TextRun({text:clean(t),bold:b,font:'Arial',size:s,color:c});
const p=(t:any,b=false,s=20,a=AlignmentType.LEFT,c=BLACK)=>new Paragraph({alignment:a,spacing:{after:70},children:[run(t,b,s,c)]});
const cell=(t:any,h=false,s=18)=>new TableCell({shading:h?{type:ShadingType.CLEAR,fill:LIGHT}:undefined,margins:{top:65,bottom:65,left:70,right:70},children:[p(t,h,s,AlignmentType.CENTER,h?TEAL:BLACK)]});
function answerRows(n=10){const rows:any[]=[new TableRow({children:['Q','A','B','C','D','E'].map(x=>cell(x,true,18))})];for(let i=1;i<=n;i++)rows.push(new TableRow({children:[cell(String(i),true,18),...['A','B','C','D','E'].map(()=>cell('○',false,20))]}));return rows}
export async function makeOmrDocx(a:any,items:any[],c:any,cl:any){
 const logo=new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:70},children:[new ImageRun({data:headerBytes(),transformation:{width:640,height:78},type:'png'})]});
 const id=new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[
  new TableRow({children:[new TableCell({columnSpan:2,shading:{type:ShadingType.CLEAR,fill:LIGHT},children:[p(`FOLHA DE RESPOSTAS - ${a.assessment_type} 2026.2`,true,22,AlignmentType.CENTER,TEAL)]})]}),
  new TableRow({children:[cell(`Disciplina: ${c.name}`,false,17),cell(`Turma: ${cl?.name||'________'}`,false,17)]}),
  new TableRow({children:[new TableCell({columnSpan:2,children:[p('Aluno(a): _________________________________________________',false,18)]})]}),
  new TableRow({children:[cell(`Docentes: ${teacher(c.code||c.name)}`,false,16),cell(`Valor: ${pct(canonicalTotal(a))} pontos`,false,17)]})
 ]});
 const grid=new Table({width:{size:78,type:WidthType.PERCENTAGE},alignment:AlignmentType.CENTER,borders:{top:{style:BorderStyle.SINGLE,size:5,color:TEAL},bottom:{style:BorderStyle.SINGLE,size:5,color:TEAL},left:{style:BorderStyle.SINGLE,size:5,color:TEAL},right:{style:BorderStyle.SINGLE,size:5,color:TEAL},insideHorizontal:{style:BorderStyle.SINGLE,size:2,color:'AAAAAA'},insideVertical:{style:BorderStyle.SINGLE,size:2,color:'AAAAAA'}},rows:answerRows(Number(a.objective_count||8))});
 const codes=new Table({width:{size:100,type:WidthType.PERCENTAGE},rows:[new TableRow({children:[cell('Código/QR individual: __________________________________',true,16),cell('Matrícula/ID: ______________________________',true,16)]}),new TableRow({children:[new TableCell({columnSpan:2,children:[p('Assinatura do aluno: ________________________________________________',false,17)]})]})]});
 const footer=new Footer({children:[new Paragraph({border:{top:{style:BorderStyle.SINGLE,size:4,color:TEAL}},alignment:AlignmentType.RIGHT,children:[run('Estácio–IDOMED – Iguatu | Página ',false,13,GRAY),new TextRun({children:[PageNumber.CURRENT],font:'Arial',size:13,color:GRAY})]})]});
 const doc=new Document({styles:{default:{document:{run:{font:'Arial',size:20,color:BLACK}}}},sections:[{properties:{page:{margin:{top:340,right:500,bottom:420,left:500}}},footers:{default:footer},children:[logo,id,p('',false,8),p('GABARITO INDIVIDUAL DO ALUNO',true,22,AlignmentType.CENTER,TEAL),p('Preencha completamente apenas um círculo por questão objetiva. Não rasurar os campos de marcação.',false,17,AlignmentType.CENTER),grid,p('',false,10),codes]}]});
 return await Packer.toBuffer(doc)
}
export async function makeOmrPdf(a:any,items:any[],c:any,cl:any){
 const pdf=await PDFDocument.create(),page=pdf.addPage([595.28,841.89]),font=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold),logo=await pdf.embedPng(headerBytes());
 const black=rgb(.05,.05,.05),gray=rgb(.38,.38,.38),teal=rgb(0,.42,.39),light=rgb(.92,.97,.96),line=rgb(.55,.62,.61);
 pdf.setTitle(`${a.title} | OMR_PACKAGE`);pdf.setSubject('IDOMED-CANONICAL-EXAM-V2');pdf.setProducer('IDOMED-CANONICAL-EXAM-V2');
 const w=523,h=w*(152/1240);page.drawImage(logo,{x:36,y:790-h,width:w,height:h});let y=777-h;
 const center=(s:string,size=12,b=true,color=black)=>{const f=b?bold:font,tw=f.widthOfTextAtSize(s,size);page.drawText(s,{x:(595.28-tw)/2,y,font:f,size,color});y-=size+9};
 const label=(s:string,x:number,yy:number,size=8,b=false,color=black)=>page.drawText(clean(s),{x,y:yy,font:b?bold:font,size,color});
 center(`FOLHA DE RESPOSTAS - ${a.assessment_type} 2026.2`,12,true,teal);y-=1;
 const ix=45,iw=505,itop=y,ih=76;page.drawRectangle({x:ix,y:itop-ih,width:iw,height:ih,borderColor:line,borderWidth:.7});page.drawRectangle({x:ix,y:itop-22,width:iw,height:22,color:light,borderColor:teal,borderWidth:.55});
 label(`Disciplina: ${c.name}`,55,itop-15,8.3,true,teal);label(`Valor: ${pct(canonicalTotal(a))} pontos`,442,itop-15,8.1,true,teal);
 page.drawLine({start:{x:ix,y:itop-48},end:{x:ix+iw,y:itop-48},thickness:.45,color:line});label('Aluno(a): _________________________________________________',55,itop-40,8.3,false);label(`Turma: ${cl?.name||'________'}`,430,itop-40,8.1,false);
 label(`Docentes: ${teacher(c.code||c.name)}`,55,itop-67,7.7,false);
 y=itop-ih-20;center('GABARITO INDIVIDUAL DO ALUNO',11,true,teal);center('Preencha completamente apenas um círculo por questão objetiva.',7.8,false,black);
 const x0=123,rowH=31,colW=58,n=Number(a.objective_count||8),heads=['Q','A','B','C','D','E'];
 for(let j=0;j<6;j++){page.drawRectangle({x:x0+j*colW,y:y-rowH,width:colW,height:rowH,color:light,borderColor:teal,borderWidth:.65});const tw=bold.widthOfTextAtSize(heads[j],9);page.drawText(heads[j],{x:x0+j*colW+(colW-tw)/2,y:y-20,font:bold,size:9,color:teal})}y-=rowH;
 for(let i=1;i<=n;i++){for(let j=0;j<6;j++){page.drawRectangle({x:x0+j*colW,y:y-rowH,width:colW,height:rowH,borderColor:line,borderWidth:.45});if(j===0){const s=String(i),tw=bold.widthOfTextAtSize(s,9);page.drawText(s,{x:x0+(colW-tw)/2,y:y-20,font:bold,size:9,color:black})}else page.drawCircle({x:x0+j*colW+colW/2,y:y-rowH/2,size:6.2,borderColor:gray,borderWidth:.8})}y-=rowH}
 y-=24;const bx=55,bw=485,bh=48;page.drawRectangle({x:bx,y:y-bh,width:bw,height:bh,borderColor:teal,borderWidth:.65});page.drawRectangle({x:bx,y:y-22,width:bw,height:22,color:light,borderColor:teal,borderWidth:.5});label('Código/QR individual:',65,y-15,7.6,true,teal);label('________________________________',164,y-15,7.6,false);label('Matrícula/ID:',340,y-15,7.6,true,teal);label('____________________',410,y-15,7.6,false);label('Assinatura do aluno: _________________________________________________',65,y-39,7.7,false);
 page.drawLine({start:{x:36,y:28},end:{x:559,y:28},thickness:.7,color:teal});page.drawText(`${clean(c?.code||c?.name||'Medicina')} | Medicina | ${clean(teacher(c?.code||c?.name||''))}`,{x:40,y:14,font,size:6.3,color:gray});page.drawText('1',{x:535,y:14,font:bold,size:6.5,color:gray});
 return await pdf.save()
}
