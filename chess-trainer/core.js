import { Chess } from 'chess.js';
import { parseRating } from './ratings.js';
export const labels = { '-2': '黑方大優', '-1': '黑方小優', 1: '白方小優', 2: '白方大優' };
export function classify(cp) { return cp === 0 ? null : cp <= -200 ? -2 : cp < 0 ? -1 : cp < 200 ? 1 : 2; }
export function splitPgn(text) { return text.trim().split(/\n\s*(?=\[Event\s)/).filter(p => p.trim()); }
export function originalGameUrl(...values){
  for(const value of values){
    try{
      const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port)continue;
      if(['lichess.org','www.lichess.org'].includes(url.hostname)){
        const match=url.pathname.match(/^\/([a-zA-Z0-9]{8})(?:[a-zA-Z0-9]{4})?(?:\/(?:white|black))?\/?$/);
        if(match)return `https://lichess.org/${match[1]}`;
      }
      if(['chess.com','www.chess.com'].includes(url.hostname)&&/^\/(?:game\/(?:live|daily)|(?:live|daily)\/game|analysis\/game\/(?:live|daily))\/\d+(?:\/.*)?$/.test(url.pathname)){
        url.hash='';url.search='';return url.href;
      }
    }catch{/* Not a usable original-game URL. */}
  }
  return null;
}
export function gamePositionUrl(value,ply){
  const safe=originalGameUrl(value);if(!safe||!Number.isInteger(ply)||ply<1)return null;
  const url=new URL(safe);
  if(url.hostname==='lichess.org'){url.hash=String(ply);return url.href;}
  const match=url.pathname.match(/\/(?:game\/(live|daily)|(live|daily)\/game)\/(\d+)/);
  if(!match)return null;
  // Chess.com indexes completed half-moves from zero; Lichess uses a one-based ply hash.
  return `https://www.chess.com/analysis/game/${match[1]||match[2]}/${match[3]}?tab=analysis&move=${ply-1}`;
}
export function positionsFromPgn(text, source = '匯入棋譜', fallbackUrl = null) {
  const positions = [];
  for (const pgn of splitPgn(text)) {
    try {
      const declaredResult=pgn.match(/\[Result\s+"([^"]+)"\]/)?.[1];
      if(declaredResult && !['1-0','0-1','1/2-1/2'].includes(declaredResult)) continue;
      const chess = new Chess(); chess.loadPgn(pgn);
      const headers = chess.getHeaders();
      if (!['1-0','0-1','1/2-1/2'].includes(headers.Result)) continue;
      if (headers.Variant && !['Standard','Chess'].includes(headers.Variant)) continue;
      const history = chess.history({verbose:true});
      const safeUrl=originalGameUrl(fallbackUrl,headers.Link,headers.Site);
      for (let i = 15; i < history.length - 2; i += 3) {
        const fen = history[i].after, position = new Chess(fen);
        if (position.isGameOver()) continue;
        const ply=(Number(fen.split(' ')[5])-1)*2+(position.turn()==='b'?1:0);
        const played=history[i],moveLabel=`${played.before.split(' ')[5]}${played.color==='w'?'.':'…'} ${played.san} 之後`;
        const leadIn=history.slice(0,i+1).map(m=>({from:m.from,to:m.to,san:m.san,color:m.color,before:m.before,after:m.after}));
        positions.push({fen,ply,moveLabel,leadIn,source,white:headers.White || '白方',black:headers.Black || '黑方',whiteElo:parseRating(headers.WhiteElo),blackElo:parseRating(headers.BlackElo),url:safeUrl});
      }
    } catch { /* Invalid or non-standard games are skipped; never invent a position. */ }
  }
  return [...new Map(positions.map(p=>[p.fen,p])).values()];
}
export function parseScore(line, turn) {
  const score = line.match(/\bscore (cp|mate) (-?\d+)/);
  if (!score || /\b(?:upperbound|lowerbound)\b/.test(line)) return null;
  const raw = Number(score[2]), sign = turn === 'w' ? 1 : -1;
  return { cp: score[1]==='cp' ? raw*sign : Math.sign(raw || -1)*100000*sign,
    mate:score[1]==='mate' ? raw*sign : null,
    depth:Number(line.match(/\bdepth (\d+)/)?.[1] || 0),
    pv:line.match(/\bpv (.+)/)?.[1]?.trim().split(/\s+/) || [] };
}
export function pvSan(fen, moves) {
  const c = new Chess(fen), san = [];
  for (const m of moves.slice(0,5)) { try {san.push(c.move({from:m.slice(0,2),to:m.slice(2,4),promotion:m[4]}).san);} catch {break;} }
  return san.join(' → ');
}
