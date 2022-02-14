// Chemistry information
const periodicTable = [];

periodicTable[1]  = {symbol: "H",  valence: 1, radius: 53,  color: {h: 0,   s: 0,   l: 100}}; // prettier-ignore
periodicTable[2]  = {symbol: "He", valence: 0, radius: 31,  color: {h: 180, s: 100, l: 50 }}; // prettier-ignore
periodicTable[3]  = {symbol: "Li", valence: 1, radius: 167, color: {h: 268, s: 100, l: 50 }}; // prettier-ignore
periodicTable[4]  = {symbol: "Be", valence: 2, radius: 112, color: {h: 120, s: 100, l: 23 }}; // prettier-ignore
periodicTable[5]  = {symbol: "B",  valence: 3, radius: 87,  color: {h: 22,  s: 100, l: 73 }}; // prettier-ignore
periodicTable[6]  = {symbol: "C",  valence: 4, radius: 67,  color: {h: 0,   s: 0,   l: 13 }}; // prettier-ignore
periodicTable[7]  = {symbol: "N",  valence: 3, radius: 56,  color: {h: 235, s: 100, l: 57 }}; // prettier-ignore
periodicTable[8]  = {symbol: "O",  valence: 2, radius: 167, color: {h: 8,   s: 100, l: 50 }}; // prettier-ignore
periodicTable[9]  = {symbol: "F",  valence: 1, radius: 42,  color: {h: 120, s: 87,  l: 53 }}; // prettier-ignore
periodicTable[10] = {symbol: "Ne",  valence: 0, radius: 38,  color: {h: 180, s: 100, l: 50 }}; // prettier-ignore
periodicTable[11] = {symbol: "Na",  valence: 1, radius: 190, color: {h: 268, s: 100, l: 50 }}; // prettier-ignore
periodicTable[12] = {symbol: "Mg",  valence: 2, radius: 167, color: {h: 120, s: 100, l: 23 }}; // prettier-ignore
periodicTable[13] = {symbol: "Al",  valence: 3, radius: 118, color: {h: 180, s: 4,   l: 53 }}; // prettier-ignore
periodicTable[14] = {symbol: "Si",  valence: 4, radius: 111, color: {h: 43,  s: 84,  l: 45 }}; // prettier-ignore
periodicTable[15] = {symbol: "P",   valence: 5, radius: 98,  color: {h: 36,  s: 100, l: 50 }}; // prettier-ignore
periodicTable[16] = {symbol: "S",   valence: 6, radius: 88,  color: {h: 53,  s: 100, l: 57 }}; // prettier-ignore
periodicTable[17] = {symbol: "Cl",  valence: 1, radius: 79,  color: {h: 120, s: 87,  l: 53 }}; // prettier-ignore
periodicTable[18] = {symbol: "Ar",  valence: 0, radius: 71,  color: {h: 180, s: 100, l: 50 }}; // prettier-ignore
periodicTable[19] = {symbol: "K",   valence: 1, radius: 243, color: {h: 268, s: 100, l: 50 }}; // prettier-ignore
periodicTable[20] = {symbol: "Ca",  valence: 2, radius: 194, color: {h: 120, s: 100, l: 23 }}; // prettier-ignore

periodicTable[35] = {symbol: "Br",  valence: 1, radius: 94,  color: {h: 13,  s: 100, l: 30 }}; // prettier-ignore

periodicTable[53] = {symbol: "I",   valence: 1, radius: 115, color: {h: 273, s: 100, l: 37 }}; // prettier-ignore

// Graph theory classes
class Vertex {
    constructor(coords, atomicNumber) {
        this.coords = coords;
        this.atomicNumber = atomicNumber;
    }
}

class Edge {
    constructor(vertexA, vertexB, order) {
        this.vertexA = vertexA;
        this.vertexB = vertexB;
        this.order = order;
    }
}

