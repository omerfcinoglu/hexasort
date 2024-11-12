import { _decorator, Component, director, Node, RichText, tween } from 'cc';
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

    addScore(score : number){
        //shake animation

        this.m_score += score;
        this.updateText();
    }
}

