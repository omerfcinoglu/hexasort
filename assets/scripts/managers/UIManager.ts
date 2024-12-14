import { _decorator, Component, Node, tween, UITransform, Vec2, Vec3, Widget } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { CameraManager } from './CameraManager';
import { ProgressBarContainer } from '../entity/ProgressBarContainer';
const { ccclass, property } = _decorator;


export enum Orientation {
    Portrait = "portrait-primary",
    Landscape = "landscape-primary"
}

@ccclass('UIManager')
export class UIManager extends SingletonComponent<UIManager> {

    @property(ProgressBarContainer)
    public progressBarContainer: ProgressBarContainer | null = null;

    @property(Node)
    public canvas: Node = null!;

    @property(Node)
    public barLogic: Node = null!;

    @property(Node)
    public endCardContent: Node = null!;

    private transform: UITransform = null;
    private cameraManager : CameraManager;

    protected onLoad(): void {
        super.onLoad();

    }

    start() {
        this.cameraManager = CameraManager.getInstance();
        this.transform = this.canvas.getComponent(UITransform);
    }

    alingItems(orientation: Orientation) {
        orientation === Orientation.Portrait
            ? this.setItemsPortrait()
            : this.setItemsLandscape();
    }

    setItemsPortrait() {
        this.cameraManager.changeToAlternative(false);
        this.progressBarContainer.portraitMode();
        this.endCardContent.active = false;
    }

    setItemsLandscape() {
        this.cameraManager.changeToAlternative(true);
        this.progressBarContainer.landscapeMode();
        this.endCardContent.active = true;
    }

    /**
     * 
     * @param display acitevate or deactivate progress bar node
     */
    displayProgressBar(display : boolean){
        this.progressBarContainer.node.active = false;
    }
}

