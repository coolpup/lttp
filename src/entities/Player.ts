import Game from '../Game';
import Level from '../levels/Level';
import Pool from '../utility/Pool';
import math from '../math';
import { default as Constants, ENTITY_TYPE } from '../data/Constants';
import { IItemDescriptor } from '../data/ItemDescriptors';
import PlayerInventory from '../data/PlayerInventory';
import Entity from './Entity';
import ParticleEntity from './misc/Particle';
import SmashEntity from './misc/Smash';
import WorldItem from './items/WorldItem';

export default class Player extends Entity {
    // player type
    entityType: ENTITY_TYPE = ENTITY_TYPE.PLAYER;

    // maximum maxMagic of this entity
    maxMagic: number;

    // current magic of this entity
    magic: number;

    // objects currently within attack range
    inAttackRange: Entity[];
    colliding: Entity[];

    // a pool of sprite to do smashing animations
    smashPool: Pool<SmashEntity>;

    // a pool of world items to be dropped
    itemPool: Pool<WorldItem>;

    // a pool of particles to throw around
    particlePool: Pool<ParticleEntity>;

    liftSound: Phaser.Sound;
    throwSound: Phaser.Sound;
    openChestSound: Phaser.Sound;
    itemFanfaireSound: Phaser.Sound;
    errorSound: Phaser.Sound;
    fallSound: Phaser.Sound;

    onReadSign: Phaser.Signal;
    onInventoryChange: Phaser.Signal;

    equipted: IItemDescriptor;

    inventory: PlayerInventory;

    carrying: Phaser.Sprite;

    attacking: boolean;
    chargingAttack: boolean;

    bodyShape: p2.Shape;
    attackSensor: p2.Shape;

    constructor(game: Game) {
        super(game, 'sprite_link');

        this.name = 'link';
        this.moveSpeed = 90;

        this.maxMagic = 10;
        this.magic = 0;

        this.inAttackRange = [];
        this.colliding = [];

        this.smashPool = new Pool<SmashEntity>(game, SmashEntity);
        this.itemPool = new Pool<WorldItem>(game, WorldItem);
        this.particlePool = new Pool<ParticleEntity>(game, ParticleEntity);

        this.liftSound = game.add.sound('effect_lift', Constants.AUDIO_EFFECT_VOLUME);
        this.throwSound = game.add.sound('effect_throw', Constants.AUDIO_EFFECT_VOLUME);
        this.openChestSound = game.add.sound('effect_chest', Constants.AUDIO_EFFECT_VOLUME);
        this.itemFanfaireSound = game.add.sound('effect_item_fanfaire', Constants.AUDIO_EFFECT_VOLUME);
        this.errorSound = game.add.sound('effect_error', Constants.AUDIO_EFFECT_VOLUME);
        this.fallSound = game.add.sound('effect_fall', Constants.AUDIO_EFFECT_VOLUME);

        this.onReadSign = new Phaser.Signal();
        this.onInventoryChange = new Phaser.Signal();

        this.equipted = null;

        this.inventory = new PlayerInventory();

        this.carrying = null;

        this.attacking = false;
        this.chargingAttack = false;

        this.anchor.set(0.5);

        this.bodyShape = null;
        this.attackSensor = null;

        // TODO: carry follow
        // this.on('physUpdate', this._physUpdate.bind(this));

        this.addAnimations();
    }

