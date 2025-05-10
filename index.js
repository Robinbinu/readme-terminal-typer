const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

function parseLines(query) {
  return (query.lines || '').split(';').map(line => decodeURIComponent(line));
}

app.get('/', (req, res) => {
  const lines = parseLines(req.query);
  const fontSize = req.query.size || 20;
  const color = req.query.color || '00FF00';
  const width = req.query.width || 700;
  const delayPerChar = 0.05; // seconds

  let svgContent = '';
  let totalDelay = 0;

  lines.forEach((line, i) => {
    const y = 40 + i * 30;
    let charX = 10;

    svgContent += `<text font-size="${fontSize}" font-family="Fira Code, Courier New, monospace" class="glitch" fill="#${color}" y="${y}">`;

    line.split('').forEach((char, j) => {
      const delay = (totalDelay + j * delayPerChar).toFixed(2);
      svgContent += `<tspan x="${charX}" dy="0" opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.01s" begin="${delay}s" fill="freeze" />
        ${char}
      </tspan>`;
      charX += fontSize * 0.6;
    });

    svgContent += '</text>';
    totalDelay += line.length * delayPerChar + 0.3;
  });

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${lines.length * 40}">
    <defs>
      <filter id="glitch">
        <feColorMatrix type="matrix" values="1 0 0 0 0
                                             0 1 0 0 0
                                             0 0 1 0 0
                                             0 0 0 1 0"/>
        <feOffset dx="1" dy="0" result="offR"/>
        <feOffset dx="-1" dy="0" result="offB"/>
        <feBlend in="offR" in2="SourceGraphic" mode="screen"/>
        <feBlend in="offB" in2="SourceGraphic" mode="screen"/>
      </filter>
      <style>
        .glitch {
          filter: url(#glitch);
          animation: flicker 2s infinite alternate;
        }

        @keyframes flicker {
          0% { opacity: 1; }
          5% { opacity: 0.8; }
          10% { opacity: 1; }
          15% { opacity: 0.9; }
          20% { opacity: 1; }
          30% { opacity: 0.85; }
          100% { opacity: 1; }
        }
      </style>
    </defs>
    <rect width="100%" height="100%" fill="black"/>
    ${svgContent}
  </svg>`;

  res.set('Content-Type', 'image/svg+xml');
  res.send(svg);
});

app.listen(port, () => {
  console.log(`Terminal Typing SVG running on port ${port}`);
});
