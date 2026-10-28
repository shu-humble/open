import assert from 'node:assert/strict';
import {processImage,countColors,makePalette} from '../pixel-studio/core.mjs';
import {checkSourceSize,exportPlan,densityPlan} from '../pixel-studio/resolution.mjs';
for(const [w,h] of [[3840,2160],[2160,3840],[4096,2160],[4096,4096]])checkSourceSize(w,h);
assert.throws(()=>checkSourceSize(9000,2160),/上限/);
const width=3840,height=2160,data=new Uint8ClampedArray(width*height*4);
for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=(y*width+x)*4;data[p]=x%256;data[p+1]=y%256;data[p+2]=(x+y)%256;data[p+3]=255;}
const source={width,height,data},start=performance.now();
const native=processImage(source,{sizeX:1,sizeY:1,paletteMode:'none'});
assert.equal(native.width,3840);assert.equal(native.height,2160);assert.equal(native.data.length,width*height*4);assert.equal(native.colors,65536);assert.equal(native.palette.length,128);assert.equal(native.paletteComplete,false);
assert.deepEqual(native.data.subarray(-16),data.subarray(-16));assert.equal(countColors(data),65536);
const grid={sizeX:4,sizeY:4,offsetX:0,offsetY:0},blocks=processImage(source,{...grid,paletteMode:'none'});
assert.equal(blocks.width,960);assert.equal(blocks.height,540);assert.deepEqual([...blocks.data.subarray(0,4)],[2,2,3,255]);
assert.deepEqual(exportPlan(blocks,source,grid,'source'),{width:3840,height:2160,drawWidth:3840,drawHeight:2160});
assert.deepEqual(exportPlan(blocks,source,grid,'4k'),{width:3840,height:2160,drawWidth:3840,drawHeight:2160});
assert.deepEqual(exportPlan({width:549,height:309},source,{sizeX:7,sizeY:7},'source'),{width:3840,height:2160,drawWidth:3843,drawHeight:2163});
assert.equal(exportPlan({width:2160,height:3840},{width:2160,height:3840},{sizeX:1,sizeY:1},'source').height,3840);
assert.equal(exportPlan({width:4096,height:4096},{width:4096,height:4096},{sizeX:1,sizeY:1},'source').width,4096);
assert.throws(()=>exportPlan(native,source,{sizeX:1,sizeY:1},'32'),/上限/);
assert.ok(makePalette(blocks.data,16).length<=16);
assert.equal(source.data[3],255);
console.log(`PASS: actual 3840x2160 pixel buffers, full-resolution 1px grid, 4px block averages, bounded palette memory, UHD/DCI/portrait/square 4K sizes, source-size and 4K export plans, partial edge crop and oversized-export rejection (${Math.round(performance.now()-start)} ms).`);

const max=densityPlan(3840,2160,3840),next=densityPlan(3840,2160,3839);
assert.equal(max.count,8294400);assert.equal(next.count,8292240);assert.ok(next.count/max.count>.99);
let previous=0;for(let level=1;level<=3840;level++){const plan=densityPlan(3840,2160,level);assert.ok(plan.count>=previous);previous=plan.count;}
const highest=processImage(source,{gridLongEdge:3840,paletteMode:'none'});
assert.deepEqual(highest.data.subarray(0,128),data.subarray(0,128));assert.deepEqual(highest.data.subarray(-128),data.subarray(-128));assert.equal(highest.width,3840);
const ramp={width:4,height:2,data:new Uint8ClampedArray([0,0,0,255,120,0,0,255,240,0,0,255,0,0,0,255,0,0,0,255,120,0,0,255,240,0,0,255,0,0,0,255])};
const smooth=processImage(ramp,{gridLongEdge:3,paletteMode:'none'});assert.equal(smooth.width,3);assert.equal(smooth.height,2);assert.deepEqual([smooth.data[0],smooth.data[4],smooth.data[8]],[30,180,60]);
const restored=processImage(source,{gridLongEdge:3840,paletteMode:'none'});assert.deepEqual(restored.data.subarray(-64),data.subarray(-64));
console.log('PASS: full-detail maximum, gradual monotonic block-count reduction, exact fractional-cell area averaging and lossless return to maximum.');
