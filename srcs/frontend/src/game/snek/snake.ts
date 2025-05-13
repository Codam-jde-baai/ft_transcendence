import { Container, Graphics } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, GRID_SIZE } from './main';
import { invertColor } from './main';


const MOVE_DELAY = 6;

type Direction = 'up' | 'down' | 'left' | 'right';

const keyMap = {
  Arrow: {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  },
  WASD: {
    KeyW: 'up',
    KeyS: 'down',
    KeyA: 'left',
    KeyD: 'right',
  },
};

export class Snake {
  public container: Container = new Container();
  public body: Graphics[] = [];
  private direction: Direction;
  private nextDirection: Direction;
  private moveCounter = 0;
  private controls: 'Arrow' | 'WASD';
  private color: number;
  private borderColor: number;
  private score = -2;

  constructor(color: number, startX: number, startY: number, controls: 'Arrow' | 'WASD', startDirection: Direction) {
    this.controls = controls;
    this.color = color;
    this.borderColor = invertColor(color);

    const alignedX = Math.floor(startX / GRID_SIZE) * GRID_SIZE;
    const alignedY = Math.floor(startY / GRID_SIZE) * GRID_SIZE;
    const head = this.createHead(alignedX, alignedY);
    this.direction = startDirection;
    this.nextDirection = startDirection;
    this.container.addChild(head);
    this.body.push(head);

    // start with 2 body segments
    this.grow();
    this.grow();
  }

  createBody(x: number, y: number): Graphics {
    const segment = new Graphics();
    segment.roundRect(0, 0, GRID_SIZE, GRID_SIZE, 5);
    segment.fill(this.color);
    segment.stroke({ width: GRID_SIZE/10, color: this.borderColor });
    segment.x = x;
    segment.y = y;
    return segment;
  }

  createHead(x: number, y: number): Graphics {
    const segment = new Graphics();
    segment.roundRect(0, 0, GRID_SIZE, GRID_SIZE, 5);
    segment.fill(this.color);
    segment.stroke({ width: GRID_SIZE/10, color: this.borderColor });
    // eyes
    const eyeSize = GRID_SIZE / 5;
    segment.circle(GRID_SIZE/4, GRID_SIZE/4, eyeSize);
    segment.circle(GRID_SIZE*3/4, GRID_SIZE/4, eyeSize);
    segment.fill(0xFFFFFF);

    segment.x = x;
    segment.y = y;
    return segment;
  }

  grow() {
    const last = this.body[this.body.length - 1];
    const newSegment = this.createBody(last.x, last.y);
    this.container.addChild(newSegment);
    this.body.push(newSegment);
    this.score += 1;
  }

  getScore(): number {
    return this.score;
  }

  update() {
    this.moveCounter++;
    if (this.moveCounter < MOVE_DELAY) {
      return;
    }
    this.moveCounter = 0;
    
    this.direction = this.nextDirection;
    
    for (let i = this.body.length - 1; i > 0; i--) {
      this.body[i].x = this.body[i - 1].x;
      this.body[i].y = this.body[i - 1].y;
    }
    const head = this.body[0];
    switch (this.direction) {
      case 'up': head.y -= GRID_SIZE; break;
      case 'down': head.y += GRID_SIZE; break;
      case 'left': head.x -= GRID_SIZE; break;
      case 'right': head.x += GRID_SIZE; break;
    }
  }

  handleInput(e: KeyboardEvent) {
    const map = keyMap[this.controls];
    const newDir = map[e.code as keyof typeof map];
    
    if (!newDir) return;
    
    const invalid = 
      (this.direction === 'up' && newDir === 'down') ||
      (this.direction === 'down' && newDir === 'up') ||
      (this.direction === 'left' && newDir === 'right') ||
      (this.direction === 'right' && newDir === 'left');
      
    if (!invalid) {
      this.nextDirection = newDir;
    }
  }

  checkWallCollision(width: number, height: number): boolean {
    const head = this.body[0];
    return head.x < 0 || head.x >= width || head.y < 0 || head.y >= height;
  }

  checkSelfCollision(): boolean {
    const head = this.body[0];
    return this.body.slice(3).some(segment =>
      Math.abs(segment.x - head.x) < GRID_SIZE/2 && 
      Math.abs(segment.y - head.y) < GRID_SIZE/2
    );
  }

  checkSnakeCollision(other: Snake): boolean {
    const head = this.body[0];
    return other.body.some(segment =>
      Math.abs(segment.x - head.x) < GRID_SIZE/2 && 
      Math.abs(segment.y - head.y) < GRID_SIZE/2
    );
  }

  checkAnyCollision(other: Snake): boolean {
    return this.checkWallCollision(GAME_WIDTH, GAME_HEIGHT) || 
           this.checkSelfCollision() || 
           this.checkSnakeCollision(other);
  }
}