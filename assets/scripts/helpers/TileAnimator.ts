import { Node, Vec3, tween, Quat } from 'cc';
import { Tile } from '../entity/Tile';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
import { ScoreManager } from '../managers/ScoreManager';
import { SoundManager } from '../managers/SoundManager';
import { Sounds } from '../core/Sounds';

export class TileAnimator {


	static applyLookAt(tile: Node, targetPosition: Vec3): void {
		const direction = new Vec3();
		Vec3.subtract(direction, targetPosition, tile.worldPosition);
		direction.normalize();

		const lookAtRotation = new Quat();
		Quat.fromViewUp(lookAtRotation, direction);
		tile.setRotation(lookAtRotation); // İlk olarak hedefe bakacak şekilde tile'ı döndürüyoruz
	}
	static async animateClusterTransfer(cluster: TileCluster, targetGround: GroundTile): Promise<void> {
		const tiles = cluster.getTiles();
		const baseTargetPosition = targetGround.node.worldPosition.clone();
		const targetTileCount = targetGround.getAllTileCount();
		
		let cumulativeHeight =  (targetTileCount + 1) * 0.1;
		
		const baseDuration = 0.3; // Hareket için toplam süre
		const delayBetweenTiles = 0.1; 
		const peakHeightFactor = 0.7; 
		const down_easingFunction = 'quartOut'; 
		const lift_easingFunction = 'quartIn'; 


		const animationPromises: Promise<void>[] = [];

		// Tiles, yukarıdan aşağıya doğru sıralanıyor
		tiles.reverse();

		// A'daki her tile, B'deki uygun pozisyona hareket edecek
		for (let i = 0; i < tiles.length; i++) {
			const tile = tiles[i];

			// Başlangıç ve hedef pozisyonlarını hesapla
			const startPosition = tile.node.worldPosition.clone();
			const targetPosition = new Vec3(
				baseTargetPosition.x,
				cumulativeHeight + ((i+1) * 0.1), // B'deki mevcut tile'ların üstüne konumlanıyor
				baseTargetPosition.z
			);
			const peakPosition = new Vec3(
				(startPosition.x + targetPosition.x) / 2,
				Math.max(startPosition.y, targetPosition.y) + peakHeightFactor, // Tepe yüksekliği
				(startPosition.z + targetPosition.z) / 2
			);

			// Overlay ve z-index kontrolü
			tile.node.setSiblingIndex(i);

			// Hedef yönü ve rotasyonları hesapla
			const direction = this.calculateDirection(tile.node.worldPosition, targetPosition);
			const { midRotation, endRotation } = this.getRotationByDirection(direction);

			// Animasyonu oluştur
			const animationPromise = new Promise<void>((resolve) => {
				tween(tile.node)
					.delay(i * delayBetweenTiles) // Her tile için gecikme
					.call(()=>{
						SoundManager.getInstance().playSound(Sounds.TransferTiles);
					})
					.sequence(
						// İlk hareket: Başlangıçtan tepe noktasına (flip sırasında orta rotasyona geçiş)
						tween(tile.node)
							.parallel(
								tween(tile.node).to(
									baseDuration / 2,
									{ worldPosition: peakPosition },
									{ easing: lift_easingFunction }
								),
								tween(tile.node).to(
									baseDuration / 2,
									{ rotation: midRotation },
									{ easing: lift_easingFunction }
								)
							),
						// İkinci hareket: Tepe noktasından hedefe (flip sonlanıyor)
						tween(tile.node)
							.parallel(
								tween(tile.node).to(
									baseDuration / 2,
									{ worldPosition: targetPosition },
									{ easing: down_easingFunction }
								),
								tween(tile.node).to(
									baseDuration / 2,
									{ rotation: endRotation },
									{ easing: down_easingFunction }
								)
							)
					)
					.call(() => {
						tile.node.setRotation(Quat.IDENTITY); // Rotasyonu sıfırla
						resolve();
					})
					.start();
			});
			
			animationPromises.push(animationPromise);
		}

		// Tüm animasyonları tamamlamayı bekle
		await Promise.all(animationPromises);
	}

