const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filename = process.argv[2] || 'src/sakura.js';
const source = fs.readFileSync(path.resolve(filename), 'utf8');

function fixture(options, selector = 'body') {
  let stamp = 1000;
  let nextId = 0;
  const frames = new Map();
  const timers = new Map();
  const elements = {};

  function element() {
    return {
      style: {},
      dataset: {},
      children: [],
      listeners: {},
      classList: { add() {} },
      rect: { top: 100, left: 100, bottom: 114, right: 114 },
      addEventListener(type, callback) {
        this.listeners[type] = callback;
      },
      setAttribute(name, value) {
        if (name === 'data-sakura-anim-id') this.dataset.sakuraAnimId = String(value);
      },
      appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
      },
      remove() {
        if (this.parentNode) {
          const siblings = this.parentNode.children;
          siblings.splice(siblings.indexOf(this), 1);
          this.parentNode = null;
        }
      },
      getBoundingClientRect() {
        return this.rect;
      },
      emit(type, animationName) {
        this.listeners[type]({ animationName });
      },
    };
  }

  elements.body = element();
  elements.body.style.overflowX = 'clip';
  elements['#container'] = element();
  const context = {
    document: {
      body: elements.body,
      documentElement: { clientHeight: 600, clientWidth: 800 },
      querySelector: name => elements[name],
      createElement: element,
    },
    window: {
      innerHeight: 600,
      innerWidth: 800,
      requestAnimationFrame(callback) {
        nextId += 1;
        frames.set(nextId, callback);
        return nextId;
      },
      cancelAnimationFrame: id => frames.delete(Number(id)),
    },
    setTimeout(callback, delay) {
      nextId += 1;
      timers.set(nextId, { callback, due: stamp + delay });
      return nextId;
    },
    clearTimeout: id => timers.delete(id),
    setInterval() { return 0; },
    Date: { now: () => stamp },
  };
  vm.createContext(context);
  const Sakura = vm.runInContext(`${source}\n;Sakura;`, context);
  const instance = new Sakura(selector, options);

  function frame() {
    const ready = Array.from(frames.entries());
    ready.forEach(([id, callback]) => {
      frames.delete(id);
      callback();
    });
  }

  function tick(milliseconds) {
    stamp += milliseconds;
    Array.from(timers.entries()).forEach(([id, timer]) => {
      if (timer.due <= stamp) {
        timers.delete(id);
        timer.callback();
      }
    });
  }

  frame();
  return { instance, elements, frames, timers, frame, tick, Sakura };
}

let passed = 0;
function test(name, run) {
  run();
  passed += 1;
  console.log(`PASS ${name}`);
}

test('fall completion removes visible petals and their references', () => {
  const { instance, elements } = fixture();
  const petal = elements.body.children[0];
  petal.emit('animationend', 'sway-0');
  assert.strictEqual(elements.body.children.length, 1);
  petal.emit('animationend', 'fall');
  assert.strictEqual(elements.body.children.length, 0);
  assert.strictEqual(instance.petals.size, 0);
});

test('partially visible petals survive and offscreen petals are released', () => {
  const { instance, elements } = fixture();
  const petal = elements.body.children[0];
  petal.rect.left = -5;
  petal.rect.right = 9;
  petal.emit('animationiteration', 'sway-0');
  assert.strictEqual(instance.petals.size, 1);
  petal.rect.right = -1;
  petal.emit('animationiteration', 'blow-soft-left');
  assert.strictEqual(instance.petals.size, 0);
  assert.strictEqual(elements.body.children.length, 0);
});

test('body petals are fixed and other containers remain absolute', () => {
  assert.strictEqual(fixture().elements.body.children[0].style.position, 'fixed');
  const container = fixture(undefined, '#container');
  assert.strictEqual(container.elements['#container'].children[0].style.position, 'absolute');
  assert.strictEqual(fixture({ position: 'absolute' }).elements.body.children[0].style.position, 'absolute');
});

test('overflow hiding is optional and keeps its original default', () => {
  assert.strictEqual(fixture().elements.body.style.overflowX, 'hidden');
  assert.strictEqual(fixture({ hideScrollbars: false }).elements.body.style.overflowX, 'clip');
});

test('positive lifetime expires petals after a graceful stop', () => {
  const { instance, elements, tick, timers } = fixture({ lifeTime: 100 });
  instance.stop(true);
  tick(99);
  assert.strictEqual(elements.body.children.length, 1);
  tick(1);
  assert.strictEqual(elements.body.children.length, 0);
  assert.strictEqual(instance.petals.size, 0);
  assert.strictEqual(timers.size, 0);
});

test('early animation completion cancels its lifetime timer', () => {
  const { instance, elements, timers } = fixture({ lifeTime: 100 });
  elements.body.children[0].emit('animationend', 'fall');
  instance.stop();
  assert.strictEqual(timers.size, 0);
});

test('petals created in the same millisecond are tracked independently', () => {
  const { instance, elements } = fixture({ lifeTime: 100 });
  instance.createPetal();
  assert.strictEqual(instance.petals.size, 2);
  elements.body.children[0].emit('animationend', 'fall');
  assert.strictEqual(instance.petals.size, 1);
});

test('immediate stop cancels pending frames, timers and petals', () => {
  const { instance, elements, timers, frames, tick, frame } = fixture({ lifeTime: 100 });
  tick(300);
  assert.strictEqual(frames.size, 1);
  instance.stop();
  tick(1000);
  frame();
  assert.strictEqual(elements.body.children.length, 0);
  assert.strictEqual(instance.petals.size, 0);
  assert.strictEqual(frames.size, 0);
  assert.strictEqual(timers.size, 0);
});

test('stop followed by start produces a single creation loop', () => {
  const { instance, elements, timers, frames, tick, frame } = fixture();
  instance.stop();
  instance.start();
  frame();
  assert.strictEqual(elements.body.children.length, 1);
  tick(300);
  frame();
  assert.strictEqual(elements.body.children.length, 2);
  assert.strictEqual(timers.size, 1);
  assert.strictEqual(frames.size, 0);
  assert.throws(() => instance.start(), /already running/);
});

test('stopping one instance leaves another container untouched', () => {
  const { instance, Sakura, elements, frame } = fixture();
  const other = new Sakura('#container');
  frame();
  instance.stop();
  assert.strictEqual(elements.body.children.length, 0);
  assert.strictEqual(elements['#container'].children.length, 1);
  assert.strictEqual(other.petals.size, 1);
});

console.log(`${passed} regression tests passed (${filename}).`);
