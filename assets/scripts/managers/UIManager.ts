import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { Orientation } from '../helpers/DeviceDetector';
const { ccclass, property } = _decorator;


@ccclass('UIManager')
export class UIManager extends SingletonComponent<UIManager> {

    @property(Node)
    public barLogic: Node = null!;

    @property(Node)
    public barSprite: Node = null!;

    protected onLoad(): void {
        super.onLoad();
    }
    
    start() {

    }

    update(deltaTime: number) {
        
    }

    alingItems(orientation : Orientation){
        orientation === Orientation.Portrait 
            ? this.setItemsPortrait()
            : this.setItemsLandscape(); 
    }

    setItemsPortrait(){
        // this.barLogic.setPosition(new Vec3(0,0,0));
    }

    setItemsLandscape(){
        // this.barLogic.setPosition(new Vec3(0,0,0));
    }
}

