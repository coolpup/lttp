export const enum ENTITY_TYPE {
    // player/npc entities
    PLAYER,
    ENEMY,
    FRIENDLY,
    NEUTRAL
}

export default class Constants {
    static DEBUG: boolean = false;

    /* tslint:disable:typedef */
    static WORLD_ITEMS = {
        HEART:   'heart',
        MAGIC:   'magic',
        ARROWS:  'arrows',
        BOMBS:   'bombs',
        RUPEES:  'rupees',
    };

    static MAP_OBJECTS = {
        CHEST:   'chest',
        SIGN:    'sign',
        ROCK:    'rock',
        GRASS:   'grass',
        POT:     'pot',
        MINE:    'mine',
    };

    static STATES = {
        BOOT:       'state_boot',
        PRELOADER:  'state_preloader',
        INTRO:      'state_intro',
        MAIN_MENU:  'state_mainmenu',
        PLAY:       'state_play',
    };

    static LEVELS = {
        CAVE034:    'level_case034',
        DARKWORLD:  'level_darkworld',
        LIGHTWORLD: 'level_lightworld',
        LINKSHOUSE: 'level_linkshouse',
    };

    static COLORS = {
        WHITE:  [255,   255,    255,    1],
        BLACK:  [  0,     0,      0,    1],
        RED:    [255,     0,      0,    1],
        GREEN:  [  0,   255,      0,    1],
        BLUE:   [  0,     0,    255,    1],
    };
    /* tslint:enable:typedef */

    // deminsions of the screen
    static GAME_WIDTH:           number = 256;
    static GAME_HEIGHT:          number = 224;
    static GAME_TEXT_SCALE:      number = 1.5;
    static GAME_SAVE_INTERVAL:   number = 10000;

    // cone within hit detector to check for interactions
    static PLAYER_ATTACK_CONE:   number = 0.5;
    static PLAYER_USE_CONE:      number = 0.4;

    // radius of hit detector
    static PLAYER_ATTACK_SENSOR_RADIUS:  number = 18;

    // distance to throw an item
    static PLAYER_THROW_DISTANCE_X:      number = 75;
    static PLAYER_THROW_DISTANCE_Y:      number = 50;

    // how long to run into something before an action takes place (blocked/jump down)
    static PLAYER_BLOCKED_WAIT_TIME:     number = 500;

    // time it takes to execute a jump animation (in seconds)
    static PLAYER_JUMP_TIME:             number = 0.5;
    static PLAYER_JUMP_DISTANCE:         number = 50;

    // time it takes for the inventory menu to drop down (in seconds)
    static PLAYER_INVENTORY_DROP_TIME:   number = 0.5;

    // volume for sounds
    static AUDIO_EFFECT_VOLUME:  number = 0.80;
    static AUDIO_MUSIC_VOLUME:   number = 0.20;

    // tilemap pack location
    static ASSET_TILEMAP_PACKS_URL: string = 'assets/tilemap-assets.json';
    static ASSET_TILEMAP_PACKS_KEY: string = 'pack_tilemap_asssets';

    // input data
    static INPUT_GAMEPAD_AXIS_THRESHOLD: number = 0.25;

    // some effect constants
    static EFFECT_INTRO_FLASH_ALPHA: number = 0.6;
    static EFFECT_INTRO_FLASH_LENGTH: number = 15;

    static EFFECT_ZONE_TRANSITION_TIME: number = 250;
    static EFFECT_ZONE_TRANSITION_SPACE: number = 20;

    static EFFECT_MAP_TRANSITION_TIME: number = 500;

    static EFFECT_OVERLAY_SCROLL_TIME: number = 100;
    static EFFECT_OVERLAY_SCROLL_FACTOR: number = 0.5;

    // direction vectors
    static VECTOR_ZERO: Phaser.Point = new Phaser.Point(0, -1);
    static VECTOR_UP: Phaser.Point = new Phaser.Point(0, -1);
    static VECTOR_DOWN: Phaser.Point = new Phaser.Point(0, 1);
    static VECTOR_LEFT: Phaser.Point = new Phaser.Point(-1, 0);
    static VECTOR_RIGHT: Phaser.Point = new Phaser.Point(1, 0);

    static DIRECTION_STRING_MAP: string[] = [
        'none',
        'left',
        'right',
        'up',
        'down',
    ];

    static DIRECTION_VECTOR_MAP: Phaser.Point[] = [
        Constants.VECTOR_ZERO,
        Constants.VECTOR_LEFT,
        Constants.VECTOR_RIGHT,
        Constants.VECTOR_UP,
        Constants.VECTOR_DOWN,
    ];
}
