// The AI "model": minimax search with alpha-beta pruning + a scoring function.
// The AI plays 'b'. Positive score = good for AI, negative = good for the player.
(function () {
  const G = typeof require !== 'undefined' ? require('./game.js') : window.Game;
  const DEPTH = { easy: 2, medium: 4, hard: 6 };   // how many moves ahead it looks
  const MARGIN = { easy: 60, medium: 5, hard: 0 }; // easy AI sometimes picks a weaker move
  let nodes = 0;

  function evaluate(b) {
    let s = 0;
    for (let i = 0; i < 64; i++) {
      const p = b[i]; if (p === '.') continue;
      const side = p.toLowerCase(), king = p !== side, r = i >> 3, c = i & 7;
      let v = king ? 160 : 100;                                   // material
      if (!king) {
        v += (side === 'b' ? r : 7 - r) * 4;                       // advance toward crowning
        if ((side === 'b' && r === 0) || (side === 'r' && r === 7)) v += 8; // keep back row
      }
      v += (3.5 - Math.max(Math.abs(r - 3.5), Math.abs(c - 3.5))) * 3; // control the centre
      s += side === 'b' ? v : -v;
    }
    return s;
  }

  function search(b, side, depth, alpha, beta) {
    nodes++;
    const moves = G.getMoves(b, side);
    if (!moves.length) return side === 'b' ? -10000 - depth : 10000 + depth; // no moves = loss
    if (depth <= 0 && !(moves[0].caps.length && depth > -4)) return evaluate(b);
    if (side === 'b') {
      let best = -Infinity;
      for (const m of moves) {
        best = Math.max(best, search(G.applyMove(b, m), 'r', depth - 1, alpha, beta));
        alpha = Math.max(alpha, best); if (alpha >= beta) break;
      }
      return best;
    }
    let best = Infinity;
    for (const m of moves) {
      best = Math.min(best, search(G.applyMove(b, m), 'b', depth - 1, alpha, beta));
      beta = Math.min(beta, best); if (alpha >= beta) break;
    }
    return best;
  }

  function bestMove(board, level) {
    nodes = 0; const t0 = Date.now();
    const scored = G.getMoves(board, 'b').map(m => ({
      m, s: search(G.applyMove(board, m), 'r', DEPTH[level] - 1, -Infinity, Infinity)
    }));
    const top = Math.max(...scored.map(x => x.s));
    const pool = scored.filter(x => x.s >= top - MARGIN[level]);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return { move: pick.m, score: pick.s, nodes, ms: Date.now() - t0 };
  }
  const api = { bestMove, evaluate };
  if (typeof window !== 'undefined') window.AI = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
