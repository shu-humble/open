import assert from 'node:assert/strict';
import {detectGrid,removeBackground,backgroundColor,sampleGrid,fillHoles,closeGaps,quantize,makePalette,trimImage,countColors,processImage,palettes,hex} from '../pixel-studio/core.mjs';
function image(w,h,fn){const data=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++)data.set(fn(x,y),(y*w+x)*4);return{width:w,height:h,data};}
const tiled=image(64,72,(x,y)=>[(Math.floor(x/4)%2)*180+30,(Math.floor(y/6)%2)*160+40,50,255]);
const grid=detectGrid(tiled);assert.equal(grid.x.size,4);assert.equal(grid.y.size,6);assert.equal(grid.x.offset,0);assert.equal(grid.y.offset,0);
const offset=image(67,75,(x,y)=>[(Math.floor((x+1)/4)%2)*180+30,(Math.floor((y+2)/6)%2)*160+40,50,255]);
const shifted=detectGrid(offset);assert.equal(shifted.x.size,4);assert.equal(shifted.x.offset,3);assert.equal(shifted.y.size,6);assert.equal(shifted.y.offset,4);
const original=new Uint8ClampedArray(tiled.data),small=sampleGrid(tiled,{sizeX:4,sizeY:6,method:'dominant'});assert.equal(small.width,16);assert.equal(small.height,12);assert.deepEqual(tiled.data,original);
assert.equal(countColors(small.data),4);assert.throws(()=>sampleGrid(tiled,{sizeX:0,sizeY:2}));assert.throws(()=>sampleGrid(tiled,{sizeX:2,sizeY:2,offsetX:64}));
console.log('PASS: grid pitch/offset detection, non-square cells, one-color sampling and immutable source.');
const ring=image(7,7,(x,y)=>x>=1&&x<=5&&y>=1&&y<=5&&!(x===3&&y===3)?[160,70,30,255]:[240,240,240,255]);
assert.equal(backgroundColor(ring),'#f0f0f0');const cut=removeBackground(ring,'#f0f0f0',0,true);assert.equal(cut.data[3],0);assert.equal(cut.data[(3*7+3)*4+3],255);
const global=removeBackground(ring,'#f0f0f0',0,false);assert.equal(global.data[(3*7+3)*4+3],0);assert.equal(ring.data[3],255);
const filled=fillHoles(global,1);assert.equal(filled.data[(3*7+3)*4+3],255);assert.equal(filled.data[3],0);assert.equal(fillHoles(global,0).data[(3*7+3)*4+3],0);
const notch=image(5,5,(x,y)=>((y===1&&x===2)||(y===2&&(x===1||x===3)))?[100,20,0,255]:[0,0,0,0]);assert.equal(closeGaps(notch).data[(2*5+2)*4+3],255);assert.equal(closeGaps(notch).data[3],0);
console.log('PASS: connected/global background removal, foreground protection, bounded hole and outline repair.');
const transparent=image(3,4,()=>[0,0,0,0]);assert.deepEqual(makePalette(transparent.data,16),[]);assert.equal(countColors(quantize(transparent,[]).data),0);assert.equal(trimImage(transparent).width,1);
const varied=image(80,80,(x,y)=>[(x*3)%256,(y*3)%256,(x+y)%256,(x===0||y===0)?0:255]);const pal=makePalette(varied.data,16);assert.ok(pal.length<=16);const reduced=quantize(varied,pal);assert.ok(countColors(reduced.data)<=16);assert.equal(reduced.data[3],0);
for(const mode of ['db16','pico8']){const q=quantize(varied,palettes[mode]);for(let i=0;i<q.data.length;i+=4)if(q.data[i+3])assert.ok(palettes[mode].includes(hex([...q.data.subarray(i,i+3)])));}
const trimmed=trimImage(global);assert.equal(trimmed.width,5);assert.equal(trimmed.height,5);assert.equal(trimmed.data[(2*5+2)*4+3],0);
const options={sizeX:1,sizeY:1,offsetX:0,offsetY:0,method:'dominant',coverage:35,remove:true,background:'#f0f0f0',tolerance:0,connected:false,holes:1,gaps:false,paletteMode:'custom',custom:['#aa4400','#ffffff'],colors:16};const finished=processImage(ring,options);assert.ok(finished.colors<=2);assert.equal(finished.data[3],255);assert.equal(finished.data[(3*7+3)*4+3],255);assert.ok([...finished.data].filter((v,i)=>i%4===3).every(v=>v===0||v===255));
console.log('PASS: adjustable color limit, exact fixed-palette membership, transparency, crop bounds and end-to-end processing.');

// Equal-cell reconstruction: mix all colors, retain background, skip palette reduction.
const mixture=image(4,2,(x,y)=>x<2?(y===0?[255,0,0,255]:[0,0,255,255]):[240,240,240,255]);
const rebuilt=processImage(mixture,{sizeX:2,sizeY:2,paletteMode:'none'});
assert.equal(rebuilt.width,2);assert.equal(rebuilt.height,1);
assert.deepEqual([...rebuilt.data],[128,0,128,255,240,240,240,255]);
const many=image(40,1,x=>[x*6,100,200,255]);
assert.equal(processImage(many,{sizeX:1,sizeY:1,paletteMode:'none'}).colors,40);
const alphaMix=image(2,1,x=>x?[0,0,255,0]:[255,0,0,255]);
assert.deepEqual([...sampleGrid(alphaMix,{sizeX:2,sizeY:1}).data],[255,0,0,128]);
assert.equal(processImage(mixture,{sizeX:2,sizeY:2,paletteMode:'none',remove:true}).data[7],255);
console.log('PASS: exact per-cell color averages, equal output grid, retained opaque background, no default 16-color reduction and alpha-weighted averaging.');
