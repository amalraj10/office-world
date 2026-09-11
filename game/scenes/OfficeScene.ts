import Phaser from 'phaser';
import { CharacterConfig, PlayerPosition, UserStatus, WeaponType } from '@/types';
import { getCharacterConfig } from '@/lib/characterPresets';
import { WEAPONS_CATALOG } from '@/lib/weaponsCatalog';
import { playGunshotSound, playRicochetSound, playHitImpactSound, playReloadSound, playDryClickSound } from '@/lib/audioFx';

export interface GameEventPayloads {
  'player-moved': PlayerPosition;
  'near-desk': { deskId: string; label: string; x: number; y: number } | null;
  'near-coworker': { userId: string; name: string; avatar: string; status: string } | null;
  'near-gunshop': boolean;
  'status-changed': UserStatus;
  'combat-kill': { attackerName: string; victimName: string; weapon: WeaponType };
  'score-updated': { redKills: number; blueKills: number };
  'ammo-updated': { ammo: number; totalAmmo: number; isReloading: boolean; weapon: WeaponType };
}

export interface OfficeSceneInitData {
  currentUser?: {
    id: string;
    name: string;
    avatar: string;
    character?: CharacterConfig;
    status: UserStatus;
  };
}

const WORLD_W = 1600;
const WORLD_H = 1000;

