const fs = require('fs');
const content = fs.readFileSync('src/app/[lang]/staff/(dashboard)/eia/page.tsx', 'utf-8');
const lines = content.split('\n');
let balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') balance++;
    else if (line[j] === '}') balance--;
  }
}
console.log('Final balance:', balance);

let divBalance = 0;
let lastReturn = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('return (')) lastReturn = i;
}
console.log('Last return ( is at line:', lastReturn + 1);
