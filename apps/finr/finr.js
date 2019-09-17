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
    document.pltVm.params['tauVa'] = 11.;
    document.pltVm.params['Vtha'] = 1;
    document.pltVm.params['Vpeaka'] = 5;
    document.pltVm.params['Vreseta'] = -3;
    document.pltVm.Sa = new Float32Array(document.M);
    document.pltVm.Qab = 0.0
    document.pltVm.params['tauQab'] = 5.0;
    document.pltVm.params['qab'] = 5.0;

    document.pltVm.addLine(document.M);
    document.pltVm.lines[1].strokeStyle = '#FF0000';
    document.pltVm.params['tauVb'] = 11.;
    document.pltVm.params['Vthb'] = 1;
    document.pltVm.params['Vpeakb'] = 5;
    document.pltVm.params['Vresetb'] = -3;
    document.pltVm.Sb = new Float32Array(document.M);
    document.pltVm.Qba = 0.0; 
    document.pltVm.params['tauQba'] = 5.0;
    document.pltVm.params['qba'] = 5.0;

    document.pltVm.params['Dba'] = 1;//Math.floor(1/document.Dt);   // delay a->b
    document.pltVm.params['Wba'] = 0;   // weight a->b
    document.pltVm.params['Dab'] = 1 //Math.floor(1/document.Dt);   // delay b->a
    document.pltVm.params['Wab'] = 0.5;   // weight b->a


    // spectrogram:
    var maxFreq = 500;
    var maxBin = Math.floor(maxFreq/(1000.0/document.Dt)*document.M);
    document.pltSpec = new Plot(document.getElementById("spec"), maxBin, [0, 1]);
    document.pltSpec.addLine(maxBin);
    document.pltSpec.lines[1].strokeStyle = '#FF0000';

    document.n = 0;
    setInterval(update, (1000.0*document.Dt) * (document.blocksize/document.fps));
};  // init()

function update() {
    // update input:
    var input = generateInput(document.pltInput.params['type'], document.blocksize, document.pltInput.params);
    var inputA = generateInput(document.pltInput.params['type'], document.blocksize, document.pltInput.params);
    var inputB = generateInput(document.pltInput.params['type'], document.blocksize, document.pltInput.params);
    for(var m = 0; m<document.blocksize; m++) {
        // update input:
        document.pltInput.lines[0].x[mod(document.n + m, document.M)] = document.pltInput.params['rho']*input[m] + (1-document.pltInput.params['rho'])*inputA[m];
        document.pltInput.lines[1].x[mod(document.n + m, document.M)] = document.pltInput.params['rho']*input[m] + (1-document.pltInput.params['rho'])*inputB[m];
    };

    // update neurons:
    var Iexta, Va, dVa;
    var Va_ = document.pltVm.lines[0].x[mod(document.n-1, document.M)];
    var Iextb, Vb, dVb, Inn;
    var Vb_ = document.pltVm.lines[1].x[mod(document.n-1, document.M)];
    for(var m=0; m<document.blocksize; m++) {
        Iexta = document.pltInput.lines[0].x[mod(document.n+m, document.M)];
        Iexta = 0;
        document.pltVm.Qab = -document.Dt*document.pltVm.Qab/document.pltVm.params['tauQab'] + document.pltVm.Sb[mod(document.n-document.pltVm.params['Dab'], document.M)] * document.pltVm.params['Wab'];
        Inna = document.pltVm.params['qab']*document.pltVm.Qab;

        Iextb = document.pltInput.lines[1].x[mod(document.n+m, document.M)];
        document.pltVm.Qba = -document.Dt*document.pltVm.Qba/document.pltVm.params['tauQba'] + document.pltVm.Sa[mod(document.n-document.pltVm.params['Dba'], document.M)] * document.pltVm.params['Wba'];
        Innb= document.pltVm.params['qba']*document.pltVm.Qba;
        Va = Va_;
        Vb = Vb_;
        dVa = (Iexta+Inna-Va) / document.pltVm.params['tauVa'];
        dVb = (Iextb+Innb-Vb) / document.pltVm.params['tauVb'];
        Va = Va + document.Dt*dVa;
        Vb = Vb + document.Dt*dVb;
        Va_ = Va;
        Vb_ = Vb;
        document.pltVm.Sa[mod(document.n+m, document.M)] = 0;
        if(Va_ > document.pltVm.params['Vtha']) {
            Va_ = document.pltVm.params['Vreseta'];
            Va = document.pltVm.params['Vpeaka'];
            document.pltVm.Sa[mod(document.n+m, document.M)] = 1;
        };
        document.pltVm.Sb[mod(document.n+m, document.M)] = 0;
        if(Vb_ > document.pltVm.params['Vthb']) {
            Vb_ = document.pltVm.params['Vresetb'];
            Vb = document.pltVm.params['Vpeakb'];
            document.pltVm.Sb[mod(document.n+m, document.M)] = 1;
        };
        document.pltVm.lines[0].x[mod(document.n+m, document.M)] = Va;
        document.pltVm.lines[1].x[mod(document.n+m, document.M)] = Vb;
    };

    // update spectrogram:
    var outRe = document.pltVm.lines[0].x.slice();
    var outIm = new Float32Array(document.M).fill(0);
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
