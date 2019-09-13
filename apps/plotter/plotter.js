class Plot {

    constructor(cid, Nx, Ny) {
        this.cid = cid;
        this.Nx = Nx;
        this.Ny = Ny;
        this.x = [];
        this.y = [];
    }

    draw() {
        // clear
        // draw
    };
};

function mod(n, M) {
    if(n>0)
        return n % M;
    else
        return M+n;
};

function init() {
    var M = 1000; var Dt = 0.1
    var n = 0;

    var V = []; var tau = 11.0
    var I = 0;
    for(n = 0; n<M; n++)
        V[n] = 0;
};

function main
    V[mod(n, M)] = V[mod(n-1, M)] + Dt*(I - V[mod(n-1, M)])/tau;
