import { Chess } from 'chess.js';
import sample from '../chess-sample.pgn?raw';
import sample2 from '../chess-sample-2.pgn?raw';
import { classify, labels, positionsFromPgn, pvSan, gamePositionUrl } from './core.js';
import { ratingRange, matchesRating } from './ratings.js';
import { Engine } from './engine.js';
import { Simulation } from './simulation.js';
import { grades, gradeMove, scoreText, whiteShare } from './review.js';
import { QuestionReplay, BoardNotes, squarePoint, pointerSquare } from './board-tools.js';
const $ = id => document.getElementById(id);
const engine = new Engine();
const simulationEngine = new Engine();
let simulation=null, simulationRevision=0, draggedFrom=null;
let replay=null,drawGesture=null,annotationMode=false;
const notes=new BoardNotes();
let analysisCache=new Map(),moveGrades=new Map(),suggestedMove=null;
const pathKey=history=>history.map(m=>m.lan).join(' ');
let pool=positionsFromPgn(sample+'\n\n'+sample2,'Lichess 內建真實棋局'), queue=[], current=null, evaluation=null;
let eloRange=ratingRange(null,null);
try{const saved=JSON.parse(localStorage.getItem('chess-intuition-elo'));if(saved)eloRange=ratingRange(saved.min,saved.max);}catch{/* Unavailable or invalid local preferences use unrestricted mode. */}
let flipped=false, answered=false, busy=false, importing=false, generation=0, count=0, correct=0, streak=0, question=0, started=0;
const pieces={k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
const pieceNames={k:'王',q:'后',r:'車',b:'象',n:'馬',p:'兵'};
function shuffle(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function updateRatingStatus(){
  const eligible=pool.filter(p=>matchesRating(p,eloRange));
  const games=new Set(eligible.map(p=>p.url||`${p.source}|${p.white}|${p.black}`)).size;
  const range=eloRange.min===null&&eloRange.max===null?'ELO 不限':`雙方 ELO ${eloRange.min??0}–${eloRange.max??4000}`;
  $('elo-status').textContent=`${range} · 目前已載入的題庫符合 ${games} 場、${eligible.length} 個候選局面（出題前另排除 0.00）`;
}
async function applyRatingFilter(event,reset=false){
  event?.preventDefault();if(importing){$('elo-status').textContent='正在匯入棋局，請完成後再套用範圍。';return;}
  let range;try{range=ratingRange(reset?'':$('elo-min').value,reset?'':$('elo-max').value);}catch(error){$('elo-status').textContent=error.message;return;}
  eloRange=range;$('elo-min').value=range.min??'';$('elo-max').value=range.max??'';
  try{localStorage.setItem('chess-intuition-elo',JSON.stringify(range));}catch{/* Device storage is optional. */}
  ++generation;engine.cancel();busy=false;queue=[];updateRatingStatus();await nextQuestion();if(current)$('settings-dialog').close();
}
function viewFen(){return simulation?.chess.fen()||replay?.fen||current?.fen;}
function renderNavigation(){
  if(!current){$('undo').disabled=true;$('redo').disabled=true;$('reset-position').disabled=true;$('clear-marks').disabled=true;$('history-position').textContent='';return;}
  const history=simulation?.chess.history({verbose:true});
  const locked=busy||importing||!!simulation?.pending;
  $('undo').disabled=locked||!(simulation?history.length:replay?.index);
  $('redo').disabled=locked||!(simulation?simulation.future.length:replay&&!replay.atQuestion);
  $('reset-position').disabled=busy||importing||!(simulation?history.length||simulation.pending:replay&&!replay.atQuestion);
  $('history-position').textContent=simulation?`試走 ${history.length} / ${history.length+simulation.future.length}`:replay?.atQuestion?'原題局面':`回看 ${replay.index} / ${replay.moves.length}`;
  $('replay-notice').hidden=answered||!replay||replay.atQuestion;
  $('session-mode').textContent=answered?'自由試走，檢查你的判斷。':replay&&!replay.atQuestion?'正在回看，回到原題後作答。':'觀察局面，判斷哪方有優勢。';
  enableChoices(!busy&&!importing&&!!evaluation&&!answered);
}
function renderBoard(){
  if(!current) return;
  const chess=simulation?.chess || new Chess(viewFen()), squares=chess.board().flat();if(flipped)squares.reverse();
  const targets=new Set(simulation?.targets().map(m=>m.to)||[]);
  const last=simulation?(simulation.chess.history({verbose:true}).at(-1)||replay?.moves.at(-1)):replay?.lastMove;
  const lastGrade=simulation&&moveGrades.get(pathKey(simulation.chess.history({verbose:true})));
  const focusedSquare=$('board').contains(document.activeElement)?document.activeElement?.dataset.square:null;
  $('board').replaceChildren();const desc=[];
  for(let i=0;i<64;i++){
    const rank=flipped?Math.floor(i/8)+1:8-Math.floor(i/8),file='abcdefgh'[flipped?7-i%8:i%8], p=squares[i];
    const square=file+rank;
    const cell=document.createElement(simulation?'button':'div');cell.className=`square ${(Math.floor(i/8)+i%8)%2?'dark':''}`;cell.dataset.square=square;
    cell.classList.toggle('last-move',last?.from===square||last?.to===square);
    cell.classList.toggle('in-check',p?.type==='k'&&p.color===chess.turn()&&chess.isCheck());
    if(simulation){
      cell.type='button';cell.setAttribute('aria-label',`${square} ${p?`${p.color==='w'?'白':'黑'}${pieceNames[p.type]}`:'空格'}${targets.has(square)?'，可走':''}`);
      cell.classList.toggle('selected-square',simulation.selected===square);cell.classList.toggle('legal-target',targets.has(square));
      cell.addEventListener('click',()=>{if(importing||annotationMode)return;const result=simulation.select(square);updateSimulation(result,square);});
      cell.draggable=!!p&&p.color===chess.turn()&&!simulation.pending&&!chess.isGameOver()&&!importing&&!annotationMode;
      cell.addEventListener('dragstart',event=>{draggedFrom=square;event.dataTransfer.setData('text/plain',square);event.dataTransfer.effectAllowed='move';});
      cell.addEventListener('dragover',event=>{if(draggedFrom)event.preventDefault();});
      cell.addEventListener('drop',event=>{event.preventDefault();if(!draggedFrom||importing)return;const from=draggedFrom;draggedFrom=null;updateSimulation(simulation.move(from,square),square);});
      cell.addEventListener('dragend',()=>{draggedFrom=null;});
      cell.addEventListener('keydown',event=>{const offset={ArrowLeft:-1,ArrowRight:1,ArrowUp:-8,ArrowDown:8}[event.key];if(offset===undefined)return;event.preventDefault();const destination=i+offset;if(destination>=0&&destination<64&&(!(Math.abs(offset)===1)||Math.floor(i/8)===Math.floor(destination/8)))$('board').children[destination].focus();});
    }
    if(p){const span=document.createElement('span');span.className=`piece ${p.color}`;span.textContent=pieces[p.type];cell.append(span);desc.push(`${file}${rank} ${p.color==='w'?'白':'黑'}${pieceNames[p.type]}`);}
    if(last?.to===square&&lastGrade){const badge=document.createElement('span');badge.className='move-badge';badge.textContent=grades[lastGrade.kind].icon;badge.style.background=grades[lastGrade.kind].color;badge.title=grades[lastGrade.kind].label;cell.append(badge);}
    if(i%8===0){const c=document.createElement('span');c.className='coord rank';c.textContent=rank;cell.append(c);}
    if(i>=56){const c=document.createElement('span');c.className='coord file';c.textContent=file;cell.append(c);}
    $('board').append(cell);
  }
  const white=chess.turn()==='w';$('turn').textContent=white?'白方行棋':'黑方行棋';$('turn').classList.toggle('black-turn',!white);
  $('board').setAttribute('aria-label',`${white?'白':'黑'}方行棋；${desc.join('，')}`);
  $('board').setAttribute('role',simulation?'group':'img');
  $('source-label').textContent=simulation?'試走模式':replay?.atQuestion?current.source:'原局回看';
  $('move-number').textContent=last?`${last.before.split(' ')[5]}${last.color==='w'?'.':'…'} ${last.san}`:'起始局面';
  $('eval-track').classList.toggle('flipped',flipped);
  renderNavigation();renderAnnotations();
  if(focusedSquare&&simulation)$('board').querySelector(`[data-square="${focusedSquare}"]`)?.focus({preventScroll:true});
}
function stopSimulation(){++simulationRevision;simulationEngine.cancel();simulation=null;replay=null;drawGesture=null;notes.reset();$('board-annotations').replaceChildren();draggedFrom=null;analysisCache.clear();moveGrades.clear();suggestedMove=null;$('simulation').hidden=true;$('eval-panel').hidden=true;$('question-content').hidden=false;$('replay-notice').hidden=true;}
function showSimulationScore(result){
  const score=result.mate!==null?`${result.cp>0?'白':'黑'}方 ${Math.abs(result.mate)} 步將殺`:`${result.cp>0?'+':''}${(result.cp/100).toFixed(2)}`;
  $('simulation-score').textContent=`試走評估：${score} · ${labels[classify(result.cp)] || '均勢'} · 深度 ${result.depth}`;
  $('eval-panel').hidden=false;$('eval-value').textContent=scoreText(result);$('eval-white').style.height=`${whiteShare(result.cp)}%`;$('eval-track').setAttribute('aria-label',`目前局面白方視角 ${scoreText(result)}；長度為優勢示意，非勝率`);
  suggestedMove=result.pv[0]||null;$('play-suggestion').disabled=!suggestedMove||!!simulation.pending||simulation.chess.isGameOver();
  $('suggestions').replaceChildren();
  for(const line of result.lines||[result]){const row=document.createElement('div');row.className='suggestion-line';const score=document.createElement('strong');score.textContent=scoreText(line);const moves=document.createElement('span');moves.textContent=pvSan(simulation.chess.fen(),line.pv);row.append(score,moves);$('suggestions').append(row);}
}
async function evaluateSimulation(){
  const revision=++simulationRevision;simulationEngine.cancel();
  const history=simulation.chess.history({verbose:true}),fen=simulation.chess.fen();
  const terminal=simulation.terminal();suggestedMove=null;$('play-suggestion').disabled=true;$('suggestions').replaceChildren();$('eval-value').textContent='…';$('eval-white').style.height='50%';$('eval-track').setAttribute('aria-label','正在分析');
  $('simulation-score').textContent='正在分析試走局面…';
  const stillCurrent=()=>revision===simulationRevision&&simulation;
  async function getScore(position){
    if(analysisCache.has(position))return analysisCache.get(position);
    const result=await simulationEngine.evaluate(position);
    if(!stillCurrent())throw new Error('已切換局面');
    analysisCache.set(position,result);return result;
  }
  try{
    let result;
    if(terminal){const mate=simulation.chess.isCheckmate();result={cp:mate?(simulation.chess.turn()==='w'?-100000:100000):0,mate:mate?0:null,depth:0,pv:[],lines:[]};}
    else result=await getScore(fen);
    if(!stillCurrent())return;
    showSimulationScore(result);if(terminal)$('simulation-score').textContent=terminal;
    // Fill every ungraded move, including moves played faster than an analysis can finish.
    for(let i=0;i<history.length;i++){
      const key=pathKey(history.slice(0,i+1));if(moveGrades.has(key))continue;
      const move=history[i],before=await getScore(move.before),after=i===history.length-1?result:await getScore(move.after);
      if(!stillCurrent())return;
      moveGrades.set(key,gradeMove(before,after,move));renderSimulation();renderBoard();
    }
  }
  catch(error){if(revision===simulationRevision&&simulation)$('simulation-score').textContent=error.message;}
}
function renderSimulation(){
  const history=simulation.chess.history({verbose:true});
  $('simulation').hidden=false;renderNavigation();
  $('promotion').hidden=!simulation.pending;
  const terminal=simulation.terminal();
  $('simulation-instruction').textContent=simulation.pending?'請選擇升變棋子。':terminal?terminal:simulation.chess.isCheck()?'被將軍，請先解將。':simulation.future.length?'可向前重播，或改走新的路線。':'點棋子再點目的地試走，可用箭頭回看。';
  $('original-game-link').hidden=!current.url;$('original-game-missing').hidden=!!current.url;
  if(current.url){$('original-game-link').href=gamePositionUrl(current.url,current.ply)||current.url;$('original-game-link').textContent=`原始對局 · ${current.moveLabel} ↗`;}
  $('simulation-history').replaceChildren();
  if(!history.length)$('simulation-history').textContent='目前是原題局面。';
  history.forEach((m,i)=>{const review=moveGrades.get(pathKey(history.slice(0,i+1))),grade=review&&grades[review.kind];const item=document.createElement('span');item.className='review-move';const badge=document.createElement('b');badge.textContent=grade?.icon||'…';badge.style.color=grade?.color||'#a0aeaf';item.append(badge,document.createTextNode(` ${m.before.split(' ')[5]}${m.color==='w'?'.':'…'} ${m.san} · ${grade?.label||'待評分'}`));item.title=review?`${grade.label}；行棋方評估損失 ${Math.min(review.loss/100,1000).toFixed(2)}；原先建議 ${pvSan(m.before,review.before.pv)}`:'引擎正在排程分析';$('simulation-history').append(item);});
  $('play-suggestion').disabled=!suggestedMove||!!simulation.pending||simulation.chess.isGameOver();
}
function updateSimulation(action,focusSquare){
  if(action==='illegal'){$('simulation-instruction').textContent='這步不合法，請選擇有標記的目的地。';return;}
  renderBoard();renderSimulation();
  if(focusSquare)$('board').querySelector(`[data-square="${focusSquare}"]`)?.focus({preventScroll:true});
  if(action==='promotion')$('promotion').querySelector('button').focus({preventScroll:true});
  if(action==='moved')evaluateSimulation();
}
function navigateHistory(direction){
  if(!current||busy||importing||drawGesture)return;
  if(simulation){
    if(simulation.pending)return;
    const changed=direction<0?simulation.undo():simulation.redo();
    if(changed)updateSimulation('moved');
  }else if(replay?.step(direction)){renderBoard();}
}
function returnToQuestion(){
  if(!current||busy||importing)return;
  if(simulation){simulation.reset();updateSimulation('moved');}
  else{replay?.returnToQuestion();renderBoard();}
}
function svgNode(name,attributes){const element=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [key,value] of Object.entries(attributes))element.setAttribute(key,String(value));return element;}
function renderAnnotations(){
  const layer=$('board-annotations');layer.replaceChildren();
  const fen=viewFen();if(!fen)return;
  const colors={green:'#237943',red:'#c94442'},defs=svgNode('defs',{});
  for(const [name,color] of Object.entries(colors)){const marker=svgNode('marker',{id:`note-arrow-${name}`,viewBox:'0 0 32 32',refX:27,refY:16,markerWidth:34,markerHeight:34,markerUnits:'userSpaceOnUse',orient:'auto'});marker.append(svgNode('path',{d:'M 2 2 L 29 16 L 2 30 L 9 16 Z',fill:color}));defs.append(marker);}layer.append(defs);
  const shapes=notes.shapes(fen);if(drawGesture?.to)shapes.push(drawGesture);
  for(const shape of shapes){
    const a=squarePoint(shape.from,flipped),b=squarePoint(shape.to,flipped);if(!a||!b)continue;
    if(shape.from===shape.to)layer.append(svgNode('circle',{cx:a.x,cy:a.y,r:40,stroke:colors[shape.color],fill:'none','stroke-width':10,opacity:.82}));
    else{const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);layer.append(svgNode('line',{x1:a.x,y1:a.y,x2:b.x-dx/length*14,y2:b.y-dy/length*14,stroke:colors[shape.color],'stroke-width':14,'stroke-linecap':'round','marker-end':`url(#note-arrow-${shape.color})`,opacity:.85}));}
  }
  $('clear-marks').disabled=!notes.shapes(fen).length&&!drawGesture;
}
function squareAtPointer(event){const rect=$('board').getBoundingClientRect();return pointerSquare(event.clientX-rect.left-4,event.clientY-rect.top-4,rect.width-8,rect.height-8,flipped);}
function clearMarks(){drawGesture=null;const fen=viewFen();if(fen)notes.clear(fen);renderAnnotations();}
function toggleAnnotationMode(){
  annotationMode=!annotationMode;drawGesture=null;draggedFrom=null;
  if(simulation)simulation.selected=null;
  $('mark-mode').setAttribute('aria-pressed',String(annotationMode));
  $('mark-mode').textContent=annotationMode?'完成':'標記';
  $('board-surface').classList.toggle('marking-mode',annotationMode);
  $('marking-hint').hidden=!annotationMode;$('gesture-hint').hidden=annotationMode;
  renderBoard();
}
function enableChoices(enabled){document.querySelectorAll('[data-choice]').forEach(b=>b.disabled=!(enabled&&replay?.atQuestion&&!answered));}
function setStatus(text){$('engine-status').textContent=text;}
async function nextQuestion(retry=false){
  if(busy||importing)return;
  stopSimulation();
  busy=true;const run=++generation;evaluation=null;answered=false;started=0;
  enableChoices(false);$('next').disabled=true;$('retry').hidden=true;$('result').hidden=true;
  document.querySelectorAll('[data-choice]').forEach(b=>{b.classList.remove('selected','correct');b.removeAttribute('aria-pressed');});
  try{
    const eligible=pool.filter(p=>matchesRating(p,eloRange));updateRatingStatus();
    if(!eligible.length){current=null;$('board-surface').hidden=true;$('empty-pool').hidden=false;$('turn').textContent='等待棋局';$('move-number').textContent='';$('source-label').textContent='沒有符合範圍的局面';$('question-number').textContent='—';setStatus('請在設定中調整 ELO 或匯入棋局。');return;}
    $('board-surface').hidden=false;$('empty-pool').hidden=true;
    const candidates=retry&&current?[current]:null;let skipped=0;
    if(!queue.length)queue=shuffle(eligible);
    const limit=candidates?1:queue.length;
    for(let i=0;i<limit;i++){
      current=candidates?candidates[0]:queue.pop();replay=new QuestionReplay(current.leadIn,current.fen);renderBoard();
      setStatus(skipped?'已跳過 0.00 局面，正在分析下一題…':'正在分析局面；完成後即可作答…');
      const result=await engine.evaluate(current.fen);if(run!==generation)return;
      if(classify(result.cp)===null){skipped++;continue;}
      evaluation=result;question++;$('question-number').textContent=`局面 ${String(question).padStart(2,'0')}`;
      setStatus('評估已就緒，答案會在選擇後揭曉。');started=Date.now();$('timer').textContent='00:00';enableChoices(!importing);return;
    }
    setStatus('這批局面皆為 0.00，已排除。請匯入其他棋局，或再抽取一批。');$('next').disabled=false;
  }catch(error){if(run===generation){setStatus(error.message);$('retry').hidden=false;$('next').disabled=false;}}
  finally{if(run===generation){busy=false;renderNavigation();}}
}
function choose(value){
  if(busy||importing||answered||!evaluation||!replay?.atQuestion)return null;
  if(![-2,-1,1,2].includes(value))throw new Error('請選擇四種優勢之一。');
  answered=true;enableChoices(false);const answer=classify(evaluation.cp),right=value===answer;count++;correct+=Number(right);streak=right?streak+1:0;
  document.querySelector(`[data-choice="${value}"]`).classList.add('selected');document.querySelector(`[data-choice="${value}"]`).setAttribute('aria-pressed','true');
  document.querySelector(`[data-choice="${answer}"]`).classList.add('correct');
  $('accuracy').textContent=`${Math.round(correct/count*100)}%`;$('stats').textContent=`${correct} / ${count} 題 · 連對 ${streak}`;
  const box=$('result');box.replaceChildren();box.hidden=false;
  const title=document.createElement('strong');title.textContent=right?'✓ 直覺命中':'再校準一下棋感';box.append(title);
  const text=document.createElement('p');text.textContent=`原題：${labels[answer]} ${scoreText(evaluation)}${right?'':` · 你選了${labels[value]}`}`;box.append(text);
  const players=document.createElement('p');players.className='player-line';players.textContent=`${current.white} ${current.whiteElo??'?'} · ${current.black} ${current.blackElo??'?'}`;box.append(players);
  $('question-content').hidden=true;
  setStatus(`Stockfish 18 Lite · 深度 ${evaluation.depth} · 分數以白方視角表示`);$('next').disabled=false;
  simulation=new Simulation(current.fen);analysisCache.set(current.fen,evaluation);renderBoard();renderSimulation();showSimulationScore(evaluation);
  return{correct:right,answer:labels[answer],cp:evaluation.cp};
}
async function fetchText(url,accept='application/x-chess-pgn'){
  const response=await fetch(url,{headers:{Accept:accept},signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw new Error(response.status===429?'平台暫時限制請求，請稍後再試，或貼上 PGN。':`無法取得棋局（${response.status}），請確認連結或玩家名稱，或改用 PGN。`);
  return response.text();
}
async function importGames(event){
  event.preventDefault();if(importing)return;
  const value=$('import-value').value.trim(),type=$('provider').value;if(!value)return;
  importing=true;$('import-submit').disabled=true;enableChoices(false);$('next').disabled=true;$('import-status').textContent='正在取得棋譜…';
  try{
    let pgn=value,source='匯入 PGN',imported=null;
    if(type==='lichess-game'){
      const match=value.match(/^(?:https:\/\/(?:www\.)?lichess\.org\/)?([a-zA-Z0-9]{8})(?:[a-zA-Z0-9]{4})?(?:[\/#?].*)?$/);
      if(!match)throw new Error('請輸入有效的 Lichess 對局連結或 8 碼 ID。');
      pgn=await fetchText(`https://lichess.org/game/export/${match[1]}?clocks=false&evals=false`);source='Lichess 匯入對局';
    }else if(type==='lichess-user'){
      if(!/^[\w-]{2,30}$/.test(value))throw new Error('請輸入玩家名稱，不是個人頁面網址。');
      pgn=await fetchText(`https://lichess.org/api/games/user/${encodeURIComponent(value)}?max=5&ongoing=false&finished=true&clocks=false&evals=false`);source='Lichess 玩家棋局';
    }else if(type==='chesscom'){
      if(!/^[\w-]{2,30}$/.test(value))throw new Error('請輸入玩家名稱，不是個人頁面網址。');
      const date=new Date(),year=date.getUTCFullYear(),month=String(date.getUTCMonth()+1).padStart(2,'0');
      const data=JSON.parse(await fetchText(`https://api.chess.com/pub/player/${encodeURIComponent(value.toLowerCase())}/games/${year}/${month}`,'application/json'));
      source='Chess.com 玩家棋局';
      imported=(data.games||[]).filter(g=>g.rules==='chess'&&g.pgn).slice(-8).flatMap(g=>positionsFromPgn(g.pgn,source,g.url));
    }
    imported??=positionsFromPgn(pgn,source);
    if(!imported.length)throw new Error('找不到可用局面。請使用已結束、超過 9 回合的標準棋局；Chess.com 本月無棋局可改貼其他月份的 PGN。');
    ++generation;engine.cancel();busy=false;pool=imported;queue=[];
    const matching=imported.filter(p=>matchesRating(p,eloRange)).length;
    $('import-status').textContent=`已載入 ${imported.length} 個候選局面，其中 ${matching} 個符合目前 ELO 範圍；出題前會排除引擎 0.00 的局面。`;
    importing=false;await nextQuestion();if(current)$('settings-dialog').close();
  }catch(error){$('import-status').textContent=error.name==='TypeError'||error.name==='TimeoutError'?'連線失敗或逾時。請稍後再試，或從平台匯出 PGN 貼上；目前題庫仍保留。':error.message;}
  finally{importing=false;$('import-submit').disabled=false;if(evaluation&&!answered)enableChoices(true);if(!busy&&(!evaluation||answered))$('next').disabled=!pool.some(p=>matchesRating(p,eloRange));}
}
document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>choose(Number(b.dataset.choice))));
$('next').addEventListener('click',()=>nextQuestion());$('retry').addEventListener('click',()=>nextQuestion(true));$('flip').addEventListener('click',()=>{flipped=!flipped;renderBoard();});
$('import-form').addEventListener('submit',importGames);
$('elo-form').addEventListener('submit',applyRatingFilter);
$('elo-reset').addEventListener('click',event=>applyRatingFilter(event,true));
$('undo').addEventListener('click',()=>navigateHistory(-1));
$('redo').addEventListener('click',()=>navigateHistory(1));
$('reset-position').addEventListener('click',returnToQuestion);
$('return-question').addEventListener('click',returnToQuestion);
$('clear-marks').addEventListener('click',clearMarks);
$('mark-mode').addEventListener('click',toggleAnnotationMode);
let wheelDistance=0,lastWheelStep=0;
$('board-surface').addEventListener('wheel',event=>{
  if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!current)return;
  event.preventDefault();if(busy||importing||drawGesture)return;
  const delta=event.deltaY*(event.deltaMode===1?24:event.deltaMode===2?300:1),now=performance.now();
  if(Math.sign(delta)!==Math.sign(wheelDistance))wheelDistance=0;
  wheelDistance+=delta;
  if(Math.abs(wheelDistance)>=24&&now-lastWheelStep>=150){navigateHistory(Math.sign(wheelDistance));wheelDistance=0;lastWheelStep=now;}
},{passive:false});
const boardSurface=$('board-surface');
boardSurface.addEventListener('contextmenu',event=>event.preventDefault());
boardSurface.addEventListener('pointerdown',event=>{
  if((event.button!==2&&!(annotationMode&&event.button===0))||!event.isPrimary||!current||importing||drawGesture)return;
  const square=squareAtPointer(event);if(!square)return;
  event.preventDefault();drawGesture={from:square,to:square,color:event.shiftKey?'red':'green',pointerId:event.pointerId,fen:viewFen()};boardSurface.setPointerCapture(event.pointerId);renderAnnotations();
});
boardSurface.addEventListener('pointermove',event=>{if(!drawGesture||event.pointerId!==drawGesture.pointerId)return;event.preventDefault();drawGesture.to=squareAtPointer(event);renderAnnotations();});
boardSurface.addEventListener('pointerup',event=>{
  if(!drawGesture||event.pointerId!==drawGesture.pointerId)return;
  event.preventDefault();const shape=drawGesture,to=squareAtPointer(event);drawGesture=null;
  if(to&&shape.fen===viewFen())notes.toggle(shape.fen,shape.from,to,shape.color);
  if(boardSurface.hasPointerCapture(event.pointerId))boardSurface.releasePointerCapture(event.pointerId);renderAnnotations();
});
boardSurface.addEventListener('pointercancel',()=>{drawGesture=null;renderAnnotations();});
boardSurface.addEventListener('lostpointercapture',()=>{if(drawGesture){drawGesture=null;renderAnnotations();}});
$('open-settings').addEventListener('click',()=>$('settings-dialog').showModal());
$('empty-settings').addEventListener('click',()=>$('settings-dialog').showModal());
$('close-settings').addEventListener('click',()=>$('settings-dialog').close());
$('simulation-analyze').addEventListener('click',()=>{if(simulation&&!importing){analysisCache.delete(simulation.chess.fen());moveGrades.clear();renderSimulation();renderBoard();evaluateSimulation();}});
$('play-suggestion').addEventListener('click',()=>{if(!simulation||importing||!suggestedMove||simulation.pending)return;const move=suggestedMove;let action=simulation.move(move.slice(0,2),move.slice(2,4));if(action==='promotion')action=simulation.promote(move[4]||'q');updateSimulation(action);});
document.querySelectorAll('[data-promotion]').forEach(button=>button.addEventListener('click',()=>{if(simulation&&!importing)updateSimulation(simulation.promote(button.dataset.promotion));}));
$('cancel-promotion').addEventListener('click',()=>{if(simulation&&!importing){simulation.cancelPromotion();updateSimulation('selected');}});
$('provider').addEventListener('change',()=>{const type=$('provider').value;$('import-label').textContent=type==='pgn'?'PGN 棋譜':type==='lichess-game'?'棋局連結或 8 碼 ID':'玩家名稱';$('import-value').placeholder=type==='pgn'?'[Event "..."]\n...':type==='lichess-game'?'https://lichess.org/xxxxxxxx':'例如：hikaru';$('import-value').value='';});
document.addEventListener('keydown',event=>{if($('settings-dialog').open)return;if(event.key==='Escape'){clearMarks();return;}if(event.ctrlKey||event.metaKey||event.altKey||['INPUT','TEXTAREA','SELECT','BUTTON','SUMMARY','A'].includes(document.activeElement?.tagName))return;const options={'1':-2,'2':-1,'3':1,'4':2};if(event.key in options){event.preventDefault();choose(options[event.key]);}if(event.key==='Enter'&&!$('next').disabled){event.preventDefault();nextQuestion();}});
setInterval(()=>{if(started&&!answered&&!busy){const s=Math.floor((Date.now()-started)/1000);$('timer').textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}},1000);
window.addEventListener('pagehide',()=>{engine.cancel();simulationEngine.cancel();});
$('elo-min').value=eloRange.min??'';$('elo-max').value=eloRange.max??'';updateRatingStatus();
nextQuestion();
