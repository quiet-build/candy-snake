import Phaser from 'phaser';
import type { Direction } from '../types';
import type { DirectionBuffer } from './KeyboardInput';

const THRESHOLD_PX = 20;
const DEAD_ZONE_PX = 6;

// Canvas pointer events work inside Shadow DOM, unlike Phaser's document hit test.
export class SwipeInput {
  constructor(scene: Phaser.Scene, buffer: DirectionBuffer) {
    const canvas = scene.game.canvas;
    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    let origin: { x: number; y: number } | null = null;
    let lastDir: Direction | null = null;
    const point = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      return { x: (event.clientX - bounds.x) * canvas.width / bounds.width,
        y: (event.clientY - bounds.y) * canvas.height / bounds.height };
    };
    canvas.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || !scene.sys.isActive()) return;
      origin = point(event);
      lastDir = null;
      canvas.setPointerCapture(event.pointerId);
    }, options);
    canvas.addEventListener('pointermove', event => {
      if (!origin || !event.isPrimary || !scene.sys.isActive()) return;
      const current = point(event);
      const dx = current.x - origin.x, dy = current.y - origin.y;
      const ax = Math.abs(dx), ay = Math.abs(dy);
      const max = Math.max(ax, ay);
      if (max < DEAD_ZONE_PX || max < THRESHOLD_PX) return;
      const dir: Direction = ax >= ay ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      if (dir !== lastDir) { buffer.tryQueue(dir); lastDir = dir; }
      origin = current;
    }, options);
    const clear = () => { origin = null; lastDir = null; };
    canvas.addEventListener('pointerup', clear, options);
    canvas.addEventListener('pointercancel', clear, options);
    canvas.addEventListener('lostpointercapture', clear, options);
    scene.events.once('shutdown', () => listeners.abort());
    scene.events.on('pause', clear);
    scene.events.once('shutdown', () => scene.events.off('pause', clear));
  }
}
