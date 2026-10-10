export const BLACK = 1, WHITE = -1;
const directions = [-1, 0, 1].flatMap(r => [-1, 0, 1].filter(c => r || c).map(c => [r, c]));
export function initialBoard() {
  const board = Array(64).fill(0);
  board[27] = board[36] = WHITE;
  board[28] = board[35] = BLACK;
  return board;
}
export function flips(board, index, player) {
  if (!Number.isInteger(index) || index < 0 || index >= 64 || board[index]) return [];
  const captured = [];
  for (const [dr, dc] of directions) {
    let r = (index >> 3) + dr, c = index % 8 + dc;
    const line = [];
    while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === -player) {
      line.push(r * 8 + c); r += dr; c += dc;
    }
    if (line.length && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r * 8 + c] === player) captured.push(...line);
  }
  return captured;
}
export function legalMoves(board, player) {
  return board.flatMap((piece, index) => !piece && flips(board, index, player).length ? [index] : []);
}
export function play(board, index, player) {
  const captured = flips(board, index, player);
  if (!captured.length) return null;
  const next = [...board];
  next[index] = player;
  for (const i of captured) next[i] = player;
  return next;
}
export function counts(board) {
  return { black: board.filter(p => p === BLACK).length, white: board.filter(p => p === WHITE).length, empty: board.filter(p => p === 0).length };
}
export function nextTurn(board, player) {
  if (legalMoves(board, -player).length) return { player: -player, passed: false, over: false };
  if (legalMoves(board, player).length) return { player, passed: true, over: false };
  return { player: -player, passed: false, over: true };
}
const weights = [120,-25,20,5,5,20,-25,120,-25,-45,-5,-5,-5,-5,-45,-25,20,-5,15,3,3,15,-5,20,5,-5,3,3,3,3,-5,5,5,-5,3,3,3,3,-5,5,20,-5,15,3,3,15,-5,20,-25,-45,-5,-5,-5,-5,-45,-25,120,-25,20,5,5,20,-25,120];
function search(board, player, depth, alpha, beta) {
  const moves = legalMoves(board, player);
  if (!moves.length) {
    if (!legalMoves(board, -player).length) {
      const difference = board.reduce((sum, p) => sum + p * player, 0);
      return difference === 0 ? 0 : Math.sign(difference) * 100000 + difference;
    }
    return -search(board, -player, depth, -beta, -alpha);
  }
  if (depth === 0) return board.reduce((sum, p, i) => sum + p * player * weights[i], 0) + 8 * (moves.length - legalMoves(board, -player).length);
  let best = -Infinity;
  moves.sort((a, b) => weights[b] - weights[a]);
  for (const move of moves) {
    best = Math.max(best, -search(play(board, move, player), -player, depth - 1, -beta, -alpha));
    alpha = Math.max(alpha, best);
    if (alpha >= beta) break;
  }
  return best;
}
export function chooseMove(board, player, depth = 3) {
  const moves = legalMoves(board, player);
  let best = -Infinity, choice = null;
  for (const move of moves) {
    const value = -search(play(board, move, player), -player, Math.max(0, depth - 1), -Infinity, Infinity);
    if (value > best) { best = value; choice = move; }
  }
  return choice;
}
