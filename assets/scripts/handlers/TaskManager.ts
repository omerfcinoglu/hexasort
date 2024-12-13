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
    }

    /**
     * Kullanıcı yerleştirme yaptıktan sonra çağrılan ana fonksiyon.
     */
    async ProcessMarkedGroundTransfer(initialMarkedGround: GroundTile): Promise<void> {
        return;

    }


}
