function init() {
    document.M = 5000;
    document.blocksize = 128;
    document.Dt = 0.1;
    document.fps = 51.2;

    // input:
    document.pltInput = new Plot(document.getElementById("input"), document.M, [-5, 5]);
    document.pltInput.params['type'] = "dc";
    document.pltInput.params['Imu'] = 0.0;
    document.pltInput.params['Isigma'] = 1.0;
    changeInputType("dc");
    document.pltInput.addLine(document.M);
    document.pltInput.lines[1].strokeStyle = '#FF0000';
    document.pltInput.params['rho'] = 0.5;

    // neurons:
    document.pltVm = new Plot(document.getElementById("Vm"), document.M, [-3, 5]);
    document.pltVm.addLine(document.M);
    document.pltVm.lines[1].strokeStyle = '#FF0000';

    document.NN = new NN(2, document.Dt);
    document.NN.W[0][1] = 0.125;  // b->a
    document.NN.D[0][1] = 11.0 / document.Dt;

    // spectrogram:
    var maxFreq = 250;
    var fftN = 10000; //document.M;
    while(Math.log2(fftN) - Math.floor(Math.log2(fftN)) != 0) fftN += 1;
    var maxBin = Math.floor(maxFreq/(1000.0/document.Dt)*fftN);
    document.pltSpec = new Plot(document.getElementById("spec"), maxBin, [0, 1]);
    document.pltSpec.fftN = fftN;

    document.pltSpec.addLine(maxBin);
    document.pltSpec.lines[1].strokeStyle = '#FF0000';

    document.n = 0;
    setInterval(update, (1000.0*document.Dt) * (document.blocksize/document.fps));
};  // init()

function update() {
    var params = document.pltInput.params;

    // update input:
    var input = generateInput(params['type'], document.blocksize, params);
    var inputA = generateInput(params['type'], document.blocksize, params);
    var inputB = generateInput(params['type'], document.blocksize, params);
    for(var m = 0; m<document.blocksize; m++) {
        // update input:
        document.pltInput.lines[0].x[mod(document.n + m, document.M)] = params['rho']*input[m] + (1-params['rho'])*inputA[m];
        document.pltInput.lines[1].x[mod(document.n + m, document.M)] = params['rho']*input[m] + (1-params['rho'])*inputB[m];
    };

    // update neurons:
    var Iexta, Iextb, V;
    for(var m=0; m<document.blocksize; m++) {
        Iexta = document.pltInput.lines[0].x[mod(document.n+m, document.M)];

        Iextb = document.pltInput.lines[1].x[mod(document.n+m, document.M)];

        V = document.NN.update([Iexta, Iextb]);
        document.pltVm.lines[0].x[mod(document.n+m, document.M)] = document.NN.V[0];
        document.pltVm.lines[1].x[mod(document.n+m, document.M)] = document.NN.V[1];
    };

    // update spectrogram:
    var outRe = new Float32Array(document.pltSpec.fftN).fill(0);
    for(var n=0; n<document.M; n++)
        outRe[n] = document.pltVm.lines[0].x[n];
    var outIm = new Float32Array(document.pltSpec.fftN).fill(0);
    transform(outRe, outIm);    // fft.js
    for(var m=0; m<document.pltSpec.M; m++) 
        document.pltSpec.lines[0].x[m] = 2/document.M*Math.sqrt(outRe[m]*outRe[m] + outIm[m]*outIm[m]);
    outRe = document.pltVm.lines[1].x.slice();
    outIm = new Float32Array(document.M).fill(0);
    transform(outRe, outIm);    // fft.js
    for(var m=0; m<document.pltSpec.M; m++) 
        document.pltSpec.lines[1].x[m] = 2/document.M*Math.sqrt(outRe[m]*outRe[m] + outIm[m]*outIm[m]);


    document.n = mod(document.n+document.blocksize, document.M);
    draw();
};  // update()

function draw() {
    document.pltInput.draw();
    document.pltVm.draw();
    document.pltSpec.draw();
};
function changeInputType(type) {
    document.pltInput.params['type'] = type;
    var dIparams = document.getElementById("Iparams");
    // delete all nodes from div:
    while(dIparams.firstChild) 
        dIparams.removeChild(dIparams.firstChild);

    var elementList = [];
    switch(type) {
        case "dc":
            elementlist = ["Imu"];
        break;
        case "norm":
            elementlist = ["Imu", "Isigma"];
        break;
    };  // switch(type)

    for(var i=0; i<elementlist.length; i++) {
        if(i > 0)
            dIparams.appendChild(document.createElement("br"));
        switch(elementlist[i]) {
            case "Imu":
                var lbl = document.createElement("LABEL");
                var inp = document.createElement("INPUT");

                lbl.innerHTML = "Input mean: ";
                lbl.setAttribute("for", "inpMu");

                inp.setAttribute("type", "number");
                inp.setAttribute("id", "inpMu");
                inp.setAttribute("value", document.pltInput.params['Imu']);
                inp.setAttribute("onchange", "inpChange('Imu', this.value)");
            break;
            case "Isigma":
                var lbl = document.createElement("LABEL");
                var inp = document.createElement("INPUT");

                lbl.innerHTML = "Input std.: ";
                lbl.setAttribute("for", "inpSigma");

                inp.setAttribute("type", "number");
                inp.setAttribute("id", "inpSigma");
                inp.setAttribute("value", document.pltInput.params['Isigma']);
                inp.setAttribute("onchange", "inpChange('Isigma', this.value)");
            break;
        };  // switch(elementlist[i])
        dIparams.appendChild(lbl);
        dIparams.appendChild(inp);
    };
};  // changeInputType()

function inpChange(param, val) {
    document.pltInput.params[param] = parseFloat(val);
};  // inpChange();

function generateInput(type, M, params) {
    var x = new Float32Array(M);
    switch(type) {
        case "dc":
            for(var n=0; n<M; n++) 
                x[n] = params['Imu'];
        break;
        case "norm":
            for(var n=0; n<M; n++) {
                var u1 = 0, u2 = 0;
                while(u1 === 0) u1 = Math.random();
                while(u2 === 0) u2 = Math.random();
                x[n] = params['Imu'] + params['Isigma']*Math.sqrt(-2.0*Math.log(u1))*Math.cos(2.0*Math.PI*u2);
            };
        break;
        case "sine":
            for(var n=0; n<M; n++) {
                x[n] = (params['Isigma']*Math.sin(10 / 100. * n)) + params['Imu'];
            };
        break;
    };  //  switch(type)
    return x;
};  // generateInput()

function mod(n, M) {
    return (n>=0) ? n%M : (M-((-n)%M));
};  // mod()
