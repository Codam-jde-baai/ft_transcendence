import { Application, Text} from 'pixi.js';
import { setupGame } from './setupGame.ts';

export type gameEndData = {
  winner: number,
  p1score: number;
  p2score: number;
}

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const GRID_SIZE = 20;
export const SNAKE1_COLOR = 0x00ff00;
export const SNAKE2_COLOR = 0xff0000;

const PREGAME_COLOUR = 0x000000;
const BCKGRND_COLOR = 0X00B4D8;

let gameActive = false;

function setupKeyboardCapture() {
  document.addEventListener('keydown', (event) => {
    if (gameActive) {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
      }
    }
  }, { passive: false });
}

export async function preGameScreen(snekContainer: HTMLElement): Promise<Application> {
  const app = new Application();
  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    background: PREGAME_COLOUR,
  });

  app.start();

  snekContainer.appendChild(app.canvas);

  const text = new Text({
    text: 'Press start game to play',
    style: {
      fontFamily: 'Arial',
      fontSize: 60,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      align: 'center',
    }
  });

  text.anchor.set(0.5);
  text.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);
  app.stage.addChild(text);

  setupKeyboardCapture();

  return app;
}


export async function startSnek(app: Application, p1alias: string, p2alias: string): Promise<gameEndData> {
  gameActive = true;
  await countDownStart(app);
  const winner = await setupGame(app, p1alias, p2alias);
  console.log("winner data:", winner);
  gameActive = false;
  return winner;
}

export async function restartSnek(app: Application, p1alias: string, p2alias: string): Promise<gameEndData> {
  app.ticker.start();
  gameActive = true;
  await countDownStart(app);
  const winner = await setupGame(app, p1alias, p2alias);
  console.log("winner data:", winner);
  gameActive = false;
  return winner;
}

async function countDownStart(app: Application): Promise<void> {
  // Change background color
  app.renderer.background.color = BCKGRND_COLOR;
  
  // Clear previous content
  app.stage.removeChildren();
  
  // Create countdown text
  const countdownText = new Text({
    text: '3',
    style: {
      fontFamily: 'Arial',
      fontSize: 120,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      align: 'center',
    }
  });
  
  countdownText.position.set(GAME_WIDTH / 2 - countdownText.width / 2, GAME_HEIGHT / 2 - countdownText.height / 2);
  app.stage.addChild(countdownText);
  
  // Function to update the countdown text
  return new Promise<void>((resolve) => {
    let count = 3;
    
    const intervalId = setInterval(() => {
      count--;
      
      if (count > 0) {
        countdownText.text = count.toString();
        // Re-center the text after changing content
        countdownText.position.set(GAME_WIDTH / 2 - countdownText.width / 2, GAME_HEIGHT / 2 - countdownText.height / 2);
      } else if (count === 0) {
        countdownText.text = 'GO!';
        countdownText.position.set(GAME_WIDTH / 2 - countdownText.width / 2, GAME_HEIGHT / 2 - countdownText.height / 2);
      } else {
        clearInterval(intervalId);
        app.stage.removeChild(countdownText);
        resolve();
      }
    }, 1000);
  });
}

export function invertColor(color: number): number {
    return 0xFFFFFF - color;
}

export function resetGame(app: Application) {
  gameActive = false;
  app.stage.removeChildren();
  app.renderer.background.color = PREGAME_COLOUR;
  const text = new Text({
    text: 'Press start game to play',
    style: {
      fontFamily: 'Arial',
      fontSize: 60,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      align: 'center',
    }
  });

  text.anchor.set(0.5);
  text.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);

  app.stage.addChild(text);
  app.ticker.start();
}