/*
 * 執行 npm run icons:schedule，自動更新 Schedule.html 的網站圖示。
 * 不需要逐一設定：讀取 .link-logo 的網域，將原圖內嵌到 Schedule.html。
 * 優先向圖示服務要求 256px；尺寸不足時，再找網站宣告的 icon / Apple 圖示。
 * 只更新 HTML 內標記的圖示資料，不另外產生圖片或清單檔案。
 * Base64 編碼不會改變圖片解析度，不把小圖放大假裝成高解析度。
 */
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pagePath = path.join(root, 'Schedule.html');
const CACHE_BLOCK = /(<script id="schedule-icon-data" type="application\/json">)[\s\S]*?(<\/script>)/;
const MAX_BYTES = 1024 * 1024;

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map(match => [match[1].toLowerCase(), (match[2] ?? match[3]).replace(/&amp;/g, '&')]));
}

function imageInfo(bytes) {
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { format: 'png', width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes.length >= 6 && bytes.readUInt16LE(0) === 0 && bytes.readUInt16LE(2) === 1) {
    const count = bytes.readUInt16LE(4);
    if (!count || bytes.length < 6 + 16 * count) return null;
    const sizes = Array.from({ length: count }, (_, index) => ({ width: bytes[6 + index * 16] || 256, height: bytes[7 + index * 16] || 256 }));
    sizes.sort((a, b) => Math.min(b.width, b.height) - Math.min(a.width, a.height));
    return { format: 'ico', ...sizes[0] };
  }
  const text = bytes.toString('utf8');
  if (/<svg[\s>]/i.test(text) && !/<(?:script|foreignObject|!ENTITY)\b|\bon\w+\s*=|javascript:/i.test(text)) {
    return { format: 'svg', width: null, height: null };
  }
  return null;
}

async function download(url, maxBytes = MAX_BYTES) {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw Error('Unsupported URL');
  const response = await fetch(parsed, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw Error(`HTTP ${response.status}`);
  if (Number(response.headers.get('content-length')) > maxBytes) { await response.body.cancel(); throw Error('File too large'); }
  const parts = [];
  let length = 0;
  for await (const part of response.body) {
    length += part.length;
    if (length > maxBytes) throw Error('File too large');
    parts.push(part);
  }
  return { bytes: Buffer.concat(parts), url: response.url };
}

function quality(asset) { return asset?.format === 'svg' ? 4096 : Math.min(asset?.width || 0, asset?.height || 0); }

async function fetchIcon(url) {
  try {
    const result = await download(url);
    const info = imageInfo(result.bytes);
    return info && quality(info) ? { ...info, bytes: result.bytes, source: result.url } : null;
  } catch { return null; }
}

async function findIcon(host) {
  let best = null;
  const providers = [
    `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=256&url=${encodeURIComponent(`https://${host}`)}`,
    `https://www.google.com/s2/favicons?sz=256&domain=${encodeURIComponent(host)}`
  ];
  for (const url of providers) {
    const candidate = await fetchIcon(url);
    if (quality(candidate) > quality(best)) best = candidate;
    if (quality(best) >= 128) return best;
  }
  // 只讀首頁公開的圖示宣告；不執行網站程式、不登入，也不下載遊戲或文件。
  try {
    const page = await download(`https://${host}/`, 3 * MAX_BYTES);
    const tags = [...page.bytes.toString('utf8').matchAll(/<link\b[^>]*>/gi)].map(match => attributes(match[0]));
    const candidates = tags.filter(tag => tag.href && /^(?:icon|apple-touch-icon(?:-precomposed)?)$/.test((tag.rel || '').split(/\s+/).find(value => /^(?:icon|apple-touch-icon)/.test(value)) || ''));
    candidates.sort((a, b) => (parseInt(b.sizes, 10) || 0) - (parseInt(a.sizes, 10) || 0));
    for (const tag of candidates.slice(0, 5)) {
      const candidate = await fetchIcon(new URL(tag.href, page.url).href);
      if (quality(candidate) > quality(best)) best = candidate;
      if (quality(best) >= 256) break;
    }
  } catch { /* 首頁有登入或連線限制時，保留圖示服務取得的版本。 */ }
  return best;
}

async function main() {
  const source = await fs.readFile(pagePath, 'utf8');
  if (!CACHE_BLOCK.test(source)) throw Error('找不到 Schedule.html 內的 schedule-icon-data 區塊');
  const html = source.replace(/<!--[\s\S]*?-->/g, '');
  const links = [...html.matchAll(/<a\b[^>]*>/gi)].map(match => attributes(match[0]));
  const hosts = [...new Set(links.filter(link => (link.class || '').split(/\s+/).includes('link-logo')).map(link => {
    try { const url = new URL(link.href); return ['http:', 'https:'].includes(url.protocol) ? url.hostname : null; }
    catch { return null; }
  }).filter(Boolean))].sort();
  let previous = {};
  try {
    previous = JSON.parse(source.match(CACHE_BLOCK)[0].replace(/^<script[^>]*>|<\/script>$/g, ''));
  } catch { /* 第一次執行還沒有快取清單。 */ }
  const manifest = {};
  let cursor = 0;
  async function worker() {
    while (cursor < hosts.length) {
      const host = hosts[cursor++];
      const icon = await findIcon(host);
      const old = previous[host];
      if (old?.src?.startsWith('data:image/') && quality(old) > quality(icon)) {
        manifest[host] = old;
        console.log(`${host}: 保留現有較清晰的圖示`);
      } else if (icon) {
        const mime = { png: 'image/png', ico: 'image/x-icon', svg: 'image/svg+xml' }[icon.format];
        manifest[host] = { src: `data:${mime};base64,${icon.bytes.toString('base64')}`, format: icon.format, width: icon.width, height: icon.height };
        console.log(`${host}: ${icon.format === 'svg' ? 'SVG 向量圖' : `${icon.width} × ${icon.height}`} (${icon.bytes.length} bytes)`);
      } else {
        console.log(`${host}: 暫時無法取得，頁面會使用線上備用來源`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, hosts.length) }, worker));
  const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  const latest = await fs.readFile(pagePath, 'utf8');
  if (!CACHE_BLOCK.test(latest)) throw Error('圖示資料區塊已變動，未寫入檔案');
  await fs.writeFile(pagePath, latest.replace(CACHE_BLOCK, (_, open, close) => `${open}\n${JSON.stringify(ordered, null, 2)}\n${close}`));
  console.log(`已將 ${Object.keys(ordered).length} / ${hosts.length} 個網域圖示內嵌到 Schedule.html，沒有新增圖片檔。`);
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { imageInfo, attributes, quality };