export class OfficeScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private knifeKey!: Phaser.Input.Keyboard.Key;
  private reloadKey!: Phaser.Input.Keyboard.Key;
  private switchWeaponKey!: Phaser.Input.Keyboard.Key;
  private shopKey!: Phaser.Input.Keyboard.Key;
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private walkStepTimer = 0;
  private leftLegStep = false;

  private isSitting = false;
  private currentDesk: { id: string; label: string; x: number; y: number } | null = null;
  private currentNearCoworker: { userId: string; name: string; avatar: string; status: string } | null = null;

  private desksGroup!: Phaser.Physics.Arcade.StaticGroup;
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private bulletsGroup!: Phaser.Physics.Arcade.Group;
  private coworkersGroup!: Phaser.Physics.Arcade.Group;
  private pickupsGroup!: Phaser.Physics.Arcade.Group;

  // Combat State
  public currentWeapon: WeaponType = 'pistol';
  public health = 100;
  public maxHealth = 100;
  public isDead = false;
  public ammo = 12;
  public maxAmmo = 12;
  public totalAmmo = 240;
  public isReloading = false;
  public playerCash = 1250;
  public playerTeam: 'red' | 'blue' = 'blue';
  public redKills = 0;
  public blueKills = 0;

  private gunSprite!: Phaser.GameObjects.Container;
  private knifeSprite!: Phaser.GameObjects.Graphics;
  private playerHpBarGraphics!: Phaser.GameObjects.Graphics;
  private playerHpBarFill!: Phaser.GameObjects.Rectangle;
  private lastFiredTime = 0;

  public currentUser: {
    id: string;
    name: string;
    avatar: string;
    character?: CharacterConfig;
    status: UserStatus;
  } = {
    id: 'user-amal',
    name: 'Amalraj',
    avatar: 'character1',
    status: 'Working',
  };

  constructor() {
    super('OfficeScene');
  }

  init(data: OfficeSceneInitData) {
    if (data?.currentUser) {
      this.currentUser = { ...this.currentUser, ...data.currentUser };
    }
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    this.wallsGroup = this.physics.add.staticGroup();
    this.desksGroup = this.physics.add.staticGroup();

    // Physics Bullet Group for Ricochet Shooting
    this.bulletsGroup = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true,
    });

    // Coworkers Physics Group for Target Shooting & Life Reduction
    this.coworkersGroup = this.physics.add.group();

    // 1. Draw Architectural Floor Plan & Room Zones
    this.createFloorPlan();

    // 2. Draw Furniture & Objects
    this.createReceptionZone();
    this.createMeetingRoomZone();
    this.createPantryZone();
    this.createWorkstations();
    this.createLoungeZone();
    this.createGameAreaZone();
    this.createEntranceZone();
    this.createGunShopZone();

    // 3. Draw Coworkers
    this.createCoworkers();

    // 4. Create Main Player (Amalraj)
    this.createPlayer();

    // 5. Input Controls & Weapon Keys
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.knifeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
      this.reloadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
      this.switchWeaponKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      this.shopKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

      this.reloadKey.on('down', () => this.reloadPistol());
      this.switchWeaponKey.on('down', () => this.switchWeapon());
      this.shopKey.on('down', () => this.refillAmmoFromShop());
    }

    // Pointer & Keyboard Down -> Fire Pistol or Knife
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.fireActiveWeapon(pointer);
    });

    if (this.input.keyboard) {
      const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      spaceKey.on('down', () => {
        this.fireActiveWeapon();
      });
    }

    // Camera
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.0);

    // Collisions
    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.player, this.desksGroup);

    // Bullet Ricochet Bounce on Walls & Desks
    this.physics.add.collider(this.bulletsGroup, this.wallsGroup, (bulletObj) => {
      this.handleBulletRicochet(bulletObj as Phaser.Types.Physics.Arcade.GameObjectWithBody);
    });
    this.physics.add.collider(this.bulletsGroup, this.desksGroup, (bulletObj) => {
      this.handleBulletRicochet(bulletObj as Phaser.Types.Physics.Arcade.GameObjectWithBody);
    });

    // Bullet Hit Enemy Coworker -> Damage HP & Die on 0 HP
    this.physics.add.overlap(this.bulletsGroup, this.coworkersGroup, (bulletObj, coworkerObj) => {
      this.handleBulletHitCoworker(bulletObj as any, coworkerObj as any);
    });

    // Glowing Map Pickups Group (Cash 💵 & Health ❤️ Medkits)
    this.pickupsGroup = this.physics.add.group();
    for (let i = 0; i < 8; i++) {
      this.spawnRandomPickup();
    }
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnRandomPickup,
      callbackScope: this,
      loop: true,
    });

    // Sync initial ammo and cash state with HUD UI
    this.emitAmmoUpdate();
    this.emitCashUpdate();
  }

  // ----------------------------------------------------
  // 1. ARCHITECTURAL FLOOR PLAN & ZONES
  // ----------------------------------------------------
  private createFloorPlan() {
    const g = this.add.graphics();

    // Main Open Floor (Natural Warm Sandstone Beige #E2D7C2)
    g.fillStyle(0xe2d7c2, 1);
    g.fillRect(0, 0, WORLD_W, WORLD_H);

    // Subtle Architectural Tile Grid
    g.lineStyle(1, 0xd0c4ad, 0.45);
    for (let x = 0; x <= WORLD_W; x += 36) g.lineBetween(x, 0, x, WORLD_H);
    for (let y = 0; y <= WORLD_H; y += 36) g.lineBetween(0, y, WORLD_W, y);

    // Ambient Floor Shadows / Depth
    g.fillStyle(0x000000, 0.05);
    g.fillRect(0, 0, WORLD_W, 28);
    g.fillRect(0, WORLD_H - 28, WORLD_W, 28);
    g.fillRect(0, 0, 28, WORLD_H);
    g.fillRect(WORLD_W - 28, 0, 28, WORLD_H);

    // Meeting Room Floor (Cool Architectural Grey #C5CCD5)
    g.fillStyle(0xc5ccd5, 1);
    g.fillRect(320, 20, 240, 230);
    g.lineStyle(1, 0xb2bcc7, 0.5);
    for (let x = 320; x <= 560; x += 30) g.lineBetween(x, 20, x, 250);
    for (let y = 20; y <= 250; y += 30) g.lineBetween(320, y, 560, y);

    // Pantry Floor (Light Natural Oak Plank Tone #DCCBB3)
    g.fillStyle(0xdccbb3, 1);
    g.fillRect(570, 20, 340, 230);
    // Parquet horizontal wood lines
    g.lineStyle(1, 0xcab79e, 0.4);
    for (let y = 20; y <= 250; y += 20) g.lineBetween(570, y, 910, y);

    // Lounge Floor (Scandinavian Slate-Blue Carpet #7E8E9E)
    g.fillStyle(0x7e8e9e, 1);
    g.fillRect(20, 590, 310, 210);
    g.lineStyle(1, 0x6e7d8d, 0.4);
    for (let x = 20; x <= 330; x += 25) g.lineBetween(x, 590, x, 800);

    // Game Area Floor (Deep Slate Wool Carpet #586675)
    g.fillStyle(0x586675, 1);
    g.fillRect(660, 590, 320, 210);
    g.lineStyle(1, 0x4a5664, 0.4);
    for (let x = 660; x <= 980; x += 25) g.lineBetween(x, 590, x, 800);

    // Perimeter Architectural Walls (Charcoal Navy #242C38)
    const wallThick = 18;
    g.fillStyle(0x242c38, 1);
    g.fillRect(0, 0, WORLD_W, wallThick);
    g.fillRect(0, WORLD_H - wallThick, WORLD_W, wallThick);
    g.fillRect(0, 0, wallThick, WORLD_H);
    g.fillRect(WORLD_W - wallThick, 0, wallThick, WORLD_H);

    // Beveled Wall Top Highlight
    g.fillStyle(0x3e4b5d, 1);
    g.fillRect(0, 0, WORLD_W, 3);
    g.fillRect(0, 0, 3, WORLD_H);

    // Meeting Room Glass Walls & Aluminum Frame
    g.fillStyle(0x242c38, 1);
    g.fillRect(320, 20, 6, 230);
    g.fillRect(560, 20, 6, 230);
    g.fillRect(320, 250, 160, 6); // Bottom glass partition with doorway

    // Frosted Blue Glass Pane Tint with Ambient Reflection Streaks
    g.fillStyle(0x9fc5e8, 0.28);
    g.fillRect(326, 20, 234, 230);
    g.lineStyle(2, 0xffffff, 0.35);
    g.lineBetween(340, 35, 380, 120);
    g.lineBetween(480, 45, 520, 130);

    // Pantry Boundary Frame
    g.fillStyle(0x242c38, 1);
    g.fillRect(570, 20, 6, 230);
    g.fillRect(910, 20, 6, 230);

    // Lounge & Game Boundary Walls
    g.fillRect(20, 590, 310, 6);
    g.fillRect(330, 590, 6, 210);
    g.fillRect(660, 590, 6, 210);
    g.fillRect(660, 590, 320, 6);

    // Wall Shadows
    g.fillStyle(0x000000, 0.12);
    g.fillRect(20, 596, 310, 6);
    g.fillRect(660, 596, 320, 6);
    g.fillRect(320, 256, 160, 6);

    // Physics static walls
    const addWall = (x: number, y: number, w: number, h: number) => {
      const rect = this.add.rectangle(x + w / 2, y + h / 2, w, h);
      this.physics.add.existing(rect, true);
      this.wallsGroup.add(rect);
    };

    addWall(0, 0, WORLD_W, wallThick);
    addWall(0, WORLD_H - wallThick, WORLD_W, wallThick);
    addWall(0, 0, wallThick, WORLD_H);
    addWall(WORLD_W - wallThick, 0, wallThick, WORLD_H);
    addWall(320, 20, 6, 230);
    addWall(560, 20, 6, 230);
    addWall(320, 250, 160, 6);
    addWall(20, 590, 310, 6);
    addWall(660, 590, 320, 6);
  }

  // ----------------------------------------------------
  // 2. DETAILED ZONES & FURNITURE
  // ----------------------------------------------------
  private createReceptionZone() {
    const g = this.add.graphics();

    // Reception Logo & Slogan on Wall/Floor
    this.add.text(145, 118, 'OfficeWorld', {
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#0F172A',
    }).setOrigin(0.5);

    this.add.text(145, 137, 'Work · Connect · Grow', {
      fontSize: '8px',
      fontStyle: '600',
      color: '#64748B',
    }).setOrigin(0.5);

    // Curved Modern White Reception Counter
    g.fillStyle(0x000000, 0.16);
    g.fillRoundedRect(72, 172, 146, 48, 12);

    g.fillStyle(0xf8fafc, 1);
    g.fillRoundedRect(70, 170, 146, 46, 12);
    g.lineStyle(1.5, 0xcfd8e3, 1);
    g.strokeRoundedRect(70, 170, 146, 46, 12);

    // Oak countertop trim
    g.fillStyle(0xd5c0a3, 1);
    g.fillRoundedRect(75, 172, 136, 10, 4);

    // Receptionist Behind Counter
    const recConfig = getCharacterConfig('character2');
    const recAvatar = this.buildCharacterVisual(recConfig, { hasBeard: false, shirtColor: 0x3b82f6 });
    const recContainer = this.add.container(143, 160);
    recContainer.add(recAvatar);

    // Floor Badge Tag
    this.createZoneLabel(143, 226, 'Reception');

    // Layered Floor Planters
    this.createPottedPlant(45, 175);
    this.createPottedPlant(235, 175);
    this.createPottedPlant(235, 95);
    this.createPottedPlant(45, 95);
  }

  private createMeetingRoomZone() {
    const g = this.add.graphics();

    // Whiteboard on top wall
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(390, 40, 100, 50, 5);
    g.lineStyle(1.5, 0x94a3b8, 1);
    g.strokeRoundedRect(390, 40, 100, 50, 5);

    this.add.text(440, 65, 'Better\nPeople\nBetter\nProducts', {
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#1E293B',
      align: 'center',
      lineSpacing: 1.5,
    }).setOrigin(0.5);

    // Conference Table (Warm Oak Oval #DEC1A0)
    g.fillStyle(0x000000, 0.16);
    g.fillRoundedRect(388, 118, 104, 64, 20);

    g.fillStyle(0xdfc29f, 1);
    g.fillRoundedRect(385, 115, 104, 64, 20);
    g.lineStyle(2, 0xbca080, 1);
    g.strokeRoundedRect(385, 115, 104, 64, 20);

    // Conference Table Cable Grommet (Center)
    g.fillStyle(0x94a3b8, 1);
    g.fillRoundedRect(428, 142, 18, 8, 2);

    // 6 Executive Mesh Chairs
    const chairCoords = [
      [410, 100], [465, 100], // top
      [410, 192], [465, 192], // bottom
      [368, 147], [505, 147], // sides
    ];
    chairCoords.forEach(([cx, cy]) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(cx - 10, cy - 8, 20, 16, 5);
      g.lineStyle(1.2, 0x475569, 1);
      g.strokeRoundedRect(cx - 10, cy - 8, 20, 16, 5);
    });

    this.createPottedPlant(345, 45);
    this.createPottedPlant(535, 45);
    this.createZoneLabel(440, 235, 'Meeting Room');
  }

  private createPantryZone() {
    const g = this.add.graphics();

    // Espresso / Coffee Bar Counter
    g.fillStyle(0x000000, 0.16);
    g.fillRect(592, 72, 196, 40);

    g.fillStyle(0xebdcc7, 1);
    g.fillRect(590, 70, 196, 40);
    g.lineStyle(1.5, 0xb8a287, 1);
    g.strokeRect(590, 70, 196, 40);

    // Espresso Machines with Spouts and Gauges
    g.fillStyle(0x1e293b, 1);
    g.fillRoundedRect(610, 50, 24, 28, 4);
    g.fillRoundedRect(645, 48, 30, 30, 4);
    g.fillRoundedRect(690, 52, 22, 26, 4);
    // Chrome knobs
    g.fillStyle(0xe2e8f0, 1);
    g.fillCircle(652, 58, 2);
    g.fillCircle(668, 58, 2);

    // Beverage Fridge on right with glass door
    g.fillStyle(0x2563eb, 1);
    g.fillRoundedRect(760, 42, 22, 38, 4);
    g.fillStyle(0x93c5fd, 0.4);
    g.fillRect(762, 44, 18, 34);

    // Glowing Neon Sign (Top Right Wall)
    this.add.text(850, 65, 'Good\nFood\nGood Ideas', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#F472B6',
      align: 'center',
      lineSpacing: 1.5,
    }).setOrigin(0.5).setShadow(0, 0, '#F472B6', 12, true, true);

    // 3 Round Wooden Cafe Tables with Stools
    const cafeTables = [
      { x: 650, y: 175 },
      { x: 810, y: 135 },
      { x: 790, y: 205 },
    ];

    cafeTables.forEach((t) => {
      g.fillStyle(0x000000, 0.14);
      g.fillCircle(t.x + 2, t.y + 2, 23);

      g.fillStyle(0xdfad72, 1);
      g.fillCircle(t.x, t.y, 23);
      g.lineStyle(2, 0xb88851, 1);
      g.strokeCircle(t.x, t.y, 23);

      // Stools with cushioned tops
      [[-25, 0], [25, 0], [0, -25], [0, 25]].forEach(([dx, dy]) => {
        g.fillStyle(0x1e293b, 1);
        g.fillCircle(t.x + dx, t.y + dy, 6.5);
      });
    });

    // Two coworkers sitting at Cafe Table 1
    const pCoworker1 = this.add.container(626, 175);
    pCoworker1.add(this.buildCharacterVisual(getCharacterConfig('character3'), { shirtColor: 0xeab308, hasBeard: false }));

    const pCoworker2 = this.add.container(674, 175);
    pCoworker2.add(this.buildCharacterVisual(getCharacterConfig('character1'), { shirtColor: 0x2563eb, hasBeard: true }));

    // Green planter partition
    g.fillStyle(0x475569, 1);
    g.fillRoundedRect(585, 220, 45, 20, 4);
    g.fillStyle(0x15803d, 1);
    g.fillCircle(597, 224, 8);
    g.fillCircle(617, 224, 8);

    this.createZoneLabel(690, 50, 'Pantry');
    this.createPottedPlant(870, 90);
  }

  private createWorkstations() {
    // 4 Modular Desk Pods (2 top, 2 bottom)
    const pods = [
      { x: 170, y: 350 },
      { x: 600, y: 350 },
      { x: 170, y: 470 },
      { x: 600, y: 470 },
    ];

    pods.forEach((pod) => {
      this.drawDeskCluster(pod.x, pod.y);
    });

    // Decorative Plants around workbay
    this.createPottedPlant(65, 335);
    this.createPottedPlant(65, 455);
    this.createPottedPlant(235, 435);
    this.createPottedPlant(505, 335);
    this.createPottedPlant(885, 275);
    this.createPottedPlant(730, 455);
  }

  private drawDeskCluster(x: number, y: number) {
    const g = this.add.graphics();
    const w = 110;
    const h = 72;

    // Soft Drop shadow
    g.fillStyle(0x000000, 0.14);
    g.fillRoundedRect(x + 2, y + 2, w, h, 6);

    // Clean Maple Desk Surface
    g.fillStyle(0xeee5d8, 1);
    g.fillRoundedRect(x, y, w, h, 6);
    g.lineStyle(1.5, 0xcac0b0, 1);
    g.strokeRoundedRect(x, y, w, h, 6);

    // Center divider partition (Frosted glass divider)
    g.fillStyle(0x64748b, 1);
    g.fillRect(x + 4, y + h / 2 - 1.5, w - 8, 3);

    // Dual Monitors with glowing green leaf logo on back
    // Top Desks (1 & 2)
    [x + 24, x + 76].forEach((mx) => {
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(mx - 15, y + 10, 30, 12, 3);
      g.fillStyle(0x22c55e, 1);
      g.fillCircle(mx, y + 16, 2.5);
      // Keyboard
      g.fillStyle(0x334155, 1);
      g.fillRect(mx - 10, y + 26, 20, 6);
    });

    // Bottom Desks (3 & 4)
    [x + 24, x + 76].forEach((mx) => {
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(mx - 15, y + h - 22, 30, 12, 3);
      g.fillStyle(0x22c55e, 1);
      g.fillCircle(mx, y + h - 16, 2.5);
      // Keyboard
      g.fillStyle(0x334155, 1);
      g.fillRect(mx - 10, y + h - 32, 20, 6);
    });

    // Black Ergonomic Mesh Chairs with Armrests & 5-wheel Star Base
    [
      [x + 24, y - 6], [x + 76, y - 6],
      [x + 24, y + h + 6], [x + 76, y + h + 6],
    ].forEach(([cx, cy]) => {
      g.fillStyle(0x1e293b, 1);
      g.fillRoundedRect(cx - 10, cy - 8, 20, 16, 5);
      g.lineStyle(1.2, 0x475569, 1);
      g.strokeRoundedRect(cx - 10, cy - 8, 20, 16, 5);
    });

    // Collision box
    const colRect = this.add.rectangle(x + w / 2, y + h / 2, w, h);
    this.physics.add.existing(colRect, true);
    this.desksGroup.add(colRect);
  }

  private createLoungeZone() {
    const g = this.add.graphics();

    // Motivational Wall Typography
    this.add.text(45, 630, 'Great\nTeams\nBuild\nGreat\nThings', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#E2E8F0',
      lineSpacing: 2,
    });

    // Cozy Mustard Yellow 3-Seater Sofa
    g.fillStyle(0x000000, 0.16);
    g.fillRoundedRect(162, 622, 100, 42, 8);

    g.fillStyle(0xeab308, 1);
    g.fillRoundedRect(160, 620, 100, 40, 8);
    g.lineStyle(2, 0xca8a04, 1);
    g.strokeRoundedRect(160, 620, 100, 40, 8);

    // Blue Accent Armchair
    g.fillStyle(0x3b82f6, 1);
    g.fillRoundedRect(122, 640, 32, 65, 6);
    g.lineStyle(1.5, 0x1d4ed8, 1);
    g.strokeRoundedRect(122, 640, 32, 65, 6);

    // Round Coffee Table
    g.fillStyle(0xdfad72, 1);
    g.fillCircle(210, 690, 20);
    g.lineStyle(1.5, 0xb88851, 1);
    g.strokeCircle(210, 690, 20);

    // Blue Water Dispenser
    g.fillStyle(0xffffff, 1);
    g.fillRect(290, 640, 20, 40);
    g.fillStyle(0x38bdf8, 0.85);
    g.fillCircle(300, 635, 10);

    // Character on Yellow Couch with Laptop
    const loungeChar = this.add.container(210, 630);
    loungeChar.add(this.buildCharacterVisual(getCharacterConfig('character6'), { hasBeard: true, shirtColor: 0x1e293b }));
    // Laptop on lap
    g.fillStyle(0x94a3b8, 1);
    g.fillRect(202, 636, 16, 10);

    // Character Walking in Lounge
    const walkingChar = this.add.container(275, 700);
    walkingChar.add(this.buildCharacterVisual(getCharacterConfig('character2'), { hasBeard: false, shirtColor: 0x2563eb }));

    this.createZoneLabel(230, 755, 'Lounge');
    this.createPottedPlant(145, 605);
    this.createPottedPlant(310, 605);
  }

  private createGameAreaZone() {
    const g = this.add.graphics();

    // Wall Quote
    this.add.text(760, 625, 'Work\nPlay\nBelong', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#E2E8F0',
      align: 'center',
    }).setOrigin(0.5);

    // Tournament Green Felt Pool Table
    const ptx = 710;
    const pty = 630;
    g.fillStyle(0x000000, 0.16);
    g.fillRoundedRect(ptx + 2, pty + 2, 80, 50, 4);

    g.fillStyle(0x15803d, 1);
    g.fillRoundedRect(ptx, pty, 80, 50, 4);
    g.lineStyle(3.5, 0x854d0e, 1);
    g.strokeRoundedRect(ptx, pty, 80, 50, 4);

    // 6 Pockets
    [[ptx, pty], [ptx + 40, pty], [ptx + 80, pty], [ptx, pty + 50], [ptx + 40, pty + 50], [ptx + 80, pty + 50]].forEach(([cx, cy]) => {
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(cx, cy, 3.5);
    });

    // Foosball Table with Player Rods
    g.fillStyle(0x166534, 1);
    g.fillRoundedRect(ptx, 700, 74, 42, 4);
    g.lineStyle(2, 0x78350f, 1);
    g.strokeRoundedRect(ptx, 700, 74, 42, 4);

    // Dartboard on Wall
    const dbx = 835;
    const dby = 635;
    g.fillStyle(0x1e293b, 1);
    g.fillCircle(dbx, dby, 16);
    g.fillStyle(0xdc2626, 1);
    g.fillCircle(dbx, dby, 12);
    g.fillStyle(0xfef08a, 1);
    g.fillCircle(dbx, dby, 8);
    g.fillStyle(0xdc2626, 1);
    g.fillCircle(dbx, dby, 4);
    g.fillStyle(0x22c55e, 1);
    g.fillCircle(dbx, dby, 1.5);

    // Plush Beanbags
    g.fillStyle(0xeab308, 1);
    g.fillCircle(775, 715, 18);
    g.fillStyle(0xca8a04, 1);
    g.fillCircle(775, 712, 8);

    g.fillStyle(0x1d4ed8, 1);
    g.fillCircle(825, 735, 18);
    g.fillStyle(0x1e40af, 1);
    g.fillCircle(825, 732, 8);

    this.createZoneLabel(760, 755, 'Game Area');
    this.createPottedPlant(850, 710);
    this.createPottedPlant(680, 605);
  }

  private createEntranceZone() {
    const g = this.add.graphics();

    // Architectural Double Glass Doors
    const edx = 425;
    const edy = 620;

    g.fillStyle(0x38bdf8, 0.3);
    g.fillRoundedRect(edx, edy, 90, 70, 6);
    g.lineStyle(3, 0x334155, 1);
    g.strokeRoundedRect(edx, edy, 90, 70, 6);
    g.lineBetween(edx + 45, edy, edx + 45, edy + 70);

    // Stainless Steel Handles
    g.fillStyle(0xffffff, 1);
    g.fillRect(edx + 38, edy + 30, 4, 16);
    g.fillRect(edx + 48, edy + 30, 4, 16);

    // Security Turnstiles
    g.fillStyle(0x475569, 1);
    g.fillRoundedRect(edx - 22, edy + 25, 12, 35, 3);
    g.fillRoundedRect(edx + 100, edy + 25, 12, 35, 3);

    // Welcome Doormat
    g.fillStyle(0x64748b, 0.7);
    g.fillRoundedRect(edx - 20, edy + 100, 130, 50, 6);
    g.lineStyle(1.5, 0x475569, 1);
    g.strokeRoundedRect(edx - 20, edy + 100, 130, 50, 6);

    this.add.text(edx + 45, edy + 118, 'Welcome to', {
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#F8FAFC',
    }).setOrigin(0.5);

    this.add.text(edx + 45, edy + 132, 'a more human workday', {
      fontSize: '8px',
      fontStyle: 'italic',
      color: '#E2E8F0',
    }).setOrigin(0.5);

    this.createPottedPlant(edx - 40, edy + 80);
    this.createPottedPlant(edx + 130, edy + 80);
  }

  private createGunShopZone() {
    const g = this.add.graphics();
    const gsx = 1250;
    const gsy = 150;

    // Gun Shop Floor Base
    g.fillStyle(0x1e1b4b, 0.95);
    g.fillRoundedRect(gsx, gsy, 300, 350, 16);
    g.lineStyle(3, 0xf59e0b, 0.8);
    g.strokeRoundedRect(gsx, gsy, 300, 350, 16);

    // Neon Gun Shop Title Header
    this.add.text(gsx + 150, gsy + 25, '🔫 WEAPONS & ARMORY SHOP', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#FBBF24',
    }).setOrigin(0.5);

    // Glass Counter Table
    g.fillStyle(0x312e81, 1);
    g.fillRoundedRect(gsx + 30, gsy + 60, 240, 40, 8);
    g.lineStyle(2, 0x6366f1, 1);
    g.strokeRoundedRect(gsx + 30, gsy + 60, 240, 40, 8);

    this.add.text(gsx + 150, gsy + 80, '🛒 Press B / Walk Near to Buy Guns & Ammo', {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#A5B4FC',
    }).setOrigin(0.5);

    // Display Weapon Rack Cabinets (Pistols, Rifles, Armor display)
    [0, 1, 2].forEach((i) => {
      const rx = gsx + 40 + i * 80;
      const ry = gsy + 130;
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(rx, ry, 60, 90, 6);
      g.lineStyle(1.5, 0x475569, 1);
      g.strokeRoundedRect(rx, ry, 60, 90, 6);

      // Weapon Icon Display inside racks
      g.fillStyle(0xfde047, 1);
      g.fillRect(rx + 15, ry + 30, 30, 8);
      g.fillRect(rx + 25, ry + 38, 10, 15);
    });

    this.createZoneLabel(gsx + 150, gsy + 320, 'BLACK MARKET ARMORY');
  }

  // ----------------------------------------------------
  // 3. COWORKERS & SPEECH BUBBLES
  // ----------------------------------------------------
  private createCoworkers() {
    // Original Desk Cluster
    this.createStaticCoworker('Rahul', 285, 385, 'character3', 'Hey! Ready for the battle?', { shirtColor: 0xa855f7, hasBeard: false });
    this.createStaticCoworker('Anu', 355, 415, 'character2', undefined, { shirtColor: 0xfacc15, hasBeard: false });
    this.createStaticCoworker('Vishnu', 225, 545, 'character5', undefined, { shirtColor: 0x16a34a, hasBeard: true });
    this.createStaticCoworker('Neha', 560, 545, 'character4', undefined, { shirtColor: 0xec4899, hasBeard: false });
    this.createStaticCoworker('Dev', 735, 420, 'character1', undefined, { shirtColor: 0x16a34a, hasBeard: false });
    this.createStaticCoworker('Sam', 775, 420, 'character6', undefined, { shirtColor: 0x334155, hasBeard: true });

    // Expanded Map Additional Coworkers & Gun Shop Targets
    this.createStaticCoworker('Victor (Arms Dealer)', 1400, 240, 'character5', 'Need more ammo? 🔫', { shirtColor: 0xd97706, hasBeard: true });
    this.createStaticCoworker('Maya (Sniper)', 1320, 600, 'character2', 'Covering the right flank!', { shirtColor: 0xdc2626, hasBeard: false });
    this.createStaticCoworker('Arjun (DevOps)', 1100, 750, 'character3', undefined, { shirtColor: 0x2563eb, hasBeard: true });
    this.createStaticCoworker('Zoe (QA)', 1450, 820, 'character4', undefined, { shirtColor: 0x059669, hasBeard: false });
    this.createStaticCoworker('Karan (Security)', 950, 200, 'character6', 'Halt! Who goes there?', { shirtColor: 0x7c3aed, hasBeard: true });
    this.createStaticCoworker('Meera (Product)', 1050, 450, 'character2', undefined, { shirtColor: 0xdb2777, hasBeard: false });
  }

  private createStaticCoworker(
    name: string,
    x: number,
    y: number,
    avatarPreset: string,
    speechText?: string,
    options?: { hasBeard?: boolean; shirtColor?: number; pantsColor?: number }
  ) {
    const container = this.add.container(x, y);
    const config = getCharacterConfig(avatarPreset);

    const shadow = this.add.ellipse(0, 16, 26, 10, 0x000000, 0.4);
    const parts = this.buildCharacterVisual(config, options);

    // Overhead Health Bar (100 HP)
    const hpBg = this.add.rectangle(0, -32, 36, 6, 0x0f172a);
    const hpFill = this.add.rectangle(-17, -32, 34, 4, 0x22c55e);
    hpFill.setOrigin(0, 0.5);

    const nameBadge = this.add.text(0, 24, name, {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#0F172A',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5);

    container.add([shadow, ...parts, hpBg, hpFill, nameBadge]);

    // Attach combat data onto coworker object
    (container as any).hp = 100;
    (container as any).maxHp = 100;
    (container as any).hpFill = hpFill;
    (container as any).coworkerName = name;

    // Physics Body for Bullet Hit Collisions
    this.physics.world.enable(container);
    const body = container.body as Phaser.Physics.Arcade.Body;
    body.setCircle(18, -18, -18);
    body.setImmovable(true);

    this.coworkersGroup.add(container);

    if (speechText) {
      this.createSpeechBubble(x, y - 45, speechText);
    }
  }

  private createSpeechBubble(x: number, y: number, text: string) {
    const bubble = this.add.container(x, y);

    const txt = this.add.text(0, 0, text, {
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#0F172A',
      backgroundColor: '#FFFFFF',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5, 1);

    bubble.add(txt);
  }

  // ----------------------------------------------------
  // 4. MAIN PLAYER CONTROLLER
  // ----------------------------------------------------
  private createPlayer() {
    this.player = this.add.container(450, 465);

    const config = getCharacterConfig(this.currentUser.avatar, this.currentUser.character ?? null);
    this.buildPlayerVisual(config);

    this.physics.world.enable(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setCircle(16, -16, -16);
    this.playerBody.setCollideWorldBounds(true);
  }

  private buildPlayerVisual(config: CharacterConfig) {
    const shadow = this.add.ellipse(0, 16, 26, 10, 0x000000, 0.45);
    const parts = this.buildCharacterVisual(config, {
      hasBeard: true,
      shirtColor: 0x38bdf8,
      pantsColor: 0x1e293b,
    });

    // Overhead Health Bar (100 HP)
    const hpBg = this.add.rectangle(0, -32, 36, 6, 0x0f172a);
    const hpFill = this.add.rectangle(-17, -32, 34, 4, 0x22c55e);
    hpFill.setOrigin(0, 0.5);
    this.playerHpBarFill = hpFill;

    const nameBadge = this.add.text(0, 24, `• ${this.currentUser.name}`, {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#22C55E',
      backgroundColor: '#0F172A',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5);

    // Render Equipped Pistol Gun Sprite onto Player
    const gunContainer = this.add.container(12, 0);
    const gunBody = this.add.rectangle(0, 0, 10, 5, 0x1e293b);
    const gunBarrel = this.add.rectangle(6, -1, 7, 3, 0x475569);
    const gunGrip = this.add.rectangle(-2, 3, 3, 5, 0x0f172a);
    gunContainer.add([gunGrip, gunBody, gunBarrel]);

    this.player.add([shadow, ...parts, hpBg, hpFill, gunContainer, nameBadge]);
  }

  public updatePlayerCharacter(config: CharacterConfig) {
    this.currentUser.character = config;
    if (!this.player) return;
    this.player.removeAll(true);
    this.buildPlayerVisual(config);
  }

  public setSittingState(sit: boolean) {
    this.isSitting = sit;
    if (sit && this.currentDesk) {
      this.player.setPosition(this.currentDesk.x, this.currentDesk.y);
      this.playerBody.setVelocity(0, 0);
      this.game.events.emit('status-changed', 'Working');
    }
  }

  update(time: number, delta: number) {
    if (!this.playerBody) return;

    let vx = 0;
    let vy = 0;
    const isRunning = !!this.shiftKey?.isDown;
    const speed = isRunning ? 260 : 170;

    if (this.cursors && this.wasd) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
      else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;

      if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
      else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    }

    if ((vx !== 0 || vy !== 0) && this.isSitting) {
      this.isSitting = false;
    }

    if (!this.isSitting) {
      this.playerBody.setVelocity(vx, vy);
      if (vx !== 0 && vy !== 0) {
        this.playerBody.velocity.normalize().scale(speed);
      }
    }

    const isMoving = vx !== 0 || vy !== 0;

    // Smooth walking bob animation when moving
    if (isMoving) {
      this.walkStepTimer += delta;
      if (this.walkStepTimer > 180) {
        this.walkStepTimer = 0;
        this.leftLegStep = !this.leftLegStep;
        this.player.setScale(this.leftLegStep ? 1.03 : 0.97, this.leftLegStep ? 0.97 : 1.03);
      }
    } else {
      this.player.setScale(1.0, 1.0);
    }

    // Dynamically Aim Gun & Rotate Player towards Mouse Cursor Pointer
    const pointer = this.input.activePointer;
    if (pointer && this.player) {
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const aimAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);
      this.player.setRotation(aimAngle);
    }

    // Actively Move Flying Bullets Forward Every Frame (Guaranteed Motion)
    if (this.bulletsGroup) {
      this.bulletsGroup.getChildren().forEach((bObj: any) => {
        if (bObj && bObj.active && bObj.vx !== undefined && bObj.vy !== undefined) {
          bObj.x += bObj.vx * (delta / 1000);
          bObj.y += bObj.vy * (delta / 1000);

          // Check outer perimeter wall ricochet reflection
          if (bObj.x <= 20) {
            bObj.x = 21;
            bObj.vx = Math.abs(bObj.vx);
            if (bObj.body) bObj.body.velocity.x = bObj.vx;
            this.handleBulletRicochet(bObj);
          } else if (bObj.x >= WORLD_W - 20) {
            bObj.x = WORLD_W - 21;
            bObj.vx = -Math.abs(bObj.vx);
            if (bObj.body) bObj.body.velocity.x = bObj.vx;
            this.handleBulletRicochet(bObj);
          }

          if (bObj.y <= 20) {
            bObj.y = 21;
            bObj.vy = Math.abs(bObj.vy);
            if (bObj.body) bObj.body.velocity.y = bObj.vy;
            this.handleBulletRicochet(bObj);
          } else if (bObj.y >= WORLD_H - 20) {
            bObj.y = WORLD_H - 21;
            bObj.vy = -Math.abs(bObj.vy);
            if (bObj.body) bObj.body.velocity.y = bObj.vy;
            this.handleBulletRicochet(bObj);
          }

          // Check coworker hit overlap
          if (this.coworkersGroup) {
            this.coworkersGroup.getChildren().forEach((cwObj: any) => {
              if (cwObj && cwObj.active) {
                const dist = Phaser.Math.Distance.Between(bObj.x, bObj.y, cwObj.x, cwObj.y);
                if (dist < 28) {
                  this.handleBulletHitCoworker(bObj, cwObj);
                }
              }
            });
          }

          // Check player self-damage ONLY AFTER reflecting off wall/desk (bounces > 0)
          if (bObj.bounces > 0 && this.player && this.player.active && !this.isDead) {
            const distToPlayer = Phaser.Math.Distance.Between(bObj.x, bObj.y, this.player.x, this.player.y);
            if (distToPlayer < 28) {
              this.handleBulletHitPlayer(bObj);
            }
          }
        }
      });
    }

    // Collect glowing map pickups (Cash 💵 & Health Medkits ❤️)
    if (this.pickupsGroup && this.player && this.player.active && !this.isDead) {
      this.pickupsGroup.getChildren().forEach((pObj: any) => {
        if (pObj && pObj.active) {
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, pObj.x, pObj.y);
          if (dist < 28) {
            this.collectPickup(pObj);
          }
        }
      });
    }

    this.game.events.emit('player-moved', {
      userId: this.currentUser.id,
      displayName: this.currentUser.name,
      avatar: this.currentUser.avatar,
      x: this.player.x,
      y: this.player.y,
      direction: vx > 0 ? 'right' : vx < 0 ? 'left' : vy > 0 ? 'down' : 'up',
      isMoving,
      isSitting: this.isSitting,
      status: this.currentUser.status,
    });
  }

  // ----------------------------------------------------
  // 5. NATURAL CHIBI CHARACTER RENDERING ENGINE
  // ----------------------------------------------------
  private buildCharacterVisual(
    config: CharacterConfig,
    options?: {
      hasBeard?: boolean;
      pantsColor?: number;
      shoeColor?: number;
      shirtColor?: number;
    }
  ): Phaser.GameObjects.GameObject[] {
    const parts: Phaser.GameObjects.GameObject[] = [];
    const g = this.add.graphics();
    parts.push(g);

    const skin = Phaser.Display.Color.HexStringToColor(config.skinTone).color;
    const outfit = options?.shirtColor ?? Phaser.Display.Color.HexStringToColor(config.outfitColor).color;
    const hairColor = Phaser.Display.Color.HexStringToColor(config.hairColor).color;
    const pants = options?.pantsColor ?? 0x1e293b;
    const shoes = options?.shoeColor ?? 0x0f172a;

    // 1. Shoes with White Rubber Soles (Y +14 to +18)
    // Left shoe
    g.fillStyle(shoes, 1);
    g.fillRoundedRect(-7, 14, 6, 4, 1.5);
    g.fillStyle(0xffffff, 1); // white sole
    g.fillRect(-7, 17, 6, 1.5);

    // Right shoe
    g.fillStyle(shoes, 1);
    g.fillRoundedRect(1, 14, 6, 4, 1.5);
    g.fillStyle(0xffffff, 1);
    g.fillRect(1, 17, 6, 1.5);

    // 2. Legs / Trousers (Y +6 to +15)
    g.fillStyle(pants, 1);
    g.fillRoundedRect(-7, 6, 6, 9, 1.5);
    g.fillRoundedRect(1, 6, 6, 9, 1.5);

    // 3. Belt with Silver Buckle (Y +5 to +7)
    g.fillStyle(0x0f172a, 1);
    g.fillRect(-8, 5, 16, 2.5);
    g.fillStyle(0x94a3b8, 1);
    g.fillRect(-1.5, 5, 3, 2.5);

    // 4. Arms & Hands with Sleeves (Y -3 to +7)
    // Left arm & watch
    g.fillStyle(outfit, 1);
    g.fillRoundedRect(-11, -3, 4, 7, 1.5);
    g.fillStyle(0x0f172a, 1); // watch
    g.fillRect(-11, 3.5, 4, 1.5);
    g.fillStyle(skin, 1); // hand
    g.fillCircle(-9, 6, 2.2);

    // Right arm
    g.fillStyle(outfit, 1);
    g.fillRoundedRect(7, -3, 4, 7, 1.5);
    g.fillStyle(skin, 1); // hand
    g.fillCircle(9, 6, 2.2);

    // 5. Torso / Shirt with Placket & Collar (Y -4 to +7)
    g.fillStyle(outfit, 1);
    g.fillRoundedRect(-8, -4, 16, 11, 3);
    g.lineStyle(1.2, 0x0f172a, 0.8);
    g.strokeRoundedRect(-8, -4, 16, 11, 3);

    // Shirt buttons placket
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(0, -1, 1);
    g.fillCircle(0, 2, 1);

    // Collar
    g.fillStyle(skin, 1);
    g.fillTriangle(-3, -4, 3, -4, 0, -1.5);

    // 6. Neck (Y -6 to -3)
    g.fillStyle(skin, 1);
    g.fillRect(-2.5, -6, 5, 3);

    // 7. Ears (X -10, +10, Y -12)
    g.fillStyle(skin, 1);
    g.fillCircle(-9.5, -12, 2.2);
    g.fillCircle(9.5, -12, 2.2);

    // 8. Head (Center at Y -12, Radius 9.5)
    g.fillStyle(skin, 1);
    g.fillCircle(0, -12, 9.5);
    g.lineStyle(1.2, 0x0f172a, 0.9);
    g.strokeCircle(0, -12, 9.5);

    // 9. Beard / Facial Hair
    const hasBeard = options?.hasBeard ?? (config.hairStyle === 'short-crop' || config.hairStyle === 'buzz');
    if (hasBeard) {
      g.fillStyle(hairColor, 0.9);
      g.beginPath();
      g.arc(0, -12, 9.5, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(150), false);
      g.closePath();
      g.fillPath();

      // Trimmed mustache
      g.fillStyle(hairColor, 1);
      g.fillRoundedRect(-3.5, -9, 7, 2, 1);
    }

    // 10. Expressive Eyes (Almond white + colored pupil + double sparkle)
    // Left eye
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(-4, -13, 4.5, 5);
    g.fillStyle(0x18181b, 1);
    g.fillCircle(-4, -13, 2.0);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(-3.2, -14, 0.7); // primary sparkle
    g.fillCircle(-4.8, -12, 0.4); // secondary catchlight

    // Right eye
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(4, -13, 4.5, 5);
    g.fillStyle(0x18181b, 1);
    g.fillCircle(4, -13, 2.0);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4.8, -14, 0.7);
    g.fillCircle(3.2, -12, 0.4);

    // 11. Eyebrows
    g.lineStyle(1.3, hairColor, 1);
    g.lineBetween(-6.5, -16.8, -2, -16.5);
    g.lineBetween(2, -16.5, 6.5, -16.8);

    // 12. Smile / Mouth
    if (!hasBeard) {
      g.lineStyle(1.1, 0x7c2d12, 0.85);
      g.beginPath();
      g.arc(0, -8.5, 2.6, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160), false);
      g.strokePath();
    }

    // 13. Styled Hair with Highlights
    g.fillStyle(hairColor, 1);
    switch (config.hairStyle) {
      case 'spiky':
        g.fillTriangle(-8, -17, -4, -25, 0, -17);
        g.fillTriangle(-2, -17, 3, -26, 7, -17);
        g.fillTriangle(4, -17, 9, -24, 12, -17);
        g.fillRoundedRect(-9.5, -21, 19, 6, 3);
        break;

      case 'long-curly':
        g.fillCircle(-9, -15, 6);
        g.fillCircle(9, -15, 6);
        g.fillCircle(-9, -10, 5);
        g.fillCircle(9, -10, 5);
        g.fillCircle(0, -20, 8);
        g.fillCircle(-6, -19, 6);
        g.fillCircle(6, -19, 6);
        break;

      case 'bob-cut':
        g.fillRoundedRect(-10.5, -21, 21, 14, 7);
        g.fillRect(-10.5, -15, 4, 10);
        g.fillRect(6.5, -15, 4, 10);
        g.fillStyle(hairColor, 1);
        g.fillRoundedRect(-7, -18, 14, 4, 1.5);
        break;

      case 'bun':
        g.fillRoundedRect(-10, -21, 20, 8, 4);
        g.fillCircle(0, -24, 4.5);
        break;

      case 'ponytail':
        g.fillRoundedRect(-10, -21, 20, 8, 4);
        g.fillCircle(11, -12, 4);
        break;

      case 'buzz':
        g.fillRoundedRect(-9.5, -21, 19, 5, 2.5);
        break;

      case 'short-crop':
      default:
        g.fillRoundedRect(-10, -22, 20, 8, 4);
        g.fillCircle(-7, -19, 4);
        g.fillCircle(0, -21, 4.5);
        g.fillCircle(7, -19, 4);
        break;
    }

    return parts;
  }

  // ----------------------------------------------------
  // HELPERS (Lush Plants, Zone Floor Labels)
  // ----------------------------------------------------
  private createPottedPlant(x: number, y: number) {
    const g = this.add.graphics();
    // Soft shadow
    g.fillStyle(0x000000, 0.16);
    g.fillCircle(x + 2, y + 8, 10);

    // Ceramic Planter Pot
    g.fillStyle(0xf8fafc, 1);
    g.fillRoundedRect(x - 8, y + 2, 16, 14, 3);
    g.lineStyle(1.2, 0xcfd8e3, 1);
    g.strokeRoundedRect(x - 8, y + 2, 16, 14, 3);

    // Wooden stand legs
    g.fillStyle(0xb45309, 1);
    g.fillRect(x - 7, y + 14, 2.5, 4);
    g.fillRect(x + 4.5, y + 14, 2.5, 4);

    // Layered Monstera Leaves
    g.fillStyle(0x14532d, 1);
    g.fillCircle(x, y - 2, 10);
    g.fillStyle(0x16a34a, 1);
    g.fillCircle(x - 5, y - 5, 7.5);
    g.fillCircle(x + 5, y - 5, 7.5);
    g.fillStyle(0x4ade80, 1);
    g.fillCircle(x, y - 7, 5.5);
  }

  private createZoneLabel(x: number, y: number, label: string) {
    this.add.text(x, y, label, {
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#1E293B',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5);
  }

  // ----------------------------------------------------
  // COMBAT & RICOCHET SHOOTER METHODS
  // -----------------------------------------  // ----------------------------------------------------
  // COMBAT & RICOCHET SHOOTER METHODS
  // ----------------------------------------------------
  public equipWeapon(weaponType: WeaponType) {
    const item = WEAPONS_CATALOG.find((w) => w.id === weaponType);
    if (!item) return;
    this.currentWeapon = weaponType;
    this.maxAmmo = item.clipSize;
    this.ammo = item.clipSize;
    this.totalAmmo = item.reserveAmmo;
    this.isReloading = false;
    this.showNoticeText(`EQUIPPED ${item.icon} ${item.name.toUpperCase()}!`);
    this.emitAmmoUpdate();
  }

  public fireActiveWeapon(inputPointer?: Phaser.Input.Pointer) {
    const now = this.time.now;
    if (this.currentWeapon !== 'knife') {
      if (this.isReloading) return;

      const item = WEAPONS_CATALOG.find((w) => w.id === this.currentWeapon) || WEAPONS_CATALOG[0];
      const fireInterval = item.id === 'laser' ? 110 : item.id === 'shotgun' ? 450 : item.id === 'rocket' ? 800 : 150;
      if (now - this.lastFiredTime < fireInterval) return;

      if (this.ammo <= 0) {
        if (this.totalAmmo > 0) {
          this.reloadPistol();
        } else {
          playDryClickSound();
          this.showNoticeText('⚠️ OUT OF AMMO! Press B to Open Store');
        }
        return;
      }

      this.lastFiredTime = now;
      this.ammo -= 1;
      this.emitAmmoUpdate();

      // Pointer angle calculation
      const pointer = inputPointer || this.input.activePointer;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const mainAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);

      const barrelOffset = 25;
      const spawnX = this.player.x + Math.cos(mainAngle) * barrelOffset;
      const spawnY = this.player.y + Math.sin(mainAngle) * barrelOffset;

      playGunshotSound();

      // Determine projectile count (Shotgun = 5 spread pellets, others = 1)
      const angles = item.id === 'shotgun'
        ? [mainAngle - 0.22, mainAngle - 0.11, mainAngle, mainAngle + 0.11, mainAngle + 0.22]
        : [mainAngle];

      angles.forEach((angle) => {
        const vx = Math.cos(angle) * item.bulletSpeed;
        const vy = Math.sin(angle) * item.bulletSpeed;

        const textureKey = `bullet_${item.id}`;
        if (!this.textures.exists(textureKey)) {
          const bg = this.make.graphics();
          if (item.id === 'laser') {
            bg.fillStyle(0x06b6d4, 0.9);
            bg.fillRoundedRect(0, 1, 24, 6, 3);
            bg.fillStyle(0xffffff, 1);
            bg.fillRect(4, 2.5, 16, 3);
            bg.generateTexture(textureKey, 24, 8);
          } else if (item.id === 'rocket') {
            bg.fillStyle(0xef4444, 1);
            bg.fillTriangle(20, 0, 32, 6, 20, 12);
            bg.fillStyle(0x1e293b, 1);
            bg.fillRoundedRect(4, 2, 18, 8, 2);
            bg.fillStyle(0xf97316, 1);
            bg.fillTriangle(0, 1, 6, 6, 0, 11);
            bg.generateTexture(textureKey, 32, 12);
          } else if (item.id === 'shotgun') {
            bg.fillStyle(0xf97316, 0.9);
            bg.fillCircle(4, 4, 4);
            bg.fillStyle(0xfde047, 1);
            bg.fillCircle(4, 4, 2);
            bg.generateTexture(textureKey, 8, 8);
          } else {
            bg.fillStyle(0xef4444, 0.8);
            bg.fillTriangle(0, 0, 10, 4, 0, 8);
            bg.fillStyle(0xfde047, 1);
            bg.fillRoundedRect(8, 1, 14, 6, 2);
            bg.fillStyle(0xdc2626, 1);
            bg.fillTriangle(20, 0, 28, 4, 20, 8);
            bg.generateTexture(textureKey, 30, 10);
          }
        }

        const bullet = this.physics.add.sprite(spawnX, spawnY, textureKey);
        bullet.setRotation(angle);
        bullet.setDepth(100);

        const body = bullet.body as Phaser.Physics.Arcade.Body;
        body.setCircle(item.id === 'rocket' ? 8 : 4);
        body.setBounce(1, 1);
        body.setCollideWorldBounds(true);
        body.setVelocity(vx, vy);

        (bullet as any).vx = vx;
        (bullet as any).vy = vy;
        (bullet as any).bounces = 0;
        (bullet as any).maxBounces = item.maxBounces;
        (bullet as any).spawnTime = this.time.now;
        (bullet as any).damage = item.id === 'shotgun' ? 15 : item.damage;

        this.time.delayedCall(2500, () => {
          if (bullet && bullet.active) bullet.destroy();
        });

        this.bulletsGroup.add(bullet);
      });

      // Muzzle Flash
      const flashColor = item.id === 'laser' ? 0x06b6d4 : item.id === 'rocket' ? 0xef4444 : 0xfde047;
      const flash = this.add.circle(spawnX, spawnY, item.id === 'rocket' ? 22 : 14, flashColor);
      flash.setDepth(101);
      this.tweens.add({
        targets: flash,
        alpha: 0,
        scale: 1.8,
        duration: 80,
        onComplete: () => flash.destroy(),
      });

      if (this.ammo <= 0 && this.totalAmmo > 0) {
        this.time.delayedCall(200, () => this.reloadPistol());
      }
    } else if (this.currentWeapon === 'knife') {
      if (now - this.lastFiredTime < 250) return;
      this.lastFiredTime = now;

      const pointer = inputPointer || this.input.activePointer;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, worldPoint.x, worldPoint.y);

      // Katana Slash Arc Visual
      const knifeArc = this.add.graphics();
      knifeArc.setDepth(102);
      knifeArc.lineStyle(6, 0x38bdf8, 0.95);
      knifeArc.beginPath();
      knifeArc.arc(this.player.x, this.player.y, 55, angle - 1.1, angle + 1.1, false);
      knifeArc.strokePath();

      playHitImpactSound();

      this.tweens.add({
        targets: knifeArc,
        alpha: 0,
        scale: 1.25,
        duration: 160,
        onComplete: () => knifeArc.destroy(),
      });

      // Katana / Knife Melee Slash Damage (60 DMG) to close-range target coworkers
      const item = WEAPONS_CATALOG.find((w) => w.id === 'knife') || { damage: 60 };
      const slashDamage = item.damage || 60;
      const attackRange = 75; // Slash reach radius in pixels

      const children = (this.coworkersGroup.getChildren() as any[]).filter((cw) => cw && cw.active);
      children.forEach((coworker) => {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, coworker.x, coworker.y);
        if (dist <= attackRange) {
          const targetAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, coworker.x, coworker.y);
          const radDiff = Phaser.Math.Angle.WrapDegrees((targetAngle - angle) * (180 / Math.PI)) * (Math.PI / 180);
          const angleDiff = Math.abs(radDiff);
          
          // Check if coworker is within the 150-degree slash arc (+/- ~1.3 rads)
          if (angleDiff <= 1.3 || angleDiff >= Math.PI * 2 - 1.3) {
            // Apply melee damage
            coworker.hp = Math.max(0, (coworker.hp || 100) - slashDamage);

            // Update Overhead HP Bar
            const hpRatio = coworker.hp / coworker.maxHp;
            if (coworker.hpFill) {
              coworker.hpFill.width = 34 * hpRatio;
              if (hpRatio < 0.3) {
                coworker.hpFill.fillColor = 0xef4444; // Red low HP
              } else if (hpRatio < 0.6) {
                coworker.hpFill.fillColor = 0xf59e0b; // Yellow mid HP
              }
            }

            // Slash Hit Visual Spark
            const slashSpark = this.add.circle(coworker.x, coworker.y, 18, 0x06b6d4, 0.95);
            slashSpark.setDepth(104);
            this.tweens.add({
              targets: slashSpark,
              scale: 2.5,
              alpha: 0,
              duration: 150,
              onComplete: () => slashSpark.destroy(),
            });

            // Floating Damage Text (-60 HP!)
            const dmgText = this.add.text(coworker.x, coworker.y - 25, `-${slashDamage} HP`, {
              fontSize: '14px',
              fontStyle: 'extrabold',
              color: '#38BDF8',
              backgroundColor: '#0F172A',
              padding: { x: 5, y: 3 },
            }).setOrigin(0.5);
            dmgText.setDepth(105);

            this.tweens.add({
              targets: dmgText,
              y: coworker.y - 55,
              alpha: 0,
              duration: 650,
              onComplete: () => dmgText.destroy(),
            });

            // Award cash reward on hit!
            this.playerCash += 35;
            this.emitCashUpdate();

            // Check if Coworker Life Gone -> DIE / ELIMINATION!
            if (coworker.hp <= 0) {
              this.playerCash += 200;
              this.showNoticeText(`🗡️ KATANA ELIMINATION: +$200 CASH!`);
              this.emitCashUpdate();

              this.spawnPickupAt(coworker.x - 15, coworker.y, 'cash');
              this.spawnPickupAt(coworker.x + 15, coworker.y, 'health');

              const elimText = this.add.text(coworker.x, coworker.y - 30, '☠️ ELIMINATED!', {
                fontSize: '14px',
                fontStyle: 'extrabold',
                color: '#EF4444',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 },
              }).setOrigin(0.5);
              elimText.setDepth(106);

              this.tweens.add({
                targets: elimText,
                y: coworker.y - 65,
                alpha: 0,
                duration: 900,
                onComplete: () => elimText.destroy(),
              });

              this.tweens.add({
                targets: coworker,
                alpha: 0,
                scale: 0.2,
                duration: 300,
                onComplete: () => {
                  coworker.destroy();
                },
              });
            }
          }
        }
      });
    }
  }

  private handleBulletRicochet(bulletContainer: any) {
    if (!bulletContainer || !bulletContainer.active) return;
    bulletContainer.bounces = (bulletContainer.bounces || 0) + 1;

    // Play Ricochet Audio Sound!
    playRicochetSound();

    // Update bullet capsule angle and manual velocity (vx, vy) to match new ricochet velocity vector
    if (bulletContainer.body) {
      if (Math.abs(bulletContainer.body.velocity.x) > 10 || Math.abs(bulletContainer.body.velocity.y) > 10) {
        bulletContainer.vx = bulletContainer.body.velocity.x;
        bulletContainer.vy = bulletContainer.body.velocity.y;
      }
      const newAngle = Math.atan2(bulletContainer.vy || bulletContainer.body.velocity.y, bulletContainer.vx || bulletContainer.body.velocity.x);
      bulletContainer.setRotation(newAngle);
    }

    // Ricochet Spark Particle Visual
    const spark = this.add.circle(bulletContainer.x, bulletContainer.y, 6, 0xf59e0b);
    spark.setDepth(103);
    this.tweens.add({
      targets: spark,
      scale: 2.5,
      alpha: 0,
      duration: 120,
      onComplete: () => spark.destroy(),
    });

    if (bulletContainer.bounces >= bulletContainer.maxBounces) {
      bulletContainer.destroy();
    }
  }

  private handleBulletHitCoworker(bullet: any, coworker: any) {
    if (!bullet || !bullet.active || !coworker || !coworker.active) return;

    // Play Body Hit Impact Sound!
    playHitImpactSound();

    // Destroy bullet on hit
    bullet.destroy();

    // Reduce HP by weapon damage per bullet
    const damage = (bullet as any).damage || 25;
    coworker.hp = Math.max(0, (coworker.hp || 100) - damage);

    // Update Overhead HP Bar
    const hpRatio = coworker.hp / coworker.maxHp;
    if (coworker.hpFill) {
      coworker.hpFill.width = 34 * hpRatio;
      if (hpRatio < 0.3) {
        coworker.hpFill.fillColor = 0xef4444; // Red low HP
      } else if (hpRatio < 0.6) {
        coworker.hpFill.fillColor = 0xf59e0b; // Yellow mid HP
      }
    }

    // Hit Impact Spark Visual & Red Flash
    const hitSpark = this.add.circle(coworker.x, coworker.y, 14, 0xef4444, 0.8);
    hitSpark.setDepth(104);
    this.tweens.add({
      targets: hitSpark,
      scale: 2.2,
      alpha: 0,
      duration: 150,
      onComplete: () => hitSpark.destroy(),
    });

    // Floating Damage Text (-25 HP!)
    const dmgText = this.add.text(coworker.x, coworker.y - 25, `-${damage} HP`, {
      fontSize: '13px',
      fontStyle: 'extrabold',
      color: '#EF4444',
      backgroundColor: '#0F172A',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);
    dmgText.setDepth(105);

    this.tweens.add({
      targets: dmgText,
      y: coworker.y - 50,
      alpha: 0,
      duration: 600,
      onComplete: () => dmgText.destroy(),
    });

    // Award cash reward on hit!
    this.playerCash += 25;
    this.emitCashUpdate();

    // Check if Coworker Life Gone -> DIE / ELIMINATION!
    if (coworker.hp <= 0) {
      // Award big kill bonus cash ($200)!
      this.playerCash += 200;
      this.showNoticeText(`☠️ KILL BONUS: +$200 CASH!`);
      this.emitCashUpdate();

      // Drop glowing Cash Bag & Medkit right where coworker died!
      this.spawnPickupAt(coworker.x - 15, coworker.y, 'cash');
      this.spawnPickupAt(coworker.x + 15, coworker.y, 'health');

      // Skull Elimination Text
      const deathText = this.add.text(coworker.x, coworker.y - 15, `☠️ ${coworker.coworkerName} ELIMINATED!`, {
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        backgroundColor: '#DC2626',
        padding: { x: 8, y: 4 },
      }).setOrigin(0.5);
      deathText.setDepth(106);

      this.tweens.add({
        targets: deathText,
        y: coworker.y - 45,
        alpha: 0,
        duration: 1500,
        onComplete: () => deathText.destroy(),
      });

      // Death Shrink & Fade Animation
      this.tweens.add({
        targets: coworker,
        scaleY: 0,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          coworker.destroy();
        },
      });
    }
  }

  private handleBulletHitPlayer(bullet: any) {
    if (this.isDead || !bullet || !bullet.active || !this.player || !this.player.active) return;

    // Play Body Hit Impact Sound!
    playHitImpactSound();

    // Destroy ricocheting bullet on hit
    bullet.destroy();

    // Reduce player HP by weapon damage per bullet
    const damage = (bullet as any).damage || 25;
    this.health = Math.max(0, this.health - damage);

    // Update Overhead Player HP Bar
    const hpRatio = this.health / this.maxHealth;
    if (this.playerHpBarFill) {
      this.playerHpBarFill.width = 34 * hpRatio;
      if (hpRatio < 0.3) {
        this.playerHpBarFill.fillColor = 0xef4444; // Red low HP
      } else if (hpRatio < 0.6) {
        this.playerHpBarFill.fillColor = 0xf59e0b; // Yellow mid HP
      } else {
        this.playerHpBarFill.fillColor = 0x22c55e; // Green full HP
      }
    }

    // Floating Red Damage Text above player head (-25 HP!)
    const dmgText = this.add.text(this.player.x, this.player.y - 25, `-${damage} HP`, {
      fontSize: '14px',
      fontStyle: 'extrabold',
      color: '#EF4444',
      backgroundColor: '#0F172A',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5).setDepth(105);

    this.tweens.add({
      targets: dmgText,
      y: this.player.y - 55,
      alpha: 0,
      duration: 700,
      onComplete: () => dmgText.destroy(),
    });

    // Red Screen Flash Damage Effect
    const flash = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY, 1600, 1000, 0xef4444, 0.25);
    flash.setScrollFactor(0);
    flash.setDepth(200);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    // Check if Player HP reaches 0 -> ELIMINATION & RESPAWN!
    if (this.health <= 0) {
      this.isDead = true;
      const deathText = this.add.text(this.player.x, this.player.y - 20, `☠️ YOU WERE ELIMINATED BY RICOCHET!`, {
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        backgroundColor: '#DC2626',
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5).setDepth(201);

      this.tweens.add({
        targets: deathText,
        y: this.player.y - 60,
        alpha: 0,
        duration: 2000,
        onComplete: () => deathText.destroy(),
      });

      // Respawn after 2 seconds
      this.time.delayedCall(2000, () => {
        this.health = 100;
        this.isDead = false;
        if (this.playerHpBarFill) {
          this.playerHpBarFill.width = 34;
          this.playerHpBarFill.fillColor = 0x22c55e;
        }
        this.player.setPosition(450, 465);
        this.showNoticeText('⚡ RESPAWNED WITH FULL HEALTH!');
      });
    }
  }

  public reloadPistol() {
    if (this.isReloading) return;
    if (this.ammo >= this.maxAmmo) {
      this.showNoticeText('⚡ CLIP FULL (12/12)');
      return;
    }
    if (this.totalAmmo <= 0) {
      playDryClickSound();
      this.showNoticeText('⚠️ NO RESERVE AMMO! Press B to Refill');
      return;
    }

    this.isReloading = true;
    playReloadSound();
    this.showNoticeText('⏳ RELOADING...');
    this.emitAmmoUpdate();

    this.time.delayedCall(1000, () => {
      const needed = this.maxAmmo - this.ammo;
      const reloaded = Math.min(needed, this.totalAmmo);
      this.ammo += reloaded;
      this.totalAmmo -= reloaded;
      this.isReloading = false;
      this.emitAmmoUpdate();
    });
  }

  public refillAmmoFromShop() {
    this.totalAmmo += 120;
    playReloadSound();
    this.showNoticeText('🛒 +120 AMMO REFILLED!');
    this.emitAmmoUpdate();
  }

  private showNoticeText(msg: string) {
    if (!this.player) return;
    const txt = this.add.text(this.player.x, this.player.y - 35, msg, {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#FBBF24',
      backgroundColor: '#0F172A',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(110);

    this.tweens.add({
      targets: txt,
      y: this.player.y - 65,
      alpha: 0,
      duration: 1200,
      onComplete: () => txt.destroy(),
    });
  }

  public switchWeapon() {
    this.currentWeapon = this.currentWeapon === 'pistol' ? 'knife' : 'pistol';
    this.emitAmmoUpdate();
  }

  public emitAmmoUpdate() {
    this.game.events.emit('ammo-updated', {
      ammo: this.ammo,
      totalAmmo: this.totalAmmo,
      isReloading: this.isReloading,
      weapon: this.currentWeapon,
    });
  }

  public emitCashUpdate() {
    this.game.events.emit('cash-updated', { cash: this.playerCash });
  }

  private spawnRandomPickup() {
    if (!this.pickupsGroup) return;
    if (this.pickupsGroup.getLength() >= 16) return;

    const type = Math.random() > 0.4 ? 'cash' : 'health';
    const px = Phaser.Math.Between(120, WORLD_W - 120);
    const py = Phaser.Math.Between(120, WORLD_H - 120);
    this.spawnPickupAt(px, py, type);
  }

  private spawnPickupAt(px: number, py: number, type: 'cash' | 'health') {
    if (!this.pickupsGroup) return;

    const container = this.add.container(px, py);

    // Glowing Aura Effect
    const auraColor = type === 'cash' ? 0xf59e0b : 0x22c55e;
    const aura = this.add.circle(0, 0, 18, auraColor, 0.45);

    // Pulsing animation for glowing pickup
    this.tweens.add({
      targets: aura,
      scale: 1.4,
      alpha: 0.15,
      yoyo: true,
      repeat: -1,
      duration: 800,
    });

    const icon = this.add.text(0, -2, type === 'cash' ? '💵' : '❤️', {
      fontSize: '18px',
    }).setOrigin(0.5);

    const badge = this.add.text(0, 16, type === 'cash' ? '+$200 CASH' : '+35 HP', {
      fontSize: '9px',
      fontStyle: 'bold',
      color: type === 'cash' ? '#FBBF24' : '#4ADE80',
      backgroundColor: '#0F172A',
      padding: { x: 4, y: 1 },
    }).setOrigin(0.5);

    container.add([aura, icon, badge]);
    (container as any).pickupType = type;
    (container as any).x = px;
    (container as any).y = py;

    this.pickupsGroup.add(container);
  }

  private collectPickup(pObj: any) {
    if (!pObj || !pObj.active) return;
    const type = pObj.pickupType || 'cash';
    pObj.destroy();

    playReloadSound();

    if (type === 'cash') {
      const reward = 200;
      this.playerCash += reward;
      this.showNoticeText(`💵 +$${reward} CASH PICKUP!`);
      this.emitCashUpdate();
    } else if (type === 'health') {
      const healAmount = 35;
      this.health = Math.min(this.maxHealth, this.health + healAmount);
      this.updatePlayerHpBarVisual();
      this.showNoticeText(`❤️ +${healAmount} HP RESTORED!`);
    }

    const spark = this.add.circle(this.player.x, this.player.y, 22, type === 'cash' ? 0xfbbf24 : 0x4ade80, 0.85);
    spark.setDepth(110);
    this.tweens.add({
      targets: spark,
      scale: 2.2,
      alpha: 0,
      duration: 250,
      onComplete: () => spark.destroy(),
    });

    // Schedule a new pickup to spawn shortly after collecting (Continuous Dynamic Respawn!)
    this.time.delayedCall(2500, () => {
      this.spawnRandomPickup();
    });
  }

  private updatePlayerHpBarVisual() {
    const hpRatio = this.health / this.maxHealth;
    if (this.playerHpBarFill) {
      this.playerHpBarFill.width = 34 * hpRatio;
      if (hpRatio < 0.3) {
        this.playerHpBarFill.fillColor = 0xef4444;
      } else if (hpRatio < 0.6) {
        this.playerHpBarFill.fillColor = 0xf59e0b;
      } else {
        this.playerHpBarFill.fillColor = 0x22c55e;
      }
    }
  }
}
