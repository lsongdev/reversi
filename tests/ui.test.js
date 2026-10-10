import test from 'node:test';
import assert from 'node:assert/strict';
class Element {
  constructor() { this.listeners = {}; this.children = []; this.classList = { toggle() {} }; this.style = {}; this.attributes = {}; }
  addEventListener(type, fn) { this.listeners[type] = fn; }
  append(child) { this.children.push(child); }
  set innerHTML(value) { this.content = value; this.writes = (this.writes || 0) + 1; }
  get innerHTML() { return this.content || ''; }
  setAttribute(key, value) { this.attributes[key] = value; }
  fire(type = 'click') { this.listeners[type]?.({}); }
}
test('UI: legal move, undo, local mode, AI cancellation and white opening', async () => {
  const elements = new Map();
  const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
  get('mode').value = 'ai'; get('color').value = '1'; get('difficulty').value = '3'; get('hints').checked = true;
  globalThis.document = { getElementById: get, createElement: () => new Element() };
  const originalSet = globalThis.setTimeout, originalClear = globalThis.clearTimeout;
  let pending = null, delay = 0;
  globalThis.setTimeout = (callback, ms) => { pending = callback; delay = ms; return 1; };
  globalThis.clearTimeout = () => { pending = null; };
  try {
    await import('../index.js');
    const cells = get('board').children;
    assert.equal(cells.length, 64);
    assert.equal(get('black-score').textContent, 2);
    cells[0].fire(); assert.equal(get('black-score').textContent, 2);
    const stablePieces = [28, 35, 36].map(index => [index, cells[index].writes]);
    cells[19].fire(); assert.equal(get('black-score').textContent, 4); assert.ok(pending);
    assert.ok(delay >= 1400);
    for (const [index, writes] of stablePieces) assert.equal(cells[index].writes, writes);
    assert.match(cells[19].innerHTML, /placed/);
    assert.match(cells[27].innerHTML, /flipped/);
    const occupiedWrites = cells.map(cell => cell.writes);
    get('hints').checked = false; get('hints').fire('change');
    for (const index of [19, 27, 28, 35, 36]) assert.equal(cells[index].writes, occupiedWrites[index]);
    get('hints').checked = true; get('hints').fire('change');
    cells[20].fire(); assert.equal(get('white-score').textContent, 1);
    get('undo').fire(); assert.equal(get('black-score').textContent, 2); assert.equal(pending, null);
    cells[19].fire(); pending();
    assert.equal(Number(get('black-score').textContent) + Number(get('white-score').textContent), 6);
    get('undo').fire(); assert.equal(get('black-score').textContent, 2); assert.equal(get('white-score').textContent, 2);
    get('mode').value = 'local'; get('mode').fire('change'); assert.equal(get('ai-settings').style.display, 'none');
    cells[19].fire(); cells[20].fire(); assert.equal(get('white-score').textContent, 3); assert.equal(pending, null);
    get('undo').fire(); assert.equal(get('black-score').textContent, 4);
    get('mode').value = 'ai'; get('color').value = '-1'; get('mode').fire('change'); assert.ok(pending);
    get('restart').fire(); assert.ok(pending); pending();
    assert.equal(get('status').textContent, '轮到你了');
    assert.equal(Number(get('black-score').textContent) + Number(get('white-score').textContent), 5);
  } finally { globalThis.setTimeout = originalSet; globalThis.clearTimeout = originalClear; delete globalThis.document; }
});
