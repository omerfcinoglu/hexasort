import { _decorator, Component, Node, Vec3 } from 'cc';
import { Orientation } from '../core/Orientation';
const { ccclass, property } = _decorator;


/**
 * !TODO
 * her ekran değişiminde yeniden konumlandırabiliriz
 */



@ccclass('ProgressBarContainer')
export class ProgressBarContainer extends Component {

    private initPos : Vec3 ;
    private landscapePos : Vec3;

    start() {
        this.initPos = this.node.getPosition();
        this.landscapePos = this.initPos.clone().add3f(-500,-300,0)
    }


    changeOrientation(orientation : Orientation){
        orientation === Orientation.Portrait
        ? this.portraitMode()
        : this.landscapeMode()        
    }

    portraitMode(){
        this.node.setPosition(this.initPos)
        this.node.setScale(1,1,1)
    }

    landscapeMode(){
        this.node.setPosition(this.landscapePos)
        this.node.setScale(1.7,1.7,1.7)
    }
}

