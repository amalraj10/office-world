import Phaser from 'phaser';
import { OfficeScene, OfficeSceneInitData } from './scenes/OfficeScene';

export function createOfficeGame(containerId: string, initData?: OfficeSceneInitData) {
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
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#0f172a',
  };

  const game = new Phaser.Game(config);
  game.scene.add('OfficeScene', OfficeScene, true, initData as unknown as Record<string, unknown>);
  return game;
}
