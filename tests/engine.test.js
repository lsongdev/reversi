import test from 'node:test';
import assert from 'node:assert/strict';
import { initialBoard, flips, legalMoves, play, nextTurn, counts, chooseMove } from '../engine.js';
test('opening, illegal moves and immutable capture', () => {
  const board = initialBoard();
  assert.deepEqual(legalMoves(board, 1), [19, 26, 37, 44]);
  assert.deepEqual(legalMoves(board, -1), [20, 29, 34, 43]);
  assert.equal(play(board, 0, 1), null);
  assert.equal(play(board, 27, 1), null);
  const next = play(board, 19, 1);
  assert.deepEqual(counts(next), { black: 4, white: 1, empty: 59 });
  assert.deepEqual(counts(board), { black: 2, white: 2, empty: 60 });
});
test('capture in all eight directions without row wrapping', () => {
  const board = Array(64).fill(0);
  for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
    board[(3+dr)*8+3+dc] = -1;
    board[(3+2*dr)*8+3+2*dc] = 1;
  }
  assert.equal(flips(board, 27, 1).length, 8);
  const edge = Array(64).fill(0); edge[8] = -1; edge[9] = 1;
  assert.deepEqual(flips(edge, 7, 1), []);
});
test('forced pass and terminal positions including unfilled boards', () => {
  const board = Array(64).fill(1); board[0] = 0; board[1] = -1;
  assert.deepEqual(nextTurn(board, 1), { player: 1, passed: true, over: false });
  assert.deepEqual(nextTurn(play(board, 0, 1), 1), { player: -1, passed: false, over: true });
  const unfilled = Array(64).fill(1); unfilled[0] = 0;
  assert.equal(nextTurn(unfilled, 1).over, true);
  assert.equal(chooseMove(unfilled, -1), null);
});
test('AI takes a safe corner', () => {
  const board = Array(64).fill(0); board[1] = -1; board[2] = 1; board[27] = -1; board[28] = 1;
  assert.equal(chooseMove(board, 1, 3), 0);
});
test('100 complete games preserve every move and finish within 60 placements', () => {
  let seed = 719;
  for (let game = 0; game < 100; game++) {
    let board = initialBoard(), player = 1, finished = false, moves = 0;
    while (!finished) {
      const legal = legalMoves(board, player);
      assert.ok(legal.length);
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const index = legal[seed % legal.length];
      const before = counts(board).empty;
      board = play(board, index, player);
      assert.equal(counts(board).empty, before - 1);
      const turn = nextTurn(board, player);
      player = turn.player; finished = turn.over;
      assert.ok(++moves <= 60);
    }
    assert.equal(legalMoves(board, 1).length + legalMoves(board, -1).length, 0);
  }
});
