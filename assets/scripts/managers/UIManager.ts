import { _decorator, Component, Node, tween, UITransform, Vec2, Vec3, Widget } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { CameraManager } from './CameraManager';
const { ccclass, property } = _decorator;

export enum Orientation {
    Portrait,
    Landscape
}

@ccclass('UIManager')
export class UIManager extends SingletonComponent<UIManager> {

    @property(Node)
    public progressBarContainer: Node = null!;

    @property(Node)
    public barLogic: Node = null!;

    @property(Node)
    public barSprite: Node = null!;

    private transform: UITransform = null;

    private progressBarInitPos : Vec3 ;
    private progressBarLandscapePos : Vec3;
    protected onLoad(): void {
        super.onLoad();
        window.addEventListener("orientationchange", this.orientationChange.bind(this));

    }

    start() {
        this.progressBarInitPos = this.progressBarContainer.getPosition();
        this.progressBarLandscapePos = this.progressBarInitPos.clone().add3f(-300,-300,0)
        this.transform = this.node.getComponent(UITransform);
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
        this.progressBarContainer.setPosition(this.progressBarInitPos)
        CameraManager.getInstance().changePosition(Orientation.Portrait);
    }

    setItemsLandscape() {
        this.progressBarContainer.setPosition(this.progressBarLandscapePos)
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

