export function parseRating(value){
  if(!/^\d{1,4}$/.test(String(value??'')))return null;
  const rating=Number(value);return rating>0&&rating<=4000?rating:null;
}
export function ratingRange(min,max){
  const parse=value=>{
    if(value===null||value===undefined||String(value).trim()==='')return null;
    if(!/^\d{1,4}$/.test(String(value).trim()))throw new Error('ELO 請填入 0 到 4000 的整數，留空代表不限。');
    const n=Number(value);if(n>4000)throw new Error('ELO 請填入 0 到 4000 的整數。');return n;
  };
  const range={min:parse(min),max:parse(max)};
  if(range.min!==null&&range.max!==null&&range.min>range.max)throw new Error('最低 ELO 不能大於最高 ELO。');
  return range;
}
export function matchesRating(position,range){
  if(range.min===null&&range.max===null)return true;
  return [position.whiteElo,position.blackElo].every(n=>Number.isInteger(n)&&n>0&&n>=(range.min??0)&&n<=(range.max??4000));
}
