import Phaser from 'phaser';
import { CharacterConfig, PlayerPosition, UserStatus } from '@/types';
import { getCharacterConfig } from '@/lib/characterPresets';

export interface GameEventPayloads {
  'player-moved': PlayerPosition;
  'near-desk': { deskId: string; label: string; x: number; y: number } | null;
  'near-coworker': { userId: string; name: string; avatar: string; status: string } | null;
  'status-changed': UserStatus;
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

const WORLD_W = 1200;
const WORLD_H = 820;

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
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private isSitting = false;
  private currentDesk: { id: string; label: string; x: number; y: number } | null = null;
  private currentNearCoworker: { userId: string; name: string; avatar: string; status: string } | null = null;

  private desksGroup!: Phaser.Physics.Arcade.StaticGroup;
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private walkStepTimer = 0;
  private leftLegStep = false;

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

    // 3. Draw Coworkers with Natural Chibi Visuals & Speech Bubbles
    this.createCoworkers();

    // 4. Create Main Player (Amalraj)
    this.createPlayer();

    // 5. Input Controls
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    // Camera
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.0);

    // Collisions
    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.player, this.desksGroup);
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

  // ----------------------------------------------------
  // 3. COWORKERS & SPEECH BUBBLES
  // ----------------------------------------------------
  private createCoworkers() {
    // Rahul (Top-Left Desk Cluster)
    this.createStaticCoworker('Rahul', 285, 385, 'character3', 'Hey! Ready for the meeting?', {
      shirtColor: 0xa855f7,
      hasBeard: false,
    });

    // Anu (Beside Rahul)
    this.createStaticCoworker('Anu', 355, 415, 'character2', undefined, {
      shirtColor: 0xfacc15,
      hasBeard: false,
    });

    // Vishnu (Bottom-Left Desk Cluster)
    this.createStaticCoworker('Vishnu', 225, 545, 'character5', undefined, {
      shirtColor: 0x16a34a,
      hasBeard: true,
    });

    // Neha (Bottom-Right Desk Cluster)
    this.createStaticCoworker('Neha', 560, 545, 'character4', undefined, {
      shirtColor: 0xec4899,
      hasBeard: false,
    });

    // Hallway Chatting Pair
    this.createStaticCoworker('Dev', 735, 420, 'character1', 'Coffee break? ☕', {
      shirtColor: 0x16a34a,
      hasBeard: false,
    });
    this.createStaticCoworker('Sam', 775, 420, 'character6', undefined, {
      shirtColor: 0x334155,
      hasBeard: true,
    });
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

    const nameBadge = this.add.text(0, 24, name, {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#0F172A',
      padding: { x: 5, y: 2 },
    }).setOrigin(0.5);

    container.add([shadow, ...parts, nameBadge]);

    if (speechText) {
      this.createSpeechBubble(x, y - 35, speechText);
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

    const nameBadge = this.add.text(0, 24, `• ${this.currentUser.name}`, {
      fontSize: '10px',
      fontStyle: 'bold',
      color: '#22C55E',
      backgroundColor: '#0F172A',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5);

    this.player.add([shadow, ...parts, nameBadge]);
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
}
