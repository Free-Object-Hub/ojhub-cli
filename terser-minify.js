// build.js — node build.js <папка версии>
// скрипт который сжимает код object hub до бандла
// впервые за всю историю object hub я навайбкодил сборщик
// а не писал свой AST парсер

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { minify } = require('terser');

// Порядок обязателен
const ORDER = ['newHelper.js', 'nhConfig.js', 'ojhub.js'];

(async () => {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node build.js <dir>'); process.exit(1); }

  const parts = ORDER.map(name => {
    const p = path.join(dir, name);
    if (!fs.existsSync(p)) { console.error('нет файла: ' + p); process.exit(1); }
    return fs.readFileSync(p, 'utf8');
  });

  // ';' между файлами, чтобы склейка не ломалась на ASI
  const src = parts.join('\n;\n');

  const out = await minify(src, {
    ecma: 2017,                 // потолок ES8
    toplevel: false,            // глобальные имена не трогаем
    compress: { toplevel: false },
    mangle: { toplevel: false },
    format: { comments: false },
  });
  if (out.error) { console.error(out.error); process.exit(1); }

  const dst = path.join(dir, 'core.min.js');
  fs.writeFileSync(dst, out.code);

  const raw = Buffer.byteLength(src);
  const min = Buffer.byteLength(out.code);
  const gz = zlib.gzipSync(out.code).length;
  console.log(`${dst}: ${raw} -> ${min} (gzip ${gz})`);
})();
