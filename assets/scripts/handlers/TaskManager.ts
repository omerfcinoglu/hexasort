import { _decorator, Component, Node } from 'cc';
import { TaskQueue } from '../core/TaskQueue';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { EventSystem } from '../utils/EventSystem';
import { Events } from '../../data/Events';
import { GroundTile, GroundTileStates } from '../entity/GroundTile';
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
        const stackedGrounds: GroundTile[] = [];
        for (const ground of processedGrounds) {
            
            if (ground.state === GroundTileStates.ReadyForStack) {
                console.log(ground.state);

                const stackResult = await this.m_stackHandler.processSingleStack(ground);
                if (stackResult) {
                    stackedGrounds.push(ground);
                }
            }
        }

        await this.ProcessTransfer(stackedGrounds);
    }

    async ProcessTransfer(markedGround: GroundTile[]): Promise<Set<GroundTile>> {
        const processingQueue: GroundTile[] = [...markedGround];
        const processedGroundsLog: Set<GroundTile> = new Set();

        while (processingQueue.length > 0) {
            const currentGround = processingQueue.shift();
            if (!currentGround || processedGroundsLog.has(currentGround)) continue;
            processedGroundsLog.add(currentGround);

            if (currentGround.state !== GroundTileStates.ReadyForNeighbor) continue;

            try {
                currentGround.state = GroundTileStates.Busy;
                const neighbors = await this.m_neighborHandler.processNeighbors(currentGround);

                for (const ground of neighbors) {
                    if (!processingQueue.includes(ground) && !processedGroundsLog.has(ground)) {
                        processingQueue.push(ground);
                    }
                }
            } finally {
                currentGround.state = GroundTileStates.ReadyForStack;
            }
        }

        return processedGroundsLog;
    }
}
