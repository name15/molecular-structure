// WARNING: This model is extremely simplified: valence is the only simulation parameter
const svgNS = "http://www.w3.org/2000/svg";

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
        
        this.edgeIndices = Array.from({length: edges.length}, (v, i) => i); 
    }
}

const periodicTable = [];

periodicTable[1] = {symbol: "H",   valence: 1, radius: 53,  color: {h: 0, s: 0, l: 100}};
periodicTable[2] = {symbol: "He",  valence: 0, radius: 31,  color: {h: 180, s: 100, l: 50}};
periodicTable[3] = {symbol: "Li",  valence: 1, radius: 167, color: {h: 268, s: 100, l: 50}};
periodicTable[4] = {symbol: "Be",  valence: 2, radius: 112, color: {h: 120, s: 100, l: 23}};
periodicTable[5] = {symbol: "B",   valence: 3, radius: 87,  color: {h: 22, s: 100, l: 73}};
periodicTable[6] = {symbol: "C",   valence: 4, radius: 67,  color: {h: 0, s: 0, l: 13}};
periodicTable[7] = {symbol: "N",   valence: 3, radius: 56,  color: {h: 235, s: 100, l: 57}};
periodicTable[8] = {symbol: "O",   valence: 2, radius: 167, color: {h: 8, s: 100, l: 50}};
periodicTable[9] = {symbol: "F",   valence: 1, radius: 42,  color: {h: 120, s: 87, l: 53}};
periodicTable[10] = {symbol: "Ne", valence: 0, radius: 38,  color: {h: 180, s: 100, l: 50}};
periodicTable[11] = {symbol: "Na", valence: 1, radius: 190, color: {h: 268, s: 100, l: 50}};
periodicTable[12] = {symbol: "Mg", valence: 2, radius: 167, color: {h: 120, s: 100, l: 23}};
periodicTable[13] = {symbol: "Al", valence: 3, radius: 118, color: {h: 180, s: 4, l: 53}};
periodicTable[14] = {symbol: "Si", valence: 4, radius: 111, color: {h: 43, s: 84, l: 45}};
periodicTable[15] = {symbol: "P",  valence: 5, radius: 98,  color: {h: 36, s: 100, l: 50}};
periodicTable[16] = {symbol: "S",  valence: 6, radius: 88,  color: {h: 53, s: 100, l: 57}};
periodicTable[17] = {symbol: "Cl", valence: 1, radius: 79,  color: {h: 120, s: 87, l: 53}};
periodicTable[18] = {symbol: "Ar", valence: 0, radius: 71,  color: {h: 180, s: 100, l: 50}};
periodicTable[19] = {symbol: "K",  valence: 1, radius: 243, color: {h: 268, s: 100, l: 50}};
periodicTable[20] = {symbol: "Ca", valence: 2, radius: 194, color: {h: 120, s: 100, l: 23}};

periodicTable[35] = {symbol: "Br", valence: 1, radius: 94,  color: {h: 13, s: 100, l: 30}};

periodicTable[53] = {symbol: "I",  valence: 1, radius: 115, color: {h: 273, s: 100, l: 37}};

function transformRadius(radius) {return 0.05 * Math.log(radius) - 0.1; }

// Controls
class Controls {
    constructor(svg, graph, strokeWidth) {
        this.clientData = {mouse: {}, touches: []};
        this.graph = graph;
        this.svg = svg;
        this.strokeWidth = strokeWidth;

        window.addEventListener("mousedown", (e) => this.vertexDown(e));
        window.addEventListener("mousemove", (e) => this.vertexMove(e));
        window.addEventListener("mouseup", (e) => this.vertexUp(e));

        window.addEventListener("touchstart", (e) => this.vertexDown(e));
        window.addEventListener("touchmove", (e) => this.vertexMove(e));
        window.addEventListener("touchend", (e) => this.vertexUp(e));
    }
    removeEventListeners
}

Controls.prototype.toSVGPos = function(clientPos) {
    let svgPoint = this.svg.createSVGPoint();
    svgPoint.x = clientPos.x;
    svgPoint.y = clientPos.y;

    let svgMatrix = this.svg.getScreenCTM().inverse();
    return svgPoint.matrixTransform(svgMatrix);
}