class Graph {
    constructor(vertices, edges) {
        this.vertices = vertices;
        this.edges = edges;

        this.edgeIndices = Array.from({ length: edges.length }, (v, i) => i);
    }
}

// Molecule custom HTML element
class Molecule extends HTMLElement {
    // Simulation parameters
    iterations = 12;
    allowMultipleGroups = false;
    repulsionForce = 0.05;
    maxBondLength = 1;
    maxFailedAttempts = 100;

    // Visualisation parameters
    viewboxMargin = { x: 0.66, y: 0.66 };
    prеcision = 4;
    bondOffset = 0.05;
    strokeWidth = 0.025;
    strokeDarkeningFactor = 0.75;

    static get observedAttributes() {
        return ["formula"];
    }

    constructor() {
        // Call the base class constructor
        super();

        // Wrap everything in a shadow DOM
        this.attachShadow({ mode: "open" });

        this.svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );
        this.svg.setAttribute("viewBox", "-1 -1 2 2");

        this.errorMessageDiv = document.createElement("div");
        this.errorMessageDiv.id = "error";

        const style = document.createElement("style");
        style.textContent =
            "#error {position: absolute; left: 18px; top: 18px; font-size: 18px; color: red; font-style: italic; }";

        this.shadowRoot.append(style, this.svg, this.errorMessageDiv);

        // Handle mouse and touch events
        this.controllerData = {};

        this.startEventListener = (e) => this.handleStartEvent(e);
        this.moveEventListener = (e) => this.handleMoveEvent(e);
        this.endEventListener = (e) => this.handleEndEvent(e);

        window.addEventListener("mousedown", this.startEventListener);
        window.addEventListener("mousemove", this.moveEventListener);
        window.addEventListener("mouseup", this.endEventListener);

        window.addEventListener("touchstart", this.startEventListener);
        window.addEventListener("touchmove", this.moveEventListener);
        window.addEventListener("touchend", this.endEventListener);

        // Handle resize events
        moleculeResizeObserver.observe(this);

        // Start the update loop
        this.running = true;
        window.requestAnimationFrame(() => this.mainLoop());
    }

    disconnectedCallback() {
        window.removeEventListener("mousedown", this.startEventListener);
        window.removeEventListener("mousemove", this.moveEventListener);
        window.removeEventListener("mouseup", this.endEventListener);

        window.removeEventListener("touchstart", this.startEventListener);
        window.removeEventListener("touchmove", this.moveEventListener);
        window.removeEventListener("touchend", this.endEventListener);

        this.running = false;
    }

    // Formula input
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "formula":
                try {
                    this.graph = this.createGraph(newValue);
                    this.errorMessageDiv.textContent = "";
                } catch (err) {
                    let message = `Error generating molecule '${newValue}': ${err}`;
                    this.errorMessageDiv.textContent = message;
                    throw message;
                }

                this.drawGraph();

                break;
        }
    }

    // Update cycle
    mainLoop() {
        this.dt = this.time == undefined ? 0 : (Date.now() - this.time) / 1000;

        if (this.graph) {
            this.updateGraph();
            this.drawUpdatedGraph();
        }

        this.time = Date.now();
        if (this.running) window.requestAnimationFrame(() => this.mainLoop());
    }
}

customElements.define("molecular-structure", Molecule);

