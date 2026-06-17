const fs = require('fs');
const path = require('path');

// Read LOGOO.svg
const svgPath = path.join(__dirname, '..', 'src', 'app', 'images', 'LOGOO.svg');
const content = fs.readFileSync(svgPath, 'utf8');

// The transform matrix is matrix(0.95571984,0,0,1.1780826,-195.37537,-330.29649)
const m = [0.95571984, 0, 0, 1.1780826, -195.37537, -330.29649];

// Parse path commands
const dMatch = content.match(/d="([\s\S]+?)"/);
if (!dMatch) {
  console.log("No path found");
  process.exit(1);
}

const d = dMatch[1];
const tokens = d.trim().split(/[\s,]+/);

let currentX = 0;
let currentY = 0;
let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;

function updateBounds(x, y) {
  // Apply transformation matrix
  const tx = x * m[0] + y * m[1] + m[4];
  const ty = x * m[2] + y * m[3] + m[5];
  
  if (tx < minX) minX = tx;
  if (tx > maxX) maxX = tx;
  if (ty < minY) minY = ty;
  if (ty > maxY) maxY = ty;
}

let i = 0;
while (i < tokens.length) {
  const token = tokens[i];
  if (!token) {
    i++;
    continue;
  }
  
  if (token === 'm') {
    const dx = parseFloat(tokens[i+1]);
    const dy = parseFloat(tokens[i+2]);
    currentX += dx;
    currentY += dy;
    updateBounds(currentX, currentY);
    i += 3;
  } else if (token === 'h') {
    const dx = parseFloat(tokens[i+1]);
    currentX += dx;
    updateBounds(currentX, currentY);
    i += 2;
  } else if (token === 'l') {
    const dx = parseFloat(tokens[i+1]);
    const dy = parseFloat(tokens[i+2]);
    currentX += dx;
    currentY += dy;
    updateBounds(currentX, currentY);
    i += 3;
  } else if (token === 'c') {
    const dx3 = parseFloat(tokens[i+5]);
    const dy3 = parseFloat(tokens[i+6]);
    currentX += dx3;
    currentY += dy3;
    updateBounds(currentX, currentY);
    i += 7;
  } else if (token === 'z') {
    i += 1;
  } else {
    const x = parseFloat(token);
    const y = parseFloat(tokens[i+1]);
    if (!isNaN(x) && !isNaN(y)) {
      currentX += x;
      currentY += y;
      updateBounds(currentX, currentY);
      i += 2;
    } else {
      i++;
    }
  }
}

console.log({
  minX,
  maxX,
  minY,
  maxY,
  width: maxX - minX,
  height: maxY - minY,
  viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`
});
