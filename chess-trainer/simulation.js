import { Chess } from 'chess.js';

// A separate position/history: exploration never changes the graded question.
export class Simulation {
  constructor(fen) { this.originalFen=fen; this.chess=new Chess(fen);this.selected=null;this.pending=null;this.future=[]; }
  targets() {return this.selected?this.chess.moves({square:this.selected,verbose:true}):[];}
  select(square) {
    if(this.pending||this.chess.isGameOver())return 'blocked';
    if(this.selected===square){this.selected=null;return 'selected';}
    if(this.selected&&this.targets().some(m=>m.to===square))return this.move(this.selected,square);
    const piece=this.chess.get(square);
    this.selected=piece?.color===this.chess.turn()?square:null;
    return 'selected';
  }
  move(from,to) {
    if(this.pending||this.chess.isGameOver())return 'blocked';
    const moves=this.chess.moves({square:from,verbose:true}).filter(m=>m.to===to);
    if(!moves.length)return 'illegal';
    if(moves.some(m=>m.promotion)){this.pending={from,to};this.selected=from;return 'promotion';}
    this.chess.move({from,to});this.future=[];this.selected=null;return 'moved';
  }
  promote(piece) {
    if(!this.pending||!['q','r','b','n'].includes(piece))return 'illegal';
    this.chess.move({...this.pending,promotion:piece});this.future=[];this.selected=null;this.pending=null;return 'moved';
  }
  cancelPromotion(){this.pending=null;this.selected=null;}
  undo(){if(this.pending){this.cancelPromotion();return null;}this.selected=null;const move=this.chess.undo();if(move)this.future.push(move);return move;}
  redo(){if(this.pending||!this.future.length)return null;this.selected=null;const move=this.future.at(-1);const result=this.chess.move({from:move.from,to:move.to,promotion:move.promotion});this.future.pop();return result;}
  reset(){this.cancelPromotion();while(this.chess.history().length)this.undo();}
  terminal(){
    if(this.chess.isCheckmate())return `${this.chess.turn()==='w'?'黑':'白'}方將死對手，試走結束。`;
    if(this.chess.isStalemate())return '無合法著法且未被將軍：逼和。';
    if(this.chess.isThreefoldRepetition())return '同一局面出現三次：和棋。';
    if(this.chess.isInsufficientMaterial())return '子力不足以將死：和棋。';
    if(this.chess.isDrawByFiftyMoves())return '五十回合未吃子或移動兵：和棋。';
    return null;
  }
}
