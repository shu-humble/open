// Replay contains only the lead-in to a question, never the game's future moves.
export class QuestionReplay {
  constructor(moves,fallbackFen){this.moves=moves||[];this.fallbackFen=fallbackFen;this.index=this.moves.length;}
  get atQuestion(){return this.index===this.moves.length;}
  get fen(){return this.index?this.moves[this.index-1].after:(this.moves[0]?.before||this.fallbackFen);}
  get lastMove(){return this.index?this.moves[this.index-1]:null;}
  step(delta){const next=Math.max(0,Math.min(this.moves.length,this.index+Math.sign(delta)));const changed=next!==this.index;this.index=next;return changed;}
  returnToQuestion(){this.index=this.moves.length;}
}
export function squarePoint(square,flipped=false){
  if(!/^[a-h][1-8]$/.test(square))return null;
  let x=square.charCodeAt(0)-97,y=8-Number(square[1]);
  if(flipped){x=7-x;y=7-y;}return{x:x*100+50,y:y*100+50};
}
export function pointerSquare(x,y,width,height,flipped=false){
  if(width<=0||height<=0||x<0||y<0||x>=width||y>=height)return null;
  let file=Math.floor(x/width*8),rank=7-Math.floor(y/height*8);
  if(flipped){file=7-file;rank=7-rank;}return 'abcdefgh'[file]+(rank+1);
}
export class BoardNotes {
  constructor(){this.positions=new Map();}
  shapes(fen){return [...(this.positions.get(fen)?.values()||[])];}
  toggle(fen,from,to,color='green'){
    if(!squarePoint(from)||!squarePoint(to))return;
    if(!this.positions.has(fen))this.positions.set(fen,new Map());
    const marks=this.positions.get(fen),key=`${from}:${to}:${color}`;
    if(marks.has(key))marks.delete(key);else marks.set(key,{from,to,color});
  }
  clear(fen){this.positions.delete(fen);}
  reset(){this.positions.clear();}
}