Controls.prototype.nearestVertex = function(pos) {
    let vertexID, 
        minDistSqr = Infinity;
    
    this.graph.vertices.forEach((vertex, i) => {
        let offset = {
            x: vertex.coords.x - pos.x,
            y: vertex.coords.y - pos.y
        };
        let distSqr = offset.x * offset.x + offset.y * offset.y;

        if (distSqr < minDistSqr) {
            vertexID = i;
            minDistSqr = distSqr;
        }
    });

    atomicNumber = this.graph.vertices[vertexID].atomicNumber;
    atomicRadius = periodicTable[atomicNumber].radius;
    if (Math.sqrt(minDistSqr) <= transformRadius(atomicRadius) + this.strokeWidth) {
        console.log("VertexID: " + vertexID);
        return vertexID;
    }
}

Controls.prototype.vertexDown = function(e) {
    if (e.type == "mousedown") {
        let pos = {x: e.clientX, y: e.clientY};
        let vertexID = this.nearestVertex(this.toSVGPos(pos));
        if (vertexID != undefined) {
            this.clientData.mouse.active = true;
            this.clientData.mouse.vertexID = vertexID;
            this.clientData.mouse.initClientPos = pos;
        }
    } else if (e.type == "touchstart") {
        for (let i = 0; i < e.touches.length; i++) {
            let touch = e.touches[i];
            let pos = {x: touch.clientX, y: touch.clientY};
            let vertexID = this.nearestVertex(this.toSVGPos(pos));
            this.clientData.touches[i] = {
                active: vertexID != undefined,
                vertexID: vertexID,
                initClientPos: pos
            };
        }
    }
}

Controls.prototype.vertexMove = function(e) {
    if (e.type == "mousemove" && this.clientData.mouse.active) {
        let pos = {x: e.clientX, y: e.clientY};
        this.clientData.mouse.clientPos = pos;
    } else if (e.type == "touchmove") {
        for (let i = 0; i < e.touches.length; i++) {
            if (this.clientData.touches[i].active) {
                let touch = e.touches[i];
                let pos = {x: touch.clientX, y: touch.clientY};
                this.clientData.touches[i].clientPos = pos;    
            }
        };
    }
}

Controls.prototype.vertexUp = function(e) {
    if (e.type == "mouseup") {
        this.clientData.mouse.active = false;
        this.clientData.mouse.vertexID = undefined;
        this.clientData.mouse.clientPos = undefined;
        this.clientData.mouse.initClientPos = undefined;
    }
    if (e.type == "touchend") {
        this.clientData.touches = [];
    };
}

// Update cycle
Controls.prototype.update = function(dt) {
    offsetVertex = (targetPos, vertexID) => {
        let coords = this.graph.vertices[vertexID].coords;
        coords.x = lerp(coords.x, targetPos.x, dt);
        coords.y = lerp(coords.y, targetPos.y, dt);

        return vertexID;
    }
    
    if (this.clientData.mouse.clientPos) {
        let targetPos = this.toSVGPos(this.clientData.mouse.clientPos);

        offsetVertex(
            targetPos,
            this.clientData.mouse.vertexID
        );
    }
    for (let i = 0; i < this.clientData.touches.length; i++) {
        if (this.clientData.touches[i].clientPos) {
            let targetPos = this.toSVGPos(this.clientData.touches[i].clientPos);

            offsetVertex(
                targetPos,
                this.clientData.touches[i].vertexID
            );
        }
    }
}

class Simulation {
    // Simulation parameters
    iterations = 12;
    repulsionForce = 0.05;
    allowMultipleGroups = false;
    maxFailedAttempts = 100;
    
    // Visualisation parameters
    viewboxMargin = {x: 0.66, y: 0.66};
    maxViewboxSize = {x: 10, y: 10};
    bondOffset = 0.05;
    strokeWidth = 0.025;
    strokeDarkeningFactor = 0.75;

    // Controls
    constructor(svg) {
        this.svg = svg;
    }

    simulationID = 0;
    start(...atoms) {
        console.log(`Generating molecular structure for atoms '${atoms.join(", ")}'.`);
        
        this.graph = this.createGraph(atoms);
        this.simulationID++;
        
        this.drawGraph();
        this.controls = new Controls(this.svg, this.graph, this.strokeWidth);

        this.time = Date.now();
        window.requestAnimationFrame(() => this.update(this.simulationID));
    }

