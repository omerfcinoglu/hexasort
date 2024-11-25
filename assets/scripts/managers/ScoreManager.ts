import { _decorator, Component, director, Node, ProgressBar, RichText, tween, UITransform, Vec3 } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
const { ccclass, property } = _decorator;

@ccclass('ScoreManager')
export class ScoreManager extends SingletonComponent<ScoreManager> {

    @property(Node)
    private progressBar: Node = null!;

    @property(Node)
    public bar: UITransform = null!;

    private m_score = 0;
    private m_goal = 100;

    private progressBarComp : ProgressBar = null;
    onLoad() {
        this.progressBarComp = this.progressBar.getComponent(ProgressBar); 
    }

    start() {
        this.progressBarComp.progress = 0;
        console.log(this.progressBar);
        this.addScore(50)
        this.updateText();
    }

    updateText() {
        this.progressBar.getComponentInChildren(RichText).string = `<color=#ffffff>${this.m_score}</color>/<color=#ffffff>${this.m_goal} </color>`
    }


    addScore(score: number) {
        const newScore = this.m_score + score;
        const targetProgress = Math.min(newScore / this.m_goal, 1);
        const targetWidth = targetProgress * this.progressBar.getComponent(UITransform).width;
        const bar = this.progressBar.getChildByName("Bar");
        const barTransform = bar.getComponent(UITransform);
        const initialWidth = barTransform.width;
    
        tween({ value: initialWidth })
            .to(
                0.5,
                { value: targetWidth },
                {
                    easing: 'quadOut',
                    onUpdate: (obj:any) => {
                        barTransform.width = obj.value;
                    },
                }
            )
            .call(() => {
                this.m_score = Math.min(newScore, this.m_goal);
                this.updateText();
            })
            .start();
    }
    
    shakeUI(node: Node, shakeIntensity: number = 3, shakeDuration: number = 0.3) {
        const originalPosition = node.position.clone();
        const shakeSequence = [
            new Vec3(originalPosition.x - shakeIntensity, originalPosition.y),
            new Vec3(originalPosition.x + shakeIntensity, originalPosition.y),
            new Vec3(originalPosition.x, originalPosition.y + shakeIntensity),
            new Vec3(originalPosition.x, originalPosition.y - shakeIntensity),
            originalPosition,
        ];

        const segmentDuration = shakeDuration / shakeSequence.length;

        const shakeTweens = shakeSequence.map((pos) =>
            tween().to(segmentDuration, { position: pos })
        );

        tween(node)
            .sequence(...shakeTweens)
            .call(() => node.setPosition(originalPosition)) 
            .start();
    }
}

