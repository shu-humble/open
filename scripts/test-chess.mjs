import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { Chess } from 'chess.js';
import { classify, parseScore, positionsFromPgn, pvSan, originalGameUrl, gamePositionUrl } from '../chess-trainer/core.js';
import { parseRating, ratingRange, matchesRating } from '../chess-trainer/ratings.js';
import { Simulation } from '../chess-trainer/simulation.js';
import { QuestionReplay, BoardNotes, squarePoint, pointerSquare } from '../chess-trainer/board-tools.js';
import { gradeMove, whiteShare, collectLine, finishLines } from '../chess-trainer/review.js';
const reviewScore=(cp,pv=['e2e4'])=>({cp,mate:null,depth:15,pv});
assert.equal(gradeMove(reviewScore(50),reviewScore(45),{color:'w',lan:'e2e4'}).kind,'best');
assert.equal(gradeMove(reviewScore(50),reviewScore(45),{color:'w',lan:'d2d4'}).kind,'excellent');
for(const [loss,kind] of [[10,'good'],[49,'good'],[50,'inaccuracy'],[100,'mistake'],[200,'blunder']]){
  assert.equal(gradeMove(reviewScore(50),reviewScore(50-loss),{color:'w',lan:'d2d4'}).kind,kind);
  assert.equal(gradeMove(reviewScore(-50),reviewScore(-50+loss),{color:'b',lan:'d7d5'}).kind,kind);
}
assert.equal(gradeMove(reviewScore(50),reviewScore(500),{color:'w',lan:'d2d4'}).loss,0);
assert.equal(whiteShare(0),50);assert.ok(whiteShare(200)>50);assert.ok(whiteShare(-200)<50);
const frames=new Map();collectLine(frames,reviewScore(100),'info depth 15 multipv 1');collectLine(frames,reviewScore(-100),'info depth 15 multipv 3');collectLine(frames,reviewScore(30),'info depth 15 multipv 2');assert.equal(finishLines(frames).cp,100);assert.deepEqual(finishLines(frames).lines.map(l=>l.rank),[1,2,3]);
collectLine(frames,{...reviewScore(500),depth:16},'info depth 16 multipv 2');assert.equal(finishLines(frames).cp,100);
console.log('PASS: move grading white/black perspectives, thresholds, score-bar direction, MultiPV primary selection and depth isolation.');
for(const [cp,category] of [[-300,-2],[-200,-2],[-199,-1],[-10,-1],[-1,-1],[0,null],[1,1],[10,1],[199,1],[200,2],[300,2]])assert.equal(classify(cp),category);
assert.equal(parseScore('info depth 15 score cp 10 pv e2e4','w').cp,10);
assert.equal(parseScore('info depth 15 score cp 10 pv e7e5','b').cp,-10);
assert.equal(parseScore('info depth 15 score mate -2 pv e7e5','b').cp,100000);
assert.equal(parseScore('info depth 15 score cp 10 lowerbound','w'),null);
const text=readFileSync('chess-sample.pgn','utf8')+'\n'+readFileSync('chess-sample-2.pgn','utf8');
const positions=positionsFromPgn(text);
const questionReplay=new QuestionReplay(positions[0].leadIn,positions[0].fen);
assert.equal(questionReplay.fen,positions[0].fen);assert.ok(questionReplay.atQuestion);
assert.equal(questionReplay.step(1),false);assert.equal(questionReplay.step(-1),true);
assert.equal(questionReplay.fen,positions[0].leadIn.at(-1).before);assert.ok(!questionReplay.atQuestion);
for(let i=0;i<100;i++)questionReplay.step(-1);assert.equal(questionReplay.index,0);assert.equal(questionReplay.lastMove,null);assert.equal(questionReplay.fen,new Chess().fen());
for(let i=0;i<100;i++)questionReplay.step(1);assert.equal(questionReplay.index,positions[0].leadIn.length);assert.equal(questionReplay.fen,positions[0].fen);
assert.equal(positions[0].leadIn.length,16);assert.equal(positions[0].leadIn.at(-1).after,positions[0].fen);
assert.deepEqual(squarePoint('a8'),{x:50,y:50});assert.deepEqual(squarePoint('a8',true),{x:750,y:750});
for(const flipped of [false,true])for(const file of 'abcdefgh')for(let rank=1;rank<=8;rank++){const s=file+rank,p=squarePoint(s,flipped);assert.equal(pointerSquare(p.x,p.y,800,800,flipped),s);}
assert.equal(pointerSquare(-1,0,800,800),null);assert.equal(pointerSquare(800,0,800,800),null);
const boardNotes=new BoardNotes();boardNotes.toggle('fen-a','e2','e4');assert.equal(boardNotes.shapes('fen-a').length,1);assert.equal(boardNotes.shapes('fen-b').length,0);boardNotes.toggle('fen-a','e2','e4');assert.equal(boardNotes.shapes('fen-a').length,0);boardNotes.toggle('fen-a','d4','d4','red');assert.equal(boardNotes.shapes('fen-a')[0].color,'red');boardNotes.clear('fen-a');assert.equal(boardNotes.shapes('fen-a').length,0);
console.log('PASS: question replay stops at original question, source move/highlight data, annotation toggles, position isolation and coordinates in both orientations.');
assert.equal(parseRating('1582'),1582);assert.equal(parseRating('?'),null);assert.equal(parseRating(''),null);assert.equal(parseRating('0'),null);assert.equal(parseRating('1600junk'),null);
assert.deepEqual(ratingRange('',''),{min:null,max:null});assert.deepEqual(ratingRange('1500','1700'),{min:1500,max:1700});
assert.throws(()=>ratingRange('1700','1500'));assert.throws(()=>ratingRange('abc','2000'));assert.throws(()=>ratingRange('-1','2000'));assert.throws(()=>ratingRange('1200.5','2000'));assert.throws(()=>ratingRange('0','4001'));
assert.ok(matchesRating({whiteElo:1500,blackElo:1700},ratingRange(1500,1700)));
assert.ok(!matchesRating({whiteElo:1499,blackElo:1600},ratingRange(1500,1700)));
assert.ok(!matchesRating({whiteElo:1600,blackElo:1701},ratingRange(1500,1700)));
assert.ok(!matchesRating({whiteElo:null,blackElo:1600},ratingRange(1500,1700)));
assert.ok(matchesRating({whiteElo:null,blackElo:null},ratingRange(null,null)));
assert.ok(matchesRating({whiteElo:2000,blackElo:2400},ratingRange(1800,null)));
assert.ok(positions.every(p=>matchesRating(p,ratingRange(1500,1700))));
assert.equal(positions.filter(p=>matchesRating(p,ratingRange(2500,3000))).length,0);
const partial=positions.filter(p=>matchesRating(p,ratingRange(1600,1700)));assert.ok(partial.length>0&&partial.length<positions.length);
assert.equal(positions[0].ply,16);assert.ok(positions[0].moveLabel.includes('8…'));
assert.equal(gamePositionUrl('https://lichess.org/yyznGmXs',16),'https://lichess.org/yyznGmXs#16');
assert.equal(gamePositionUrl('https://lichess.org/yyznGmXs#3',19),'https://lichess.org/yyznGmXs#19');
for(const base of ['https://www.chess.com/game/live/123','https://www.chess.com/live/game/123','https://www.chess.com/analysis/game/live/123/analysis?move=0'])assert.equal(gamePositionUrl(base,16),'https://www.chess.com/analysis/game/live/123?tab=analysis&move=15');
assert.equal(gamePositionUrl('https://www.chess.com/game/daily/123',1),'https://www.chess.com/analysis/game/daily/123?tab=analysis&move=0');
assert.equal(gamePositionUrl('https://lichess.org/yyznGmXs',-1),null);assert.equal(gamePositionUrl('https://example.com/game/123',16),null);
console.log('PASS: exact question-ply URLs for both platforms, Elo parsing, inclusive dual-player ranges, missing ratings, empty and partial filtered pools.');
assert.ok(positions.length>=20);
assert.ok(positions.some(p=>p.fen.split(' ')[1]==='b'));
assert.ok(positions.some(p=>p.fen.split(' ')[1]==='w'));
for(const p of positions){assert.equal(new Chess(p.fen).isGameOver(),false);assert.match(p.url,/^https:\/\/lichess.org\//);}
assert.equal(positionsFromPgn('not a pgn').length,0);
assert.equal(positionsFromPgn(text.replaceAll('[Result "1-0"]','[Result "*"]')).length,0);
assert.equal(pvSan(new Chess().fen(),['e2e4','e7e5','g1f3']),'e4 → e5 → Nf3');
const page=readFileSync('棋感訓練.html','utf8');
assert.equal((page.match(/data-choice=/g)||[]).length,4);
assert.ok(!page.includes('data-choice="0"'));
assert.match(page,/id="eval-panel" hidden/);assert.match(page,/id="simulation"[^>]*hidden/);assert.ok(page.includes('id="play-suggestion"'));
assert.ok(readFileSync('Games.html','utf8').includes('href="棋感訓練.html"'));
assert.ok(page.includes('id="redo"'));assert.ok(page.includes('id="original-game-link"'));
assert.equal(originalGameUrl('https://lichess.org/yyznGmXs/black#20'),'https://lichess.org/yyznGmXs');
assert.equal(originalGameUrl('https://www.chess.com'),null);
assert.equal(originalGameUrl('https://www.chess.com/game/live/123456#24'),'https://www.chess.com/game/live/123456');
assert.equal(originalGameUrl('https://www.chess.com/live/game/123456'),'https://www.chess.com/live/game/123456');
assert.equal(originalGameUrl('javascript:alert(1)','https://chess.com.evil.example/game/live/123'),null);
assert.equal(originalGameUrl('https://name:password@www.chess.com/game/live/123'),null);
const chesscomPgn=readFileSync('chess-sample.pgn','utf8').replace('[Site "https://lichess.org/yyznGmXs"]','[Site "Chess.com"]\n[Link "https://www.chess.com/game/live/123456"]');
assert.ok(positionsFromPgn(chesscomPgn).every(p=>p.url==='https://www.chess.com/game/live/123456'));
assert.ok(positionsFromPgn(chesscomPgn,'Chess.com','https://www.chess.com/game/live/987654').every(p=>p.url==='https://www.chess.com/game/live/987654'));
// Explore legal moves independently of the immutable question, including special rules.
const start=new Chess().fen(),sim=new Simulation(start);
assert.equal(sim.move('e2','e5'),'illegal');assert.equal(sim.chess.fen(),start);
assert.equal(sim.select('e2'),'selected');assert.ok(sim.targets().some(m=>m.to==='e4'));
assert.equal(sim.select('e4'),'moved');assert.equal(sim.chess.turn(),'b');
assert.equal(sim.originalFen,start);assert.equal(sim.move('d2','d4'),'illegal');
sim.undo();assert.equal(sim.chess.fen(),start);
sim.move('e2','e4');sim.move('e7','e5');sim.reset();assert.equal(sim.chess.fen(),start);assert.equal(sim.chess.history().length,0);
assert.equal(sim.future.length,2);sim.redo();assert.equal(sim.chess.get('e4').type,'p');sim.redo();assert.equal(sim.chess.get('e5').type,'p');assert.equal(sim.redo(),null);
const replayFen=sim.chess.fen();sim.undo();sim.redo();assert.equal(sim.chess.fen(),replayFen);
sim.undo();assert.equal(sim.move('e7','e4'),'illegal');assert.equal(sim.future.length,1);sim.move('c7','c5');assert.equal(sim.future.length,0);assert.equal(sim.redo(),null);
sim.reset();sim.redo();sim.redo();assert.equal(sim.chess.get('c5').type,'p');
const castle=new Simulation('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');assert.equal(castle.move('e1','g1'),'moved');assert.equal(castle.chess.get('f1').type,'r');castle.undo();assert.equal(castle.chess.fen(),castle.originalFen);
castle.redo();assert.equal(castle.chess.get('f1').type,'r');
const ep=new Simulation('7k/8/8/3pP3/8/8/8/4K3 w - d6 0 2');assert.equal(ep.move('e5','d6'),'moved');assert.equal(ep.chess.get('d5'),undefined);
const epFen=ep.chess.fen();ep.undo();ep.redo();assert.equal(ep.chess.fen(),epFen);
const promoteReplay=new Simulation('7k/P7/8/8/8/8/8/7K w - - 0 1');promoteReplay.move('a7','a8');promoteReplay.promote('n');promoteReplay.undo();promoteReplay.redo();assert.equal(promoteReplay.chess.get('a8').type,'n');
console.log('PASS: rewind/redo, reset with replay, alternate branch replacement, special-move replay, Lichess and Chess.com original-game links and unsafe URL rejection.');
for(const piece of ['q','r','b','n']){const promotion=new Simulation('7k/P7/8/8/8/8/8/7K w - - 0 1');assert.equal(promotion.move('a7','a8'),'promotion');assert.equal(promotion.chess.fen(),promotion.originalFen);assert.equal(promotion.promote(piece),'moved');assert.equal(promotion.chess.get('a8').type,piece);promotion.undo();assert.equal(promotion.chess.fen(),promotion.originalFen);}
const pinned=new Simulation('k3r3/8/8/8/8/8/4R3/4K3 w - - 0 1');assert.equal(pinned.move('e2','a2'),'illegal');
const mate=new Simulation('7k/6Q1/5K2/8/8/8/8/8 b - - 0 1');assert.ok(mate.terminal().includes('將死'));assert.equal(mate.move('h8','h7'),'blocked');
const stalemate=new Simulation('7k/5K2/6Q1/8/8/8/8/8 b - - 0 1');assert.ok(stalemate.terminal().includes('逼和'));
const repeat=new Simulation(start);for(let i=0;i<2;i++){repeat.move('g1','f3');repeat.move('g8','f6');repeat.move('f3','g1');repeat.move('f6','g8');}assert.ok(repeat.terminal().includes('三次'));
console.log('PASS: simulation legal moves, turn order, immutable original, undo/reset, castling, en passant, all promotions, pinned piece, mate/stalemate/repetition.');
// Exercise the exact shipped engine, then verify mate signs for both sides to move.
async function runEngine(fen){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,['public/chess-engine/stockfish-18-lite-single.js'],{stdio:['pipe','pipe','pipe']});
    let buffer='',score=null,ready=false,errors='';const frames=new Map();
    const timer=setTimeout(()=>{child.kill();reject(new Error('Engine timed out '+errors));},20000);
    child.on('error',reject);child.stderr.on('data',d=>errors+=d);
    child.stdout.on('data',data=>{
      buffer+=data;const lines=buffer.split('\n');buffer=lines.pop();
      for(const line of lines){
        if(line.trim()==='uciok')child.stdin.write('setoption name MultiPV value 3\nisready\n');
        if(line.trim()==='readyok'&&!ready){ready=true;child.stdin.write(`position fen ${fen}\ngo depth 12 movetime 1000\n`);}
        const parsed=parseScore(line,fen.split(' ')[1]);if(parsed){collectLine(frames,parsed,line);score=finishLines(frames);}
        if(line.startsWith('bestmove')){clearTimeout(timer);child.kill();score?resolve(score):reject(new Error('No score'));}
      }
    });
    child.stdin.write('uci\n');
  });
}
const white=await runEngine('7k/5K2/6Q1/8/8/8/8/8 w - - 0 1');assert.equal(classify(white.cp),2);assert.ok(white.mate>0);
const black=await runEngine('8/8/8/8/8/6q1/5k2/7K b - - 0 1');assert.equal(classify(black.cp),-2);assert.ok(black.mate<0);
const real=await runEngine(positions[0].fen);assert.ok(real.depth>0);assert.ok(pvSan(positions[0].fen,real.pv));
assert.ok(real.lines.length>=2);assert.equal(real.rank,1);
console.log(`PASS: classification including ±0.10 and zero exclusion; four choices; Games link; ${positions.length} legal real-game positions; PGN validation; actual Stockfish white/black mate and real position.`);