    addAnimations() {
        // add walking animations
        this._addDirectionalPrefixedFrames('walk', 8, 24, true);

        // add idle shield animations
        this.animations.add('idle_shield_left', ['walk_shield_left/walk_shield_left_1.png']);
        this.animations.add('idle_shield_right', ['walk_shield_right/walk_shield_right_1.png']);
        this.animations.add('idle_shield_down', ['walk_shield_down/walk_shield_down_1.png']);
        this.animations.add('idle_shield_up', ['walk_shield_up/walk_shield_up_1.png']);

        this.animations.add('idle_left', ['walk_left/walk_left_1.png']);
        this.animations.add('idle_right', ['walk_right/walk_right_1.png']);
        this.animations.add('idle_down', ['walk_down/walk_down_1.png']);
        this.animations.add('idle_up', ['walk_up/walk_up_1.png']);

        this.animations.add('lift_idle_left', ['lift_walk_left/lift_walk_left_1.png']);
        this.animations.add('lift_idle_right', ['lift_walk_right/lift_walk_right_1.png']);
        this.animations.add('lift_idle_down', ['lift_walk_down/lift_walk_down_1.png']);
        this.animations.add('lift_idle_up', ['lift_walk_up/lift_walk_up_1.png']);

        // add attack animations
        this._addDirectionalPrefixedFrames('attack', 9, 36);

        // add bow attack animations
        this._addDirectionalPrefixedFrames('attack_bow', 3, 24);

        // add spin attack animations
        this._addDirectionalPrefixedFrames('attack_spin', 12, 24);

        // add attack tap animations
        this._addDirectionalPrefixedFrames('attack_tap', 3, 24);

        // add fall in hole animations
        this._addFrames(['fall_in_hole/fall_in_hole'], 4, 3);

        // add lifting animations
        this._addDirectionalPrefixedFrames('lift', 4, 12);

        // add lifting walking animations
        this.animations.add('lift_walk_left', [
            'lift_walk_left/lift_walk_left_1.png',
            'lift_walk_left/lift_walk_left_2.png',
            'lift_walk_left/lift_walk_left_3.png',
            'lift_walk_left/lift_walk_left_2.png',
        ], 12, true);

        this.animations.add('lift_walk_right', [
            'lift_walk_right/lift_walk_right_1.png',
            'lift_walk_right/lift_walk_right_2.png',
            'lift_walk_right/lift_walk_right_3.png',
            'lift_walk_right/lift_walk_right_2.png',
        ], 12, true);

        // this._addFrames(['lift_walk_left', 'lift_walk_right'], 3, 0.2, true);
        this._addFrames(['lift_walk_down/lift_walk_down', 'lift_walk_up/lift_walk_up'], 6, 15, true);

        // add pulling animations
        this._addDirectionalPrefixedFrames('push', 5, 6, true);

        // add walking-attacking animations
        this._addFrames(['walk_attack_left/walk_attack_left', 'walk_attack_right/walk_attack_right'], 3, 24, true);
        this._addFrames(['walk_attack_down/walk_attack_down', 'walk_attack_up/walk_attack_up'], 6, 24, true);

        // add walking with shield animations
        this._addDirectionalPrefixedFrames('walk_shield', 8, 24, true);

        this.textureDirty = true;
    }

    setup(level: Level): Player {
        super.setup(level);

        this.unlock();

        this.body.clearShapes();

        // this.bodyShape = this.body.addRectangle(16, 22, 0, 4);
        // this.bodyShape = this.body.addCapsule(2, 6, 0, 7, Math.PI / 2);
        this.bodyShape = this.body.addCircle(7, 0, 7);

        this.attackSensor = this.body.addCircle(Constants.PLAYER_ATTACK_SENSOR_RADIUS, 0, 4);
        this.attackSensor.sensor = true;

        return this;
    }

    update() {
        super.update();

        if (this.textureDirty) {
            this.textureDirty = false;

            this._updateAnimation();
        }

        if (!this.locked && this.moveDirty) {
            // Update X movement
            if (this.moving[Phaser.LEFT]) {
                this.body.velocity.x = -this.moving[Phaser.LEFT] * this.moveSpeed;
            }
            else if (this.moving[Phaser.RIGHT]) {
                this.body.velocity.x = this.moving[Phaser.RIGHT] * this.moveSpeed;
            }
            else {
                this.body.velocity.x = 0;
            }

            // Update Y movement
            if (this.moving[Phaser.UP]) {
                this.body.velocity.y = -this.moving[Phaser.UP] * this.moveSpeed;
            }
            else if (this.moving[Phaser.DOWN]) {
                this.body.velocity.y = this.moving[Phaser.DOWN] * this.moveSpeed;
            }
            else {
                this.body.velocity.y = 0;
            }
        }
    }

    move(direction: number, value: number, active: boolean) {
        const newValue = active ? value : 0;

        if (this.moving[direction] !== newValue) {
            this.moving[direction] = newValue;

            this.moveDirty = true;
            this.textureDirty = true;
        }

        this.evalFacingDirection();
    }

    attack(active: boolean) {
        if (!this.inventory.sword || this.carrying) {
            return;
        }

        if (!active) {
            this.chargingAttack = false;
            return;
        }

        if (this.locked || this.chargingAttack) {
            return;
        }

        this.lock();

        this.attacking = true;

        this.chargingAttack = true;

        this.textureDirty = true;

        this._checkAttack();
    }

