export const grades={
  critical:{icon:'!',label:'關鍵好棋',color:'#719bcd'},
  best:{icon:'★',label:'最佳',color:'#a7cf65'},
  excellent:{icon:'👍',label:'優秀',color:'#91bb73'},
  good:{icon:'✓',label:'尚可',color:'#a3b38b'},
  inaccuracy:{icon:'?!',label:'不精確',color:'#e8ba43'},
  mistake:{icon:'?',label:'失誤',color:'#ee944a'},
  blunder:{icon:'??',label:'嚴重失誤',color:'#ec6868'},
};
export function scoreText(score){return score.mate!==null?`${score.cp>0?'+':'−'}M${Math.abs(score.mate)}`:`${score.cp>0?'+':''}${(score.cp/100).toFixed(2)}`;}
export function whiteShare(cp){return 100/(1+Math.exp(-Math.max(-2000,Math.min(2000,cp))/250));}
export function gradeMove(before,after,move){
  const sign=move.color==='w'?1:-1;
  const loss=Math.max(0,(before.cp-after.cp)*sign);
  const best=before.pv?.[0]===move.lan;
  const second=before.lines?.find(l=>l.rank===2&&l.depth===before.depth);
  let kind=loss<10?'excellent':loss<50?'good':loss<100?'inaccuracy':loss<200?'mistake':'blunder';
  // A best move must also remain sound on the follow-up search.
  if(best&&loss<50)kind='best';
  if(kind==='best'&&second&&before.cp*sign>=-50&&second.cp*sign<=-150&&(before.cp-second.cp)*sign>=150)kind='critical';
  return {kind,loss,before,after};
}
// Select only the main variation, never the last (often third-best) UCI info line.
export function collectLine(frames,score,line){
  const rank=Number(line.match(/\bmultipv (\d+)/)?.[1]||1);
  if(!frames.has(score.depth))frames.set(score.depth,new Map());
  frames.get(score.depth).set(rank,{...score,rank});
}
export function finishLines(frames){
  const depths=[...frames.keys()].sort((a,b)=>b-a);
  const depth=depths.find(d=>frames.get(d).has(1));
  if(depth===undefined)return null;
  const lines=[...frames.get(depth).values()].sort((a,b)=>a.rank-b.rank);
  return {...frames.get(depth).get(1),lines};
}
