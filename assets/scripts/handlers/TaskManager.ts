import { _decorator, Component, Node } from 'cc';
import { TaskQueue } from '../core/TaskQueue';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { EventSystem } from '../utils/EventSystem';
import { Events } from '../../data/Events';
import { GroundTile } from '../entity/GroundTile';
const { ccclass, property } = _decorator;

@ccclass('TaskManager')
export class TaskManager extends SingletonComponent<TaskManager> {

    private m_queue = new TaskQueue();

    protected onLoad(): void {
        super.onLoad();
        EventSystem.getInstance().on(Events.ProcessMarkedGround, this.ProcessMarkedGround.bind(this), this)

    }

    start() {
    }

    ProcessMarkedGround(markedGrounds: GroundTile[]) {
        console.log(markedGrounds.length);
    }
}

