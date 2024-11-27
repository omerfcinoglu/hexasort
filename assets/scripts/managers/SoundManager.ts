import { _decorator, Component, Node, AudioSource } from 'cc';
import { SingletonComponent } from '../helpers/SingletonComponent';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends SingletonComponent<SoundManager> {
	protected onLoad() {
		super.onLoad();
		this.soundList.forEach(sound => {
			let audioSource = this.node.addComponent(AudioSource);
			audioSource = sound;
			this.soundsMap.set(sound.name, audioSource);
		});
	}

	@property({ type: AudioSource })
	soundList: AudioSource[] = [];

	private soundsMap: Map<string, AudioSource> = new Map();
	private audioSource: AudioSource | null = null;

	playSound(key: string, loop: boolean = false, speed: number = 1.0): void {
		const audioSource = this.soundsMap.get(key);
	 
		if (audioSource) {
		    if (audioSource.playing) {
			   audioSource.stop();
		    }
	 
		    audioSource.loop = loop;
		    audioSource.playOneShot(audioSource.clip);
		}
	 }

	stopSound(key: string): void {
		const audioSource = this.soundsMap.get(key);
		if (audioSource && audioSource.playing) {
			audioSource.stop();
		}
	}

	setVolume(key: string, volume: number): void {
		const audioSource = this.soundsMap.get(key);
		if (audioSource) {
			audioSource.volume = volume;
		}
	}

	setGlobalVolume(volume: number): void {
		this.soundsMap.forEach((audioSource) => {
			audioSource.volume = volume;
		});
	}

	stopAllSounds(): void {
		this.soundsMap.forEach((audioSource) => {
			if (audioSource.playing) {
				audioSource.stop();
			}
		});
	}
}