// Generation
Molecule.parseFormula = (string) => {
    let i = 0;

    parse = (condition) => {
        let text = "";

        while (i < string.length) {
            char = string[i];

            if (!condition(char, text)) return text;

            text += char;
            i++;
        }

        return text;
    };

    isDigit = (char) => "01234567890".includes(char);

    parseAtoms = () => {
        let atoms = [];

        let iter = 0;
        while (i < string.length && iter < 100) {
            let symbol = parse((char, text) =>
                periodicTable.find((atom) => atom && atom.symbol == text + char)
            );

            let atomicNumber;
            for (let num = 0; num < periodicTable.length; num++) {
                let atom = periodicTable[num];
                if (atom && atom.symbol == symbol) {
                    atomicNumber = num;
                    break;
                }
            }

            if (!atomicNumber) {
                if (char == "(" || char == ")") return atoms;
                else
                    throw `Invalid chemical symbol '${parse(
                        (char) => !"()0123456789".includes(char)
                    )}'.`;
            }

            let index = parse((char) => isDigit(char));
            index = index == "" ? 1 : parseInt(index);

            let atom = Array(index).fill(atomicNumber);
            atoms = atoms.concat(atom);

            iter++;
        }
        if (iter == 100) throw "Sorry, something went wrong during parsing.";

        return atoms;
    };

    let bracketLevel = 0;
    parseAll = () => {
        let atoms = [];

        let iter = 0;
        while (i < string.length && iter < 100) {
            if (string[i] != "(" && string[i] != ")") {
                atoms = atoms.concat(parseAtoms());
            }

            if (string[i] == "(") {
                bracketLevel++;
                i++;
                atoms = atoms.concat(parseAll());
            }

            if (string[i] == ")") {
                bracketLevel--;
                i++;

                let level = parse((char) => isDigit(char));
                level = level == "" ? 1 : parseInt(level);

                return Array(level).fill(atoms).flat();
            }
            iter++;
        }
        if (iter == 100) throw "Sorry, something went wrong during parsing.";

        return atoms;
    };

    let result = parseAll();

    if (bracketLevel != 0)
        throw `Missing ${bracketLevel < 0 ? "opening" : "closing"} bracket(s).`;
        
    return result;
};

Molecule.prototype.createGraph = function (molecularFormula) {
    let atoms = Molecule.parseFormula(molecularFormula);
    
    if (result.length > 150)
        throw `The simulation cannot handle that many atoms.`;
    
    // Randomize vertices
    let vertices = atoms.map((atomicNumber) => {
        let coords = {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1,
        };

        return new Vertex(coords, atomicNumber);
    });

    let sum = 0;
    atoms.forEach((atomicNumber) => {
        sum += periodicTable[atomicNumber].valence;
    });

    if (sum % 2 != 0) throw `Invalid atom sequence.`;

    // Randomize edges
    let edges;
    let groups;

    failedAttempts = 0;
    success = false;
    while (!success && failedAttempts < this.maxFailedAttempts) {
        try {
            edges = [];
            groups = Array.from({ length: atoms.length }, (v, i) => [i]);

            let valence = atoms.map(
                (atomicNumber) => periodicTable[atomicNumber].valence
            );

            let getIndex = (n) => {
                let id = 0,
                    sum = 0;
                while (id < valence.length) {
                    sum += valence[id];
                    if (sum >= n) return id;
                    id++;
                }
            };

            let max = sum;
            for (let i = 0; i < sum / 2; i++) {
                let vertexA = getIndex(1);

                let min = valence[vertexA] + 1;
                let n = Math.floor(Math.random() * (max - min + 1)) + min; // Random number between min and max
                if (min > max) throw "Invalid bond sequence.";

                let vertexB = getIndex(n); // TODO

                valence[vertexA]--;
                valence[vertexB]--;

                let match = edges.find(
                    (edge) =>
                        (edge.vertexA == vertexA && edge.vertexB == vertexB) ||
                        (edge.vertexA == vertexB && edge.vertexB == vertexA)
                );

                if (match) match.order++;
                else edges.push(new Edge(vertexA, vertexB, 1));

                max -= 2;
            }

            // Add repulsion edges
            find = (vertex) => {
                let matchIndex;
                for (let i = 0; i < groups.length; i++) {
                    if (groups[i].includes(vertex)) {
                        matchIndex = i;
                        break;
                    }
                }
                return matchIndex;
            };

            edges.forEach((edge) => {
                let groupA = find(edge.vertexA);
                let groupB = find(edge.vertexB);

                if (groupA != groupB) {
                    a = groups[groupA];
                    b = groups[groupB];

                    groups = groups.filter(
                        (group, i) => i != groupA && i != groupB
                    );

                    groups.unshift(a.concat(b));
                }
            });

            if (groups.length > 1) {
                message = `The graph has ${groups.length} groups, only one expected`;
                if (this.allowMultipleGroups) console.warn(message);
                else throw message;
            }

            success = true;
        } catch (e) {
            failedAttempts++;

            if (failedAttempts == this.maxFailedAttempts)
                throw `Could not generate the graph after ${this.maxFailedAttempts} failed attempts.`;
        }
    }

    groups.forEach((group) => {
        while (group.length > 0) {
            let vertexA = group.shift();
            group.forEach((vertexB) => {
                let match = edges.find(
                    (edge) =>
                        (edge.vertexA == vertexA && edge.vertexB == vertexB) ||
                        (edge.vertexA == vertexB && edge.vertexB == vertexA)
                );

                if (match == undefined)
                    edges.push(new Edge(vertexA, vertexB, 0));
            });
        }
    });

    //console.log(
    //    `Molecular structure generated after ${failedAttempts} failed attempts.`
    //);
    //console.log("Vertices: ", vertices);
    //console.log("Edges: ", edges);

    return new Graph(vertices, edges);
};

