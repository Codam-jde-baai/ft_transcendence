export class Render {
	constructor(ctx: CanvasRenderingContext2D, theme: Theme) {
    this.ctx = ctx;
    this.theme = theme;
    this.fps = 60; // aim for 60fps
    this.counter = 0;
    this.initTicker();
}
}