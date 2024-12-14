import { _decorator, Component, Node, UIOpacity, tween, Vec3, Quat } from 'cc';
import { CameraManager } from './CameraManager';
import { ScoreManager } from './ScoreManager';
import { GridManager } from './GridManager';
import { InputManager } from './InputManager';
import { SelectableManager } from './SelectableManager';
const { ccclass, property } = _decorator;

@ccclass('SceneManager')
export class SceneManager extends Component {
    @property(Node)
    private particle: Node = null!;

    @property(Node)
    private gridContainer: Node = null!;

    @property(Node)
    private EndCard: Node = null!;

    @property(Node)
    private HexasortPlay: Node = null!;

    @property(Node)
    private ProgressBar: Node = null!;

    onLoad(): void {
        ScoreManager.goalReached.on('goalReached', this.onGoalReached, this);
    }

    onDestroy() {
        ScoreManager.goalReached.off('goalReached', this.onGoalReached, this);
    }

    async onGoalReached() {
        if (!this.particle || !this.gridContainer || !this.EndCard) return;
    
        this.particle.active = true;
        this.ProgressBar.active = false;
        CameraManager.getInstance().zoom(false, 1.5);
        GridManager.getInstance().ClearStack();
        InputManager.getInstance().lockInputs();
        SelectableManager.getInstance().clear();

        try {
            await Promise.all([
                this.rotateGridContainerY(),
                this.fadeInEndCard(150, 1),
            ]);
        } catch (error) {
            console.error("Error in onGoalReached:", error);
        } finally {
            this.HexasortPlay.active = true;
            InputManager.getInstance().unlockInputs();
        }
    }

    private rotateGridContainerY(): Promise<void> {
        return new Promise((resolve) => {
            const currentRotation = this.gridContainer!.getRotation();
            const currentEuler = new Vec3();
            currentRotation.getEulerAngles(currentEuler);

            const targetRotation = Quat.fromEuler(new Quat(), 0, -80, 0);

            tween(this.gridContainer)
                .to(1, { rotation: targetRotation }, { easing: 'linear' })
                .call(resolve)
                .start();
        });
    }

    private fadeInEndCard(targetOpacity: number, duration: number): Promise<void> {
        return new Promise((resolve) => {
            const background = this.EndCard.getChildByName('Background');
            if (!background) return;

            const uiOpacity = background.getComponent(UIOpacity);
            if (!uiOpacity) return;

            tween(uiOpacity)
                .to(duration, { opacity: targetOpacity }, { easing: 'quadOut' })
                .call(()=>{
                    this.EndCard.getChildByName("HexasortPlay")
                    resolve();
                })
                .start();
        });
    }
}