// Rendering
Molecule.prototype.drawGraph = function () {
    // Remove previous SVG graph
    while (this.svg.firstChild) {
        this.svg.firstChild.remove();
    }

    // Draw vertices
    let verticesGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );
    for (let i = 0; i < this.graph.vertices.length; i++) {
        let vertex = this.graph.vertices[i];
        let atom = periodicTable[vertex.atomicNumber];
        let hsl = { ...atom.color };
        let radius = Molecule.transformRadius(atom.radius);

        let circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        circle.setAttribute("r", radius.toFixed(this.prеcision));
        circle.setAttribute("class", atom.symbol);

        circle.setAttribute("fill", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
        circle.setAttribute(
            "stroke",
            `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l * this.strokeDarkeningFactor}%)`
        ); // darken the stroke color
        circle.setAttribute("stroke-width", this.strokeWidth);

        circle.setAttribute("cx", vertex.coords.x.toFixed(this.prеcision));
        circle.setAttribute("cy", vertex.coords.y.toFixed(this.prеcision));

        let text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
        );
        text.textContent = atom.symbol;
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("alignment-baseline", "central");
        text.setAttribute("font-size", radius.toFixed(this.prеcision));

        let textColor = hsl.l >= 50 ? "black" : "white";
        text.setAttribute("fill", textColor);
        text.setAttribute("stroke-color", textColor);

        text.setAttribute("x", vertex.coords.x.toFixed(this.prеcision));
        text.setAttribute("y", vertex.coords.y.toFixed(this.prеcision));

        verticesGroup.append(circle, text);
    }

    // Draw edges
    let edgesGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );
    for (let i = 0; i < this.graph.edges.length; i++) {
        let edge = this.graph.edges[i];

        let vertexA = this.graph.vertices[edge.vertexA];
        let vertexB = this.graph.vertices[edge.vertexB];

        let atomA = periodicTable[vertexA.atomicNumber];
        let atomB = periodicTable[vertexB.atomicNumber];

        let direction = {
            x: vertexB.coords.x - vertexA.coords.x,
            y: vertexB.coords.y - vertexA.coords.y,
        };
        let length = Math.sqrt(
            direction.x * direction.x + direction.y * direction.y
        );
        direction.x /= length;
        direction.y /= length;

        let normal = {
            x: -direction.y,
            y: direction.x,
        };

        let radiusA = Molecule.transformRadius(atomA.radius);
        let radiusB = Molecule.transformRadius(atomB.radius);
        let midpoint = {
            x: (
                    (vertexA.coords.x + direction.x * radiusA) +
                    (vertexB.coords.x - direction.x * radiusB)
                ) / 2, // prettier-ignore
            y: (
                    (vertexA.coords.y + direction.y * radiusA) +
                    (vertexB.coords.y - direction.y * radiusB)
                ) / 2, // prettier-ignore
        };

        for (let j = 0; j < edge.order; j++) {
            let line1 = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );
            line1.setAttribute(
                "stroke",
                `hsl(${atomA.color.h}, ${atomA.color.s}%, ${
                    atomA.color.l * this.strokeDarkeningFactor
                }%)`
            );
            line1.setAttribute("stroke-width", this.strokeWidth);

            let line2 = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "line"
            );
            line2.setAttribute(
                "stroke",
                `hsl(${atomB.color.h}, ${atomB.color.s}%, ${
                    atomB.color.l * this.strokeDarkeningFactor
                }%)`
            );
            line2.setAttribute("stroke-width", this.strokeWidth);

            let vertexANew = { ...vertexA.coords };
            let vertexBNew = { ...vertexB.coords };
            let midpointNew = { ...midpoint };

            let factor = (j - (edge.order - 1) / 2) * this.bondOffset;
            vertexANew.x += factor * normal.x;
            vertexANew.y += factor * normal.y;
            vertexBNew.x += factor * normal.x;
            vertexBNew.y += factor * normal.y;
            midpointNew.x += factor * normal.x;
            midpointNew.y += factor * normal.y;

            line1.setAttribute("x1", vertexANew.x.toFixed(this.prеcision));
            line1.setAttribute("y1", vertexANew.y.toFixed(this.prеcision));
            line1.setAttribute("x2", midpointNew.x.toFixed(this.prеcision));
            line1.setAttribute("y2", midpointNew.y.toFixed(this.prеcision));

            line2.setAttribute("x1", vertexBNew.x.toFixed(this.prеcision));
            line2.setAttribute("y1", vertexBNew.y.toFixed(this.prеcision));
            line2.setAttribute("x2", midpointNew.x.toFixed(this.prеcision));
            line2.setAttribute("y2", midpointNew.y.toFixed(this.prеcision));

            edgesGroup.append(line1, line2);
        }
    }

    this.svg.append(edgesGroup, verticesGroup);
};

