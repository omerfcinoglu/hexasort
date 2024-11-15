import { _decorator, Component, Node } from 'cc';
import { GroundTile } from '../entity/GroundTile';
import { TileAnimator } from '../helpers/TileAnimator';
const { ccclass, property } = _decorator;

@ccclass('StackHandler')
export class StackHandler {
    private matchStackCount = 0;

    constructor(matchStackCount = 5){
        this.matchStackCount = matchStackCount; 
    }

    async processStacks(grounds: GroundTile[]) : Promise<GroundTile[]> {
        const processedGrounds : GroundTile[] = [];
        for (const ground of grounds) {
            const lastCluster = ground.getLastCluster();
            if (lastCluster && lastCluster.getLength() >= this.matchStackCount) {
                await TileAnimator.animateTilesToZeroScale(lastCluster.getTiles());
                ground.popTileCluster();
                processedGrounds.push(ground)
            }
        }

        return processedGrounds;
    }
}

