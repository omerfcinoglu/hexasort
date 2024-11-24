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
		tile.setRotation(lookAtRotation); 
	}
	static async animateClusterTransfer(cluster: TileCluster, targetGround: GroundTile , source : GroundTile): Promise<void> {
		const tiles = cluster.getTiles();
		const baseTargetPosition = targetGround.node.worldPosition.clone();
		const targetTileCount = targetGround.getAllTileCount();
		
		const sourceGridPos = source.gridPosition;
		const targetGridPos = targetGround.gridPosition;

		const direction = this.calculateDirection(targetGridPos, sourceGridPos);


		let cumulativeHeight =  (targetTileCount + 1) * 0.1;
		
		const baseDuration = 0.35;
		const delayBetweenTiles = 0.06; 
		const peakHeightFactor = 0.9; 
		const down_easingFunction = 'quartOut'; 
		const lift_easingFunction = 'linear'; 


		const animationPromises: Promise<void>[] = [];

		tiles.reverse();

		for (let i = 0; i < tiles.length; i++) {
			const tile = tiles[i];

			// Başlangıç ve hedef pozisyonlarını hesapla
			const startPosition = tile.node.worldPosition.clone();
			const targetPosition = new Vec3(
				baseTargetPosition.x,
				cumulativeHeight + ((i+1) * 0.11), 
				baseTargetPosition.z
			);
			const peakPosition = new Vec3(
				(startPosition.x + targetPosition.x) / 2,
				Math.max(startPosition.y, targetPosition.y) + peakHeightFactor, 
				(startPosition.z + targetPosition.z) / 2
			);

			tile.node.setSiblingIndex(i);

			const { midRotation, endRotation } = this.getRotationByDirection(direction);
			
			const animationPromise = new Promise<void>((resolve) => {
				tween(tile.node)
					.delay(i * delayBetweenTiles) 
					.call(()=>{
						SoundManager.getInstance().playSound(Sounds.TransferTiles);
					})
					.sequence(
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
						tile.node.setRotation(Quat.IDENTITY); 
						resolve();
					})
					.start();
			});
			
			animationPromises.push(animationPromise);
		}

		await Promise.all(animationPromises);
	}


	private static calculateDirection(
		source: { row: number; col: number },
		target: { row: number; col: number }
	 ): string {
		const dRow = target.row - source.row;
		const dCol = target.col - source.col;
  
		//checked
		const evenColmDirections = [
		    { dRow: -1, dCol: 0, direction: "Up" },
		    { dRow: 1, dCol: 0, direction: "Down" },
		    { dRow: 0, dCol: -1, direction: "LeftDown" },
		    { dRow: 0, dCol: 1, direction: "RightDown" },
		    { dRow: 1, dCol: -1, direction: "LeftUp" },
		    { dRow: 1, dCol: 1, direction: "RightUp" },
		];
		
		//checked
		const oddColmDirections = [
		    { dRow: -1, dCol: 0, direction: "Up" },
		    { dRow: 1, dCol: 0, direction: "Down" },
		    { dRow: 0, dCol: -1, direction: "LeftUp" },
		    { dRow: 0, dCol: 1, direction: "RightUp" },
		    { dRow: -1, dCol: -1, direction: "LeftDown" },
		    { dRow: -1, dCol: 1, direction: "RightDown" },
		];
  
		const directions = source.col % 2 === 0 ? evenColmDirections : oddColmDirections;

  
		for (const dir of directions) {
		    if (dRow === dir.dRow && dCol === dir.dCol) {
			   return dir.direction;
		    }
		}
		return "Unknown";
	 }
	private static getRotationByDirection(direction: string): { midRotation: Quat, endRotation: Quat } {
		switch (direction) {
			case 'Up':
				return { midRotation: Quat.fromEuler(new Quat(), -90, 0, 0), endRotation: Quat.fromEuler(new Quat(), -180, 0, 0) };
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

		await new Promise<void>((resolve) => {
			tween(lastTile.node)
				.to(duration, { scale: new Vec3(0.231, lastTile.node.scale.y * 0.5, 0.231) })
				.call(resolve)
				.start();
		});

		//this must be dynamic !todo
		const position1 = new Vec3(0, 2, 2);
		const position2 = new Vec3(-2.3, 7.2, 2); 

		await new Promise<void>((resolve) => {
			tween(lastTile.node)
				.to(duration, { worldPosition: position1 }, { easing: "cubicOut" })
				.call(resolve)
				.start();
		});

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