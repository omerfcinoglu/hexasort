import { _decorator, Component } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { EventSystem } from '../utils/EventSystem';
import { Events } from '../../data/Events';
import { GroundTile } from '../entity/GroundTile';
import { NeighborHandler } from './NeighborHandler';
import { StackHandler } from './StackHandler';

const { ccclass, property } = _decorator;
@ccclass('TaskManager')
export class TaskManager extends SingletonComponent<TaskManager> {
    private m_neighborHandler: NeighborHandler = new NeighborHandler();
    private m_stackHandler: StackHandler = new StackHandler();

    protected onLoad(): void {
        super.onLoad();
        EventSystem.getInstance().on(Events.ProcessMarkedGround, this.ProcessMarkedGroundTransfer.bind(this), this);
    }

    /**
     * Kullanıcı yerleştirme yaptıktan sonra çağrılan ana fonksiyon.
     */
    async ProcessMarkedGroundTransfer(initialMarkedGround: GroundTile): Promise<void> {
        const markedGrounds = await this.ProcessTransfer([initialMarkedGround]);

        if (markedGrounds.size > 0) {
            const processedGrounds = Array.from(markedGrounds);
            await this.ProcessStack(processedGrounds);
        }
    }

    /**
     * Komşuluk Kontrolü ve Transfer İşlemleri
     */
    async ProcessTransfer(markedGrounds: GroundTile[]): Promise<Set<GroundTile>> {
        const processingQueue: GroundTile[] = [...markedGrounds];
        const processedGrounds: Set<GroundTile> = new Set();

        while (processingQueue.length > 0) {
            const currentGround = processingQueue.shift();
            if (!currentGround || processedGrounds.has(currentGround)) continue;

            console.log(`Current Ground: (${currentGround.gridPosition.row}, ${currentGround.gridPosition.col}), isLocked: ${currentGround.isLocked}`);

            if (!currentGround.tryLock()) {
                console.log(`Ground ${currentGround.node.name} is locked`);
                continue;
            }
            try {
                processedGrounds.add(currentGround);
                const neighbors = await this.m_neighborHandler.processNeighbors(currentGround);
                neighbors.forEach((neighbor) => {
                    if (!processedGrounds.has(neighbor)) {
                        processingQueue.push(neighbor);
                    }
                });
            } finally {
                currentGround.unlock();
            }
        }

        return processedGrounds;
    }

    /**
     * Stack Kontrolü
     */
    async ProcessStack(processedGrounds: GroundTile[]): Promise<void> {
        const stackProcessedGrounds: GroundTile[] = [];

        for (const ground of processedGrounds) {
            if (!ground.tryLock()) continue;

            try {
                const stackResult = await this.m_stackHandler.processSingleStack(ground);
                if (stackResult) {
                    console.log(`Stack processed for: (${ground.gridPosition.row}, ${ground.gridPosition.col})`);
                    stackProcessedGrounds.push(ground); // Tekrar kontrol edilecekler
                }
            } finally {
                ground.unlock();
            }
        }

        if (stackProcessedGrounds.length > 0) {
            const markedGrounds = await this.ProcessTransfer(stackProcessedGrounds);
            if (markedGrounds.size > 0) {
                await this.ProcessStack(Array.from(markedGrounds));
            }
        }
    }
}
