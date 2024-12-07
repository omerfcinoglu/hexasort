import { _decorator } from 'cc';
import { NeighborChecker } from '../core/NeighborChecker';
import { TileTransferHandler } from './TileTransferHandler';
import { GroundTile } from '../entity/GroundTile';

const { ccclass } = _decorator;

@ccclass('NeighborHandler')
export class NeighborHandler {
    private neighborChecker: NeighborChecker | null = null;
    private transferHandler: TileTransferHandler | null = null;

    constructor() {
        this.neighborChecker = new NeighborChecker();
        this.transferHandler = new TileTransferHandler();
    }

    /**
     * Komşuları işleyerek transfer işlemlerini gerçekleştirir.
     * @param currentGround İşlenecek GroundTile
     * @returns Transfer işlemi yapılan GroundTile'ların listesi
     */
    async processNeighbors(currentGround: GroundTile): Promise<GroundTile[]> {
        const transferedGrounds: GroundTile[] = [];
        const typeMatches = await this.neighborChecker.findAllMatches(currentGround) || [];

        if (typeMatches.length > 0) {
            for (const match of typeMatches) {
                const { source, target } = this.determineTransferTargets(currentGround, match);
                transferedGrounds.push(source);
                transferedGrounds.push(target);
                await this.transferHandler?.transferClusterToTarget(source, target);
            }
        }

        return transferedGrounds;
    }

    /**
     * Belirtilen GroundTile'ın komşularında aynı type'da bir TileCluster olup olmadığını kontrol eder.
     * @param currentGround Kontrol edilecek GroundTile
     * @returns Komşular arasında type eşleşmesi olup olmadığı
     */
public async hasMatchingNeighbor(currentGround: GroundTile): Promise<boolean> {
        const neighbors = await this.getNeighbors(currentGround);
        const currentType = currentGround.getTopClusterType();

        for (const neighbor of neighbors) {
            if (neighbor.getTopClusterType() === currentType) {
                return true; // Eşleşme bulundu
            }
        }
        return false; // Eşleşme yok
    }

    /**
     * Belirtilen GroundTile'ın komşularını bulur.
     * @param currentGround Komşuları bulunacak GroundTile
     * @returns Komşu GroundTile'ların listesi
     */
    public async getNeighbors(currentGround: GroundTile): Promise<GroundTile[]> {
        return this.neighborChecker.findNeighbors(currentGround);
    }

    /**
     * Transfer için kaynak ve hedef GroundTile'ı belirler.
     * @param currentGround Mevcut GroundTile
     * @param match Eşleşen GroundTile
     * @returns Kaynak ve hedef GroundTile
     */
    private determineTransferTargets(currentGround: GroundTile, match: GroundTile): { source: GroundTile, target: GroundTile } {
        const clusterCount1 = currentGround.attachedClusters.length;
        const clusterCount2 = match.attachedClusters.length;

        if (clusterCount1 === 1 && clusterCount2 > 1) return { source: match, target: currentGround };
        if (clusterCount2 === 1 && clusterCount1 > 1) return { source: currentGround, target: match };

        if (clusterCount1 < clusterCount2) return { source: match, target: currentGround };
        if (clusterCount2 < clusterCount1) return { source: currentGround, target: match };

        return { source: match, target: currentGround };
    }
}
