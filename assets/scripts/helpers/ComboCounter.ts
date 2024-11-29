import { _decorator, Component, Node } from 'cc';
import { SingletonComponent } from './SingletonComponent';
const { ccclass, property } = _decorator;

@ccclass('ComboCounter')
export class ComboCounter extends SingletonComponent<ComboCounter> {
    private currentComboCount = 0;
    private isComboActive = false;

    protected onLoad(): void {
        super.onLoad();
    }

    startCombo(): void {
        if(this.isComboActive) return;
        this.isComboActive = true;
        this.currentComboCount = 0;
        // ComboManager.comboEvent.emit('comboStarted');
    }

    incrementCombo(): void {
        if (this.isComboActive) {
            this.currentComboCount++;
            // ComboManager.comboEvent.emit('comboUpdated', this.currentComboCount);
        }
    }

    endCombo(): void {
        if (this.isComboActive) {
            // ComboManager.comboEvent.emit('comboEnded', this.currentComboCount);
            this.currentComboCount = 0;
            this.isComboActive = false;
        }
    }

    getComboCount(): number {
        return this.currentComboCount;
    }
}

