import { _decorator, Component,  EventMouse, EventTouch, input, Input } from 'cc';
const { ccclass } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    public isSelectable : boolean = false;

    onLoad () {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDestroy () {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onTouchStart(event: EventTouch) {

    }

    select(){
        if(!this.isSelectable) return;
        console.log(this.node.name);
    }

}
