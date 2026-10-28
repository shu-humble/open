export const IMAGE_LIMIT=128*1024*1024,MEDIA_LIMIT=150*1024*1024;
export function mediaUrl(value){
  let url;try{url=new URL(value.trim());}catch{throw new Error('請貼上完整的圖片或 MP4 直連網址。');}
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error('連結只接受不含帳號密碼的 HTTP／HTTPS 網址。');
  return url;
}
export function inspectMedia(bytes,name='',type=''){
  const ascii=(a,b)=>String.fromCharCode(...bytes.slice(a,b));
  if(bytes[0]===255&&bytes[1]===216)return{kind:'image',mime:'image/jpeg',label:/\.ajpg$/i.test(name)?'JPEG（AJPG 副檔名）':'JPEG',animated:false};
  if(ascii(0,6)==='GIF87a'||ascii(0,6)==='GIF89a')return{kind:'image',mime:'image/gif',label:'GIF',animated:true};
  if(bytes[0]===137&&ascii(1,4)==='PNG'){
    let animated=false;for(let i=8;i+12<=bytes.length;){const len=(bytes[i]*16777216)+(bytes[i+1]<<16)+(bytes[i+2]<<8)+bytes[i+3],chunk=ascii(i+4,i+8);if(chunk==='acTL'){animated=true;break;}if(chunk==='IDAT'||len<0)break;i+=len+12;}
    return{kind:'image',mime:'image/png',label:animated?'APNG':'PNG',animated};
  }
  if(ascii(4,8)==='ftyp')return{kind:'video',mime:'video/mp4',label:'MP4',animated:true};
  if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP')return{kind:'image',mime:'image/webp',label:'WebP',animated:true};
  if(ascii(0,2)==='BM')return{kind:'image',mime:'image/bmp',label:'BMP',animated:false};
  if(/<svg[\s>]/i.test(new TextDecoder().decode(bytes.slice(0,4096))))return{kind:'image',mime:'image/svg+xml',label:'SVG',animated:false};
  if(type==='image/avif')return{kind:'image',mime:type,label:'AVIF',animated:true};
  throw new Error(/\.ajpg$/i.test(name)?'這個 AJPG 的內容不是可辨識的 JPEG。若指動態 PNG，請改用 APNG；也可轉成 GIF 或 MP4。':'檔案內容無法辨識。請使用 JPG、PNG、GIF、APNG、WebP、BMP、SVG 或 MP4 直連檔案。');
}
export async function readRemote(url,{fetcher=fetch,signal}={}){
  const response=await fetcher(mediaUrl(url).href,{signal,credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw new Error(`來源回應 ${response.status}，請確認連結能直接開啟媒體。`);
  if(Number(response.headers.get('content-length'))>MEDIA_LIMIT)throw new Error('檔案超過 150 MB，請先縮小檔案。');
  const chunks=[];let size=0;
  if(response.body){const reader=response.body.getReader();try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MEDIA_LIMIT){await reader.cancel();throw new Error('檔案超過 150 MB，已停止下載。');}chunks.push(value);}}finally{reader.releaseLock();}}
  else{const bytes=new Uint8Array(await response.arrayBuffer());if(bytes.length>MEDIA_LIMIT)throw new Error('檔案超過 150 MB。');chunks.push(bytes);}
  return new Blob(chunks,{type:response.headers.get('content-type')?.split(';')[0]||''});
}
