import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('ProgressBarContainer')
export class ProgressBarContainer extends Component {

    private initPos : Vec3 ;
    private landscapePos : Vec3;

    start() {
        this.initPos = this.node.getPosition();
        this.landscapePos = this.node.getPosition().clone().add3f(-500,-100,0)
    }


    portraitMode(){
        this.node.setScale(1.5,1.5,1.5)
        this.node.setPosition(this.initPos)
    }

    landscapeMode(){
        this.node.setScale(2.3,2.3,2.3)
        this.node.setPosition(this.landscapePos)
    }
}