    // Talk, run, Lift/Throw/Push/Pull
    use(active: boolean) {
        if (!active || this.locked) {
            return;
        }

        // throw current item if carrying;
        if (this.carrying) {
            return this.throwItem();
        }

        // interact with the first thing in the use cone that you can
        for (let i = 0; i < this.colliding.length; ++i) {
            const ent = this.colliding[i];

            if (math.isInViewCone(this, ent, Constants.PLAYER_USE_CONE)) {
                switch (ent.properties.type) {
                    // TODO: Make the item decide this stuff? They all implement a `use` method instead?
                    case Constants.MAP_OBJECTS.CHEST:
                        if (this.facing === Phaser.UP) {
                            this.openChest(ent);
                        }
                        break;

                    case Constants.MAP_OBJECTS.SIGN:
                        if (this.facing === Phaser.UP) {
                            this.onReadSign.dispatch(ent);
                        }
                        else {
                            this.liftItem(ent);
                        }
                        break;

                    case Constants.MAP_OBJECTS.ROCK:
                        if (this.inventory.gloves) {
                            this.liftItem(ent);
                        }
                        break;

                    case Constants.MAP_OBJECTS.GRASS:
                    case Constants.MAP_OBJECTS.POT:
                        this.liftItem(ent);
                        break;
                }

                // only act on a single object in the cone
                break;
            }
        }
    }

    useItem(active: boolean) {
        if (active) { return; }

        // if there is no item equipted or the item costs more magic than the player has currently
        if (!this.equipted || this.magic < this.equipted.cost) {
            this.errorSound.play();
            return;
        }

        // take out magic cost
        this.magic -= this.equipted.cost;

        // create the item particle
        let particle = this.particlePool.alloc();
        particle.boot(this.equipted);

        this.parent.addChild(particle);
    }

    destroy() {
        // debugger;
    }

    throwItem() {
        const v = this.getFacingVector();
        const yf = v.y === -1 ? 0 : 1;

        this.carrying = null;
        this.throwSound.play();

        this.game.add.tween(this.carrying)
            .to({
                x: this.carrying.x + (Constants.PLAYER_THROW_DISTANCE_X * v.x),
                y: this.carrying.y + (Constants.PLAYER_THROW_DISTANCE_Y * v.y) + (yf * this.height),
            }, 250)
            .start()
            .onComplete.addOnce(() => {
                this._destroyObject(this.carrying);
            }, this);

        this.textureDirty = true;
    }

    // TODO: Move this into a new Chest class
    openChest(chest: Entity) {
        if (!chest.properties.loot) {
            return;
        }

        // conditional loot based on inventory
        let loot = chest.properties.loot.split(',');
        let i = 0;

        // find the first loot item they don't have already
        while (i < loot.length - 1 && this.inventory[loot[i]]) {
            ++i;
        }

        // use the loot they don't have, or the last one
        loot = loot[i];

        // lock player movement and go to the open animation
        this.lock().animations.stop('lift_walk_down');

        // set chest texture to the open state
        chest.setFrame(this.game.cache.getFrameData('sprite_worlditems').getFrameByName('dungeon/chest_open.png'));

        // play the check open sound
        this.openChestSound.play();

        // show loot
        const obj = this.itemPool.alloc();
        this.parent.addChild(obj);
        obj.boot(chest, loot);
        obj.position.y -= 5;

        // small animation
        Game.timer.add(100, function () {
            this.itemFanfaireSound.play();
        }, this);

        this.game.add.tween(obj)
            .to({ y: obj.y - 5 }, 1500)
            .start()
            .onComplete.addOnce(function () {
                // TODO: Show dialog when first time item has been got

                // unlock the player
                this.unlock();

                // remove the item
                this.itemPool.free(obj);
                obj.pickup();

                // update the inventory
                this.inventory[obj.itemType] += obj.value;

                this.onInventoryChange.dispatch();
            }, this);

        // TODO: remove loot from level for next time
        // this._markEmpty(chest);
    }

    liftItem(item: Entity) {
        // lock player movement
        this.lock();

        // TODO: item physics
        // change physics to sensor
        // item.disablePhysics();
        // item.sensor = true;
        // item.enablePhysics();

        // remove from collision list
        const idx = this.colliding.indexOf(item);
        if (idx !== -1) {
            this.colliding.splice(idx, 1);
        }

        // drop the loot
        if (item.properties.loot) {
            const obj = this.itemPool.alloc();

            obj.boot(item);
            this.game.add.existing(obj);

            this._markEmpty(item);
        }

        // make it just below loot in the draw array (so you can see loot on top)
        // item.parent.removeChild(item);
        // this.parent.addChild(item);

        // set the correct texture
        // TODO: Looks like the old code expected WorldItems to be spawned for map objects
        // now they are just sprites, and they share a texture! Need to create a new texture and
        // set the proper frame for it when lifting.
        // console.log(item.objectType, item.itemType);
        // item.setTexture(new PIXI.Texture(item.texture.baseTexture));
        // item.setFrame(item.frames.getFrameByName('dungeon/' + item.itemType + (item.properties.heavy ? '_heavy' : '') + '.png'));

        // lift the item
        this.animations.play('lift_' + this.getFacingString());
        this.liftSound.play();

        this.game.add.tween(item.body)
            .to({ x: this.x, y: this.y - this.height + 5 }, 150)
            .start()
            .onComplete.addOnce(function () {
                this.unlock().carrying = item;
            }, this);
    }

