import { Graphics } from 'pixi.js';
import { GRID_SIZE } from './main';

const MOUSE_COLOR = '#4d4a49' // grey
const MOUSE_EARS_COLOR = '#ffffff' // grey

export function createMouse(x: number, y: number): Graphics {
  const mouse = new Graphics();
  // Draw a circle for the mouse
  mouse.circle(GRID_SIZE/2, GRID_SIZE/2, GRID_SIZE/2);
  mouse.fill(MOUSE_COLOR);

  mouse.circle(GRID_SIZE/4, GRID_SIZE/4, GRID_SIZE/8);
  mouse.fill(MOUSE_EARS_COLOR);
  mouse.circle(GRID_SIZE/4 * 3, GRID_SIZE/4, GRID_SIZE/8);
  mouse.fill(MOUSE_EARS_COLOR);  
  mouse.x = x;
  mouse.y = y;
  return mouse;
}

export function randomPosition(width: number, height: number): [number, number] {
  const gridX = Math.floor(width / GRID_SIZE);
  const gridY = Math.floor(height / GRID_SIZE);

  const x = Math.floor(Math.random() * (gridX - 4) + 2) * GRID_SIZE;
  const y = Math.floor(Math.random() * (gridY - 4) + 2) * GRID_SIZE;
  
  return [x, y];
}
