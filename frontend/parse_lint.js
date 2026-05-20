const fs = require('fs'); 
const data = JSON.parse(fs.readFileSync('lint.json', 'utf8')); 
data.forEach(file => { 
  if (file.errorCount > 0) { 
    console.log(file.filePath); 
    file.messages.forEach(m => { 
      if (m.severity === 2) console.log(`  Line ${m.line}: ${m.message}`); 
    }); 
  } 
});
