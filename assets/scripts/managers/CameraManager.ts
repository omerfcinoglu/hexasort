import { _decorator, Component, Camera, tween, Vec3 } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { Orientation } from '../core/Orientation';
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
    private orientationChangePos : Vec3;

    
    protected onLoad(): void {
        super.onLoad();
    }

    protected start(): void {
        this.startPos = this.mainCamera.node.getPosition()
        this.orientationChangePos = this.mainCamera.node.getPosition().add3f(-10,0,0)
    }


    public zoom(inOrOut: boolean, duration: number) {
        if (!this.mainCamera) {
            console.error('Main camera is not assigned.');
            return;
        }

        const currentOrthoHeight = this.mainCamera.orthoHeight;
        const targetOrthoHeight = inOrOut
            ? 11 // Zoom In
            : 15 // Zoom Out

        tween(this.mainCamera)
            .to(
                duration,
                { orthoHeight: targetOrthoHeight },
                { easing: 'quadOut' }
            )
            .start();

    }

    changePosition(orientation: Orientation) {
        const targetPosition = 
            orientation == Orientation.Portrait 
                ? this.startPos 
                : this.orientationChangePos;
    
        this.mainCamera.node.setPosition(targetPosition);
    }
}