// Event handling
const moleculeResizeObserver = new ResizeObserver((entries) => {
    // Resize event
    entries.forEach((entry) => {
        let svg = entry.target.svg;
        svg.setAttribute("width", entry.contentRect.width + "px");
        svg.setAttribute("height", entry.contentRect.height + "px");
    });
});

Molecule.prototype.toSVGPos = function (clientPos) {
    if (clientPos.x < 0) clientPos.x = 0;
    if (clientPos.y < 0) clientPos.y = 0;
    if (clientPos.x > this.svg.clientWidth) clientPos.x = this.svg.clientWidth;
    if (clientPos.y > this.svg.clientWidth) clientPos.y = this.svg.clientWidth;

    let svgPoint = this.svg.createSVGPoint();
    svgPoint.x = clientPos.x;
    svgPoint.y = clientPos.y;

    let svgMatrix = this.svg.getScreenCTM().inverse();
    return svgPoint.matrixTransform(svgMatrix);
};

Molecule.prototype.nearestVertex = function (pos) {
    let vertexID,
        minDistSqr = Infinity;

    this.graph.vertices.forEach((vertex, i) => {
        let offset = {
            x: vertex.coords.x - pos.x,
            y: vertex.coords.y - pos.y,
        };
        let distSqr = offset.x * offset.x + offset.y * offset.y;

        if (distSqr < minDistSqr) {
            vertexID = i;
            minDistSqr = distSqr;
        }
    });

    atomicNumber = this.graph.vertices[vertexID].atomicNumber;
    atomicRadius = periodicTable[atomicNumber].radius;
    if (
        Math.sqrt(minDistSqr) <=
        Molecule.transformRadius(atomicRadius) + this.strokeWidth
    ) {
        console.log("Vertex ID: " + vertexID);
        return vertexID;
    }
};

