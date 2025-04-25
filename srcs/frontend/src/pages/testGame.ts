import { Application, Assets, Sprite } from 'pixi.js';

export function setupTestGame() {
    console.log("testgame page");
    const root = document.getElementById('app');
    if (root) {
        root.innerHTML = "";
        root.insertAdjacentHTML("beforeend", /*html*/ `
        <div id="testContainer"></div>`);
    }
}

(async () => {
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });

    // Append the application canvas to the #testContainer div
    const container = document.getElementById('testContainer');
    if (container) {
        container.appendChild(app.canvas);
    } else {
        console.error("Container element not found!");
        return;
    }

    // Load the bunny texture
    const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

    // Create a bunny Sprite
    const bunny = new Sprite(texture);

    // Center the sprite's anchor point
    bunny.anchor.set(0.5);

    // Move the sprite to the center of the screen
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny);

    // Listen for animate update
    app.ticker.add((time) => {
        // Rotate the bunny sprite
        bunny.rotation += 0.1 * time.deltaTime;
    });
})();