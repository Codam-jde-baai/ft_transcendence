import { Application, Text, TextStyle } from 'pixi.js';
import { Snake } from './snake';
import { createMouse, randomPosition } from './mouse';
import { GAME_WIDTH, GAME_HEIGHT, gameEndData, SNAKE1_COLOR, SNAKE2_COLOR } from './main';

export async function setupGame(app: Application, player1Alias: string, player2Alias: string) : Promise<gameEndData> {
  return new Promise((resolve) => {
  const snake1 = new Snake(SNAKE1_COLOR, 700, 300, 'Arrow',  'left');
  const snake2 = new Snake(SNAKE2_COLOR, 100, 300, 'WASD', 'right');
  
  let gameData : gameEndData = {
    winner: null,
    p1score: 0,
    p2score: 0
  };
  
  function spawnMouse() {
    const [newX, newY] = randomPosition(GAME_WIDTH, GAME_HEIGHT);
    const mouse = createMouse(newX, newY);
    app.stage.addChild(mouse);
    return mouse;
  }
  
  function finishGame(tie: boolean, winner: string){
    gameOver = true;
    
    const style = new TextStyle({
      fill: '#ffffff',
      fontSize: 48,
      fontWeight: 'bold',
      align: 'center'
    });
    const message = new Text({text: tie ? 'Both Snakes Lose' : `${winner} wins!`, style: style});
    message.x = GAME_WIDTH / 2 - message.width / 2;
    message.y = GAME_HEIGHT / 2 - message.height / 2;
    app.stage.addChild(message);
    gameData.winner = tie ? null : winner;
    gameData.p1score = snake1.getScore();
    gameData.p2score = snake2.getScore();
    resolve(gameData);
  }

  let gameOver = false;
  app.stage.addChild(snake1.container, snake2.container);
  let mouse = spawnMouse();
  // game loop
  app.ticker.add(() => {
    if (gameOver) 
      return;
      
    snake1.update();
    snake2.update();
    
    let snake1Collision = false;
    let snake2Collision = false;
    // ourobouros
    // Check for collisions
    if (snake1.checkAnyCollision(snake2)) {
      snake1Collision = true;
    }
    if (snake2.checkAnyCollision(snake1)) {
      snake2Collision = true;
    }
    if (snake1Collision || snake2Collision) {
      if (snake1Collision && snake2Collision) {
        finishGame(true, 'none');
      } else if (snake1Collision) {
        finishGame(false, player2Alias);
      } else {
        finishGame(false, player1Alias);
      }
      return;
    }
    const head1 = snake1.body[0];
    const head2 = snake2.body[0];
    const distance = (a: any, b: any) => Math.abs(a.x - b.x) < 20 && Math.abs(a.y - b.y) < 20;
    if (distance(head1, mouse)) {
      snake1.grow();
      app.stage.removeChild(mouse);
      mouse = spawnMouse();
    }
    if (distance(head2, mouse)) {
      snake2.grow();
      app.stage.removeChild(mouse);
      mouse = spawnMouse();
    }
  });

  window.addEventListener('keydown', (e) => {
    snake1.handleInput(e);
    snake2.handleInput(e);
  });
  
  return gameData;
  });
}