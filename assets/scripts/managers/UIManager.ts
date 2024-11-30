import { _decorator, Component, Node, tween, UITransform, Vec2, Vec3, Widget } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { CameraManager } from './CameraManager';
import { ProgressBarContainer } from '../entity/ProgressBarContainer';
import { Orientation } from '../core/Orientation';
const { ccclass, property } = _decorator;



@ccclass('UIManager')
export class UIManager extends SingletonComponent<UIManager> {

    @property(ProgressBarContainer)
    public progressBarContainer: ProgressBarContainer | null = null;

    @property(Node)
    public canvas: Node = null!;

    @property(Node)
    public barLogic: Node = null!;

    @property(Node)
    public barSprite: Node = null!;

    private transform: UITransform = null;

    protected onLoad(): void {
        super.onLoad();
        window.addEventListener("orientationchange", this.orientationChange.bind(this));

    }

    start() {
        this.transform = this.canvas.getComponent(UITransform);
        this.orientationChange();
    }

    update(deltaTime: number) {

    }

    alingItems(orientation: Orientation) {
        orientation === Orientation.Portrait
            ? this.setItemsPortrait()
            : this.setItemsLandscape();
    }

    setItemsPortrait() {
        this.progressBarContainer.changeOrientation(Orientation.Portrait)
        CameraManager.getInstance().changePosition(Orientation.Portrait);
    }

    setItemsLandscape() {
        this.progressBarContainer.changeOrientation(Orientation.Landscape)
        CameraManager.getInstance().changePosition(Orientation.Landscape);
    }

    orientationChange() {
        this.alingItems(this.getOrientation());
    }

    getOrientation() : Orientation{
        const contentSize = this.transform.contentSize
        return contentSize.width > contentSize.height
            ?  Orientation.Landscape
            :  Orientation.Portrait;
    }
}

