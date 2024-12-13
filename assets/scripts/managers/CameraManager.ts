import { _decorator, Component, Camera, tween, Vec2, Vec3 } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
const { ccclass, property } = _decorator;

@ccclass('CameraManager')
export class CameraManager extends SingletonComponent<CameraManager> {
    @property(Camera)
    public mainCamera: Camera | null = null;

    @property
    public minOrthoHeight: number = 5;

    @property
    public maxOrthoHeight: number = 20;

    private startPos : Vec3;

    protected start(): void {
        this.startPos = this.mainCamera.node.getPosition().clone();
    }

    zoom(inOrOut: boolean, duration: number) {
        if (!this.mainCamera) {
            console.error('Main camera is not assigned.');
            return;
        }

        const currentOrthoHeight = this.mainCamera.orthoHeight;
        const targetOrthoHeight = inOrOut
            ? Math.max(this.minOrthoHeight, currentOrthoHeight - 5) // Zoom In
            : Math.min(this.maxOrthoHeight, currentOrthoHeight + 5); // Zoom Out

        tween(this.mainCamera)
            .to(
                duration,
                { orthoHeight: targetOrthoHeight },
                { easing: 'quadOut' }
            )
            .start();
    }

    changeToAlternative(value:boolean){
        if(value){
            this.mainCamera.node.setPosition(
                this.startPos.clone().add3f(-9,0,0)
            )
        }
        else{
            console.log("ana");
            
            this.mainCamera.node.setPosition(this.startPos)
        }
    }
}
