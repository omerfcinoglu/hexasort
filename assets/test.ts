import { _decorator, Component, Node, tween, Vec3, Quat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {

     async flipTile(tileNode: Node, startPosition: Vec3, endPosition: Vec3) {
          const duration = 0.2;

          // Rotasyonlar
          // const midRotation = Quat.fromEuler(new Quat(), 0, 0, 90);
          // const endRotation = Quat.fromEuler(new Quat(), 0, 0, 180);
          const midRotation = Quat.fromEuler(new Quat(), 90, 0, 0)
          const endRotation = Quat.fromEuler(new Quat(), 180, 0, 0)
          // Kaldırma pozisyonu (orta noktada bir yükselme eklenir)
          const liftPosition = new Vec3(
               (startPosition.x + endPosition.x) / 2,
               startPosition.y + 0.5, // Hafif yukarı kaldırılır
               (startPosition.z + endPosition.z) / 2
          );

          const animationPromise = new Promise<void>((resolve) => {
               tween(tileNode)
                    .sequence(
                         // İlk olarak yukarı kaldır ve orta rotasyona geç
                         tween(tileNode)
                              .parallel(
                                   tween(tileNode).to(duration, { position: liftPosition }, { easing: 'cubicInOut' }),
                                   tween(tileNode).to(duration, { rotation: midRotation }, { easing: 'cubicInOut' })
                              ),

                         // Son olarak endPosition'a geç ve son rotasyonu uygula
                         tween(tileNode)
                              .parallel(
                                   tween(tileNode).to(duration, { position: endPosition }, { easing: 'cubicInOut' }),
                                   tween(tileNode).to(duration, { rotation: endRotation }, { easing: 'cubicInOut' })
                              )
                    )
                    .call(() => resolve())
                    .start();
          });

          await animationPromise;
     }

     start() {
          const tileNode = this.node; // Animasyonu uygulayacağınız tile
          const startPos = this.node.position; // Başlangıç pozisyonu
          const endPos = new Vec3(startPos.x , startPos.y, startPos.z); // Bitiş pozisyonu
          this.flipTile(tileNode, startPos, endPos); // Animasyonu başlat
     }
}
