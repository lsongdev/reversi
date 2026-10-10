import { initialBoard, legalMoves, play, flips, counts, nextTurn, chooseMove } from './engine.js';
const $ = id => document.getElementById(id);
const name = player => player === 1 ? '黑棋' : '白棋';
const coordinate = index => `${'ABCDEFGH'[index % 8]}${(index >> 3) + 1}`;
let board = initialBoard(), player = 1, history = [], last = null, over = false, notice = '', timer;
const isAI = () => $('mode').value === 'ai';
const human = () => Number($('color').value);
const computerTurn = () => isAI() && player !== human() && !over;
const cells = Array.from({ length: 64 }, (_, index) => {
  const cell = document.createElement('button');
  cell.className = 'cell';
  cell.type = 'button';
  cell.addEventListener('click', () => { if (!computerTurn() && !over) move(index); });
  cell.addEventListener('keydown', event => {
    const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8 }[event.key];
    if (!offset) return;
    event.preventDefault();
    const indexNext = index + offset;
    if (indexNext >= 0 && indexNext < 64 && (Math.abs(offset) !== 1 || (index >> 3) === (indexNext >> 3))) cells[indexNext].focus();
  });
  $('board').append(cell);
  return cell;
});
function render() {
  const legal = legalMoves(board, player), score = counts(board), thinking = computerTurn();
  cells.forEach((cell, index) => {
    const valid = !over && legal.includes(index);
    cell.className = `cell${valid ? ' legal' : ''}${index === last ? ' last' : ''}`;
    cell.setAttribute('aria-label', `${coordinate(index)}，${board[index] ? name(board[index]) : valid ? '可落子' : '空位'}`);
    cell.setAttribute('aria-disabled', String(!valid || thinking));
    cell.innerHTML = board[index] ? `<span class="disc ${board[index] === 1 ? 'black' : 'white'}"></span>` : valid && $('hints').checked ? '<span class="hint"></span>' : '';
  });
  $('black-score').textContent = score.black;
  $('white-score').textContent = score.white;
  $('remaining').textContent = score.empty;
  $('balance-black').style.width = `${score.black / (score.black + score.white) * 100}%`;
  $('black-name').textContent = '黑棋' + (isAI() ? human() === 1 ? ' · 你' : ' · 电脑' : '');
  $('white-name').textContent = '白棋' + (isAI() ? human() === -1 ? ' · 你' : ' · 电脑' : '');
  $('black-card').classList.toggle('active', !over && player === 1);
  $('white-card').classList.toggle('active', !over && player === -1);
  $('turn-label').textContent = over ? '本局结束' : `${name(player)}回合${thinking ? ' · 思考中' : ''}`;
  $('move-label').textContent = over ? `共 ${history.length} 手` : `第 ${history.length + 1} 手`;
  $('last-move').textContent = last === null ? '黑棋先行 · 点击圆点落子' : `上一手 ${coordinate(last)} · 金色圆点标记`;
  $('undo').disabled = history.length === 0;
  $('ai-settings').hidden = !isAI();
  // The flex layout must respect the hidden attribute on narrow screens.
  $('ai-settings').style.display = isAI() ? '' : 'none';
  if (over) {
    const winner = score.black === score.white ? 0 : score.black > score.white ? 1 : -1;
    $('status').textContent = winner ? `${name(winner)}获胜` : '平分秋色';
    $('detail').textContent = `${score.black} : ${score.white}。${winner && isAI() ? winner === human() ? '漂亮的对弈！再来一局？' : '再来一局，试试新的策略。' : '一局结束，再开一局吧。'}`;
  } else {
    $('status').textContent = thinking ? '电脑正在思考…' : isAI() ? '轮到你了' : `轮到${name(player)}`;
    $('detail').textContent = (notice ? notice + ' ' : '') + `有 ${legal.length} 个可落点。${thinking ? '稍候，下一步即将揭晓。' : '每一次翻转，都可能改变局面。'}`;
  }
}
function schedule() {
  clearTimeout(timer);
  if (computerTurn()) timer = setTimeout(() => {
    const index = chooseMove(board, player, Number($('difficulty').value));
    if (index !== null) move(index);
  }, 380);
}
function move(index) {
  const next = play(board, index, player);
  if (!next) return;
  history.push({ board: [...board], player, last, over, notice });
  const flipped = flips(board, index, player).length;
  const mover = player;
  board = next; last = index;
  const turn = nextTurn(board, player);
  player = turn.player; over = turn.over;
  notice = turn.passed ? `${name(-mover)}无处落子，自动跳过。` : `刚刚翻转了 ${flipped} 枚棋子。`;
  render(); schedule();
}
function restart() {
  clearTimeout(timer);
  board = initialBoard(); player = 1; history = []; last = null; over = false; notice = '';
  render(); schedule();
}
$('undo').addEventListener('click', () => {
  clearTimeout(timer);
  if (!history.length) return;
  let previous = history.pop();
  if (isAI()) while (previous.player !== human() && history.length) previous = history.pop();
  ({ board, player, last, over, notice } = previous);
  render(); schedule();
});
$('restart').addEventListener('click', restart);
$('mode').addEventListener('change', restart);
$('color').addEventListener('change', restart);
$('difficulty').addEventListener('change', schedule);
$('hints').addEventListener('change', render);
restart();
