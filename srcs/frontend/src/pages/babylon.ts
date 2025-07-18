import * as BABYLON from '@babylonjs/core'
import * as GUI from '@babylonjs/gui'
import { getTranslation } from '../script/language';

export interface SceneOptions {
	p1_alias?: string;
	p2_alias?: string;
	scoreToWinString?: string;
	victoryMessage?: string;
	// User Options
	scoreToWin?: number;
	// Ball Acceleration?
	// Ball Speed?
}

export class Pong {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
	winner_id: number | 0 = 0;
	private _onGameEndCallback?: (winner_id: number) => void;

    constructor(readonly canvas: HTMLCanvasElement, options: SceneOptions) {
        this.engine = new BABYLON.Engine(canvas)
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
		options.scoreToWinString = getTranslation("Score_To_Win")
		options.victoryMessage = getTranslation("Victory_Message")
        this.scene = createScene(this.engine, this.canvas, options, (winner_id:number) => {
			this.winner_id = winner_id
			if (this._onGameEndCallback)
				this._onGameEndCallback(winner_id);
		})

    }

    run(): Promise<number> {
        return new Promise((resolve) => {
			this._onGameEndCallback = (winner_id: number) => {
				this.engine.stopRenderLoop();
				resolve(winner_id);
			};
			this.engine.runRenderLoop(() => {
				this.scene.render();
			});
		});
    }



}

function createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement, options: SceneOptions, setWinner: (winner:number) => void): BABYLON.Scene {
    const scene = new BABYLON.Scene(engine);

    // Adjustable Variables
    const groundWidth       = 20;
    const groundHeight      = 10;
    const paddleWidth       = 0.5;
    const paddleHeight      = 2;
    const paddleDepth       = 2;
    const paddleSpeed       = 0.4;
    const ballSize          = 0.4;
    const ballMaxAngle      = Math.PI / 4;
    const ballBaseSpeed     = 0.2
    const ballAcceleration  = 1.05;
    const ballMaxSpeed      = 0.4;
    const ballStartAngle    = Math.PI / 6;
	const ballDropSpeed		= 0.2
    // Colours
    const paddle1Colour     = new BABYLON.Color3(0, 0, 1);
    const paddle2Colour     = new BABYLON.Color3(1, 0, 0);
    const ballColour        = new BABYLON.Color3(1, 1, 1);
    const goalColour        = new BABYLON.Color3(0, 1, 0);
    // User Variables
	const player1Alias		= options.p1_alias ?? "P1";
	const player2Alias		= options.p2_alias ?? "P2";
	const scoreToWinString	= options.scoreToWinString ?? "Score To Win"
	const victoryMessage	= options.victoryMessage ?? "Wins!\n(Press 'Enter' To Continue)"
    const scoreToWin        = options.scoreToWin ?? 2;
    // Loop Variables
	let	ballDropped			= false;
	let	ballVector			= new BABYLON.Vector3(0,0,0);
    let ballSpeed           = ballBaseSpeed;
    let paddle1Direction    = 0;
    let paddle2Direction    = 0;
    let paused              = -1;
    let player1Score        = 0;
    let player2Score        = 0;
	let winner_id			= 0;


    // Camera: ArcRotate to get a good view of the pong field
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 4, 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
    camera.lowerBetaLimit = 1;
    camera.upperBetaLimit = Math.PI / 2;
    camera.lowerRadiusLimit = 12;
    camera.upperRadiusLimit = 18;
// engine.onResizeObservable.add(() => {
//   if (camera instanceof BABYLON.FreeCamera || camera instanceof BABYLON.ArcRotateCamera) {
//     camera.aspectRatio = engine.getRenderingCanvasClientRect().width / engine.getRenderingCanvasClientRect().height;
//     camera.getProjectionMatrix(true); // force recalculation
//   }
// });
    // light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Ground, Playing Field
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: groundWidth, height: groundHeight}, scene);
    ground.position.y = -1;
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    ground.material = groundMat;
    // Goal Lines
    const line1 = BABYLON.MeshBuilder.CreateLines("line", {
        points: [
            new BABYLON.Vector3(-groundWidth / 2 + paddleWidth, -1, -groundHeight / 2),
            new BABYLON.Vector3(-groundWidth / 2 + paddleWidth, -1, groundHeight / 2)
        ],
        updatable: false
    }, scene);
    const line2 = BABYLON.MeshBuilder.CreateLines("line", {
        points: [
            new BABYLON.Vector3(groundWidth / 2 - paddleWidth, -1, -groundHeight / 2),
            new BABYLON.Vector3(groundWidth / 2 - paddleWidth, -1, groundHeight / 2)
        ],
        updatable: false
    }, scene);

    const lineMat = new BABYLON.StandardMaterial("lineMat", scene);
    lineMat.emissiveColor = goalColour;
    lineMat.disableLighting = true; 
    line1.material = lineMat;
    line2.material = lineMat;

    // Generate Paddles
    const paddle1 = BABYLON.MeshBuilder.CreateBox("paddle1", {width: paddleWidth, height: paddleHeight, depth: paddleDepth}, scene);
    paddle1.position.x = -1 * groundWidth / 2 + paddleWidth;
    paddle1.position.y = 0;
    paddle1.position.z = 0;
    const paddle1Mat = new BABYLON.StandardMaterial("paddle1Mat", scene);
    paddle1Mat.diffuseColor = paddle1Colour;
    paddle1.material = paddle1Mat;

    const paddle2 = BABYLON.MeshBuilder.CreateBox("paddle2", {width: paddleWidth, height: paddleHeight, depth: paddleDepth}, scene);
    paddle2.position.x = 1 * groundWidth / 2 - paddleWidth;
    paddle2.position.y = 0;
    paddle2.position.z = 0;
    const paddle2Mat = new BABYLON.StandardMaterial("paddle2Mat", scene);
    paddle2Mat.diffuseColor = paddle2Colour;
    paddle2.material = paddle2Mat;

    // Generate Ball
    const ball = BABYLON.MeshBuilder.CreateSphere("ball", {diameter: ballSize}, scene);
    ball.position.set(0, 5, 0)
    const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
    ballMat.diffuseColor = ballColour;
    ball.material = ballMat;

    // Loop
    scene.onBeforeRenderObservable.add(() => {
        // Pause Game
        if (paused >= 0)
        {
			if (paused) {
            // Surrender
			}
            return ;
        }

        // Move Paddles
        paddle1.position.z += paddle1Direction * paddleSpeed;
        paddle2.position.z += paddle2Direction * paddleSpeed;
        // Paddle Boundaries
		paddle1.position.z = Math.min(Math.max(paddle1.position.z, -1 * (groundHeight / 2) + paddleDepth / 2), 1 * (groundHeight / 2) - paddleDepth / 2);
        paddle2.position.z = Math.min(Math.max(paddle2.position.z, -1 * (groundHeight / 2) + paddleDepth / 2), 1 * (groundHeight / 2) - paddleDepth / 2);

        // Move Ball
		if (!ballDropped) {
			if (ball.position.y > 0) {
				ball.position.y -= ballDropSpeed;
			} else {
				ball.position.y = 0;
				ballDropped = true;
            	ballVector.set((Math.random() > 0.5 ? 1 : -1) * ballBaseSpeed * Math.cos(ballStartAngle), 0, (Math.random() > 0.5 ? 1 : -1) * ballBaseSpeed * Math.sin(ballStartAngle));
			}
		} else {
			ball.position.addInPlace(ballVector);
		}
        // Ball Boundaries
        if (ball.position.z > 1 * (groundHeight / 2) - .5 || ball.position.z < -1 * (groundHeight / 2) + .5) {
            ballVector.z = -ballVector.z;
        }


        // Paddle/Ball Collision
        const handlePaddleCollision = (paddle:BABYLON.Mesh, direction:number) => {
            const contactPoint = ball.position.z - paddle.position.z;
            const adjustedContactPoint = contactPoint / (paddleHeight / 2);
            const bounceAngle = adjustedContactPoint * ballMaxAngle;
            // Recalculate Vector
            ballSpeed = Math.min(ballSpeed * ballAcceleration, ballMaxSpeed)
            ballVector.x = ballSpeed * Math.cos(bounceAngle) * direction;
            ballVector.z = ballSpeed * Math.sin(bounceAngle);
        };
        const checkCollision = (paddle:BABYLON.Mesh) => {
            return Math.abs(ball.position.x - paddle.position.x) < ballSize / 2 + paddleWidth / 2 &&
                   Math.abs(ball.position.z - paddle.position.z) < ballSize / 2 + paddleHeight / 2;
        };
        if (checkCollision(paddle1) && ballVector.x < 0) {
            handlePaddleCollision(paddle1, 1);
        }
        if (checkCollision(paddle2) && ballVector.x > 0) {
            handlePaddleCollision(paddle2, -1);
        }

        // Scoring
        if (ball.position.x < -groundWidth / 2 + paddleWidth + ballSize / 2 || ball.position.x > groundWidth / 2 - paddleWidth - ballSize / 2) {
            // Track Score
            if (ball.position.x > 0) {
                player1Score++;
                player1Text.text = `${player1Alias}: ${player1Score}`;
            } else {
                player2Score++;
                player2Text.text = `${player2Alias}: ${player2Score}`;
            }
            // Check For Game End
            if (player1Score == scoreToWin || player2Score == scoreToWin)
            {
                paused = 0;
                winner_id = player1Score === scoreToWin ? 1 : 2;
                const winner:string = player1Score === scoreToWin ? `${player1Alias}` : `${player2Alias}`;
				declareWinner(winner);
            } else { // Reset Game
				paddle1.position.z = 0;
				paddle2.position.z = 0;
				ball.position.set(0, 3, 0);
				ballDropped = false;
				ballSpeed = ballBaseSpeed;
				ballVector = BABYLON.Vector3.Zero();
			}
        }
    });

    // Controls
    window.addEventListener("keydown", (evt) => {
        const key = evt.key.toLowerCase();
		switch(key) {
            case "p":
                paused *= -1;
                break;
            case "w":
                paddle1Direction = 1;
                break;
            case "s":
                paddle1Direction = -1;
                break;
            case "arrowup":
                paddle2Direction = 1;
                break;
            case "arrowdown":
                paddle2Direction = -1;
                break;
			case "t":
            	changeCameraTopDown();
				break;
			case "enter":
				setWinner(winner_id);
				break;
        }
    });

    window.addEventListener("keyup", (evt) => {
        const key = evt.key.toLowerCase();
		switch(key) {
            case "w":
            case "s":
                paddle1Direction = 0;
                break;
            case "arrowup":
            case "arrowdown":
                paddle2Direction = 0;
                break;
        }
    });

    // GUI Setup
	// TODO, Update GUI Based On resize
    const gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    //Score UI
    const scoreToWinText = new GUI.TextBlock();
    scoreToWinText.text = `${scoreToWinString}: ${scoreToWin}`;
    scoreToWinText.color = "white";
    scoreToWinText.fontSize = 24;
    scoreToWinText.top = "10px";
    scoreToWinText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    scoreToWinText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    gui.addControl(scoreToWinText);
    const player1Text = new GUI.TextBlock();
    player1Text.text = `${player1Alias}: ${player1Score}`;
    player1Text.color = "white";
    player1Text.fontSize = 24;
    player1Text.top = "10px";
    player1Text.left = "10px";
    player1Text.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    player1Text.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    gui.addControl(player1Text);
    const player2Text = new GUI.TextBlock();
    player2Text.text = `${player2Alias}: ${player2Score}`;
    player2Text.color = "white";
    player2Text.fontSize = 24;
    player2Text.top = "10px";
    player2Text.left = "-10px";
    player2Text.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    player2Text.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    gui.addControl(player2Text);
	const winnerText = new GUI.TextBlock();
	winnerText.text = "";
	winnerText.color = "yellow";
	winnerText.fontSize = 48;
	winnerText.fontStyle = "bold";
    winnerText.top = "50px";
	winnerText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
	winnerText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
	winnerText.isVisible = false;
	gui.addControl(winnerText);

    // Optional:
    // Add POV Change
    // Add Button Hints (Hide With h)

	function changeCameraTopDown() {
		if (paused < 0)
			return ;
		if (camera.lowerBetaLimit) {
			camera.lowerBetaLimit = 0;
    		camera.upperBetaLimit = 0;
    		camera.lowerRadiusLimit = 12;
    		camera.upperRadiusLimit = 18;
		} else {
			camera.lowerBetaLimit = 1;
    		camera.upperBetaLimit = Math.PI / 2;
    		camera.lowerRadiusLimit = 12;
    		camera.upperRadiusLimit = 18;
		}
	}

	function declareWinner(name: string) {
		winnerText.text = `${name} ${victoryMessage}`;
		winnerText.isVisible = true;
		// setTimeout(() => {
			// winnerText.isVisible = false;
		// }, 4000);
	}
    return scene;
};


