// ═══ SCRIBE: COPYIST (v2 — GitHub API discovery) ═══
var SOURCES = [
  { id: 'artemis', name: 'Artemis', repo: 'kairos-coder/artemis', branch: 'main', namespace: 'pantheon' },
  { id: 'apollo', name: 'Apollo', repo: 'kairos-coder/apollo', branch: 'main', namespace: 'pantheon' },
  { id: 'athena', name: 'Athena', repo: 'kairos-coder/athena', branch: 'main', namespace: 'pantheon' },
  { id: 'demeter', name: 'Demeter', repo: 'kairos-coder/demeter', branch: 'main', namespace: 'pantheon' },
  { id: 'gaia', name: 'GAIA', repo: 'kairos-coder/kairos-coder.github.io', branch: 'main', namespace: 'pantheon' },
  { id: 'zeus', name: 'Zeus', repo: 'kairos-coder/zeus', branch: 'main', namespace: 'pantheon' },
  { id: 'hera', name: 'Hera', repo: 'kairos-coder/hera', branch: 'main', namespace: 'pantheon' },
  { id: 'poseidon', name: 'Poseidon', repo: 'kairos-coder/poseidon', branch: 'main', namespace: 'pantheon' },
  { id: 'hephaestus', name: 'Hephaestus', repo: 'kairos-coder/hephaestus', branch: 'main', namespace: 'pantheon' },
  { id: 'aphrodite', name: 'Aphrodite', repo: 'kairos-coder/aphrodite', branch: 'main', namespace: 'pantheon' },
  { id: 'ares', name: 'Ares', repo: 'kairos-coder/ares', branch: 'main', namespace: 'pantheon' },
  { id: 'hermes', name: 'Hermes', repo: 'kairos-coder/hermes', branch: 'main', namespace: 'pantheon' },
  { id: 'persephone', name: 'Persephone', repo: 'kairos-coder/persephone', branch: 'main', namespace: 'pantheon' }
];

// Files worth transcribing (by extension or name)
var TRANSCRIBE_EXTENSIONS = ['.md', '.js', '.html', '.css', '.json'];
var TRANSCRIBE_NAMES = ['README.md', 'agent.js', 'config.js', 'index.html', 'chat.html', 'domain.html', 'library.html'];
var SKIP_PATTERNS = ['node_modules', '.git', 'package-lock.json', '.DS_Store', 'LICENSE'];

function isTranscribable(filename) {
  // Skip hidden files and common junk
  for (var i = 0; i < SKIP_PATTERNS.length; i++) {
    if (filename.indexOf(SKIP_PATTERNS[i]) > -1) return false;
  }
  
  // Transcribe known important names
  var base = filename.split('/').pop();
  for (var j = 0; j < TRANSCRIBE_NAMES.length; j++) {
    if (base === TRANSCRIBE_NAMES[j]) return true;
  }
  
  // Transcribe by extension
  for (var k = 0; k < TRANSCRIBE_EXTENSIONS.length; k++) {
    if (filename.endsWith(TRANSCRIBE_EXTENSIONS[k])) return true;
  }
  
  return false;
}

function getLanguage(filename) {
  if (filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.md')) return 'markdown';
  return '';
}

// Fetch the full file tree from GitHub API
async function fetchRepoTree(repo, branch) {
  var url = 'https://api.github.com/repos/' + repo + '/git/trees/' + branch + '?recursive=1';
  
  try {
    var response = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    
    if (!response.ok) {
      // Fallback: try the contents API on root
      return await fetchRepoContents(repo, branch, '');
    }
    
    var data = await response.json();
    if (data.tree) {
      return data.tree
        .filter(function(item) { return item.type === 'blob'; })
        .map(function(item) { return item.path; });
    }
    return [];
  } catch (err) {
    // Fallback for rate limiting or network issues
    terminalPrint('    ⚠ GitHub API unavailable — trying raw URLs for known files', 'warn');
    return null;
  }
}

// Fallback: list a single directory
async function fetchRepoContents(repo, branch, dir) {
  var url = 'https://api.github.com/repos/' + repo + '/contents/' + dir + '?ref=' + branch;
  
  try {
    var response = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!response.ok) return [];
    var data = await response.json();
    if (!Array.isArray(data)) return [];
    
    var files = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].type === 'file') files.push(data[i].path);
      else if (data[i].type === 'dir') {
        var subFiles = await fetchRepoContents(repo, branch, data[i].path);
        files = files.concat(subFiles);
      }
    }
    return files;
  } catch (err) {
    return [];
  }
}

