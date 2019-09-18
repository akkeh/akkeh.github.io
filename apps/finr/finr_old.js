function init() {

    loadIparams();  // load params
    var cInput = document.getElementById("input");
    var cVmem = document.getElementById("Vm");
    var cSpec = document.getElementById("spec");

    cInput.n = 0;
    cInput.blocksize = 256; // update block size
    cInput.M = 2000; // canvas 'size'

    cInput.x = new Float32Array(cInput.M);
    //cVmem.x = new Float32Array(cInput.M);
    //cSpec.x = new Float32Array(cInput.M);
    for(var n=0; n<cInput.M; n++) {
        cInput.x[n] = 0;
        //cVmem.x[n] = 0;
        //cSpec.x[n] = 0;
    }

    cInput.pltMaxval = 5;
    cInput.pltMinval = -5;
    setInterval(update, 500);    // 25.6ms per 50ms
}

function update() {
    var cInput = document.getElementById("input");
    var cVmem = document.getElementById("Vm");
    var cSpec = document.getElementById("spec");
    var n = cInput.n;
    var m = 0;
    // INPUT:
    switch(cInput.type) {
        case "dc":
            for(m=0; m<cInput.blocksize; m++)
                cInput.x[mod(n+m, cInput.M)] = cInput.Imu;
        break;
    }   // switch(cInput.type)
    cInput.n = mod(cInput.n + cInput.blocksize, cInput.M);
    draw();
}

function getPoint(n, c) {
    var w = c.width;
    var h = c.height;
    var N = c.x.length;
    var pltMinval = c.pltMinval;
    var pltMaxval = c.pltMaxval;

    var dw = w / N;
    var dh = h / (pltMaxval-pltMinval);
    return [n*dw, h/2 - c.x[n]*dh]
}

function draw() {
    var cInput = document.getElementById("input");
    var ctxInput = cInput.getContext("2d");
    var cVmem = document.getElementById("Vm");
    var ctxVmem = cVmem.getContext("2d");
    var cSpec = document.getElementById("spec");
    var ctxSpec = cSpec.getContext("2d");

    ctxInput.clearRect(0, 0, cInput.width, cInput.height);
    var pnt = getPoint(0, cInput);
    ctxInput.beginPath();
    ctxInput.moveTo(pnt[0], pnt[1]);
    for(var n = 0; n<cInput.M; n++) {
        pnt = getPoint(n, cInput);
        ctxInput.lineTo(pnt[0], pnt[1]);
    };
    ctxInput.lineWidth = 5;
    ctxInput.strokeStyle = '#000000';
    ctxInput.stroke();
}

function loadIparams() {
    var cInput = document.getElementById("input");
    cInput.Imu = 1;
    Iselect("dc");
}

function Iselect(type) {
    var cInput = document.getElementById("input");

    var divIparams = document.getElementById("Iparams");
    // delete all nodes from div "Iparams":
    while(divIparams.firstChild) {
        divIparams.removeChild(divIparams.firstChild);
    };

    var elementList = [];
    switch(type) {
        case "dc":
            cInput.type = "dc";
            elementlist = ["Imu"];
        break;
        case "norm":
            cInput.type = "norm";
            elementlist = ["Imu", "Isigma"];
        break;
    }

    for(var i=0; i<elementlist.length; i++) {
        if(i > 0)
            divIparams.appendChild(document.createElement("br"));
        switch(elementlist[i]) {
            case "Imu":
                var lblImu = document.createElement("LABEL");
                var inputImu = document.createElement("INPUT");

                lblImu.innerHTML = "Input mean: ";
                lblImu.setAttribute("for", "inputImu");

                inputImu.setAttribute("type", "number");
                inputImu.setAttribute("id", "inputImu");
                inputImu.setAttribute("value", cInput.Imu);
                inputImu.setAttribute("onchange", "Ichange('Imu', this.value)");

                divIparams.appendChild(lblImu);
                divIparams.appendChild(inputImu);
            break;
            case "Isigma":
                var lblIsigma = document.createElement("LABEL");
                var inputIsigma = document.createElement("INPUT");

                lblIsigma.innerHTML = "Input std.:";
                lblIsigma.setAttribute("for", "inputIsigma");
    
                inputIsigma.setAttribute("type", "number");
                inputIsigma.setAttribute("id", "inputIsigma");
                inputIsigma.setAttribute("value", cInput.Isigma);
                inputIsigma.setAttribute("onchange", "Ichange('Isigma', this.value)");

                divIparams.appendChild(lblIsigma);
                divIparams.appendChild(inputIsigma);
        };
    };
};

function Ichange(param, val) {
    var cInput = document.getElementById("input");
    switch(param) {
        case "Imu":
            cInput.Imu = val;
        break;
        case "Isigma":
            cInput.Isigma = val;
        break;
    }
};

function mod(n, M) {
    return (n >= 0) ? n%M : (M-((-n)%M));
};