    collectLoot(item: WorldItem) {
        switch (item.itemType) {
            case Constants.WORLD_ITEMS.HEART:
                this.heal(1);
                break;

            case Constants.WORLD_ITEMS.MAGIC:
                this.magic += item.value;
                if (this.magic > this.maxMagic) {
                    this.magic = this.maxMagic;
                }
                break;

            case Constants.WORLD_ITEMS.ARROWS:
            case Constants.WORLD_ITEMS.BOMBS:
            case Constants.WORLD_ITEMS.RUPEES:
                this.inventory[item.type] += item.value;
                break;
        }

        item.pickup();
        this.itemPool.free(item);
    }

    postUpdate() {
        super.postUpdate();

        if (this.carrying) {
            this.carrying.position.x = this.position.x;
            this.carrying.position.y = this.position.y - this.height + 5;
        }
    }

    onBeginContact(obj: Entity /*| Phaser.Plugin.Tiled.ITiledObject*/, objShape: p2.Shape, myShape: p2.Shape) {
        // we got into range of something to attack
        if (myShape === this.attackSensor) {
            if (obj.type && obj.body) {
                this.inAttackRange.push(obj);

                // something new walked in while we were attacking
                if (this.attacking) {
                    this._checkAttack();
                }
            }
        }
        // colliding with a blocking object
        else if (obj.body && !obj.body.data.shapes[0].sensor) {
            this.colliding.push(obj);
            // this._isBlocked();
        }
        // colliding with a sensor object, see if we can collect it
        else if ((<WorldItem>obj).itemType) {
            this.collectLoot((<WorldItem>obj));
        }
    }

    onEndContact(obj: Entity /*| Phaser.Plugin.Tiled.ITiledObject*/, objShape: p2.Shape, myShape: p2.Shape) {
        // remove from attack range
        if (myShape === this.attackSensor) {
            const i = this.inAttackRange.indexOf(obj);

            if (i >= 0) {
                this.inAttackRange.splice(i, 1);
            }
        }
        // remove from collision list
        else if (obj.body && !obj.body.data.shapes[0].sensor) {
            const i = this.colliding.indexOf(obj);

            if (i >= 0) {
                this.colliding.splice(i, 1);
            }

            // if(!this.colliding.length) {
            //     this._notBlocked();
            // }
        }
    }

    private _markEmpty(item: Entity) {
        item.properties.loot = null;

        if (item.parent) {
            const layer = <Phaser.Plugin.Tiled.Objectlayer>item.parent;

            layer.objects[(<any>item)._objIndex].properties.loot = null;

            this.game.loadedSave.updateZoneData(layer);
        }
    }

    private _destroyObject(obj: any) {
        const spr = this.smashPool.alloc();

        spr.animations.play(obj.properties.type);
        spr.anchor.copyFrom(obj.anchor);
        spr.position.copyFrom(obj.position);
        spr.visible = true;

        // add sprite
        obj.parent.addChild(spr);

        // TODO: drops?
        obj.destroy();
    }

    private _addDirectionalPrefixedFrames(type: string, num: number, frameRate: number = 60, loop: boolean = false) {
        this._addDirectionalFrames(type + '_%s/' + type + '_%s', num, frameRate, loop);
    }

    private _updateAnimation() {
        // update attack animation
        if (this.attacking) {
            this.animations.play('attack_' + this.facing);
            return;
        }

        // update movement animation
        const moving = this.moving[Phaser.UP] || this.moving[Phaser.DOWN] || this.moving[Phaser.LEFT] || this.moving[Phaser.RIGHT];

        let anim = (moving ? 'walk' : 'idle');

        if (this.carrying) {
            anim = 'lift_' + anim;
        }
        else if (this.inventory.shield) {
            anim += '_shield';
        }

        this.animations.play(anim + '_' + this.getFacingString());
    }

    private _checkAttack() {
        for (let i = this.inAttackRange.length - 1; i > -1; --i) {
            const ent = this.inAttackRange[i];

            if (math.isInViewCone(this, ent, Constants.PLAYER_ATTACK_CONE)) {
                ent.damage(this.attackDamage);
            }
        }
    }
}
