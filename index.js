'use strict';
const { ipcRenderer } = require('electron');
const d3 = require('d3');

const Node = require('./models/Node.model');
const Link = require('./models/Link.model');

var topology = '';

let width;
let height;
let rayon;
let color;
let simulation;
let ctx;

var networkNodes = [];
var networkLinks = [];

let sliderDensity = document.getElementById('density');
sliderDensity.oninput = updateDensityValue;

document.getElementById('nodeNumber').addEventListener('change', generateNetwork);
sliderDensity.addEventListener('change', generateNetwork);

document.getElementById('exportBtn').addEventListener('click', () => {
    prepareForExport();
    ipcRenderer.send('export-network', topology);
});

document.getElementById('generateBtn').addEventListener('click', generateNetwork);

function updateDensityValue() {
    document.getElementById('densityValue').innerText = sliderDensity.value;
}

function generateNetwork() {
    let numberOfNodes = document.getElementById('nodeNumber').value;
    let density = sliderDensity.value;
    if(numberOfNodes < 3 || numberOfNodes > 150) {
        alert('the node number must be between 2 and 150');
        return;
    }
    // networkNodes = Node.Generate(numberOfNodes, width, height);
    // networkLinks = Link.Generate(networkNodes);
    generateBAGraph(numberOfNodes);
    prepareForExport();
    document.getElementById('networkContent').innerText = topology;
    generateGraph();
}

function prepareForExport() {
    topology = '# Positions\n';
    topology += Node.ListToString(networkNodes);
    topology += '\n# liens (symetriques)\n';
    topology += Link.ListToString(networkLinks);
}

// Function for the graph part.

function initGraph() {
    let canvas = d3.select('#networkGraph');
    width = canvas.attr('width');
    height = canvas.attr('height');
    ctx = canvas.node().getContext('2d');
    rayon = 6;
    color = d3.scaleOrdinal(d3.schemeCategory10);
    simulation = initSimulation();
}

function initSimulation() {
    return d3.forceSimulation()
            .force("x", d3.forceX((d) => { return d.posX; }))
            .force("y", d3.forceY((d) => { return d.posY; }))
            .force("collide", d3.forceCollide(rayon + 1))
            .force("charge", d3.forceManyBody()
                .strength(-50))
            .force('link', d3.forceLink()
                .id((d) => {return d.name}));
}

function update(){
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    networkLinks.forEach(link => {
        link.draw(ctx);
    })
    ctx.stroke();
    
    networkNodes.forEach(node => {
        node.draw(ctx, rayon, color(node.name))
    });
}

function generateGraph() {
    simulation.alpha(1).restart();
    simulation.nodes(networkNodes);
    simulation.force('link')
        .links(networkLinks);
    simulation.on('tick', update);
}

function getSumDegree() {
    let sum = 0;
    networkNodes.forEach(node => {
        sum += node.degree;
    })
    return sum;
}

function getProbability() {
    // return a array of [nodeId, nodeProbability]
    // P = degree(node)/sum of degree(nodes)
    let probArray = []
    let previousProb = 0;
    let degreeSum = getSumDegree();
    networkNodes.forEach(node => {
        let prob = node.degree / degreeSum;
        if(prob != 0) {
            prob += previousProb;
        }
        probArray[node.name] = prob;
        previousProb = prob;
    })
    return probArray;
}

function getGraphDensity() {
    return getSumDegree()/networkNodes.length;
}

function shuffle(array){
    array.sort(() => Math.random() - 0.5);
    return array;
}

function randomBetween(min, max) {
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cloneNodes(nbOfNodes) {
    let cloneArray = [];
    for(let i = 0; i < nbOfNodes; i++) {
        cloneArray[i] = networkNodes[i];
    }
    return cloneArray;
}

function getNodeToLink(randomNbr){
    let probArray = getProbability();
    for(let prop in probArray) {
        if(probArray[prop] >= randomNbr) {
            return networkNodes.find(n => n.name === prop);
        }
    }
}

function addNode(node){
    let sourceList = [];
    let randomNbr = Math.random();
    let nbrOfNodes = networkNodes.length;
    let nbrOfLinks = networkLinks.length;
    let nodeSource = getNodeToLink(randomNbr);
    sourceList[0] = nodeSource;
    networkNodes[nbrOfNodes] = node;
    let link = new Link();
    link.nodeSource = nodeSource.id;
    link.source = nodeSource.name;
    link.nodeTarget = node.id;
    link.target = node.name;
    node.degree++;
    nodeSource.degree++;
    networkLinks[nbrOfLinks] = link;
    while(getGraphDensity() < sliderDensity.value) {
        randomNbr = Math.random();
        nbrOfNodes = networkNodes.length;
        nbrOfLinks = networkLinks.length;
        nodeSource = getNodeToLink(randomNbr);
        if(sourceList.find(n => n.id === nodeSource.id) === undefined && nodeSource.id !== node.id) {
            let nbrOfSource = sourceList.length;
            sourceList[nbrOfSource] = nodeSource;
            let link = new Link();
            link.nodeSource = nodeSource.id;
            link.source = nodeSource.name;
            link.nodeTarget = node.id;
            link.target = node.name;
            node.degree++;
            nodeSource.degree++;
            networkLinks[nbrOfLinks] = link;
        }
        if (sourceList.length === networkNodes.length - 1) {
            break;
        }
    }
}

function generateBAGraph(nbrNode) {
    /*
    Create m0 = a radom number between 2 and nbrNode;
    Copy the m0 first node into a tabInit;
    Shuffle tabInit and loop link them
    loop for nbrNode - m0
        loop on density (density = avg(degree(nodes)))
            generate a random number between 0-1
            select the first bigger node to link it with
    */
    Node.nodeCounter = 0;
    let m0 = randomBetween(2, nbrNode/3); // m0 is the initial number of nodes
    networkNodes = Node.Generate(m0, width, height);
    let nodeInit = cloneNodes(m0);
    nodeInit = shuffle(nodeInit);
    networkLinks = Link.Generate(nodeInit);
    for(let i = 0; i < nbrNode-m0; i++) {
        addNode(Node.Generate(1, width, height)[0]);
    }
    console.log(networkLinks.length);
}

function generateRingGraph(nbrNode) {

}

initGraph();
updateDensityValue();