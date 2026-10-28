import {detectGrid,processImage,countColors} from './core.mjs';
self.onmessage=({data:{id,task,image,options}})=>{
  try{const result=task==='detect'?{grid:detectGrid(image),colors:countColors(image.data)}:processImage(image,options);self.postMessage({id,result},result.data?[result.data.buffer]:[]);}
  catch(error){self.postMessage({id,error:error.message});}
};
