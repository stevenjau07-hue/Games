const G = require('./game.js'), AI = require('./ai.js');
console.log('opening moves for player:', G.getMoves(G.newBoard(), 'r').length, '(expect 7)');
for (let g = 0; g < 6; g++) {
  let b = G.newBoard(), side = 'r', plies = 0, quiet = 0, end = 'draw';
  while (plies < 300) {
    const ms = G.getMoves(b, side);
    if (!ms.length) { end = side === 'r' ? 'AI wins' : 'player wins'; break; }
    let m;
    if (side === 'b') m = AI.bestMove(b, 'hard').move; else m = ms[Math.floor(Math.random() * ms.length)];
    const p = b[m.path[0]]; quiet = (m.caps.length || p === p.toLowerCase()) ? 0 : quiet + 1;
    b = G.applyMove(b, m); side = side === 'r' ? 'b' : 'r'; plies++;
    if (quiet >= 40) break;
  }
  console.log('game', g + 1, end, 'in', plies, 'plies');
}
