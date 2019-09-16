function init() {

    loadIparams();  // load params
}

function loadIparams() {
    var divIparams = document.getElementById("Iparams");
    divIparams.Imag = 1;
    Iselect("dc");
}

function Iselect(val) {
    var divIparams = document.getElementById("Iparams");
    // delete all nodes from div "Iparams":
    for(var i=0; i < divIparams.children.length; i++) 
        divIparams.removeChild(divIparams.children[i]);

    switch(val) {
        case "dc":
            var divInput = document.createElement("DIV");
            
            var lblImag = document.createElement("LABEL");
            lblImag.innerHTML = "Input magnitude: ";
            lblImag.setAttribute("for", "inputImag");
            divInput.appendChild(lblImag);

            var inputImag = document.createElement("INPUT");
            inputImag.setAttribute("type", "number");
            inputImag.setAttribute("id", "inputImag");
            inputImag.setAttribute("value", divIparams.Imag);
            inputImag.setAttribute("onchange", "ImagChange(this.value)");
            divInput.appendChild(inputImag);

            divIparams.appendChild(divInput);
        break;
    };
};

function ImagChange(val) {
    var divIparams = document.getElementById("Iparams");
    divIparams.Imag = val;
};
