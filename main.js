const molecularStructure = document.querySelector("molecular-structure");

const formulaContainer = document.querySelector("#formula-container");
const errorMessage = document.querySelector("#error-message");

const formulaInput = formulaContainer.querySelector("input");
const formulaButton = formulaContainer.querySelector("button");

const defaultFormula = "C2H5(OH)";
formulaInput.value = defaultFormula;
formulaInput.setAttribute("placeholder", defaultFormula);

function submitInput() {
    molecularStructure.setAttribute("formula", formulaInput.value);
}

formulaButton.onclick = () => submitInput();
formulaInput.onkeydown = (e) => {
    if (e.key == "Enter") submitInput();
};

submitInput();