async function runCopyist(args) {
  if (args[0] === '--list') {
    terminalPrint('Registered Olympian repositories:', 'result');
    for (var i = 0; i < SOURCES.length; i++) {
      terminalPrint('  <span class="cmd">' + SOURCES[i].id + '</span> — ' + SOURCES[i].name + ' (' + SOURCES[i].repo + ')', '');
    }
    return;
  }

  var targets = [];
  if (args[0] === '--all' || args.length === 0) {
    targets = SOURCES;
  } else {
    for (var i = 0; i < args.length; i++) {
      var found = SOURCES.find(function(s) { return s.id === args[i]; });
      if (found) targets.push(found);
      else terminalPrint('Unknown source: <span class="warn">' + args[i] + '</span>', 'warn');
    }
  }

  if (targets.length === 0) {
    terminalPrint('No sources to transcribe. <span class="cmd">scribe copyist --list</span>', 'warn');
    return;
  }

  var feast = getFeast();
  terminalPrint('✦ <span class="scribe-name">Copyist</span> begins transcribing on ' + feast + '...', 'result');
  terminalPrint('');

  var allTranscribed = [];

  for (var t = 0; t < targets.length; t++) {
    var source = targets[t];
    terminalPrint('  📁 <span class="cmd">' + source.name + '</span> (' + source.repo + ')', '');
    
    // Discover files
    var fileList = await fetchRepoTree(source.repo, source.branch);
    
    if (fileList === null || fileList.length === 0) {
      // Tree API failed — try known files as fallback
      terminalPrint('    ⚠ Cannot scan repo — trying known files', 'warn');
      fileList = ['README.md', 'index.html', 'chat.html', 'agent.js', 'config.js', 
                  'cards/config.js', 'domain.html', 'library.html', 'terminal.html'];
    }
    
    var transcribed = 0;
    var skipped = 0;
    
    for (var f = 0; f < fileList.length; f++) {
      var filePath = fileList[f];
      
      if (!isTranscribable(filePath)) {
        skipped++;
        continue;
      }
      
      var url = 'https://raw.githubusercontent.com/' + source.repo + '/' + source.branch + '/' + filePath;
      
      try {
        var response = await fetch(url);
        if (!response.ok) {
          terminalPrint('    ✗ <span class="warn">' + filePath + '</span> — ' + response.status, 'warn');
          continue;
        }
        
        var content = await response.text();
        
        // Generate page title from file path
        var parts = filePath.replace(/\.[^/.]+$/, '').split('/');
        var pageTitle = source.name;
        if (parts.length > 1 || parts[0] !== 'README') {
          var subParts = parts.slice(parts[0] === 'README' ? 0 : 0);
          var shortPath = subParts.join(' — ');
          if (shortPath && shortPath !== source.name.toLowerCase()) {
            pageTitle = source.name + ' — ' + shortPath;
          }
        }
        
        // Clean up title
        pageTitle = pageTitle.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
        pageTitle = pageTitle.split(' ').map(function(w) {
          return w.charAt(0).toUpperCase() + w.slice(1);
        }).join(' ');
        
        // Wrap code files in markdown
        var lang = getLanguage(filePath);
        if (lang && lang !== 'markdown') {
          content = '# ' + pageTitle + '\n\n`' + filePath + '`\n\n```' + lang + '\n' + content + '\n```';
        }
        
        // Generate filename for the wiki
        var filename = pageTitle.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        var fullPath = source.namespace + '/' + filename + '.md';
        
        // Frontmatter
        var frontmatter = [
          '---',
          'title: ' + pageTitle,
          'description: Transcribed from ' + source.repo + '/' + filePath,
          'namespace: ' + source.namespace,
          'scribe: Copyist',
          'feast: ' + feast,
          'source: ' + source.repo + '/' + filePath,
          '---',
          '',
          ''
        ].join('\n');
        
        var colophon = '\n\n---\n*Transcribed by the Copyist on ' + feast + '. Source: [' + source.repo + '/' + filePath + '](https://github.com/' + source.repo + '/blob/' + source.branch + '/' + filePath + ').*';
        
        allTranscribed.push({
          path: fullPath,
          content: frontmatter + content + colophon,
          title: pageTitle,
          sourceName: source.name
        });
        
        transcribed++;
        terminalPrint('    ✓ <span class="result">' + fullPath + '</span>', 'result');
        
      } catch (err) {
        terminalPrint('    ✗ <span class="error">' + filePath + '</span> — ' + err.message, 'error');
      }
    }
    
    if (transcribed === 0 && skipped > 0) {
      terminalPrint('    ○ No transcribable files found (' + skipped + ' skipped)', '');
    } else if (transcribed === 0) {
      terminalPrint('    ○ Repository is empty or unreachable', 'warn');
    }
    
    terminalPrint('');
  }

  // Generate pantheon summary page
  if (allTranscribed.length > 0) {
    var pantheonSummary = generatePantheonSummary(allTranscribed, feast);
    allTranscribed.push({
      path: 'pantheon.md',
      content: pantheonSummary,
      title: 'The Pantheon',
      sourceName: 'All'
    });
  }

  terminalPrint('✦ Copyist complete. <span class="result">' + allTranscribed.length + ' folios</span> transcribed.', 'result');
  
  if (allTranscribed.length > 0) {
    terminalPrint('');
    terminalPrint('Folios ready: <span class="cmd">display pantheon</span> to see the Pantheon summary.', '');
    
    // Group by source
    var bySource = {};
    for (var a = 0; a < allTranscribed.length; a++) {
      var sn = allTranscribed[a].sourceName;
      if (!bySource[sn]) bySource[sn] = [];
      bySource[sn].push(allTranscribed[a]);
    }
    
    var sourceNames = Object.keys(bySource);
    for (var s = 0; s < sourceNames.length; s++) {
      var entries = bySource[sourceNames[s]];
      terminalPrint('  <span class="cmd">' + sourceNames[s] + '</span>: ' + entries.length + ' folios', '');
    }
    
    window._lastTranscribed = allTranscribed;
  }
}

