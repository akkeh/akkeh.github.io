class Plot {
    constructor(c, M, ylim) {
        this.c = c;     // canvas
        this.ctx = c.getContext("2d");
        this.h = c.height; this.w = c.width;
        this.M = M;
        this.x = new Float32Array(M);
        this.ylim = ylim;
        this.dh = this.h / (ylim[1]-ylim[0]);
        this.dw = this.w / M;

        for(var n=0; n<M; n++) 
            this.x[n] = 0;

        this.params = {};
        this.params['strokeStyle'] = '#0000FF';
    };  // constructor()

    getPoint(n) {
        return [this.dw*n, this.h - this.dh*(this.x[n] - this.ylim[0])];
    };  // getPoint()

    draw() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        // draw grid?
        this.ctx.beginPath();
            this.ctx.moveTo(0, this.h + this.dh*this.ylim[0]);
            this.ctx.lineTo(this.w, this.h + this.dh*this.ylim[0]);
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1;
        this.ctx.stroke();
        // draw line:
        var pnt = this.getPoint(0);
        this.ctx.beginPath();
            this.ctx.moveTo(pnt[0], pnt[1]);
            for(var n=1; n<this.M; n++) {
                pnt = this.getPoint(n);
                this.ctx.lineTo(pnt[0], pnt[1]);
            };
            this.ctx.lineWidth = 5;
            this.ctx.strokeStyle = this.params.strokeStyle;
        this.ctx.stroke();
            
    };  // draw();
}
