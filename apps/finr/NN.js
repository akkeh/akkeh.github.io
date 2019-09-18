class NN {
    constructor(N, Dt) {
        this.N = N;
        this.Dt = Dt;
        this.V = new Float32Array(N).fill(0);
        this.W = [];
        this.D = [];
        this.Dmax = 100/Dt;
        this.Q = []; 
        this.q = 1;
        this.tauQ = [];

        this.Sbuf = []; this.m = 0;
        for(var i=0; i<N; i++) {
            this.Sbuf.push(new Float32Array(this.Dmax).fill(0));
            this.W.push(new Float32Array(N).fill(0));
            this.D.push(new Int32Array(N).fill(0));
            this.Q.push(new Float32Array(N).fill(0));
            this.tauQ.push(new Float32Array(N).fill(15.0));
        };

        this.tauV = new Float32Array(N).fill(12.0);
        this.Vth = new Float32Array(N).fill(1.0);
        this.Vreset = new Float32Array(N).fill(-3.0);
        this.Vpeak = new Float32Array(N).fill(5.0);
    };  // constructor()
    
    update(Iext) {
        for(var i=0; i<this.N; i++) {
            if(this.Sbuf[i][this.mod(this.m-1, this.Dmax)] == 1) {
                this.V[i] = this.Vreset[i];
            };
            var Inn = 0, Qij;
            for(var j=0; j<this.N; j++) {
                Qij = this.Sbuf[j][this.mod(this.m-1-this.D[i][j], this.Dmax)];
                this.Q[i][j] = this.Q[i][j] + this.Dt*(-this.Q[i][j])/this.tauQ[i][j] + this.W[i][j]*this.q*Qij;
                Inn = Inn + this.Q[i][j];
            };
            this.V[i] = this.V[i] + this.Dt*(Iext[i]+Inn-this.V[i])/this.tauV[i];
            this.Sbuf[i][this.m] = 0;
            if(this.V[i] > this.Vth[i]) {
                this.V[i] = this.Vpeak[i];
                this.Sbuf[i][this.m] = 1;
            };
        };
        this.m = mod(this.m + 1, this.Dmax);
        return [this.V];
    };  // update();

     mod(n, N) {
        return n>=0 ? n%N : N-((-n)%N)
    };
};  // class Neuron

