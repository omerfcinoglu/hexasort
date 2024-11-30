import { _decorator, Component, Camera, tween, Vec3 } from 'cc';
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

    protected onLoad(): void {
        super.onLoad();
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

    console.log(targetOrthoHeight);
    
    }

    setCameraPosition(position : Vec3){
        
    }
}