// Generate a pantheon.md summary page
function generatePantheonSummary(transcribed, feast) {
  var page = '# THE PANTHEON\n\n';
  page += '*The Twelve Olympians of the Order of Olympus*\n\n';
  
  // Group by source
  var bySource = {};
  for (var i = 0; i < transcribed.length; i++) {
    var sn = transcribed[i].sourceName;
    if (sn === 'All') continue;
    if (!bySource[sn]) bySource[sn] = [];
    bySource[sn].push(transcribed[i]);
  }
  
  var sourceNames = Object.keys(bySource).sort();
  
  for (var s = 0; s < sourceNames.length; s++) {
    var name = sourceNames[s];
    var entries = bySource[name];
    
    page += '## ' + name + '\n\n';
    page += '*Repository: ' + SOURCES.find(function(src) { return src.name === name; })?.repo || 'unknown' + '*\n\n';
    
    for (var e = 0; e < entries.length; e++) {
      page += '- [[' + entries[e].title + ']]\n';
    }
    page += '\n';
  }
  
  page += '## Status\n\n';
  page += '| Olympian | Folios | Status |\n';
  page += '|----------|--------|--------|\n';
  
  for (var st = 0; st < sourceNames.length; st++) {
    var stName = sourceNames[st];
    var count = bySource[stName].length;
    var status = count > 0 ? '📜 Transcribed' : '🌑 Not yet';
    page += '| ' + stName + ' | ' + count + ' | ' + status + ' |\n';
  }
  
  page += '\n---\n*Compiled by the Copyist on ' + feast + '.*';
  
  return page;
}
