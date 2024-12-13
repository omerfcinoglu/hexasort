import { _decorator, Component } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
import { LockableComponent } from '../helpers/LockableComponent';
const { ccclass, property } = _decorator;

@ccclass('InputManager')
export class InputManager extends SingletonComponent<InputManager>{
    public isLocked = false;


    public lockInputs() {
        this.isLocked = true;
    }

    public unlockInputs() {
        this.isLocked = false;
    }

    public handleInput(callback: () => void) {
        if (!this.isLocked) callback();
    }
}
