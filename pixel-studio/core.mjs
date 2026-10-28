// Pure image operations, shared by the worker and regression tests.
import {MAX_GRID_EDGE,MAX_GRID_PIXELS,densityPlan} from './resolution.mjs';
export const palettes = {
  db16: ['#140c1c','#442434','#30346d','#4e4a4e','#854c30','#346524','#d04648','#757161','#597dce','#d27d2c','#8595a1','#6daa2c','#d2aa99','#6dc2ca','#dad45e','#deeed6'],
  pico8: ['#000000','#1d2b53','#7e2553','#008751','#ab5236','#5f574f','#c2c3c7','#fff1e8','#ff004d','#ffa300','#ffec27','#00e436','#29adff','#83769c','#ff77a8','#ffccaa']
};
export const rgb = hex => hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16));
export const hex = c => '#'+c.slice(0,3).map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const distance = (a,b) => 2*(a[0]-b[0])**2+4*(a[1]-b[1])**2+3*(a[2]-b[2])**2;
export function countColors(data){const seen=new Uint8Array(1<<21);let count=0;for(let i=0;i<data.length;i+=4)if(data[i+3]){const color=(data[i]<<16)|(data[i+1]<<8)|data[i+2],index=color>>3,mask=1<<(color&7);if(!(seen[index]&mask)){seen[index]|=mask;count++;}}return count;}
export function backgroundColor({data,width,height}){
  const bins=new Map();
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(x!==0&&y!==0&&x!==width-1&&y!==height-1)continue;
    const i=(y*width+x)*4;if(data[i+3]<128)continue;
    const key=(data[i]>>4)+','+(data[i+1]>>4)+','+(data[i+2]>>4);
    const b=bins.get(key)||[0,0,0,0];for(let c=0;c<3;c++)b[c]+=data[i+c];b[3]++;bins.set(key,b);
  }
  const best=[...bins.values()].sort((a,b)=>b[3]-a[3])[0];
  return best?hex(best.slice(0,3).map(v=>v/best[3])):'#ffffff';
}
export function removeBackground(image,color,tolerance=28,connected=true){
  const {width,height}=image,data=new Uint8ClampedArray(image.data),target=rgb(color),threshold=tolerance*tolerance*9;
  const matches=p=>data[p*4+3]===0||distance(data.subarray(p*4,p*4+3),target)<=threshold;
  if(!connected){for(let p=0;p<width*height;p++)if(matches(p))data[p*4+3]=0;return{data,width,height};}
  const visited=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0;
  const add=p=>{if(!visited[p]){visited[p]=1;if(matches(p))queue[tail++]=p;}};
  for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
  while(head<tail){const p=queue[head++];data[p*4+3]=0;const x=p%width,y=Math.floor(p/width);if(x)add(p-1);if(x+1<width)add(p+1);if(y)add(p-width);if(y+1<height)add(p+width);}
  return{data,width,height};
}
export function detectGrid(image){
  const {width,height,data}=image;
  function axis(horizontal){
    const length=horizontal?width:height,cross=horizontal?height:width,edges=new Float64Array(length);
    for(let p=1;p<length;p++)for(let q=0;q<cross;q+=Math.max(1,Math.floor(cross/160))){
      const i=(horizontal?q*width+p:p*width+q)*4,j=i-(horizontal?4:width*4);
      edges[p]+=Math.abs(data[i]-data[j])+Math.abs(data[i+1]-data[j+1])+Math.abs(data[i+2]-data[j+2])+Math.abs(data[i+3]-data[j+3]);
    }
    const total=edges.reduce((a,b)=>a+b,0);if(!total)return{size:1,offset:0,confidence:0};
    let best={score:0,size:1,offset:0,confidence:0};
    for(let size=2;size<=Math.min(80,Math.floor(length/6));size++){
      for(let offset=0;offset<size;offset++){
        let sum=0,n=0;for(let p=offset||size;p<length;p+=size){sum+=edges[p];n++;}
        // True cell boundaries concentrate contrast; harmonics explain fewer edges.
        const coverage=sum/total,lift=coverage*size,score=coverage*Math.max(0,1-1/lift);
        if(n>=4&&score>best.score)best={score,size,offset,confidence:Math.min(1,score)};
      }
    }
    return best;
  }
  return{x:axis(true),y:axis(false)};
}
export function sampleGrid(image,options){
  if(options.gridLongEdge)return sampleDensity(image,options.gridLongEdge);
  const {sizeX,sizeY,offsetX=0,offsetY=0,method='average',coverage=1}=options;
  if(!Number.isInteger(sizeX)||!Number.isInteger(sizeY)||sizeX<1||sizeY<1||offsetX<0||offsetY<0||offsetX>=image.width||offsetY>=image.height)throw new Error('格子與起點超出圖片範圍。');
  const width=Math.ceil((image.width-offsetX)/sizeX),height=Math.ceil((image.height-offsetY)/sizeY);
  if(width>MAX_GRID_EDGE||height>MAX_GRID_EDGE||width*height>MAX_GRID_PIXELS)throw new Error('輸出最多 4096 × 4096 格，請加大格子尺寸。');
  if(sizeX===1&&sizeY===1&&offsetX===0&&offsetY===0)return{width,height,data:new Uint8ClampedArray(image.data)};
  const data=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    let count=0,total=0,weight=0;const sum=[0,0,0],bins=method==='dominant'?new Map():null;
    for(let sy=offsetY+y*sizeY;sy<Math.min(image.height,offsetY+(y+1)*sizeY);sy++)for(let sx=offsetX+x*sizeX;sx<Math.min(image.width,offsetX+(x+1)*sizeX);sx++){
      total++;const i=(sy*image.width+sx)*4,alpha=image.data[i+3]/255;if(!alpha)continue;count++;weight+=alpha;
      for(let c=0;c<3;c++)sum[c]+=image.data[i+c]*alpha;
      if(method==='dominant'){const key=(image.data[i]>>3)+','+(image.data[i+1]>>3)+','+(image.data[i+2]>>3),b=bins.get(key)||[0,0,0,0];for(let c=0;c<3;c++)b[c]+=image.data[i+c];b[3]++;bins.set(key,b);}
    }
    if(!count||count/total*100<coverage)continue;
    const best=method==='dominant'?[...bins.values()].sort((a,b)=>b[3]-a[3])[0]:[...sum,weight],i=(y*width+x)*4;
    for(let c=0;c<3;c++)data[i+c]=Math.round(best[c]/best[3]);data[i+3]=Math.round(weight/total*255);
  }
  return{data,width,height};
}
export function sampleDensity(image,longEdge){
  const plan=densityPlan(image.width,image.height,longEdge),cell=plan.cell;
  if(Number.isInteger(cell))return sampleGrid(image,{sizeX:cell,sizeY:cell,method:'average'});
  const width=plan.width,height=plan.height,data=new Uint8ClampedArray(width*height*4),src=image.data;
  // Area-weighted box averages make density changes gradual, including near 4K.
  for(let y=0;y<height;y++){
    const top=y*cell,bottom=Math.min(image.height,(y+1)*cell);
    for(let x=0;x<width;x++){
      const left=x*cell,right=Math.min(image.width,(x+1)*cell);let red=0,green=0,blue=0,weight=0;
      for(let sy=Math.floor(top);sy<Math.ceil(bottom);sy++){
        const wy=Math.min(bottom,sy+1)-Math.max(top,sy);if(wy<=0)continue;
        for(let sx=Math.floor(left);sx<Math.ceil(right);sx++){
          const wx=Math.min(right,sx+1)-Math.max(left,sx);if(wx<=0)continue;
          const i=(sy*image.width+sx)*4,a=wx*wy*src[i+3]/255;
          red+=src[i]*a;green+=src[i+1]*a;blue+=src[i+2]*a;weight+=a;
        }
      }
      if(weight){const i=(y*width+x)*4;data[i]=Math.round(red/weight);data[i+1]=Math.round(green/weight);data[i+2]=Math.round(blue/weight);data[i+3]=Math.round(255*weight/((right-left)*(bottom-top)));}
    }
  }
  return{data,width,height};
}
export function fillHoles(image,maxArea=4){
  const {width,height}=image,data=new Uint8ClampedArray(image.data),seen=new Uint8Array(width*height);
  for(let start=0;start<width*height;start++){
    if(seen[start]||data[start*4+3])continue;
    const region=[start],border=new Set();seen[start]=1;let edge=false;
    for(let k=0;k<region.length;k++){
      const p=region[k],x=p%width,y=Math.floor(p/width);if(!x||!y||x===width-1||y===height-1)edge=true;
      const neighbors=[];if(x)neighbors.push(p-1);if(x+1<width)neighbors.push(p+1);if(y)neighbors.push(p-width);if(y+1<height)neighbors.push(p+width);
      for(const n of neighbors){if(data[n*4+3])border.add(n);else if(!seen[n]){seen[n]=1;region.push(n);}}
    }
    if(!edge&&region.length<=maxArea&&border.size){const colors=[...border];for(const p of region){const nearest=colors.reduce((a,b)=>Math.abs(a%width-p%width)+Math.abs(Math.floor(a/width)-Math.floor(p/width))<=Math.abs(b%width-p%width)+Math.abs(Math.floor(b/width)-Math.floor(p/width))?a:b);data.set(data.subarray(nearest*4,nearest*4+4),p*4);}}
  }
  return{data,width,height};
}
export function closeGaps(image){
  // Fill narrow concavities using the original mask, never grow the entire outline.
  const {width,height}=image,data=new Uint8ClampedArray(image.data);
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
    const p=y*width+x;if(image.data[p*4+3])continue;
    const neighbors=[p-1,p+1,p-width,p+width].filter(n=>image.data[n*4+3]);
    if(neighbors.length>=3){const n=neighbors[0];data.set(image.data.subarray(n*4,n*4+4),p*4);}
  }
  return{data,width,height};
}
export function makePalette(data,limit){
  // Bounded color histogram keeps optional quantization practical on 4K inputs.
  const hist=new Map(),coarse=data.length>65536*4;
  for(let i=0;i<data.length;i+=4)if(data[i+3]){const key=coarse?((data[i]>>3)<<10)|((data[i+1]>>3)<<5)|(data[i+2]>>3):(data[i]<<16)|(data[i+1]<<8)|data[i+2],bin=hist.get(key)||{c:[0,0,0],count:0};for(let c=0;c<3;c++)bin.c[c]+=data[i+c];bin.count++;hist.set(key,bin);}
  let boxes=[[...hist.values()].map(b=>({c:b.c.map(v=>v/b.count),count:b.count}))].filter(b=>b.length);
  // Avoid spread calls on large images by reducing bounds explicitly.
  function range(b){const lo=[255,255,255],hi=[0,0,0];for(const p of b)for(let c=0;c<3;c++){lo[c]=Math.min(lo[c],p.c[c]);hi[c]=Math.max(hi[c],p.c[c]);}return hi.map((v,c)=>v-lo[c]);}
  while(boxes.length<limit){
    let index=-1,score=-1,channel=0;
    boxes.forEach((b,i)=>{const r=range(b),axis=r.indexOf(Math.max(...r)),s=r[axis]*Math.sqrt(b.reduce((n,p)=>n+p.count,0));if(b.length>1&&s>score){score=s;index=i;channel=axis;}});
    if(index<0)break;const box=boxes.splice(index,1)[0].sort((a,b)=>a.c[channel]-b.c[channel]),half=box.reduce((s,p)=>s+p.count,0)/2;let sum=0,split=1;
    for(let i=0;i<box.length-1;i++){sum+=box[i].count;split=i+1;if(sum>=half)break;}
    boxes.push(box.slice(0,split),box.slice(split));
  }
  return[...new Set(boxes.map(b=>{const sum=[0,0,0],n=b.reduce((s,p)=>s+p.count,0);for(const p of b)for(let c=0;c<3;c++)sum[c]+=p.c[c]*p.count;return hex(sum.map(v=>v/n));}))];
}
export function quantize(image,palette){
  if(!palette.length)return{...image,data:new Uint8ClampedArray(image.data)};
  const colors=palette.map(rgb),cache=new Map(),data=new Uint8ClampedArray(image.data);
  for(let i=0;i<data.length;i+=4)if(data[i+3]){const key=(data[i]<<16)|(data[i+1]<<8)|data[i+2];let best=cache.get(key);if(!best){const source=data.subarray(i,i+3);best=colors.reduce((a,b)=>distance(source,a)<=distance(source,b)?a:b);cache.set(key,best);}data.set(best,i);}
  return{...image,data};
}
export function trimImage(image){
  const {width,height,data}=image;let left=width,top=height,right=-1,bottom=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  if(right<0)return{data:new Uint8ClampedArray(4),width:1,height:1};
  const w=right-left+1,h=bottom-top+1,out=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)out.set(data.subarray(((top+y)*width+left)*4,((top+y)*width+left+w)*4),y*w*4);return{data:out,width:w,height:h};
}
export function reduceLevels(image,levels=256){
  if(!Number.isInteger(levels)||levels<2||levels>256)throw new Error('色階需為 2–256。');
  if(levels===256)return image;
  const lut=Uint8Array.from({length:256},(_,v)=>Math.round(Math.round(v*(levels-1)/255)*255/(levels-1)));
  const data=new Uint8ClampedArray(image.data);
  for(let i=0;i<data.length;i+=4)for(let c=0;c<3;c++)data[i+c]=lut[data[i+c]];
  return{...image,data};
}
export function processImage(source,o){
  let image=reduceLevels(sampleGrid(source,o),o.levels??256);
  if(o.holes>0)image=fillHoles(image,o.holes);
  if(o.gaps)image=closeGaps(image);
  if(!o.paletteMode||o.paletteMode==='none'){
    const colors=countColors(image.data),preview=new Set();for(let i=0;i<image.data.length&&preview.size<128;i+=4)if(image.data[i+3])preview.add(hex([...image.data.subarray(i,i+3)]));
    return{...image,palette:[...preview],paletteTotal:colors,paletteComplete:colors<=128,colors};
  }
  const palette=o.paletteMode==='auto'?makePalette(image.data,o.colors):o.paletteMode==='custom'?o.custom:palettes[o.paletteMode];
  if(!palette)throw new Error('請選擇有效的色盤。');
  image=quantize(image,palette);
  return{...image,palette,colors:countColors(image.data)};
}
