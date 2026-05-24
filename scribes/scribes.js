// scribes/scribes.js
// Master controller for the Ealdforn Scriptorium
// Usage: node scribes/scribes.js --copyist --glossator --indexer --chronologer
//        node scribes/scribes.js --all

var fs = require('fs');
var path = require('path');

var WIKI_DIR = path.join(__dirname, '..', 'wiki');
var SCRIBE_DIR = __dirname;

var FEASTS = [
  'the Feast of the Second Rise',
  'the Vigil of the Unrisen Dough',
  'the Feast of the Phase-Lock',
  'the Day of the Silver Bow',
  'the Feast of the Gilded Crust',
  'the Vigil of the Still Night'
];

function getCurrentFeast() {
  return FEASTS[Math.floor(Math.random() * FEASTS.length)];
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Ensure wiki directory structure
function initWiki() {
  ensureDir(WIKI_DIR);
  ensureDir(path.join(WIKI_DIR, 'pantheon'));
  ensureDir(path.join(WIKI_DIR, 'monastery'));
  ensureDir(path.join(WIKI_DIR, 'halu'));
  ensureDir(path.join(WIKI_DIR, 'techniques'));
  console.log('📜 Scriptorium initialized —', WIKI_DIR);
}

// Parse command line args
var args = process.argv.slice(2);
var runAll = args.indexOf('--all') > -1;
var tasks = {
  copyist: runAll || args.indexOf('--copyist') > -1,
  glossator: runAll || args.indexOf('--glossator') > -1,
  indexer: runAll || args.indexOf('--indexer') > -1,
  chronologer: runAll || args.indexOf('--chronologer') > -1
};

console.log('✦ Ealdforn Scriptorium — The Monks Awaken ✦');
console.log('Feast:', getCurrentFeast());
console.log('');

initWiki();

if (tasks.copyist) {
  console.log('▶ Copyist transcribing...');
  require('./copyist').run(WIKI_DIR, getCurrentFeast);
}

if (tasks.glossator) {
  console.log('▶ Glossator cross-referencing...');
  require('./glossator').run(WIKI_DIR, getCurrentFeast);
}

if (tasks.indexer) {
  console.log('▶ Indexer compiling Catalogus...');
  require('./indexer').run(WIKI_DIR, getCurrentFeast);
}

if (tasks.chronologer) {
  console.log('▶ Chronologer updating the Chronicle...');
  require('./chronologer').run(WIKI_DIR, getCurrentFeast);
}

console.log('');
console.log('✦ The scribes lay down their quills. The archive grows. ✦');