Molecule.prototype.handleStartEvent = function (e) {
    if (!this.graph) return;

    let pos;
    if (e.type == "mousedown") {
        pos = { x: e.clientX, y: e.clientY };
    } else if (e.type == "touchstart") {
        let touch = e.changedTouches[0];
        pos = { x: touch.clientX, y: touch.clientY };
    }

    let vertexID = this.nearestVertex(this.toSVGPos(pos));
    if (vertexID != undefined) {
        this.controllerData.active = true;
        this.controllerData.vertexID = vertexID;
        this.controllerData.clientPos = pos;
    }
};

Molecule.prototype.handleMoveEvent = function (e) {
    if (this.controllerData.active) {
        if (e.type == "mousemove") {
            this.controllerData.clientPos.x = e.clientX;
            this.controllerData.clientPos.y = e.clientY;
        } else if (e.type == "touchmove") {
            let touch = e.changedTouches[0];
            this.controllerData.clientPos.x = touch.clientX;
            this.controllerData.clientPos.y = touch.clientY;
        }
    }
};

Molecule.prototype.handleEndEvent = function (e) {
    this.controllerData.active = false;
    this.controllerData.vertexID = undefined;
    this.controllerData.clientPos = undefined;
};

Molecule.prototype.controllerUpdate = function (dt) {
    if (this.controllerData.clientPos) {
        let targetPos = this.toSVGPos(this.controllerData.clientPos);

        let coords = this.graph.vertices[this.controllerData.vertexID].coords;
        coords.x = Molecule.lerp(coords.x, targetPos.x, dt);
        coords.y = Molecule.lerp(coords.y, targetPos.y, dt);
    }
};

// Update Loop
Molecule.prototype.updateGraph = function () {
    let updateEdge = (a, b, order) => {
        let center = {
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2,
        };

        let offset = {
            x: a.x - b.x,
            y: a.y - b.y,
        };

        let currentLength = offset.x * offset.x + offset.y * offset.y;

        let targetLength;
        if (order == 0) targetLength = currentLength + this.repulsionForce;
        else targetLength = 0.25 / order;

        let factor = 0.5 / currentLength;
        factor *= Molecule.lerp(currentLength, targetLength, this.dt);

        offset.x *= factor;
        offset.y *= factor;

        a.x = center.x + offset.x;
        a.y = center.y + offset.y;

        b.x = center.x - offset.x;
        b.y = center.y - offset.y;
    };

    for (let i = 0; i < this.iterations; i++) {
        this.controllerUpdate(this.dt); // Important
        this.graph.edgeIndices.shuffle();
        for (let j = 0; j < this.graph.edges.length; j++) {
            let edgeIndex = this.graph.edgeIndices[j];
            let edge = this.graph.edges[edgeIndex];
            let vertexA = this.graph.vertices[edge.vertexA];
            let vertexB = this.graph.vertices[edge.vertexB];

            updateEdge(vertexA.coords, vertexB.coords, edge.order);
        }
    }
};

