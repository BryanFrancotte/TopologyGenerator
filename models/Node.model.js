'use strict';

class Node {
    name;
    posX;
    posY;
    degree;

    constructor(id, posX, posY) {
        this.name = 'R' + id;
        this.posX = posX;
        this.posY = posY;
        this.degree = 0;
    }

    print() {
        console.log(this.posX + ' ' + this.posY + ' # ' + this.name);
    }

    export() {
        return this.posX + ' ' + this.posY + ' # ' + this.name + '\n';
    }

    draw(ctx, rayon, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, rayon, 0, Math.PI * 2);
        ctx.fill(); 
        ctx.font = '10px Arial';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y + rayon + 15);
    }

    static Generate(nbr, width, height) {
        let nodeList = [];
        for(let i = 0; i < nbr; i++) {
            let node = new Node(i + 1, getRandom(width - 24), getRandom(height - 34))
            nodeList[i] = node;
        }
        return nodeList;
    }

    static ListToString(list) {
        let outString = ''
        networkNodes.forEach(element => {
            outString += element.export();
        });
        return outString;
    }
}

function getRandom(range) {
    return Math.floor(Math.random() * range) + 12;
}

module.exports = Node;