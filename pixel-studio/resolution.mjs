export const MAX_SOURCE_EDGE=8192;
export const MAX_SOURCE_PIXELS=33554432;
export const MAX_GRID_EDGE=4096;
export const MAX_GRID_PIXELS=16777216;
export function densityPlan(width,height,longEdge){
  const max=Math.min(MAX_GRID_EDGE,Math.max(width,height));
  if(!Number.isInteger(longEdge)||longEdge<1||longEdge>max)throw new Error('色塊密度超出這張圖片的可用範圍。');
  const cell=Math.max(width,height)/longEdge;
  const columns=Math.max(1,Math.ceil(width/cell-1e-9)),rows=Math.max(1,Math.ceil(height/cell-1e-9));
  return{width:columns,height:rows,cell,count:columns*rows,maxLongEdge:max};
}
export function checkSourceSize(width,height){
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)throw new Error('無法讀取媒體解析度。');
  if(width>MAX_SOURCE_EDGE||height>MAX_SOURCE_EDGE||width*height>MAX_SOURCE_PIXELS)throw new Error('圖片超過本工具上限（每邊 8192 px、3200 萬像素）。4K 可原尺寸讀取，請先縮小更大的圖片。');
}
export function exportPlan(image,source,grid,mode,trim=false){
  let width,height,drawWidth,drawHeight;
  if(mode==='source'){
    const cellX=grid?.sizeX||1,cellY=grid?.sizeY||1;
    drawWidth=image.width*cellX;drawHeight=image.height*cellY;
    width=trim?Math.min(drawWidth,source.width-(grid?.offsetX||0)):source.width-(grid?.offsetX||0);
    height=trim?Math.min(drawHeight,source.height-(grid?.offsetY||0)):source.height-(grid?.offsetY||0);
  }else if(mode==='4k'){
    const scale=3840/Math.max(image.width,image.height);width=Math.max(1,Math.round(image.width*scale));height=Math.max(1,Math.round(image.height*scale));drawWidth=width;drawHeight=height;
  }else{
    const scale=Number(mode);if(![1,4,8,16,32].includes(scale))throw new Error('請選擇有效的輸出尺寸。');
    width=drawWidth=image.width*scale;height=drawHeight=image.height*scale;
  }
  if(width>8192||height>8192||width*height>16777216)throw new Error('輸出超過上限（每邊 8192 px、1600 萬像素），請降低倍率或改用 4K 尺寸。');
  return{width,height,drawWidth,drawHeight};
}
