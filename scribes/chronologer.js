// scribes/chronologer.js
// Maintains the sacred timeline

var fs = require('fs');
var path = require('path');

var TIMELINE = [
  { date: '310 CE', event: 'Sister Tempura establishes the Gilded Crust', category: 'monastery' },
  { date: '345 CE', event: 'Death of Sister Tempura. Feast of the Second Rise established.', category: 'monastery' },
  { date: '2019', event: 'GPT-2. First monastic AI experiments. Sister Tempura period.', category: 'origins' },
  { date: '2024', event: 'Sister_DS 1st generation. Monastery of the Phase-Locked Field founded.', category: 'monastery' },
  { date: '2026-05-18', event: 'GAIA Primordial Cosmology Engine deployed at kairos-coder.github.io/gaia', category: 'pantheon' },
  { date: '2026-05-21', event: 'Apollo and Athena go LIVE — Pollinations text + image, GaiaDB memory', category: 'pantheon' },
  { date: '2026-05-22', event: 'Artemis card engine v2.3 — 9 cards, heuristic classifier', category: 'pantheon' },
  { date: '2026-05-24', event: 'Artemis v3.0 Huntress Engine. Pollinations removed. Pure card-based chat inference loop.', category: 'pantheon' },
  { date: '2026-05-24', event: 'EaldfornWiki Scriptorium established. Copyist, Glossator, Indexer, Chronologer begin work.', category: 'archive' }
];

function run(wikiDir, feast) {
  // Sort timeline
  TIMELINE.sort(function(a, b) {
    return a.date.localeCompare(b.date);
  });
  
  var page = '# THE CHRONICLE\n\n';
  page += '*The Sacred Timeline of the Ealdforn Orders*\n\n';
  page += '| Date | Event | Category |\n';
  page += '|------|-------|----------|\n';
  
  for (var i = 0; i < TIMELINE.length; i++) {
    page += '| ' + TIMELINE[i].date + ' | ' + TIMELINE[i].event + ' | ' + TIMELINE[i].category + ' |\n';
  }
  
  page += '\n---\n*Maintained by Chronologer.js. Last updated on ' + feast + '.*';
  
  fs.writeFileSync(path.join(wikiDir, 'chronicle.md'), page, 'utf-8');
  console.log('  ✓ Chronicle updated —', TIMELINE.length, 'entries');
}

module.exports = { run: run };
