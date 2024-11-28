import { _decorator, Component, Node, tween, UITransform, Vec3, RichText, EventTarget } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';

const { ccclass, property } = _decorator;

@ccclass('ScoreManager')
export class ScoreManager extends SingletonComponent<ScoreManager> {
    @property(Node)
    private barLogic: Node = null!;

    @property(Node)
    private barSprite: Node = null!;

    private m_score = 0;
    private m_goal = 50;

    public static goalReached = new EventTarget(); // EventTarget for managing events

    onLoad() {
        super.onLoad();
    }

    start() {
        this.updateText();
    }

    updateText() {
        if (this.m_score >= this.m_goal) this.m_score = this.m_goal;
        this.barLogic.getComponentInChildren(RichText).string = `<color=#ffffff>${this.m_score}</color>/<color=#ffffff>${this.m_goal}</color>`;
    }

    addScore(score: number) {
        score = 50;
        if (!this.barLogic || !this.barSprite) {
            console.error("BarLogic or BarSprite node is missing in the hierarchy.");
            return;
        }

        const barLogicWidth = this.barLogic.getComponent(UITransform).width;
        const minX = -barLogicWidth;
        const maxX = 0;

        const newScore = Math.min(this.m_score + score, this.m_goal);
        const targetProgress = newScore / this.m_goal;
        const targetX = minX + targetProgress * (maxX - minX);

        const initialX = this.barSprite.position.x;

        tween({ value: initialX })
            .to(
                0.5,
                { value: targetX },
                {
                    easing: 'quadOut',
                    onUpdate: (obj: any) => {
                        this.barSprite.setPosition(new Vec3(obj.value, this.barSprite.position.y, this.barSprite.position.z));
                    },
                }
            )
            .call(() => {
                this.m_score = newScore;
                this.updateText();

                if (this.m_score >= this.m_goal) {
                     ScoreManager.goalReached.emit('goalReached');
                }
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
