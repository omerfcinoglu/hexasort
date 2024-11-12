import { _decorator, Component, director, Node, RichText, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScoreManager')
export class ScoreManager extends Component {
    private static _instance: ScoreManager | null = null;

    @property(Node)
    public score: Node = null!;

    private m_score = 0;

    onLoad() {
        if (ScoreManager._instance === null) {
            ScoreManager._instance = this;
            director.addPersistRootNode(this.node);
        } else {
            this.destroy();
            console.warn("Only one instance of ScoreManager is allowed.");
        }
    }

    public static getInstance(): ScoreManager {
        if (!ScoreManager._instance) {
            console.error("ScoreManager instance is not yet initialized.");
        }
        return ScoreManager._instance!;
    }

    start() {
        this.updateText();
    }

    updateText() {
        this.score.getComponentInChildren(RichText).string = `<color=#00000>${this.m_score}</color>`
    }

    addScore(score: number) {
        //shake animation
        this.shakeUI(this.score)
        this.m_score += score;
        this.updateText();
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

        // Duration for each segment of the shake
        const segmentDuration = shakeDuration / shakeSequence.length;

        // Build the tween sequence
        const shakeTweens = shakeSequence.map((pos) =>
            tween().to(segmentDuration, { position: pos })
        );

        // Run the shake tween sequence on the node
        tween(node)
            .sequence(...shakeTweens)
            .call(() => node.setPosition(originalPosition)) // Ensure it ends at the original position
            .start();
    }
}

