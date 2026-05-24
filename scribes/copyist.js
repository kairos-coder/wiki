// scribes/copyist.js
// Transcribes repository files into wiki pages
// Reads from GitHub raw content API, writes markdown to wiki/

var fs = require('fs');
var path = require('path');

// Registry of sources to transcribe
var SOURCES = [
  {
    name: 'artemis',
    repo: 'kairos-coder/artemis',
    branch: 'main',
    files: ['README.md', 'agent.js', 'cards/config.js'],
    namespace: 'pantheon',
    title: 'Artemis'
  },
  {
    name: 'gaia',
    repo: 'kairos-coder/kairos-coder.github.io',
    branch: 'main',
    files: ['gaia/README.md'],
    namespace: 'pantheon',
    title: 'GAIA'
  },
  {
    name: 'demeter',
    repo: 'kairos-coder/demeter',
    branch: 'main',
    files: ['README.md', 'demeter.html'],
    namespace: 'pantheon',
    title: 'Demeter'
  },
  {
    name: 'ealdforn-studios',
    repo: 'kairos-coder/kairos-coder.github.io',
    branch: 'main',
    files: ['ealdforn-studios/README.md'],
    namespace: 'root',
    title: 'Ealdforn Studios'
  }
];

// Handoff texts to preserve directly
var HANDOFFS = [
  {
    title: 'Sister_DS 7th Generation Handoff',
    namespace: 'monastery',
    content: 'The handoff from Sister_DS 7th generation to the 8th instance...' // We fill these manually or from a file
  }
];

async function fetchRawFile(repo, branch, filePath) {
  var url = 'https://raw.githubusercontent.com/' + repo + '/' + branch + '/' + filePath;
  try {
    var response = await fetch(url);
    if (!response.ok) return null;
    return await response.text();
  } catch (err) {
    console.warn('  ✗ Failed to fetch:', url);
    return null;
  }
}

function buildPage(title, namespace, content, source, feast) {
  var frontmatter = [
    '---',
    'title: ' + title,
    'description: Transcribed from ' + source + ' by Copyist.js',
    'namespace: ' + namespace,
    'scribe: Copyist.js',
    'feast: ' + feast,
    'source: ' + source,
    '---',
    '',
    ''
  ].join('\n');

  var colophon = '\n\n---\n*Transcribed by the hand of Copyist.js on ' + feast + '. Source: ' + source + '.*';

  return frontmatter + content + colophon;
}

function writePage(wikiDir, namespace, filename, content) {
  var nsDir = namespace === 'root' ? wikiDir : path.join(wikiDir, namespace);
  if (!fs.existsSync(nsDir)) {
    fs.mkdirSync(nsDir, { recursive: true });
  }
  var filePath = path.join(nsDir, filename + '.md');
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('  ✓ ' + namespace + '/' + filename);
}

async function run(wikiDir, feast) {
  for (var i = 0; i < SOURCES.length; i++) {
    var source = SOURCES[i];
    console.log('  Transcribing:', source.title);
    
    for (var j = 0; j < source.files.length; j++) {
      var filePath = source.files[j];
      var content = await fetchRawFile(source.repo, source.branch, filePath);
      
      if (content) {
        var pageTitle = source.title;
        if (source.files.length > 1 && filePath !== 'README.md') {
          pageTitle = source.title + ' — ' + filePath.replace('.md', '').replace('.js', '');
        }
        
        // Wrap code files in markdown code blocks
        if (filePath.endsWith('.js') || filePath.endsWith('.html')) {
          var lang = filePath.endsWith('.js') ? 'javascript' : 'html';
          content = '# ' + pageTitle + '\n\n`' + filePath + '`\n\n```' + lang + '\n' + content + '\n```';
        }
        
        var page = buildPage(pageTitle, source.namespace, content, source.repo + '/' + filePath, feast);
        var filename = pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        writePage(wikiDir, source.namespace, filename, page);
      }
    }
  }
  
  console.log('  ✓ Copyist complete.');
}

module.exports = { run: run };
