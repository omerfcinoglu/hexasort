import { _decorator, Component, Node } from 'cc';
import { TaskQueue } from '../core/TaskQueue';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { EventSystem } from '../utils/EventSystem';
import { Events } from '../../data/Events';
import { GroundTile, GroundTileStates } from '../entity/GroundTile';
import { NeighborHandler } from './NeighborHandler';
import { sleep } from '../helpers/Promises';
import { group } from 'console';
const { ccclass, property } = _decorator;

@ccclass('TaskManager')
export class TaskManager extends SingletonComponent<TaskManager> {

    private m_queue = new TaskQueue();
    private m_neighborHandler : NeighborHandler = new NeighborHandler();

    protected onLoad(): void {
        super.onLoad();
        EventSystem.getInstance().on(Events.ProcessMarkedGround, this.ProcessMarkedGround.bind(this), this);
    }

    async ProcessMarkedGround(initialMarkedGrounds: GroundTile[]): Promise<void> {
        let processTransferedGrounds : GroundTile[] = [];
        const processingQueue: GroundTile[] = [...initialMarkedGrounds];
        
        while (processingQueue.length > 0) {
            const currentGround = processingQueue.shift();
            
            if (!currentGround ) continue;
            
            console.log(currentGround);

            try {
                processTransferedGrounds = await this.m_neighborHandler?.processNeighbors(currentGround);
                for (const ground of processTransferedGrounds) {
                        if (!processingQueue.includes(ground)) {
                            processingQueue.push(ground);
                        }
                }
            } finally {
                // const stackedGrounds = await this.stackHandler?.processStacks(transferedGrounds);
                currentGround.state = GroundTileStates.Ready;
            }
        }
    }
}