Molecule.prototype.drawUpdatedGraph = function () {
    // Update vertices
    let circlesAndText = this.svg.lastChild.childNodes;
    for (let i = 0; i < this.graph.vertices.length; i++) {
        let vertex = this.graph.vertices[i];

        let circle = circlesAndText[i * 2];
        let text = circlesAndText[i * 2 + 1];

        circle.setAttribute("cx", vertex.coords.x.toFixed(this.prеcision));
        circle.setAttribute("cy", vertex.coords.y.toFixed(this.prеcision));

        text.setAttribute("x", vertex.coords.x.toFixed(this.prеcision));
        text.setAttribute("y", vertex.coords.y.toFixed(this.prеcision));
    }

    // Update edges
    let index = 0;
    let lines = this.svg.firstChild.childNodes;
    for (let i = 0; i < this.graph.edges.length; i++) {
        let edge = this.graph.edges[i];

        let vertexA = this.graph.vertices[edge.vertexA];
        let vertexB = this.graph.vertices[edge.vertexB];

        let atomA = periodicTable[vertexA.atomicNumber];
        let atomB = periodicTable[vertexB.atomicNumber];

        let direction = {
            x: vertexB.coords.x - vertexA.coords.x,
            y: vertexB.coords.y - vertexA.coords.y,
        };

        let length = Math.sqrt(
            direction.x * direction.x + direction.y * direction.y
        );
        direction.x /= length;
        direction.y /= length;

        let normal = {
            x: -direction.y,
            y: direction.x,
        };

        let radiusA = Molecule.transformRadius(atomA.radius);
        let radiusB = Molecule.transformRadius(atomB.radius);
        let midpoint = {
            x:
                (vertexA.coords.x +
                    direction.x * radiusA +
                    (vertexB.coords.x - direction.x * radiusB)) /
                2,
            y:
                (vertexA.coords.y +
                    direction.y * radiusA +
                    (vertexB.coords.y - direction.y * radiusB)) /
                2,
        };

        for (let j = 0; j < edge.order; j++) {
            let line1 = lines[index];
            let line2 = lines[index + 1];

            let vertexANew = { ...vertexA.coords };
            let vertexBNew = { ...vertexB.coords };
            let midpointNew = { ...midpoint };

            let factor = (j - (edge.order - 1) / 2) * this.bondOffset;

            vertexANew.x += factor * normal.x;
            vertexANew.y += factor * normal.y;
            vertexBNew.x += factor * normal.x;
            vertexBNew.y += factor * normal.y;
            midpointNew.x += factor * normal.x;
            midpointNew.y += factor * normal.y;

            line1.setAttribute("x1", vertexANew.x.toFixed(this.prеcision));
            line1.setAttribute("y1", vertexANew.y.toFixed(this.prеcision));
            line1.setAttribute("x2", midpointNew.x.toFixed(this.prеcision));
            line1.setAttribute("y2", midpointNew.y.toFixed(this.prеcision));

            line2.setAttribute("x1", vertexBNew.x.toFixed(this.prеcision));
            line2.setAttribute("y1", vertexBNew.y.toFixed(this.prеcision));
            line2.setAttribute("x2", midpointNew.x.toFixed(this.prеcision));
            line2.setAttribute("y2", midpointNew.y.toFixed(this.prеcision));

            index += 2;
        }
    }

    // Update viewbox
    let min = { x: Infinity, y: Infinity };
    let max = { x: -Infinity, y: -Infinity };

    for (let i = 0; i < this.graph.vertices.length; i++) {
        let vertex = this.graph.vertices[i];

        min.x = Math.min(vertex.coords.x, min.x);
        min.y = Math.min(vertex.coords.y, min.y);

        max.x = Math.max(vertex.coords.x, max.x);
        max.y = Math.max(vertex.coords.y, max.y);
    }

    min.x -= this.viewboxMargin.x;
    min.y -= this.viewboxMargin.y;

    max.x += this.viewboxMargin.x;
    max.y += this.viewboxMargin.y;

    let size = {
        x: max.x - min.x,
        y: max.y - min.y,
    };

    this.svg.setAttribute(
        "viewBox",
        `${min.x.toFixed(this.prеcision)} ${min.y.toFixed(
            this.prеcision
        )} ${size.x.toFixed(this.prеcision)} ${size.y.toFixed(this.prеcision)}`
    );
};

// Utilities
Array.prototype.shuffle = function () {
    // Source: StackOverflow
    let currentIndex = this.length,
        randomIndex;

    while (currentIndex != 0) {
        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element
        [this[currentIndex], this[randomIndex]] = [
            this[randomIndex],
            this[currentIndex],
        ];
    }
};

Molecule.lerp = function (a, b, t) {
    if (t < 0) return a;
    if (t > 1) return t;
    return a * (1 - t) + b * t;
};

Molecule.transformRadius = function (radius) {
    return 0.05 * Math.log(radius) - 0.1;
};
