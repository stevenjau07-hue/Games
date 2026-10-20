// Dama game rules (American checkers). Board = array of 64 chars.
// '.' empty, 'r'/'R' = player man/king (moves up), 'b'/'B' = AI man/king (moves down).
(function (root) {
  function newBoard() {
    const b = Array(64).fill('.');
    for (let i = 0; i < 64; i++) {
      const r = i >> 3, c = i & 7;
      if ((r + c) % 2 === 1) { if (r < 3) b[i] = 'b'; else if (r > 4) b[i] = 'r'; }
    }
    return b;
  }
  function dirs(p) {
    if (p === 'R' || p === 'B') return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    return p === 'r' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  }
  const crowns = (side, r) => (side === 'r' && r === 0) || (side === 'b' && r === 7);

  // All jump sequences for the piece at square i (multi-jumps included).
  function jumpsFrom(board, i, side) {
    const out = [];
    function dfs(b, pos, pc, path, caps) {
      let found = false;
      for (const [dr, dc] of dirs(pc)) {
        const r = (pos >> 3) + dr, c = (pos & 7) + dc, r2 = r + dr, c2 = c + dc;
        if (r2 < 0 || r2 > 7 || c2 < 0 || c2 > 7) continue;
        const mid = r * 8 + c, land = r2 * 8 + c2, mp = b[mid];
        if (mp !== '.' && mp.toLowerCase() !== side && b[land] === '.') {
          found = true;
          const nb = b.slice(); nb[pos] = '.'; nb[mid] = '.';
          let np = pc, promoted = false;
          if (pc === pc.toLowerCase() && crowns(side, r2)) { np = pc.toUpperCase(); promoted = true; }
          nb[land] = np;
          if (promoted) out.push({ path: [...path, land], caps: [...caps, mid] });
          else dfs(nb, land, np, [...path, land], [...caps, mid]);
        }
      }
      if (!found && caps.length) out.push({ path, caps });
    }
    dfs(board, i, board[i], [i], []);
    return out;
  }
  function stepsFrom(board, i) {
    const out = [];
    for (const [dr, dc] of dirs(board[i])) {
      const r = (i >> 3) + dr, c = (i & 7) + dc;
      if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === '.')
        out.push({ path: [i, r * 8 + c], caps: [] });
    }
    return out;
  }
  // Captures are compulsory: if any jump exists, only jumps are legal.
  function getMoves(board, side) {
    let jumps = [], steps = [];
    for (let i = 0; i < 64; i++) {
      if (board[i] !== '.' && board[i].toLowerCase() === side) {
        jumps = jumps.concat(jumpsFrom(board, i, side));
        steps = steps.concat(stepsFrom(board, i));
      }
    }
    return jumps.length ? jumps : steps;
  }
  function applyMove(board, m) {
    const nb = board.slice(), from = m.path[0], to = m.path[m.path.length - 1];
    let p = nb[from];
    nb[from] = '.';
    for (const c of m.caps) nb[c] = '.';
    if (p === p.toLowerCase() && crowns(p, to >> 3)) p = p.toUpperCase();
    nb[to] = p;
    return nb;
  }
  const api = { newBoard, getMoves, applyMove };
  root.Game = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
