const fs = require('fs');

const filePath = 'C:\Projects\bike-marketplace\src\components\Settings.tsx';
const content = fs.readFileSync(filePath, 'utf-8');

// Find all duplicate keys
const matches = content.match(/(\w+):\s*['"`][^'"`]*['"`],?/g);
const keyMap = {};
const duplicates = new Set();

if (matches) {
  matches.forEach(match => {
    const key = match.split(':')[0].trim();
    if (keyMap[key]) {
      duplicates.add(key);
      console.log(`Found duplicate: ${key}`);
    } else {
      keyMap[key] = true;
    }
  });
}

console.log(`Total duplicates found: ${duplicates.size}`);
Array.from(duplicates).forEach(d => console.log(`  - ${d}`));
