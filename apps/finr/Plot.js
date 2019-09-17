class Line {
    constructor(M, w, h, dw, dh, ylim) {
        this.M = M;
        this.x = new Float32Array(M).fill(0.0);
        this.h = h; this.w = w;
        this.dh = dh; this.dw = dw;
        this.ylim = ylim;

        this.strokeStyle = '#0000FF';
        this.lineWidth = 5;
    };  // constructor

    draw(ctx) {
        var pnt = this.getPoint(0);
        ctx.beginPath();
            ctx.moveTo(pnt[0], pnt[1]);
            for(var n=1; n<this.M; n++) {
                pnt = this.getPoint(n);
                ctx.lineTo(pnt[0], pnt[1]);
            };
            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = this.strokeStyle;
        ctx.stroke();
    };  // draw()

    getPoint(n) {
        return [this.dw*n, this.h - this.dh*(this.x[n] - this.ylim[0])];
    };  // getPoint()
 
};  // class Line

class Plot {
    constructor(c, M, ylim) {
        this.c = c;     // canvas
        this.ctx = c.getContext("2d");
        this.h = c.height; this.w = c.width;
        this.M = M;
        this.ylim = ylim;
        this.dh = this.h / (ylim[1]-ylim[0]);
        this.dw = this.w / M;

        this.lines = [new Line(M, this.w, this.h, this.dw, this.dh, this.ylim)];

        this.params = {};
    };  // constructor()
    
    addLine(M) {
        this.lines.push(new Line(M, this.w, this.h, this.dw, this.dh, this.ylim));
    };  // addLine()

    draw() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        // draw grid?
        this.ctx.beginPath();
            this.ctx.moveTo(0, this.h + this.dh*this.ylim[0]);
            this.ctx.lineTo(this.w, this.h + this.dh*this.ylim[0]);
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1;
        this.ctx.stroke();
        // draw lines:
        for(var i=0; i<this.lines.length; i++)
            this.lines[i].draw(this.ctx);
    };  // draw();
};  // class Plot
