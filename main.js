const svg = document.querySelector("#molecule-container");
const simulation = new Simulation(svg);

const formulaContainer = document.querySelector("#formula-container");
const errorMessage = document.querySelector("#error-message");

const formulaInput = formulaContainer.querySelector("input");
const formulaButton = formulaContainer.querySelector("button");

var defaultFormula = "C4H10";
formulaInput.value = defaultFormula;
formulaInput.setAttribute("placeholder", defaultFormula);

function parseFormula(value) {
    let atoms = [], 
        index = symbol = "",
        wasNaN = true;
    
    let pushAtom = () => {
        let atomicNumber;
        for (let num = 0; num < periodicTable.length; num++) {
            let atom = periodicTable[num];
            if (atom && atom.symbol == symbol) {
                atomicNumber = num;
                break;
            }
        }

        if (!atomicNumber) throw `Invalid formula, '${symbol}' is not a chemical symbol.`;
        
        let indexInt = index == "" ? 1 : parseInt(index);
        if (indexInt <= 0) throw `Invalid formula, '${index}' is not a valid index.`;

        for (let i = 0; i < indexInt; i++) {
            atoms.push(atomicNumber);
        }

        symbol = ""; index = "";
    }

    for (let i = 0 ; i < value.length; i++) {
        let char = value[i];

        if (isNaN(char)) {
            if (!wasNaN) pushAtom();

            let match = periodicTable.find(atom =>
                atom && atom.symbol == symbol + char
            );

            if (match == undefined) pushAtom();

            symbol += char;
            wasNaN = true;
        } else {
            index += char;
            wasNaN = false;
        }
    }
    pushAtom();

    return atoms;
}

function submitInput() {
    try {
        console.clear();

        let atoms = parseFormula(formulaInput.value);
        simulation.start(...atoms);

        formulaContainer.setAttribute("valid", true);
        errorMessage.className = "hidden";
    } catch (e) {
        formulaContainer.setAttribute("valid", false);
        errorMessage.className = "";
        console.error(e);
    }
}

formulaButton.onclick = () => submitInput();
formulaInput.onkeydown = (e) => {
    if (e.key == "Enter") submitInput();
};

window.onresize = () => {
    svg.setAttribute("width", window.innerWidth + "px");
    svg.setAttribute("height", window.innerHeight + "px");
};
window.onresize();

submitInput();