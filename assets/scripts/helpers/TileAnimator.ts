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

        const baseDuration = 0.2; // TileCount az olduğunda maksimum süre
        const minDuration = 0.05; // TileCount fazla olduğunda minimum süre
        const maxTileCount = 10; // Beklenen maksimum tileCount (bu, sisteminizin büyüklüğüne göre ayarlanabilir)
        
        // Dinamik duration hesaplama
        const duration = baseDuration - (tileCount / maxTileCount) * (baseDuration - minDuration);
        
        let cumulativeHeight = (tileCount + 1) * 0.1;
        const animationPromises = [];
        
        for (let i = tiles.length - 1; i >= 0; i--) {
            const reverseIndex =( (tiles.length - 1) - i + 1) * 0.8;
            const tile = tiles[i];

            const targetPosition = new Vec3(baseTargetPosition.x, cumulativeHeight, baseTargetPosition.z);

            const liftPosition = new Vec3(baseTargetPosition.x, cumulativeHeight+1, baseTargetPosition.z);
            

            // Hedef yönünü hesapla ve rotasyonları al
            const direction = this.calculateDirection(tile.node.worldPosition, targetPosition);
            const { midRotation, endRotation } = this.getRotationByDirection(direction);
            console.log(direction );
            
            const animationPromise = new Promise<void>((resolve) => {
                tween(tile.node)
                    .sequence(
                        tween(tile.node)
                            .parallel(
                                // tween(tile.node).to(duration * reverseIndex, { worldPosition: liftPosition }, { easing: 'cubicInOut' }),
                                tween(tile.node).to(duration * reverseIndex, { rotation: midRotation }, { easing: 'cubicInOut' }),
                                tween(tile.node).to(duration * reverseIndex, { worldPosition: liftPosition }, { easing: 'cubicInOut' }),

                            ),

                        tween(tile.node)
                        // .to(duration * reverseIndex, { rotation: endRotation }, { easing: 'cubicInOut' })
                            .parallel(
                                tween(tile.node).to(duration * reverseIndex, { worldPosition: targetPosition }, { easing: 'cubicInOut' }),
                                tween(tile.node).to(duration * reverseIndex, { rotation: endRotation }, { easing: 'cubicInOut' })
                            )
                    )
                    .call(resolve)
                    .start();
            });

            animationPromises.push(animationPromise);
            cumulativeHeight += 0.1;
        }

        await Promise.all(animationPromises); // Tüm animasyonların tamamlanmasını bekle
    }

    /**
     * Kaynak ve hedef pozisyonları arasında yön hesaplama.
     * @param sourcePosition Kaynak GroundTile'ın pozisyonu.
     * @param targetPosition Hedef GroundTile'ın pozisyonu.
     * @returns Yön bilgisi (string).
     */
    private static calculateDirection(sourcePosition: Vec3, targetPosition: Vec3): string {
        const deltaX = Math.floor(targetPosition.x - sourcePosition.x);
        const deltaZ = Math.floor(targetPosition.z - sourcePosition.z);
        console.log(deltaX , deltaZ);
        
        if (deltaX > 0 && deltaZ === 0) return 'LeftUp'; 
        if (deltaX < 0 && deltaZ === 0) return 'RightUp'; 
        if (deltaX > 0 && deltaZ < 0) return 'LeftDown'; 
        if (deltaX < 0 && deltaZ < 0) return 'RightDown';  
        if (deltaZ > 0) return 'Down';                     
        return 'Up';                            
    }

    /**
     * Yön bilgisine göre orta ve son rotasyonu belirler.
     * @param direction Yön bilgisi ('Up', 'Down', 'LeftUp', 'LeftDown', 'RightUp', 'RightDown').
     * @returns Rotasyon bilgileri (midRotation, endRotation).
     */
    private static getRotationByDirection(direction: string): { midRotation: Quat, endRotation: Quat } {
        switch (direction) {
            case 'Up':
                return {
                    midRotation: Quat.fromEuler(new Quat(), -90, 0, 0),
                    endRotation: Quat.fromEuler(new Quat(), -180, 0, 0),
                };
            case 'Down':
                return {
                    midRotation: Quat.fromEuler(new Quat(), 90, 0, 0),
                    endRotation: Quat.fromEuler(new Quat(), 180, 0, 0),
                };
            case 'LeftUp':
                return {
                    midRotation: Quat.fromEuler(new Quat(), 90, 45, 0),
                    endRotation: Quat.fromEuler(new Quat(), 180, 60, 0),
                };
            case 'LeftDown':
                return {
                    midRotation: Quat.fromEuler(new Quat(), -90, -45, 0),
                    endRotation: Quat.fromEuler(new Quat(), -180, -60, 0),
                };
            case 'RightUp':
                return {
                    midRotation: Quat.fromEuler(new Quat(), 0, 45, 90),
                    endRotation: Quat.fromEuler(new Quat(), 0, 60, 180),
                };
            case 'RightDown':
                return {
                    midRotation: Quat.fromEuler(new Quat(), 0, -45, 90),
                    endRotation: Quat.fromEuler(new Quat(), 0, -60, 180),
                };
            default:
                return {
                    midRotation: Quat.fromEuler(new Quat(), 0, 0, 0),
                    endRotation: Quat.fromEuler(new Quat(), 0, 0, 0),
                };
        }
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
                    .to(0.1, { scale: new Vec3(0, 0, 0) })
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
                .to(0.1, { worldPosition: position1 }, { easing: "cubicOut" })
                .call(resolve)
                .start();
        });

        // Move the last tile to the second position
        await new Promise<void>((resolve) => {
            tween(lastTile.node)
                .to(0.1, { worldPosition: position2 }, { easing: "expoIn" })
                .call(() => {
                    lastTile.node.active = false;
                    ScoreManager.getInstance().addScore(10);
                    resolve()
                })
                .start();
        });
    }

}
