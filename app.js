(function () {
  const $ = id => document.getElementById(id);
  const boardEl = $('board'), statusEl = $('status'), statsEl = $('stats');
  let board, selected, moves, last, busy, over, quiet;

  function start() {
    board = Game.newBoard(); selected = null; last = null; busy = false; over = false; quiet = 0;
    moves = Game.getMoves(board, 'r');
    say('Your turn. You are the red pieces.'); statsEl.textContent = ''; render();
  }
  const say = t => { statusEl.textContent = t; };
  const movable = () => new Set(moves.map(m => m.path[0]));
  const targets = () => new Set(selected === null ? [] : moves.filter(m => m.path[0] === selected).map(m => m.path.at(-1)));

  function render() {
    const can = movable(), tg = targets();
    boardEl.textContent = '';
    for (let i = 0; i < 64; i++) {
      const dark = ((i >> 3) + (i & 7)) % 2 === 1, p = board[i];
      const sq = document.createElement('button');
      sq.className = 'sq ' + (dark ? 'dark' : 'light'); sq.dataset.i = i;
      if (!dark) { sq.disabled = true; sq.tabIndex = -1; }
      if (p !== '.') {
        const king = p !== p.toLowerCase(), d = document.createElement('div');
        d.className = 'pc ' + (p.toLowerCase() === 'r' ? 'me' : 'ai') + (king ? ' king' : '');
        if (king) d.textContent = '♛';
        sq.appendChild(d);
        sq.setAttribute('aria-label', (p.toLowerCase() === 'r' ? 'Your ' : 'AI ') + (king ? 'king' : 'piece'));
      }
      if (selected === i) sq.classList.add('sel');
      if (tg.has(i)) sq.classList.add('target');
      if (!over && !busy && selected === null && can.has(i)) sq.classList.add('can');
      if (last && last.includes(i)) sq.classList.add('last');
      boardEl.appendChild(sq);
    }
  }

  function play(m, side) {
    const p = board[m.path[0]];
    quiet = (m.caps.length || p === p.toLowerCase()) ? 0 : quiet + 1;
    board = Game.applyMove(board, m); last = [m.path[0], m.path.at(-1)];
  }

  function aiTurn() {
    const r = AI.bestMove(board, $('level').value);
    play(r.move, 'b');
    statsEl.textContent = 'AI checked ' + r.nodes.toLocaleString() + ' positions in ' + r.ms + ' ms. Board score: ' + (r.score > 0 ? '+' : '') + Math.round(r.score) + ' (positive favors the AI).';
    moves = Game.getMoves(board, 'r'); busy = false;
    if (!moves.length) { over = true; say('AI wins. You have no moves left.'); }
    else if (quiet >= 40) { over = true; say('Draw. No captures for 40 moves.'); }
    else say(moves[0].caps.length ? 'Your turn. You must capture.' : 'Your turn.');
    render();
  }

  boardEl.addEventListener('click', e => {
    const sq = e.target.closest('.sq'); if (!sq || busy || over) return;
    const i = +sq.dataset.i;
    const mv = selected !== null && moves.find(m => m.path[0] === selected && m.path.at(-1) === i);
    if (mv) {
      play(mv, 'r'); selected = null;
      if (!Game.getMoves(board, 'b').length) { over = true; say('You win!'); render(); return; }
      busy = true; say('AI is thinking…'); render(); setTimeout(aiTurn, 60);
    } else {
      selected = movable().has(i) ? i : null; render();
    }
  });

  $('new').addEventListener('click', start);
  let dp; const inst = $('install');
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); dp = e; inst.hidden = false; });
  inst.addEventListener('click', async () => { if (!dp) return; dp.prompt(); await dp.userChoice; dp = null; inst.hidden = true; });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  start();
})();