    update(id) {
        this.dt = (Date.now() - this.time) / 1000;

        this.updateGraph();
        this.drawUpdatedGraph();

        this.time = Date.now();
        if (id == this.simulationID) {
            window.requestAnimationFrame(() => this.update(id));
        } else {
            console.log("Stop!");
        }
    }
}

// Generation
Simulation.prototype.createGraph = function(atoms) {
    atoms.sort().reverse();

    // Randomize vertices
    let vertices = atoms.map(atomicNumber => {
        let coords = {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1
        };
        
        return new Vertex(coords, atomicNumber);
    });

    let sum = 0;
    atoms.forEach(atomicNumber => {
        sum += periodicTable[atomicNumber].valence;
    });

    if (sum % 2 != 0) throw `Invalid atom sequence.`;

    // Randomize edges
    let edges; let groups; 
    
    failedAttempts = 0;
    success = false;
    while (!success && failedAttempts < this.maxFailedAttempts) {
        try {
            edges = [];
            groups = Array.from({length: atoms.length}, (v, i) => [i]);
            
    
            let valence = atoms.map(atomicNumber => 
                periodicTable[atomicNumber].valence
            );
            
            let getIndex = (n) => {
                let id = 0, sum = 0;
                while (id < valence.length) {
                    sum += valence[id];
                    if (sum >= n) return id;
                    id++;
                }
            }        

            let max = sum;
            for (let i = 0; i < sum / 2; i++) {
                //console.log(valence, max);
                
                let vertexA = getIndex(1);
            
                let min = valence[vertexA] + 1;
                let n = Math.floor(Math.random() * (max - min + 1)) + min; // Random number between min and max
                if (min > max) throw `Invalid bond sequence.`;
                //console.log(`min: ${min}, max: ${max}, n: ${n}`);
                
                let vertexB = getIndex(n); // TODO

                valence[vertexA]--;
                valence[vertexB]--;

                //console.log("Bond: " + vertexA + " - " + vertexB);
                
                let match = edges.find(edge => (
                    edge.vertexA == vertexA && edge.vertexB == vertexB || 
                    edge.vertexA == vertexB && edge.vertexB == vertexA
                ));

                if (match) match.order++;
                else edges.push(new Edge(vertexA, vertexB, 1));
                
                max -= 2;
            }

            // Add repulsion edges
            find = vertex => {
                let matchIndex;
                for (let i = 0; i < groups.length; i++) {
                    if (groups[i].includes(vertex)) {
                        matchIndex = i; break;
                    }
                }
                return matchIndex;
            }

            edges.forEach(edge => {
                let groupA = find(edge.vertexA);
                let groupB = find(edge.vertexB);
                
                if (groupA != groupB) {
                    a = groups[groupA];
                    b = groups[groupB];
                    
                    groups = groups.filter((group, i) => i != groupA && i != groupB);
                    
                    groups.unshift(a.concat(b));
                }
            });

            //console.log(JSON.parse(JSON.stringify(groups)));

            if (groups.length > 1) {
                message = `The graph has ${groups.length} groups, only one expected`;
                if (this.allowMultipleGroups) console.warn(message);
                else throw message;
            }

            success = true;
        } catch (e) {
            failedAttempts++;
            
            if (failedAttempts == this.maxFailedAttempts) throw `Could not generate the graph after ${this.maxFailedAttempts} failed attempts.`;
        }
    }
 
    groups.forEach(group => {
        while (group.length > 0) {
            let vertexA = group.shift();
            group.forEach(vertexB => {
                let match = edges.find(edge => (
                    edge.vertexA == vertexA && edge.vertexB == vertexB || 
                    edge.vertexA == vertexB && edge.vertexB == vertexA
                ));

                if (match == undefined) edges.push(new Edge(vertexA, vertexB, 0));
            });
        }
    });

    console.log(`Molecule structure generated after ${failedAttempts} failed attempts.`);
    console.log(vertices);
    console.log(edges);
    
    return new Graph(vertices, edges);
}

