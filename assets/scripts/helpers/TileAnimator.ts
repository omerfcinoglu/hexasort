import { Node, Vec3, tween, Quat } from 'cc';
import { Tile } from '../entity/Tile';
import { TileCluster } from '../core/TileCluster';
import { GroundTile } from '../entity/GroundTile';
import { ScoreManager } from '../managers/ScoreManager';

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
        const tileCount = targetGround.getAllTileCount();

        let cumulativeHeight = (tileCount + 1) * 0.1;
        const animationPromises = [];

        for (let i = tiles.length - 1; i >= 0; i--) {
            const reverseIndex = (tiles.length - 1) - i + 1;
            const tile = tiles[i];
            const targetPosition = new Vec3(baseTargetPosition.x, cumulativeHeight, baseTargetPosition.z);

            // Y yönünde bir pozisyona kaldırma
            const liftedPosition = new Vec3(tile.node.position.x, 1, tile.node.position.z);

            // Rotasyonu hedefe göre ayarlayalım
            const direction = targetPosition.clone().subtract(tile.node.worldPosition).normalize(); // Hedef yönünü hesapla

            const initialRotation = tile.node.rotation.clone();
            const halfFlipRotation = Quat.fromEuler(new Quat(), 0, 0, -180); // Komşuya göre çevrilen açı
            const animationPromise = new Promise<void>((resolve) => {
                tween(tile.node)
                    .to(0.1 * reverseIndex, { position: liftedPosition }, { easing: 'cubicInOut' }) // Yukarı doğru kalkma hareketi
                    .call(() => {
                        tween(tile.node)
                            .parallel(
                                tween().to(0.125 * reverseIndex, { rotation: halfFlipRotation }, { easing: 'quadOut' }),
                                tween().to(0.125 * reverseIndex, { worldPosition: targetPosition }, { easing: 'cubicIn' }) // Hedefe doğru hareket
                            )
                            .call(resolve)
                            .start();
                    })
                    .start();
            });

            animationPromises.push(animationPromise);
            cumulativeHeight += 0.1;
        }

        await Promise.all(animationPromises); // Tüm animasyonların tamamlanmasını bekle
    }

    static async animateTilesToZeroScale(tiles: Tile[]): Promise<void> {
        const reversedTiles = [...tiles].reverse();
        const lastTile = reversedTiles[reversedTiles.length - 1]

        // Scale all tiles except the last one to (0, 0, 0)
        for (let i = 0; i < reversedTiles.length; i++) {
            const tile = reversedTiles[i];
            if (i === reversedTiles.length - 1) {
                break;
            }
            await new Promise<void>((resolve) => {
                tween(tile.node)
                    .to(0.2, { scale: new Vec3(0, 0, 0) })
                    .call(resolve)
                    .start();
            });
        }

        // Scale the last tile to (0.231, 0.231, 0.231)
        await new Promise<void>((resolve) => {
            tween(lastTile.node)
                .to(0.1, { scale: new Vec3(0.231, lastTile.node.scale.y * 0.5, 0.231) })
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
                .to(0.3, { worldPosition: position1 }, { easing: "cubicOut" })
                .call(resolve)
                .start();
        });

        // Move the last tile to the second position
        await new Promise<void>((resolve) => {
            tween(lastTile.node)
                .to(0.3, { worldPosition: position2 }, { easing: "expoIn" })
                .call(() => {
                    ScoreManager.getInstance().addScore(10);
                    resolve()
                })
                .start();
        });
    }

}
