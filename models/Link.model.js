'use strict';

class Link {
    nodeSource;
    nodeTarget;
    source;
    target;

    constructor (nodeSource, nodeTarget, source, target){
        this.nodeSource = nodeSource;
        this.nodeTarget = nodeTarget;
        this.source = source;
        this.target = target;
    }

    print() {
        console.log(this.nodeSource + ' ' + this.nodeTarget);
    }

    export() {
        return this.nodeSource + ' ' + this.nodeTarget + '\n';
    }

    draw(ctx) {
        ctx.moveTo(this.source.x, this.source.y);
        ctx.lineTo(this.target.x, this.target.y);
    }

    static Generate(networkNodes) {
        let linkList = [];
        for(let i = 0; i < networkNodes.length; i++) {
            let nodeSource = i;
            let source = networkNodes[i].name;
            let nodeTarget;
            let target;
            if((i+1) >= networkNodes.length) {
                nodeTarget = 1;
                target = networkNodes[0].name;
            } else {
                nodeTarget = i + 1;
                target = networkNodes[i+1].name;
            }
            let link = new Link(nodeSource, nodeTarget, source, target);
            linkList[i] = link; 
        }
        return linkList;
    }

    static ListToString(linkList) {
        let str = '';
        linkList.forEach(element => {
            str += element.export();
        });
        return str;
    }
}

module.exports = Link;