// Thanks, StackOverflow
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    while (currentIndex != 0) {
        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

function lerp(a, b, t) {
    if (t < 0) return a;
    if (t > 1) return t;
    return a * (1 - t) + b * t;
}

Simulation.prototype.updateGraph = function() {
    let updateEdge = (a, b, order) => {
        let center = {
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2
        };
        
        let offset = {
            x: a.x - b.x,
            y: a.y - b.y
        };
        
        let currentLength = offset.x * offset.x + offset.y * offset.y;
        
        let targetLength;
        if (order == 0) targetLength = currentLength + this.repulsionForce;
        else targetLength = order / 10;
        
        let factor = 0.5 / currentLength;
        factor *= lerp(currentLength, targetLength, this.dt);
        
        offset.x *= factor;
        offset.y *= factor;
        
        a.x = center.x + offset.x;
        a.y = center.y + offset.y;
        
        b.x = center.x - offset.x;
        b.y = center.y - offset.y;
    }

    for (let i = 0; i < this.iterations; i++) {
        this.controls.update(this.dt); // Important
        shuffle(this.graph.edgeIndices);
        for (let j = 0; j < this.graph.edges.length; j++) {
            let edgeIndex = this.graph.edgeIndices[j];
            let edge = this.graph.edges[edgeIndex];
            let vertexA = this.graph.vertices[edge.vertexA];
            let vertexB = this.graph.vertices[edge.vertexB];
            
            updateEdge(vertexA.coords, vertexB.coords, edge.order);
        }
    }
}

// Rendering
Simulation.prototype.drawGraph = function() {
    // Remove previous SVG graph
    while (this.svg.firstChild) {
        this.svg.firstChild.remove();
    }
    
    // Draw vertices
    let verticesGroup = document.createElementNS(svgNS, "g");
    for (let i = 0; i < this.graph.vertices.length; i++) {
        let vertex = this.graph.vertices[i];
        let atom = periodicTable[vertex.atomicNumber];
        let hsl = {...atom.color};
        let radius = transformRadius(atom.radius)

        let circle = document.createElementNS(svgNS, "circle");
        
        circle.setAttribute("r", radius);
        circle.setAttribute("class", atom.symbol);

        circle.setAttribute("fill", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
        circle.setAttribute("stroke", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l * this.strokeDarkeningFactor}%)`); // darken the stroke color
        circle.setAttribute("stroke-width", this.strokeWidth);
        
        circle.setAttribute("cx", vertex.coords.x.toFixed(3));
        circle.setAttribute("cy", vertex.coords.y.toFixed(3));
        
        let text = document.createElementNS(svgNS, "text");
        text.textContent = atom.symbol;
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("alignment-baseline", "central");
        text.setAttribute("font-size", radius);
        
        let textColor = hsl.l >= 50 ? "black": "white";
        text.setAttribute("fill", textColor);
        text.setAttribute("stroke-color", textColor);

        text.setAttribute("x", vertex.coords.x.toFixed(3));
        text.setAttribute("y", vertex.coords.y.toFixed(3));

        verticesGroup.append(circle, text);
    }

    // Draw edges
    let edgesGroup = document.createElementNS(svgNS, "g");
    for (let i = 0; i < this.graph.edges.length; i++) {
        let edge = this.graph.edges[i];
        
        let vertexA = this.graph.vertices[edge.vertexA];
        let vertexB = this.graph.vertices[edge.vertexB];
        
        let atomA = periodicTable[vertexA.atomicNumber];
        let atomB = periodicTable[vertexB.atomicNumber];

        let direction = {
            x: vertexB.coords.x - vertexA.coords.x,
            y: vertexB.coords.y - vertexA.coords.y
        };
        let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= length;
        direction.y /= length;
        
        let normal = {
            x: - direction.y,
            y: direction.x
        };

        let radiusA = transformRadius(atomA.radius);
        let radiusB = transformRadius(atomB.radius);        
        let midpoint = {
            x: ((vertexA.coords.x + direction.x * radiusA) + (vertexB.coords.x - direction.x * radiusB)) / 2,
            y: ((vertexA.coords.y + direction.y * radiusA) + (vertexB.coords.y - direction.y * radiusB)) / 2
        };
                        
        for (let j = 0; j < edge.order; j++) {
            let line1 = document.createElementNS(svgNS, "line");
            line1.setAttribute("stroke", `hsl(${atomA.color.h}, ${atomA.color.s}%, ${atomA.color.l * this.strokeDarkeningFactor}%)`);
            line1.setAttribute("stroke-width", this.strokeWidth);

            let line2 = document.createElementNS(svgNS, "line");
            line2.setAttribute("stroke", `hsl(${atomB.color.h}, ${atomB.color.s}%, ${atomB.color.l * this.strokeDarkeningFactor}%)`);
            line2.setAttribute("stroke-width", this.strokeWidth);
            
            let vertexANew = {...vertexA.coords};
            let vertexBNew = {...vertexB.coords};
            let midpointNew = {...midpoint};

            let factor = (j - (edge.order - 1) / 2) * this.bondOffset;
            vertexANew.x  += factor * normal.x;
            vertexANew.y  += factor * normal.y;
            vertexBNew.x  += factor * normal.x;
            vertexBNew.y  += factor * normal.y;
            midpointNew.x += factor * normal.x;
            midpointNew.y += factor * normal.y;

            line1.setAttribute("x1", vertexANew.x.toFixed(3));
            line1.setAttribute("y1", vertexANew.y.toFixed(3));
            line1.setAttribute("x2", midpointNew.x.toFixed(3));
            line1.setAttribute("y2", midpointNew.y.toFixed(3));
            
            line2.setAttribute("x1", vertexBNew.x.toFixed(3));
            line2.setAttribute("y1", vertexBNew.y.toFixed(3));
            line2.setAttribute("x2", midpointNew.x.toFixed(3));
            line2.setAttribute("y2", midpointNew.y.toFixed(3));
            
            edgesGroup.append(line1, line2);    
        }
    }

    this.svg.append(edgesGroup, verticesGroup);
}

Simulation.prototype.drawUpdatedGraph = function() {
    // Update vertices
    let circlesAndText = this.svg.lastChild.childNodes;
    for (let i = 0; i < this.graph.vertices.length; i++) {
        let vertex = this.graph.vertices[i];

        let circle = circlesAndText[i * 2];
        let text = circlesAndText[i * 2 + 1];
 
        circle.setAttribute("cx", vertex.coords.x.toFixed(3));
        circle.setAttribute("cy", vertex.coords.y.toFixed(3));

        text.setAttribute("x", vertex.coords.x.toFixed(3));
        text.setAttribute("y", vertex.coords.y.toFixed(3));
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
            y: vertexB.coords.y - vertexA.coords.y
        };

        let length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= length;
        direction.y /= length;

        let normal = {
            x: - direction.y,
            y: direction.x
        };

        let radiusA = transformRadius(atomA.radius);
        let radiusB = transformRadius(atomB.radius);        
        let midpoint = {
            x: ((vertexA.coords.x + direction.x * radiusA) + (vertexB.coords.x - direction.x * radiusB)) / 2,
            y: ((vertexA.coords.y + direction.y * radiusA) + (vertexB.coords.y - direction.y * radiusB)) / 2
        };

        for (let j = 0; j < edge.order; j++) {
            let line1 = lines[index];
            let line2 = lines[index + 1];
            
            let vertexANew = {...vertexA.coords};
            let vertexBNew = {...vertexB.coords};
            let midpointNew = {...midpoint};
            
            let factor = (j - (edge.order - 1) / 2) * this.bondOffset;
            
            vertexANew.x += factor * normal.x;
            vertexANew.y += factor * normal.y;
            vertexBNew.x += factor * normal.x;
            vertexBNew.y += factor * normal.y;
            midpointNew.x += factor * normal.x;
            midpointNew.y += factor * normal.y;

            line1.setAttribute("x1", vertexANew.x.toFixed(3));
            line1.setAttribute("y1", vertexANew.y.toFixed(3));
            line1.setAttribute("x2", midpointNew.x.toFixed(3));
            line1.setAttribute("y2", midpointNew.y.toFixed(3));
            
            line2.setAttribute("x1", vertexBNew.x.toFixed(3));
            line2.setAttribute("y1", vertexBNew.y.toFixed(3));
            line2.setAttribute("x2", midpointNew.x.toFixed(3));
            line2.setAttribute("y2", midpointNew.y.toFixed(3));

            index += 2;
        }
    }

    // Update viewbox
    let min = {x: Infinity, y: Infinity};
    let max = {x: -Infinity, y: -Infinity};
    
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
        y: max.y - min.y
    };
    
    if (size.x > this.maxViewboxSize.x || size.y > this.maxViewboxSize.y) console.warn("Viewbox size is too large");
        

    this.svg.setAttribute(
        "viewBox", 
        `${min.x.toFixed(3)} ${min.y.toFixed(3)} ${size.x.toFixed(3)} ${size.y.toFixed(3)}`
    );    
}