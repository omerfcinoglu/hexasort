import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AreaBackground')
export class AreaBackground extends Component {
    start() {
        this.node.active = false;
    }

    update(deltaTime: number) {
        
    }
}

