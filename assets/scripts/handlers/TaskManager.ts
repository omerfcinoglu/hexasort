import { _decorator, Component, Node } from 'cc';
import { TaskQueue } from '../core/TaskQueue';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { EventSystem } from '../utils/EventSystem';
import { Events } from '../../data/Events';
import { GroundTile } from '../entity/GroundTile';
import { NeighborHandler } from './NeighborHandler';
import { StackHandler } from './StackHandler';
const { ccclass, property } = _decorator;
@ccclass('TaskManager')
export class TaskManager extends SingletonComponent<TaskManager> {

    private m_queue = new TaskQueue();
    private m_neighborHandler: NeighborHandler = new NeighborHandler();
    private m_stackHandler: StackHandler = new StackHandler();

    protected onLoad(): void {
        super.onLoad();
        EventSystem.getInstance().on(Events.ProcessMarkedGround, this.ProcessMarkedGroundTransfer.bind(this), this);
    }

    async ProcessMarkedGroundTransfer(initialMarkedGround: GroundTile): Promise<void> {
        
        const stack = await this.ProcessTransfer([initialMarkedGround]);
        if (stack.size > 0) {
            await this.ProcessStack(Array.from(stack));
        }
    }

    async ProcessStack(processedGrounds: GroundTile[]) {
            if (processedGrounds.length>0) {
                const stackResult = await this.m_stackHandler.processStacks(processedGrounds);
                if (stackResult) {
                    await this.ProcessTransfer(stackResult);
                }
        }
    }

    async ProcessTransfer(markedGround: GroundTile[]): Promise<Set<GroundTile>> {
        const processingQueue: GroundTile[] = [...markedGround];
        const processedGroundsLog: Set<GroundTile> = new Set();
        console.log(markedGround);
        
        while (processingQueue.length > 0) {
            const currentGround = processingQueue.shift();
            processedGroundsLog.add(currentGround);
            try {
                const neighbors = await this.m_neighborHandler.processNeighbors(currentGround);

                for (const ground of neighbors) {
                    if (!processingQueue.includes(ground) && !processedGroundsLog.has(ground)) {
                        processingQueue.push(ground);
                    }
                }
            } finally {
            }
        }

        return processedGroundsLog;
    }
}
