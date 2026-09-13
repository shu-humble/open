import { parseScore } from './core.js';
import { collectLine, finishLines } from './review.js';
// A separate single-threaded worker keeps the board responsive and needs no COOP/COEP headers.
export class Engine {
  async evaluate(fen) {
    this.cancel();
    return new Promise((resolve,reject)=>{
      const frames=new Map();let searching = false;
      const worker = new Worker(new URL('./chess-engine/stockfish-18-lite-single.js', document.baseURI));
      this.worker = worker;
      const cleanup = () => { clearTimeout(timer); worker.terminate(); if(this.worker===worker) {this.worker=null;this.cancelCurrent=null;} };
      const fail = message => { cleanup(); reject(new Error(message)); };
      const timer = setTimeout(()=>fail('引擎載入或分析逾時，請重試。'),30000);
      this.cancelCurrent = () => {cleanup();reject(new Error('分析已取消'));};
      worker.onerror = () => fail('Stockfish 無法啟動。請確認瀏覽器支援 WebAssembly，並重新分析。');
      worker.onmessage = ({data}) => {
        if(typeof data !== 'string') return;
        for(const line of data.split('\n')) {
          if(line==='uciok') {worker.postMessage('setoption name Hash value 16');worker.postMessage('setoption name MultiPV value 3');worker.postMessage('isready');}
          if(line==='readyok' && !searching) {searching=true;worker.postMessage(`position fen ${fen}`);worker.postMessage('go depth 18 movetime 3000');}
          if(line.startsWith('info ')) { const s = parseScore(line,fen.split(' ')[1]); if(s) collectLine(frames,s,line); }
          if(line.startsWith('bestmove ')) {const score=finishLines(frames);cleanup();score ? resolve(score) : reject(new Error('引擎未回傳有效分數，請重新分析。'));}
        }
      };
      worker.postMessage('uci');
    });
  }
  cancel() {this.cancelCurrent?.();}
}
