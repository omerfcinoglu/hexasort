import { _decorator, Component, Node, tween, UITransform, Vec3, RichText, EventTarget, CylinderCollider } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';

const { ccclass, property } = _decorator;

/**
 * !todo
 * if stack count is 10 give it 10 point
 * if stack > 10 give it extra 2 point for each tile
 * if there is combo stacking and stack > 10 give extra 4 point for each tile
 * if there is current_stack % goal_stack === 0 give stack should give 15 points
 */

@ccclass('ScoreManager')
export class ScoreManager extends SingletonComponent<ScoreManager> {
    @property(Node)
    private barLogic: Node = null!;

    @property(Node)
    private barSprite: Node = null!;

    private s_base = 10;
    private s_external = 15;
    private s_singleCombo = 2;
    private s_multiCombo = 4;


    private m_score = 0;
    private m_goal = 50;

    public static goalReached = new EventTarget(); // EventTarget for managing events

    onLoad() {
        super.onLoad();
    }

    start() {
        this.updateText();
        console.log(
        );
        
    }

    updateText() {
        if (this.m_score >= this.m_goal) this.m_score = this.m_goal;
        this.barLogic.getComponentInChildren(RichText).string = `<color=#ffffff>${this.m_score}</color>/<color=#ffffff>${this.m_goal}</color>`;
    }

    addScore(score: number) {
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
        this.m_score = newScore;
        this.updateText();

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


    /**
     * 
     * @param combo combo count
     * @param currentStackCount last cluster tile length for current stack count 
     * @param minStackCount stack handler provides min stack count
     */
    calculateScore(combo:number , currentStackCount : number , minStackCount : number){
        let baseScore = this.decideBaseScore(currentStackCount,minStackCount);
        console.log("base score : ",baseScore);
        
        if(currentStackCount>minStackCount && combo === 1) baseScore += (this.s_singleCombo * (currentStackCount - minStackCount));
        if(currentStackCount>minStackCount && combo >= 2) baseScore +=   (this.s_multiCombo  * (currentStackCount - minStackCount));
        return baseScore;
    }


    decideBaseScore(currentStackCount : number , minStackCount : number) : number{
        return currentStackCount / minStackCount > 2 ?  this.s_external : this.s_base 
    }   
}
