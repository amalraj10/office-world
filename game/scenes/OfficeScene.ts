import Phaser from 'phaser';
import { PlayerPosition, UserStatus } from '@/types';

export interface GameEventPayloads {
  'player-moved': PlayerPosition;
  'near-desk': { deskId: string; label: string; x: number; y: number } | null;
  'near-coworker': { userId: string; name: string; avatar: string; status: string } | null;
  'status-changed': UserStatus;
}

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
  private isSitting = false;
  private currentDesk: { id: string; label: string; x: number; y: number } | null = null;
  private currentNearCoworker: { userId: string; name: string; avatar: string; status: string } | null = null;

  private activeCoworkers: Map<string, Phaser.GameObjects.Container> = new Map();
  private desksGroup!: Phaser.Physics.Arcade.StaticGroup;
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;

  public currentUser: {
    id: string;
    name: string;
    avatar: string;
    status: UserStatus;
  } = {
    id: 'user-amal',
    name: 'Amal',
    avatar: 'character1',
    status: 'Working',
  };

  public mockCoworkers: Array<{
    id: string;
    name: string;
    avatar: string;
    status: UserStatus;
    x: number;
    y: number;
    isSitting?: boolean;
  }> = [
    { id: 'user-rahul', name: 'Rahul', avatar: 'character3', status: 'Working', x: 420, y: 190, isSitting: true },
    { id: 'user-anu', name: 'Anu', avatar: 'character2', status: 'Working', x: 580, y: 190, isSitting: true },
    { id: 'user-vishnu', name: 'Vishnu', avatar: 'character5', status: 'Away', x: 800, y: 550, isSitting: false },
    { id: 'user-neha', name: 'Neha', avatar: 'character4', status: 'Break', x: 200, y: 560, isSitting: false },
    { id: 'user-arjun', name: 'Arjun', avatar: 'character6', status: 'Working', x: 420, y: 310, isSitting: true },
    { id: 'user-fahad', name: 'Fahad', avatar: 'character1', status: 'Working', x: 740, y: 310, isSitting: true },
  ];

  constructor() {
    super('OfficeScene');
  }

  preload() {
    // Generate graphics programmatically for zero asset missing issues
  }

  create() {
    this.physics.world.setBounds(0, 0, 1000, 700);

    // Create Floor & Rooms
    this.createOfficeLayout();

    // Create Desks & Furniture Groups
    this.wallsGroup = this.physics.add.staticGroup();
    this.desksGroup = this.physics.add.staticGroup();

    this.createWalls();
    this.createDesks();

    // Create Coworkers
    this.createCoworkerSprites();

    // Create Main Player
    this.createPlayer();

    // Input Keys
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Camera follow player
    this.cameras.main.setBounds(0, 0, 1000, 700);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.15);

    // Collisions
    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.player, this.desksGroup);
  }

  private createOfficeLayout() {
    const graphics = this.add.graphics();

    // Main floor background (Soft Dark Sleek Blue/Gray)
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRect(0, 0, 1000, 700);

    // Grid pattern
    graphics.lineStyle(1, 0x1e293b, 0.5);
    for (let x = 0; x <= 1000; x += 40) {
      graphics.lineBetween(x, 0, x, 700);
    }
    for (let y = 0; y <= 700; y += 40) {
      graphics.lineBetween(0, y, 1000, y);
    }

    // Zone 1: Reception Header (Top)
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRoundedRect(50, 20, 900, 60, 12);
    graphics.lineStyle(2, 0x3b82f6, 0.4);
    graphics.strokeRoundedRect(50, 20, 900, 60, 12);

    this.add.text(500, 50, '🛎️ RECEPTION & ENTRANCE', {
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#60A5FA',
    }).setOrigin(0.5);

    // Zone 2: Main Open Work Desk Bay
    graphics.fillStyle(0x1e293b, 0.8);
    graphics.fillRoundedRect(200, 120, 600, 250, 16);
    graphics.lineStyle(1, 0x334155, 0.8);
    graphics.strokeRoundedRect(200, 120, 600, 250, 16);

    this.add.text(220, 135, '💻 WORK BAY', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#94A3B8',
    });

    // Zone 3: Meeting Room (Center-Bottom)
    graphics.fillStyle(0x1e1b4b, 0.9);
    graphics.fillRoundedRect(350, 420, 300, 150, 16);
    graphics.lineStyle(2, 0x6366f1, 0.6);
    graphics.strokeRoundedRect(350, 420, 300, 150, 16);

    this.add.text(500, 440, '──────── MEETING ROOM ────────', {
      fontSize: '11px',
      color: '#818CF8',
    }).setOrigin(0.5);

    // Meeting Table
    graphics.fillStyle(0x312e81, 1);
    graphics.fillRoundedRect(420, 470, 160, 60, 12);
    graphics.lineStyle(2, 0xa5b4fc, 0.8);
    graphics.strokeRoundedRect(420, 470, 160, 60, 12);

    this.add.text(500, 500, '📊 CONFERENCE', {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#C7D2FE',
    }).setOrigin(0.5);

    // Zone 4: Pantry (Bottom Left)
    graphics.fillStyle(0x064e3b, 0.8);
    graphics.fillRoundedRect(50, 480, 250, 180, 16);
    graphics.lineStyle(2, 0x10b981, 0.5);
    graphics.strokeRoundedRect(50, 480, 250, 180, 16);

    this.add.text(70, 500, '☕ PANTRY & CAFÉ', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#34D399',
    });

    // Coffee Counter
    graphics.fillStyle(0x065f46, 1);
    graphics.fillRect(70, 530, 120, 30);
    this.add.text(130, 545, '☕ Coffee Machine', { fontSize: '10px', color: '#A7F3D0' }).setOrigin(0.5);

    // Zone 5: Lounge (Bottom Right)
    graphics.fillStyle(0x4c1d95, 0.8);
    graphics.fillRoundedRect(700, 480, 250, 180, 16);
    graphics.lineStyle(2, 0x8b5cf6, 0.5);
    graphics.strokeRoundedRect(700, 480, 250, 180, 16);

    this.add.text(720, 500, '🛋️ CHILL LOUNGE', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#C084FC',
    });

    // Sofa Visual
    graphics.fillStyle(0x5b21b6, 1);
    graphics.fillRoundedRect(740, 540, 170, 45, 10);
    this.add.text(825, 562, '🛋️ Comfortable Couch', { fontSize: '10px', color: '#DDD6FE' }).setOrigin(0.5);
  }

  private createWalls() {
    const graphics = this.add.graphics();
    graphics.lineStyle(4, 0x475569, 1);

    // Outer Boundary Wall Visual & Physics Bodies
    const wallThickness = 16;
    
    // Top wall
    const topW = this.add.rectangle(500, 8, 1000, wallThickness, 0x334155);
    this.wallsGroup.add(topW);
    // Bottom wall
    const botW = this.add.rectangle(500, 692, 1000, wallThickness, 0x334155);
    this.wallsGroup.add(botW);
    // Left wall
    const leftW = this.add.rectangle(8, 350, wallThickness, 700, 0x334155);
    this.wallsGroup.add(leftW);
    // Right wall
    const rightW = this.add.rectangle(992, 350, wallThickness, 700, 0x334155);
    this.wallsGroup.add(rightW);
  }

  private createDesks() {
    const deskCoords = [
      { id: 'desk-1', label: 'Amal', x: 260, y: 190 },
      { id: 'desk-2', label: 'Rahul', x: 420, y: 190 },
      { id: 'desk-3', label: 'Anu', x: 580, y: 190 },
      { id: 'desk-4', label: 'Vishnu', x: 740, y: 190 },
      { id: 'desk-5', label: 'Neha', x: 260, y: 310 },
      { id: 'desk-6', label: 'Arjun', x: 420, y: 310 },
      { id: 'desk-7', label: 'Meera', x: 580, y: 310 },
      { id: 'desk-8', label: 'Fahad', x: 740, y: 310 },
    ];

    deskCoords.forEach((d) => {
      const container = this.add.container(d.x, d.y);

      // Desk Table Top
      const table = this.add.rectangle(0, 0, 90, 50, 0x334155);
      table.setStrokeStyle(2, 0x64748b);

      // Monitor Screen
      const monitor = this.add.rectangle(0, -10, 45, 14, 0x0284c7);
      monitor.setStrokeStyle(1, 0x38bdf8);

      // Keyboard
      const kb = this.add.rectangle(0, 8, 30, 8, 0x1e293b);

      // Chair (Behind desk)
      const chair = this.add.circle(0, 28, 14, 0x475569);
      chair.setStrokeStyle(1, 0x94a3b8);

      // Desk Name Tag
      const tag = this.add.text(0, -32, d.label, {
        fontSize: '10px',
        color: '#CBD5E1',
        backgroundColor: '#0F172A',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5);

      container.add([chair, table, monitor, kb, tag]);

      // Static Physics Body for collision
      const staticZone = this.add.rectangle(d.x, d.y, 90, 50);
      this.physics.add.existing(staticZone, true);
      this.desksGroup.add(staticZone);
    });
  }

  private createCoworkerSprites() {
    this.mockCoworkers.forEach((cw) => {
      const container = this.add.container(cw.x, cw.y);

      // Status color map
      const statusColor =
        cw.status === 'Working'
          ? 0x22c55e
          : cw.status === 'Away'
          ? 0xeab308
          : cw.status === 'Break'
          ? 0x3b82f6
          : 0x64748b;

      // Character body shadow
      const shadow = this.add.ellipse(0, 16, 26, 12, 0x000000, 0.45);

      // Avatar unique colors and hair/accessories mapping
      const avatarMap: Record<string, { body: number; hair: number; glasses: boolean; shirt: number }> = {
        character1: { body: 0x3b82f6, hair: 0x1e293b, glasses: true, shirt: 0x1d4ed8 },
        character2: { body: 0xec4899, hair: 0xf59e0b, glasses: false, shirt: 0xbe185d },
        character3: { body: 0x10b981, hair: 0x475569, glasses: true, shirt: 0x047857 },
        character4: { body: 0x8b5cf6, hair: 0xd97706, glasses: false, shirt: 0x6d28d9 },
        character5: { body: 0xf97316, hair: 0x000000, glasses: true, shirt: 0xc2410c },
        character6: { body: 0x06b6d4, hair: 0x84cc16, glasses: false, shirt: 0x0e7490 },
      };

      const style = avatarMap[cw.avatar] || avatarMap.character1;

      // Body / Torso
      const body = this.add.circle(0, 0, 17, style.body);
      body.setStrokeStyle(2.5, 0xffffff);

      // Hair visual (Distinct top hair style per character)
      const hairGraphic = this.add.graphics();
      hairGraphic.fillStyle(style.hair, 1);
      if (cw.avatar === 'character2') {
        // Long curly hair
        hairGraphic.fillCircle(-8, -8, 8);
        hairGraphic.fillCircle(8, -8, 8);
        hairGraphic.fillCircle(0, -12, 10);
      } else if (cw.avatar === 'character4') {
        // Bun hair
        hairGraphic.fillCircle(0, -18, 9);
      } else if (cw.avatar === 'character3') {
        // Spiky hair
        hairGraphic.fillTriangle(-10, -8, -4, -18, 0, -8);
        hairGraphic.fillTriangle(-2, -8, 4, -19, 8, -8);
      } else {
        // Short crop / buzz hair
        hairGraphic.fillRoundedRect(-14, -16, 28, 12, 6);
      }

      // Eyes
      const eye1 = this.add.circle(-5, -3, 2.5, 0xffffff);
      const eye2 = this.add.circle(5, -3, 2.5, 0xffffff);
      const pupil1 = this.add.circle(-4.5, -3, 1.2, 0x000000);
      const pupil2 = this.add.circle(5.5, -3, 1.2, 0x000000);

      // Glasses frame if applicable
      const glassesGraphic = this.add.graphics();
      if (style.glasses) {
        glassesGraphic.lineStyle(1.5, 0x000000, 0.9);
        glassesGraphic.strokeCircle(-5, -3, 4.5);
        glassesGraphic.strokeCircle(5, -3, 4.5);
        glassesGraphic.lineBetween(-0.5, -3, 0.5, -3);
      }

      // Name label (Classic Dark Glass Badge)
      const nameTag = this.add.text(0, -28, cw.name, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#F8FAFC',
        backgroundColor: '#0F172A',
        padding: { x: 6, y: 3 },
      }).setOrigin(0.5);

      // Status dot
      const statusDot = this.add.circle(13, -13, 5.5, statusColor);
      statusDot.setStrokeStyle(1.5, 0x0f172a);

      container.add([
        shadow,
        body,
        hairGraphic,
        eye1,
        eye2,
        pupil1,
        pupil2,
        glassesGraphic,
        nameTag,
        statusDot,
      ]);
      this.activeCoworkers.set(cw.id, container);
    });
  }

  private createPlayer() {
    // Start position (Near Desk #1 or Reception)
    this.player = this.add.container(260, 235);

    const shadow = this.add.ellipse(0, 14, 26, 10, 0x000000, 0.5);
    const bodyColor = 0x3b82f6; // Default Player color

    const body = this.add.circle(0, 0, 18, bodyColor);
    body.setStrokeStyle(2.5, 0x60a5fa);

    const eye1 = this.add.circle(-5, -4, 3, 0xffffff);
    const eye2 = this.add.circle(5, -4, 3, 0xffffff);
    const pupil1 = this.add.circle(-4, -4, 1.2, 0x000000);
    const pupil2 = this.add.circle(6, -4, 1.2, 0x000000);

    const nameTag = this.add.text(0, -28, `${this.currentUser.name} ( You )`, {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#60A5FA',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: { x: 6, y: 2 },
    }).setOrigin(0.5);

    const statusDot = this.add.circle(14, -14, 5, 0x22c55e);
    statusDot.setStrokeStyle(1.5, 0x0f172a);

    this.player.add([shadow, body, eye1, eye2, pupil1, pupil2, nameTag, statusDot]);

    // Enable physics body
    this.physics.world.enable(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setCircle(18, -18, -18);
    this.playerBody.setCollideWorldBounds(true);
  }

  public setSittingState(sit: boolean) {
    this.isSitting = sit;
    if (sit && this.currentDesk) {
      this.player.setPosition(this.currentDesk.x, this.currentDesk.y + 28);
      this.playerBody.setVelocity(0, 0);
      this.game.events.emit('status-changed', 'Working');
    }
  }

  update() {
    if (!this.playerBody) return;

    let vx = 0;
    let vy = 0;
    const speed = 170;

    // Movement Controls
    if (this.cursors && this.wasd) {
      if (this.cursors.left.isDown || this.wasd.A.isDown) {
        vx = -speed;
      } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
        vx = speed;
      }

      if (this.cursors.up.isDown || this.wasd.W.isDown) {
        vy = -speed;
      } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
        vy = speed;
      }
    }

    // Stand up if moving while sitting
    if ((vx !== 0 || vy !== 0) && this.isSitting) {
      this.isSitting = false;
    }

    if (!this.isSitting) {
      this.playerBody.setVelocity(vx, vy);

      // Normalize diagonal speed
      if (vx !== 0 && vy !== 0) {
        this.playerBody.velocity.normalize().scale(speed);
      }
    }

    // Broadcast player movement to React UI
    const isMoving = vx !== 0 || vy !== 0;
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

    // Desk Proximity Check
    this.checkDeskProximity();

    // Coworker Proximity Check
    this.checkCoworkerProximity();
  }

  private checkDeskProximity() {
    const px = this.player.x;
    const py = this.player.y;
    const deskCoords = [
      { id: 'desk-1', label: 'Desk #1 (Amal)', x: 260, y: 190 },
      { id: 'desk-2', label: 'Desk #2 (Rahul)', x: 420, y: 190 },
      { id: 'desk-3', label: 'Desk #3 (Anu)', x: 580, y: 190 },
      { id: 'desk-4', label: 'Desk #4 (Vishnu)', x: 740, y: 190 },
      { id: 'desk-5', label: 'Desk #5 (Neha)', x: 260, y: 310 },
      { id: 'desk-6', label: 'Desk #6 (Arjun)', x: 420, y: 310 },
      { id: 'desk-7', label: 'Desk #7 (Meera)', x: 580, y: 310 },
      { id: 'desk-8', label: 'Desk #8 (Fahad)', x: 740, y: 310 },
    ];

    let foundDesk: { id: string; label: string; x: number; y: number } | null = null;

    for (const d of deskCoords) {
      const dist = Phaser.Math.Distance.Between(px, py, d.x, d.y + 28);
      if (dist < 45) {
        foundDesk = d;
        break;
      }
    }

    if (foundDesk !== this.currentDesk) {
      this.currentDesk = foundDesk;
      this.game.events.emit('near-desk', foundDesk);
    }
  }

  private checkCoworkerProximity() {
    const px = this.player.x;
    const py = this.player.y;

    let foundCoworker: { userId: string; name: string; avatar: string; status: string } | null = null;

    for (const cw of this.mockCoworkers) {
      const dist = Phaser.Math.Distance.Between(px, py, cw.x, cw.y);
      if (dist < 65) {
        foundCoworker = {
          userId: cw.id,
          name: cw.name,
          avatar: cw.avatar,
          status: cw.status,
        };
        break;
      }
    }

    if (foundCoworker?.userId !== this.currentNearCoworker?.userId) {
      this.currentNearCoworker = foundCoworker;
      this.game.events.emit('near-coworker', foundCoworker);
    }
  }
}
