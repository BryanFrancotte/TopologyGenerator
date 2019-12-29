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
    if(numberOfNodes < 2 || numberOfNodes > 150) {
        alert('the node number must be between 2 and 150');
        return;
    }
    networkNodes = Node.Generate(numberOfNodes, width, height);
    networkLinks = Link.Generate(networkNodes);
    prepareForExport();
    document.getElementById('networkContent').innerText = topology;
    simulation.alpha(1).restart();
    simulation.nodes(networkNodes);
    simulation.force('link')
        .links(networkLinks);
    simulation.on('tick', update);
}

function prepareForExport() {
    topology = '# Positions\n';
    topology += Node.ListToString(networkNodes);
    topology += '\n# liens (symetriques)\n';
    topology += Link.ListToString(networkLinks);
}

// Function for the graph part.

function initGraph() {
    console.log('init graph')
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
                .strength(-20))
            .force('link', d3.forceLink()
                .id((d) => {return d.name}));
}

function update(){
    console.log('update simulation')
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

initGraph();
updateDensityValue();