	async playSoundSequentially(tileCount: number , delay : number): Promise<void> {
		for (let i = 0; i < tileCount; i++) {
		    // SoundManager üzerinden sesi çal
		    SoundManager.getInstance().playSound(Sounds.TransferTiles);
		    // Her ses çalma işlemi arasında delay ekle
		    await new Promise((resolve) => setTimeout(resolve, 1000 * delay)); // Delay saniye cinsinden
		}
	 }


	private static calculateDirection(sourcePosition: Vec3, targetPosition: Vec3): string {
		const deltaX = Math.floor(targetPosition.x - sourcePosition.x);
		const deltaZ = Math.floor(targetPosition.z - sourcePosition.z);

		if (deltaX > 0 && deltaZ === 0) return 'LeftUp';
		if (deltaX < 0 && deltaZ === 0) return 'RightUp';
		if (deltaX > 0 && deltaZ < 0) return 'LeftDown';
		if (deltaX < 0 && deltaZ < 0) return 'RightDown';
		if (deltaZ > 0) return 'Down';
		return 'Up';
	}

	private static getRotationByDirection(direction: string): { midRotation: Quat, endRotation: Quat } {
		switch (direction) {
			case 'Up':
				return { midRotation: Quat.fromEuler(new Quat(), -180, 0, 0), endRotation: Quat.fromEuler(new Quat(), -180, 0, 0) };
			case 'Down':
				return { midRotation: Quat.fromEuler(new Quat(), 90, 0, 0), endRotation: Quat.fromEuler(new Quat(), 180, 0, 0) };
			case 'LeftUp':
				return { midRotation: Quat.fromEuler(new Quat(), 90, 45, 0), endRotation: Quat.fromEuler(new Quat(), 180, 60, 0) };
			case 'LeftDown':
				return { midRotation: Quat.fromEuler(new Quat(), -90, -45, 0), endRotation: Quat.fromEuler(new Quat(), -180, -60, 0) };
			case 'RightUp':
				return { midRotation: Quat.fromEuler(new Quat(), 0, 45, 90), endRotation: Quat.fromEuler(new Quat(), 0, 60, 180) };
			case 'RightDown':
				return { midRotation: Quat.fromEuler(new Quat(), 0, -45, 90), endRotation: Quat.fromEuler(new Quat(), 0, -60, 180) };
			default:
				return { midRotation: Quat.fromEuler(new Quat(), 0, 0, 0), endRotation: Quat.fromEuler(new Quat(), 0, 0, 0) };
		}
	}

	static async animateTilesToZeroScale(tiles: Tile[]): Promise<void> {
		const reversedTiles = [...tiles].reverse()
		const lastTile = reversedTiles[reversedTiles.length - 1]
		const duration = 0.1;
		// Scale all tiles except the last one to (0, 0, 0)
		for (let i = 0; i < reversedTiles.length; i++) {
			const tile = reversedTiles[i];
			if (i === reversedTiles.length - 1) {
				break;
			}
			await new Promise<void>((resolve) => {
				tween(tile.node)
					.to(duration , { scale: new Vec3(0, 0, 0) })
					.call(resolve)
					.start();
			});
		}

		// Scale the last tile to (0.231, 0.231, 0.231)
		await new Promise<void>((resolve) => {
			tween(lastTile.node)
				.to(duration, { scale: new Vec3(0.231, lastTile.node.scale.y * 0.5, 0.231) })
				.call(resolve)
				.start();
		});

		//this must be dynamic !todo
		// Define two target positions for the last tile
		const position1 = new Vec3(0, 2, 2); // Replace with the desired first position
		const position2 = new Vec3(-2.3, 7.2, 2); // Replace with the desired second position

		// Move the last tile to the first position
		await new Promise<void>((resolve) => {
			tween(lastTile.node)
				.to(duration, { worldPosition: position1 }, { easing: "cubicOut" })
				.call(resolve)
				.start();
		});

		// Move the last tile to the second position
		await new Promise<void>((resolve) => {
			tween(lastTile.node)
				.to(duration, { worldPosition: position2 }, { easing: "expoIn" })
				.call(() => {
					lastTile.node.active = false;
					ScoreManager.getInstance().addScore(10);
					resolve()
				})
				.start();
		});
	}

}