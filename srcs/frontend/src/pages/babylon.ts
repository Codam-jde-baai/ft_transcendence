import * as BABYLON from '@babylonjs/core'
import * as GUI from '@babylonjs/gui'

interface sceneOptions {
  scoreToWin: number;
}

export class Pong {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;

    constructor(readonly canvas: HTMLCanvasElement, options?: sceneOptions) {
        this.engine = new BABYLON.Engine(canvas)
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
        this.scene = createScene(this.engine, this.canvas, options)

    }

    run() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }



}

function createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement, options?: sceneOptions): BABYLON.Scene {
    const scene = new BABYLON.Scene(engine);

    // Adjustable Variables
    const groundWidth       = 10;
    const groundHeight      = 7;
    const paddleWidth       = 0.5;
    const paddleHeight      = 2;
    const paddleDepth       = 1.5;
    const paddleSpeed       = 0.3;
    const ballSize          = 0.4;
    const ballMaxAngle      = Math.PI / 4;
    const ballBaseSpeed     = 0.10
    const ballAcceleration  = 1.05;
    const ballMaxSpeed      = 0.3;
    const ballStartAngle    = Math.PI / 6;
    let   ballVector        = new BABYLON.Vector3((Math.random() > 0.5 ? 1 : -1) * ballBaseSpeed * Math.cos(ballStartAngle), 0, (Math.random() > 0.5 ? 1 : -1) * ballBaseSpeed * Math.sin(ballStartAngle));
    // let ballVector = new BABYLON.Vector3(0.01, 0, 0);
    // Colours
    const paddle1Colour     = new BABYLON.Color3(0, 0, 1);
    const paddle2Colour     = new BABYLON.Color3(1, 0, 0);
    const ballColour        = new BABYLON.Color3(1, 1, 1);
    const goalColour        = new BABYLON.Color3(0, 1, 0);
    // User Variables
    const scoreToWin        =  options?.scoreToWin ?? 1;
    // Loop Variables
    let ballSpeed           = ballBaseSpeed;
    let paddle1Direction    = 0;
    let paddle2Direction    = 0;
    let paused              = -1;
    let player1Score        = 0;
    let player2Score        = 0;


    // Camera: ArcRotate to get a good view of the pong field
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 4, 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
    camera.lowerBetaLimit = 0.2;
    camera.upperBetaLimit = Math.PI / 2;
    camera.lowerRadiusLimit = 12;
    camera.upperRadiusLimit = 18;

    // light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
	let StopComplaining;
	StopComplaining = light;



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
    ball.position = new BABYLON.Vector3(0, 0, 0);
    const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
    ballMat.diffuseColor = ballColour;
    ball.material = ballMat;

    // Loop
    scene.onBeforeRenderObservable.add(() => {
        // Pause Game
        if (paused >= 0)
        {
            // Add Paused Logic
            // Draw
            // Surrender
            // End Match
            // Change To Fixed (Topdownp) Camera Angle
            return ;
        }

        // Move Paddles
        paddle1.position.z += paddle1Direction * paddleSpeed;
        paddle2.position.z += paddle2Direction * paddleSpeed;
        // Paddle Boundaries
		paddle1.position.z = Math.min(Math.max(paddle1.position.z, -1 * (groundHeight / 2) + paddleDepth / 2), 1 * (groundHeight / 2) - paddleDepth / 2);
        paddle2.position.z = Math.min(Math.max(paddle2.position.z, -1 * (groundHeight / 2) + paddleDepth / 2), 1 * (groundHeight / 2) - paddleDepth / 2);

        // Move Ball
        ball.position.addInPlace(ballVector);
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
                player1Text.text = `Player 1: ${player1Score}`;
            } else {
                player2Score++;
                player2Text.text = `Player 2: ${player2Score}`;
            }
            // Check For Game End
            if (player1Score == scoreToWin || player2Score == scoreToWin)
            {
                paused = 0;
                const winner = player1Score === scoreToWin ? "Player 1" : "Player 2";
                alert(`${winner} WINS!`); // Better Alert
                // Exit Game
            }
            // Reset Game
            paddle1.position.z = 0;
            paddle2.position.z = 0;
            ball.position = BABYLON.Vector3.Zero();
            ballSpeed = ballBaseSpeed;
            // ballVector = new BABYLON.Vector3(0.01, 0, 0);
            ballVector = new BABYLON.Vector3((Math.random() > 0.5 ? 1 : -1) * ballBaseSpeed * Math.cos(ballStartAngle), 0, (Math.random() > 0.5 ? 1 : -1) * ballBaseSpeed * Math.sin(ballStartAngle));
        }
    });

    // Controls
    window.addEventListener("keydown", (evt) => {
        switch(evt.key) {
            case "p":
                paused *= -1;
                break;
            case "w":
                paddle1Direction = 1;
                break;
            case "s":
                paddle1Direction = -1;
                break;
            case "ArrowUp":
                paddle2Direction = 1;
                break;
            case "ArrowDown":
                paddle2Direction = -1;
                break;
        }
    });

    window.addEventListener("keyup", (evt) => {
        switch(evt.key) {
            case "w":
            case "s":
                paddle1Direction = 0;
                break;
            case "ArrowUp":
            case "ArrowDown":
                paddle2Direction = 0;
                break;
        }
    });

    // GUI Setup
    const gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    //Score UI
    const scoreToWinText = new GUI.TextBlock();
    scoreToWinText.text = `Score To Win: ${scoreToWin}`;
    scoreToWinText.color = "white";
    scoreToWinText.fontSize = 24;
    scoreToWinText.top = "10px";
    scoreToWinText.left = "10px";
    scoreToWinText.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    scoreToWinText.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    gui.addControl(scoreToWinText);
    const player1Text = new GUI.TextBlock();
    player1Text.text = `Player 1: ${player1Score}`;
    player1Text.color = "white";
    player1Text.fontSize = 24;
    player1Text.top = "10px";
    player1Text.left = "10px";
    player1Text.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    player1Text.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    gui.addControl(player1Text);
    const player2Text = new GUI.TextBlock();
    player2Text.text = `Player 2: ${player2Score}`;
    player2Text.color = "white";
    player2Text.fontSize = 24;
    player2Text.top = "10px";
    player2Text.left = "-10px";
    player2Text.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    player2Text.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    gui.addControl(player2Text);

    // Optional:
    // Add POV Change
    // Add Ball Drop
    // Add Camera Angle Change
    // Add Button Hints (Hide With h)

    return scene;
};


