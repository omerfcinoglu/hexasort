import { _decorator, Component, Node } from 'cc';
import { TaskQueue } from '../core/TaskQueue';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { EventSystem } from '../utils/EventSystem';
import { Events } from '../../data/Events';
import { GroundTile } from '../entity/GroundTile';
import { NeighborHandler } from './NeighborHandler';
import { sleep } from '../helpers/Promises';
const { ccclass, property } = _decorator;

@ccclass('TaskManager')
export class TaskManager extends SingletonComponent<TaskManager> {

    private m_queue = new TaskQueue();
    private m_neighborHandler : NeighborHandler = new NeighborHandler();

    protected onLoad(): void {
        super.onLoad();
        EventSystem.getInstance().on(Events.ProcessMarkedGround, this.ProcessMarkedGround.bind(this), this);
    }

    ProcessMarkedGround(markedGrounds: GroundTile[]) {
        
        markedGrounds.forEach(groundTile => {
            let newMarked = []
            this.m_queue.add(async () => {
                newMarked = await this.m_neighborHandler.processNeighbors(groundTile)
                await sleep(1000)
            });
        });
        console.log(`Processing marked grounds is done`);

    }


}