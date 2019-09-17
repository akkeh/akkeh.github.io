function init() {
    var M = 1000;
    var blocksize = 256;
    document.pltInput = new Plot(document.getElementById("input"), M, [-5, 5]);
    document.pltInput.params['type'] = "dc";
    document.pltInput.params['Imu'] = 0.0;
    document.pltInput.params['Isigma'] = 1.0;
    changeInputType("dc");

    document.pltVm = new Plot(document.getElementById("Vm"), M, [-3, 1]);
    document.M = M;
    document.blocksize = blocksize;
    document.n = 0;
    setInterval(update, 500);
};  // init()

function update() {
    var input = generateInput(document.pltInput.params['type'], document.blocksize, document.pltInput.params);
    for(var m = 0; m<document.blocksize; m++) {
        // update input:
        document.pltInput.x[mod(document.n + m, document.M)] = input[m];
    };
    document.n = mod(document.n+document.blocksize, document.M);

    draw();
};  // update()

function draw() {
    document.pltInput.draw();
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
};  // generateInput

function mod(n, M) {
    return (n>=0) ? n%M : (M-((-n)%M));
};  // mod()
