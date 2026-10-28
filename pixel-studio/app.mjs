import { countColors, hex, rgb, trimImage } from './core.mjs';
import { inspectMedia,readRemote,mediaUrl,IMAGE_LIMIT,MEDIA_LIMIT } from './media.mjs';
import {checkSourceSize,exportPlan,MAX_SOURCE_EDGE,MAX_GRID_EDGE,densityPlan} from './resolution.mjs';
const $=id=>document.getElementById(id);
const worker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'});
let source=null,result=null,originalColors=0,busy=false,tool='view',picking=false,stroke=null,sequence=0,filename='狐狸練習稿',appliedOptions=null,selectedColor=0;
const jobs=new Map(),undo=[],redo=[];
let currentMedia=null,remoteController=null;
let densityActive=true,densityRevision=0,densityPending=false,densityTimer=null;
worker.onmessage=({data})=>{const job=jobs.get(data.id);if(!job)return;jobs.delete(data.id);data.error?job.reject(new Error(data.error)):job.resolve(data.result);};
worker.onerror=()=>{for(const job of jobs.values())job.reject(new Error('圖片處理程式無法啟動，請重新整理網頁。'));jobs.clear();setBusy(false);};
function request(task,options){return new Promise((resolve,reject)=>{const id=++sequence;jobs.set(id,{resolve,reject});worker.postMessage({id,task,image:source,options});});}
function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
function setBusy(value){busy=value;document.body.classList.toggle('processing',value);document.querySelector('.settings').inert=value;for(const id of ['apply','detect','demo','file','export','export-palette','undo','redo','replace-color','load-url','open-link','capture-frame'])$(id).disabled=value;document.querySelector('label[for="file"]').style.opacity=value?'.5':'1';if(!value){updateUndo();if(densityPending)armDensity();}$('state-tag').textContent=value?'處理中…':densityPending?'更新色塊中…':'可編輯';}
function currentDensity(){return densityPlan(source.width,source.height,Number($('block-density').value));}
function renderDensity(){
  if(!source)return;const plan=currentDensity(),max=densityPlan(source.width,source.height,plan.maxLongEdge);
  $('density-limit').textContent=`最高 ${max.count.toLocaleString()} 個色塊（${max.width} × ${max.height}）`;
  $('density-readout').textContent=densityActive?`${plan.count.toLocaleString()} 個色塊 · ${plan.width} × ${plan.height} 格`:'手動格子尺寸模式';
  $('block-density').setAttribute('aria-valuetext',`${plan.count.toLocaleString()} 個色塊，${plan.width} 乘 ${plan.height} 格`);
  $('density-mode-note').textContent=densityActive?(Number($('block-density').value)===plan.maxLongEdge?'目前為最高細節：保留原圖逐像素資料。往左拉才開始合併色塊。':'每次都從原始圖片重新平均混色，可往右拉回細節。背景保持原樣。'):'移動上方滑桿，即可回到即時色塊數量調整。';
}
function renderLevels(){const n=Number($('color-levels').value);const label=n===256?'256 階／通道 · 不降低原色':n+' 階／通道 · RGB 最多 '+Math.pow(n,3).toLocaleString()+' 色';$('levels-readout').textContent=label;$('color-levels').setAttribute('aria-valuetext',label);}
function changeLevels(){renderLevels();if(!source)return;densityRevision++;densityPending=true;updateUndo();$('state-tag').textContent='更新色階中…';armDensity();}
function armDensity(){clearTimeout(densityTimer);densityTimer=setTimeout(()=>{densityTimer=null;if(!source||busy||!densityPending)return;renderSource();apply();},140);}
function changeDensity(){if(!source)return;densityActive=true;densityRevision++;densityPending=true;renderDensity();updateUndo();$('state-tag').textContent='更新色塊中…';armDensity();}
async function initializeSource(){originalColors=countColors(source.data);$('original-colors').textContent=`${originalColors.toLocaleString()} 種顏色`;await apply();}
function numeric(id,min,max){const n=Number($(id).value);if(!Number.isInteger(n)||n<min||n>max)throw new Error(`請將「${$(id).closest('label')?.childNodes[0]?.textContent.trim()||id}」設為 ${min}–${max} 的整數。`);return n;}
function options(){
  const custom=$('custom').value.split(/[\s,;，；]+/).filter(Boolean);
  if($('palette-mode').value==='custom'&&(!custom.length||custom.length>256||custom.some(c=>!/^#[a-f\d]{6}$/i.test(c))))throw new Error('自訂色盤需填入 1–256 個六位 HEX 色碼，例如 #ff8833，以空格或逗號分隔。');
  const density=densityActive?currentDensity():null;
  return{levels:numeric('color-levels',2,256),sizeX:density?.cell??numeric('cell-x',1,MAX_SOURCE_EDGE),sizeY:density?.cell??numeric('cell-y',1,MAX_SOURCE_EDGE),gridLongEdge:density?Number($('block-density').value):undefined,offsetX:density?0:numeric('offset-x',0,source.width-1),offsetY:density?0:numeric('offset-y',0,source.height-1),method:density?'average':$('sample').value,coverage:1,holes:+$('holes').value,gaps:$('gaps').checked,paletteMode:$('palette-mode').value,colors:$('palette-mode').value==='auto'?numeric('colors',2,256):16,custom:[...new Set(custom.map(c=>c.toLowerCase()))]};
}
function renderSource(){
  if(!source)return;const canvas=$('source-canvas');canvas.width=source.width;canvas.height=source.height;const ctx=canvas.getContext('2d');ctx.putImageData(new ImageData(source.data,source.width,source.height),0,0);
  const plan=densityActive?currentDensity():null;
  const columns=plan?.width??Math.ceil((source.width-(+$('offset-x').value||0))/Math.max(1,+$('cell-x').value||1)),rows=plan?.height??Math.ceil((source.height-(+$('offset-y').value||0))/Math.max(1,+$('cell-y').value||1));
  $('grid-summary').textContent=`原圖 ${source.width} × ${source.height} px → ${columns} × ${rows} 格。匯出選「原圖尺寸」即可保留原始解析度。`;
  if($('show-grid').checked){
    const sx=plan?.cell??Math.max(1,+$('cell-x').value||1),sy=plan?.cell??Math.max(1,+$('cell-y').value||1),ox=plan?0:Math.max(0,+$('offset-x').value||0),oy=plan?0:Math.max(0,+$('offset-y').value||0);
    const displayScale=Math.min($('source-view').clientWidth/source.width,$('source-view').clientHeight/source.height);
    if(Math.min(sx,sy)*displayScale<5)return;
    ctx.strokeStyle='rgba(43,76,62,.38)';ctx.lineWidth=Math.max(1,source.width/700);ctx.beginPath();for(let x=ox;x<source.width;x+=sx){ctx.moveTo(x,0);ctx.lineTo(x,source.height);}for(let y=oy;y<source.height;y+=sy){ctx.moveTo(0,y);ctx.lineTo(source.width,y);}ctx.stroke();
  }
}
function renderResult(){
  if(!result)return;const canvas=$('result-canvas');canvas.width=result.width;canvas.height=result.height;canvas.getContext('2d').putImageData(new ImageData(result.data,result.width,result.height),0,0);
  const view=$('result-view'),zoom=$('zoom').value,style=getComputedStyle(view);
  const availableWidth=view.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-1,availableHeight=view.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom)-1;
  const scale=zoom==='fit'?Math.min(availableWidth/result.width,availableHeight/result.height):+zoom;
  canvas.style.width=`${Math.max(1,result.width*scale)}px`;canvas.style.height=`${Math.max(1,result.height*scale)}px`;
  $('result-size').textContent=`${result.width} × ${result.height} 格`;
  const colors=countColors(result.data);result.colors=colors;$('result-colors').textContent=`${originalColors.toLocaleString()} → ${colors.toLocaleString()} 色`;
  updateUndo();
}
function renderPalette(){
  $('swatches').replaceChildren();if(!result)return;
  const total=result.paletteComplete===false?countColors(result.data):result.palette.length;
  $('palette-count').textContent=`${total.toLocaleString()} 色`;
  selectedColor=Math.min(selectedColor,result.palette.length-1);$('replace-color').disabled=busy||selectedColor<0;
  $('swatch-note').textContent=total>128?`顯示 ${Math.min(128,result.palette.length)} 個代表色票，共 ${total.toLocaleString()} 色；輸出仍保留全部顏色。`:'';
  result.palette.slice(0,128).forEach((color,i)=>{const b=document.createElement('button');b.className='swatch';b.style.background=color;b.title=`${color} · 選為畫筆色`;b.setAttribute('aria-label',`選色 ${color}`);b.setAttribute('aria-pressed',String(i===selectedColor));b.addEventListener('click',()=>{if(busy)return;selectedColor=i;$('brush').value=color;renderPalette();});$('swatches').append(b);});
}
function snapshot(){return{...result,data:new Uint8ClampedArray(result.data),palette:[...result.palette]};}
function saveUndo(){undo.push(snapshot());redo.length=0;while(undo.length>1&&(undo.length>24||undo.reduce((n,item)=>n+item.data.byteLength,0)>96*1024*1024))undo.shift();updateUndo();}
function updateUndo(){
  $('undo').disabled=busy||densityPending||!undo.length;$('redo').disabled=busy||densityPending||!redo.length;
  $('export').disabled=busy||densityPending||!result;$('export-palette').disabled=busy||densityPending||!result;
}
function markEdited(){$('state-tag').textContent='已手動修補';renderResult();}
async function apply(showPreview=false){
  if(busy||!source)return;let o;try{o=options();}catch(e){densityPending=false;status(e.message,true);updateUndo();return;}
  const revision=densityRevision;densityPending=false;clearTimeout(densityTimer);
  setBusy(true);status('正在切分等大方格，平均混合每格顏色…');
  try{const next=await request('process',o);if(revision!==densityRevision)return;result=next;appliedOptions=o;undo.length=0;redo.length=0;selectedColor=0;renderResult();renderPalette();if(result.palette[0])$('brush').value=result.palette[0];status(result.colors?`整理完成：${(result.width*result.height).toLocaleString()} 個色塊（${result.width} × ${result.height} 格）。可繼續拉動滑桿調整。`:'輸入畫面完全透明，請確認圖片或改選其他畫面。',!result.colors);}
  catch(e){status(e.message,true);}finally{setBusy(false);}
  if(showPreview&&result&&window.matchMedia('(max-width:760px)').matches)document.querySelector('.editor').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
}
async function detect(alsoProcess=false){
  if(busy||!source)return;densityActive=false;densityRevision++;renderDensity();setBusy(true);status('正在建議適合重建的格子大小…');
  try{const info=await request('detect');const {x,y}=info.grid;
    const confident=Math.min(x.confidence,y.confidence)>.35;
    const floorSize=Math.max(1,Math.ceil(Math.max(source.width,source.height)/MAX_GRID_EDGE)),squareSize=Math.max(floorSize,confident?Math.round((x.size+y.size)/2):4);
    $('cell-x').value=$('square-grid').checked?squareSize:Math.max(floorSize,x.size);$('cell-y').value=$('square-grid').checked?squareSize:Math.max(floorSize,y.size);$('offset-x').value=0;$('offset-y').value=0;
    originalColors=info.colors;$('original-colors').textContent=`${originalColors.toLocaleString()} 種顏色`;
    $('detect-note').textContent=confident?`建議以 ${$('cell-x').value} × ${$('cell-y').value} px 的等大格子重建。可依想要的細節粗細調整。`:'原圖色塊不規則，無須逐一對齊。調整格子大小，重新切成整齊色塊。';
    renderSource();$('state-tag').textContent='待套用';status('已設定等大方格，套用後平均混合格內顏色。');
  }catch(e){status(e.message,true);}finally{setBusy(false);}if(alsoProcess)await apply();
}
function releaseMedia(){if(!currentMedia)return;const {element,url,decoder}=currentMedia;decoder?.close();if(element.tagName==='VIDEO'){element.pause();element.removeAttribute('src');element.load();}element.remove();URL.revokeObjectURL(url);currentMedia=null;$('media-panel').hidden=true;}
function readyMedia(element,url,isVideo){return new Promise((resolve,reject)=>{
  const success=()=>{cleanup();resolve();},failure=()=>{cleanup();reject(new Error(isVideo?'這個 MP4 的編碼無法播放，請轉為 H.264 MP4 後重試。':'瀏覽器無法解碼這個圖片，請轉成 PNG／JPG 後重試。'));};
  const cleanup=()=>{clearTimeout(timer);element.removeEventListener(isVideo?'loadeddata':'load',success);element.removeEventListener('error',failure);};
  const timer=setTimeout(()=>{cleanup();reject(new Error('媒體讀取逾時，請改用較小的檔案。'));},30000);
  element.addEventListener(isVideo?'loadeddata':'load',success,{once:true});element.addEventListener('error',failure,{once:true});element.src=url;if(isVideo)element.load();
});}
function captureSource(frameImage=null,frameLabel=''){
  const {element,info,name}=currentMedia,isVideo=info.kind==='video';if(isVideo){element.pause();if(element.readyState<2||element.seeking)throw new Error('請等待影片畫面載入，再擷取。');}
  const w=frameImage?frameImage.displayWidth:isVideo?element.videoWidth:element.naturalWidth,h=frameImage?frameImage.displayHeight:isVideo?element.videoHeight:element.naturalHeight;if(!w||!h)throw new Error('這個媒體沒有可讀取的畫面。');
  checkSourceSize(w,h);const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(frameImage||element,0,0,w,h);
  const next={data:ctx.getImageData(0,0,canvas.width,canvas.height).data,width:canvas.width,height:canvas.height};
  source=next;filename=name.replace(/\.[^.]+$/,'')||'像素素材';$('filename').textContent=name;
  const frame=isVideo?` · 已擷取 ${element.currentTime.toFixed(2)} 秒`:info.animated?` · ${frameLabel||'第一幀'}`:'';
  $('source-info').textContent=`${source.width} × ${source.height} px · ${info.label}${frame} · 原始解析度`;clearForSource();
}
async function loadFile(file,fromRemote=false){
  if(busy||!file)return;if(file.size>MEDIA_LIMIT){status('檔案上限 150 MB；圖片上限 128 MB。',true);return;}
  setBusy(true);status('正在辨識媒體內容…');let url,element,decoder=null;
  try{
    const info=inspectMedia(new Uint8Array(await file.slice(0,65536).arrayBuffer()),file.name,file.type);
    if(info.kind==='image'&&file.size>IMAGE_LIMIT)throw new Error('圖片上限 128 MB，請先縮小檔案。');
    url=URL.createObjectURL(new Blob([file],{type:info.mime}));element=info.kind==='video'?document.createElement('video'):new Image();
    if(info.kind==='video'){element.controls=true;element.playsInline=true;element.muted=true;element.preload='auto';}
    element.setAttribute('aria-label',info.kind==='video'?'影片畫面選擇器':'動圖畫面預覽');await readyMedia(element,url,info.kind==='video');
    // Decode failures preserve the previous image and editing result.
    if(info.kind==='image'&&info.animated&&'ImageDecoder' in window){try{if(await ImageDecoder.isTypeSupported(info.mime)){decoder=new ImageDecoder({data:await file.arrayBuffer(),type:info.mime,preferAnimation:true});await decoder.tracks.ready;await decoder.completed;if((decoder.tracks.selectedTrack?.frameCount||1)<2){decoder.close();decoder=null;}}}catch{decoder?.close();decoder=null;}}
    const old=currentMedia;currentMedia={element,url,info,decoder,name:file.name||'匯入素材'};
    try{captureSource();}catch(e){currentMedia=old;throw e;}
    if(old){old.decoder?.close();if(old.element.tagName==='VIDEO'){old.element.pause();old.element.removeAttribute('src');old.element.load();}old.element.remove();URL.revokeObjectURL(old.url);}
    $('media-preview').replaceChildren(element);$('media-panel').hidden=!info.animated;
    $('media-label').textContent=info.kind==='video'?'影片選畫面':'動圖選畫面';
    $('media-note').textContent=info.kind==='video'?'播放、暫停或拖曳影片進度，再按「擷取目前畫面」。':decoder?'預覽播放動圖；輸入幀序號，再按「擷取所選幀」整理該畫面。':'此瀏覽器或檔案未提供逐幀解碼，僅擷取第一幀；可改用 MP4 選畫面。';
    $('frame-select').hidden=!decoder;$('frame-index').value=1;$('frame-index').max=decoder?.tracks.selectedTrack.frameCount||1;$('frame-total').textContent=decoder?`共 ${decoder.tracks.selectedTrack.frameCount} 幀`:'';
    $('capture-frame').textContent=info.kind==='video'?'擷取目前畫面':decoder?'擷取所選幀':'擷取第一幀';
    if(fromRemote)$('link-import').hidden=true;
  }catch(e){decoder?.close();if(url)URL.revokeObjectURL(url);if(element?.tagName==='VIDEO'){element.pause();element.removeAttribute('src');element.load();}status(e.message||'無法讀取媒體，請換一個檔案。',true);setBusy(false);return;}finally{$('file').value='';}
  setBusy(false);await initializeSource();
}
async function importUrl(event){
  event.preventDefault();if(busy)return;let url;try{url=mediaUrl($('media-url').value);}catch(e){$('link-status').textContent=e.message;return;}
  remoteController=new AbortController();const controller=remoteController,timer=setTimeout(()=>controller.abort(),30000);setBusy(true);$('link-status').textContent='正在讀取連結…';
  try{const blob=await readRemote(url.href,{signal:controller.signal});let name;try{name=decodeURIComponent(url.pathname.split('/').pop())||'連結素材';}catch{name='連結素材';}const file=new File([blob],name,{type:blob.type});setBusy(false);$('link-status').textContent='已讀取媒體。';await loadFile(file,true);}
  catch(e){const message=e.name==='TypeError'?'無法讀取連結。來源網站可能限制跨站讀取（CORS），或連結不是公開媒體直連；請改用下載後上傳。':e.name==='AbortError'?'連結讀取已取消或逾時。':e.message;$('link-status').textContent=message;status(message,true);}
  finally{clearTimeout(timer);remoteController=null;setBusy(false);}
}
function clearForSource(){$('color-levels').value=256;renderLevels();densityRevision++;densityPending=false;clearTimeout(densityTimer);densityActive=true;$('block-density').max=Math.min(MAX_GRID_EDGE,Math.max(source.width,source.height));$('block-density').value=$('block-density').max;$('cell-x').value=1;$('cell-y').value=1;$('offset-x').value=0;$('offset-y').value=0;renderDensity();result=null;undo.length=0;redo.length=0;setTool('view');picking=false;updatePick();$('result-canvas').width=1;$('result-canvas').height=1;$('result-size').textContent='等待處理';$('result-colors').textContent='—';$('palette-count').textContent='—';$('swatches').replaceChildren();renderSource();updateUndo();}
function demo(){
  if(busy)return;releaseMedia();const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d');ctx.fillStyle='#e8e4dc';ctx.fillRect(0,0,32,32);
  const poly=(points,color)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
  poly([[3,19],[6,17],[10,18],[13,23],[20,25],[24,25],[24,28],[11,28],[6,26],[3,23]],'#c36b39');
  poly([[3,19],[6,17],[9,18],[8,21],[6,23],[3,23]],'#f3e6ca');
  poly([[14,14],[21,13],[24,19],[24,27],[17,28],[12,24],[12,20]],'#d9793c');
  poly([[21,17],[24,19],[24,26],[20,27],[18,23]],'#f5e8ce');
  poly([[10,7],[10,3],[13,5],[15,8],[20,8],[24,4],[25,11],[27,14],[24,18],[17,20],[12,17],[10,13]],'#e78b42');
  poly([[11,5],[13,7],[14,9],[11,9]],'#443c37');poly([[22,8],[24,6],[24,11]],'#443c37');
  poly([[11,12],[15,13],[17,16],[20,13],[25,12],[26,15],[23,17],[17,19],[13,17]],'#f5e8ce');
  ctx.fillStyle='#353d37';for(const [x,y,w,h] of [[13,11,2,2],[22,11,2,2],[17,15,2,2],[14,27,4,1],[22,27,3,1]])ctx.fillRect(x,y,w,h);
  ctx.fillStyle='#f5b259';ctx.fillRect(15,8,6,1);ctx.fillRect(13,20,2,3);ctx.fillStyle='#e8e4dc';ctx.fillRect(16,22,1,1);ctx.fillRect(13,24,1,1);
  const base=ctx.getImageData(0,0,32,32).data,side=384,data=new Uint8ClampedArray(side*side*4);let seed=19;
  const mapAxis=widths=>{const map=[];for(let i=0;i<32;i++)for(let j=0;j<widths[i%widths.length];j++)map.push(i);return map;},xs=mapAxis([10,13,11,14]),ys=mapAxis([13,10,14,11]);
  for(let y=0;y<side;y++)for(let x=0;x<side;x++){const from=(ys[y]*32+xs[x])*4,to=(y*side+x)*4;for(let c=0;c<3;c++){seed=(seed*1664525+1013904223)>>>0;data[to+c]=Math.max(0,Math.min(255,base[from+c]+(seed%9)-4));}data[to+3]=255;}
  source={data,width:side,height:side};filename='狐狸練習稿';$('filename').textContent=filename;$('source-info').textContent='384 × 384 px · 範例含不等大的色塊、邊緣混色與雜訊';clearForSource();initializeSource();
}
function setTool(next){tool=next;document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===tool)));$('result-canvas').classList.toggle('editing',next!=='view');$('edit-hint').textContent=next==='view'?'檢視模式：可捲動放大圖。選擇畫筆或擦除工具，即可逐格修補。':next==='paint'?'畫筆：點選或拖曳填色。可先選色票，或點畫筆色自訂。':'擦除：點選或拖曳移除格子。復原可找回誤刪的輪廓。';}
function point(event){const rect=$('result-canvas').getBoundingClientRect(),x=Math.floor((event.clientX-rect.left)/rect.width*result.width),y=Math.floor((event.clientY-rect.top)/rect.height*result.height);return x<0||y<0||x>=result.width||y>=result.height?null:{x,y};}
function paint(p){const i=(p.y*result.width+p.x)*4;if(tool==='erase')result.data.fill(0,i,i+4);else{result.data.set(rgb($('brush').value),i);result.data[i+3]=255;}}
function drawTo(p){if(!p)return;const from=stroke.last||p,steps=Math.max(Math.abs(p.x-from.x),Math.abs(p.y-from.y));for(let i=0;i<=steps;i++)paint({x:Math.round(from.x+(p.x-from.x)*(steps?i/steps:0)),y:Math.round(from.y+(p.y-from.y)*(steps?i/steps:0))});stroke.last=p;renderResult();}
function finishStroke(){if(!stroke)return;stroke=null;const active=new Set(result.palette);for(let i=0;i<result.data.length&&active.size<128;i+=4)if(result.data[i+3])active.add(hex([...result.data.subarray(i,i+3)]));result.palette=[...active];result.colors=countColors(result.data);result.paletteTotal=result.colors;result.paletteComplete=result.colors<=result.palette.length;renderPalette();markEdited();}
function updatePick(){picking=false;$('pick-hint').hidden=true;}
function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function exportPng(){
  if(!result||busy||densityPending)return;const image=$('trim').checked?trimImage(result):result;let plan;
  try{plan=exportPlan(image,source,appliedOptions,$('export-scale').value,$('trim').checked);}catch(e){status(e.message,true);return;}
  const {width:w,height:h,drawWidth,drawHeight}=plan;
  const raw=document.createElement('canvas');raw.width=image.width;raw.height=image.height;raw.getContext('2d').putImageData(new ImageData(image.data,image.width,image.height),0,0);
  const out=document.createElement('canvas');out.width=w;out.height=h;const ctx=out.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(raw,0,0,drawWidth,drawHeight);
  out.toBlob(blob=>{if(!blob){status('匯出失敗，請降低倍率後重試。',true);return;}download(blob,`${filename}-pixel-${w}x${h}.png`);status(`已匯出 ${w} × ${h} px PNG，保留原圖背景，不含預覽格線與棋盤底紋。`);},'image/png');
}
$('file').addEventListener('change',()=>loadFile($('file').files[0]));$('demo').addEventListener('click',demo);$('apply').addEventListener('click',()=>apply(true));$('detect').addEventListener('click',()=>detect());
$('color-levels').addEventListener('input',changeLevels);$('levels-reset').addEventListener('click',()=>{$('color-levels').value=256;changeLevels();});
$('block-density').addEventListener('input',changeDensity);$('density-reset').addEventListener('click',()=>{$('block-density').value=$('block-density').max;changeDensity();});
$('open-link').addEventListener('click',()=>{$('link-import').hidden=!$('link-import').hidden;if(!$('link-import').hidden)$('media-url').focus();});
$('url-form').addEventListener('submit',importUrl);$('cancel-link').addEventListener('click',()=>{remoteController?.abort();$('link-import').hidden=true;});
$('capture-frame').addEventListener('click',async()=>{if(busy||!currentMedia)return;setBusy(true);let frame,success=false;try{if(currentMedia.decoder){const index=numeric('frame-index',1,currentMedia.decoder.tracks.selectedTrack.frameCount);frame=(await currentMedia.decoder.decode({frameIndex:index-1})).image;captureSource(frame,`第 ${index} 幀`);}else captureSource();originalColors=countColors(source.data);$('original-colors').textContent=`${originalColors.toLocaleString()} 種顏色`;success=true;}catch(e){status(e.message,true);}finally{frame?.close();setBusy(false);}if(success)await apply(true);});
window.addEventListener('pagehide',()=>{remoteController?.abort();releaseMedia();});
for(const event of ['dragenter','dragover'])$('drop-zone').addEventListener(event,e=>{e.preventDefault();$('drop-zone').classList.add('dragging');});
$('drop-zone').addEventListener('dragleave',e=>{if(!$('drop-zone').contains(e.relatedTarget))$('drop-zone').classList.remove('dragging');});$('drop-zone').addEventListener('drop',e=>{e.preventDefault();$('drop-zone').classList.remove('dragging');loadFile(e.dataTransfer.files[0]);});
for(const id of ['cell-x','cell-y','offset-x','offset-y'])$(id).addEventListener('input',()=>{densityActive=false;densityRevision++;densityPending=false;clearTimeout(densityTimer);renderDensity();if($('square-grid').checked&&['cell-x','cell-y'].includes(id))$(id==='cell-x'?'cell-y':'cell-x').value=$(id).value;renderSource();if(!busy)$('state-tag').textContent='設定待套用';});
document.querySelectorAll('.settings input,.settings select,.settings textarea').forEach(e=>e.addEventListener('change',()=>{if(!busy)$('state-tag').textContent='設定待套用';}));
$('show-grid').addEventListener('change',renderSource);$('square-grid').addEventListener('change',()=>{if($('square-grid').checked)$('cell-y').value=$('cell-x').value;renderSource();});
$('palette-mode').addEventListener('change',()=>{$('colors-label').hidden=$('palette-mode').value!=='auto';$('custom-label').hidden=$('palette-mode').value!=='custom';});
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{if(!busy)setTool(b.dataset.tool);}));
const resultCanvas=$('result-canvas');resultCanvas.addEventListener('pointerdown',e=>{if(busy||densityPending||!result||tool==='view'||e.button!==0||!e.isPrimary||stroke)return;const p=point(e);if(!p)return;e.preventDefault();saveUndo();stroke={id:e.pointerId,last:null};resultCanvas.setPointerCapture(e.pointerId);drawTo(p);});
resultCanvas.addEventListener('pointermove',e=>{if(stroke?.id!==e.pointerId)return;e.preventDefault();drawTo(point(e));});
for(const name of ['pointerup','pointercancel','lostpointercapture'])resultCanvas.addEventListener(name,e=>{if(stroke?.id===e.pointerId)finishStroke();});
$('undo').addEventListener('click',()=>{if(busy||!undo.length)return;redo.push(snapshot());result=undo.pop();renderResult();renderPalette();$('state-tag').textContent='已復原';});
$('redo').addEventListener('click',()=>{if(busy||!redo.length)return;undo.push(snapshot());result=redo.pop();renderResult();renderPalette();$('state-tag').textContent='已重做';});
$('zoom').addEventListener('change',renderResult);new ResizeObserver(()=>renderResult()).observe($('result-view'));
$('replace-color').addEventListener('click',()=>{if(busy||!result||selectedColor<0)return;$('palette-picker').value=result.palette[selectedColor];$('palette-picker').click();});
$('palette-picker').addEventListener('change',()=>{if(busy||!result||selectedColor<0)return;const old=result.palette[selectedColor],color=$('palette-picker').value;if(old===color)return;saveUndo();const from=rgb(old),to=rgb(color);for(let i=0;i<result.data.length;i+=4)if(result.data[i+3]&&from.every((v,c)=>result.data[i+c]===v))result.data.set(to,i);result.palette=[...new Set(result.palette.map(c=>c===old?color:c))];$('brush').value=color;renderPalette();markEdited();});
$('export').addEventListener('click',exportPng);$('export-palette').addEventListener('click',()=>{if(!result||busy)return;download(new Blob([JSON.stringify({version:1,name:filename,width:result.width,height:result.height,palette:result.palette,paletteContainsAllColors:result.paletteComplete!==false,actualColors:countColors(result.data),gridAndProcessing:appliedOptions,source:{width:source.width,height:source.height},export:{sizeMode:$('export-scale').value,trim:$('trim').checked},note:'PNG 另行匯出；設定記錄最後一次套用的流程，PNG 包含後續手動修補。'},null,2)],{type:'application/json'}),`${filename}-palette.json`);status('已匯出色盤與最後套用的處理設定。');});
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$(e.shiftKey?'redo':'undo').click();}if(e.key==='Escape'){picking=false;updatePick();setTool('view');}});
demo();
