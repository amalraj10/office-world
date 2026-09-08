import Phaser from 'phaser';
import { OfficeScene } from './scenes/OfficeScene';

export function createOfficeGame(containerId: string) {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: containerId,
    width: '100%',
    height: '100%',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [OfficeScene],
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#0f172a',
  };

  return new Phaser.Game(config);
}
