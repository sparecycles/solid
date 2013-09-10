/// <reference path="collide.ts" />
/// <reference path="sound.ts" />

module Game {
    var magic = {
        color: 'blue'
    };

    var collision: Collide.Collision = {
        width: 16,
        height: 16,
        palette: [
            // 0: empty block
            [{
                collision_data_index: 0,
                collision_attributes: 1
            }, {
                collision_data_index: 0,
                collision_attributes: 1
            }, {
                collision_data_index: 0,
                collision_attributes: 1
            }, {
                collision_data_index: 0,
                collision_attributes: 1
            }],
            // 1: solid block
            [{
                collision_data_index: 1,
                collision_attributes: 1
            }, {
                collision_data_index: 1,
                collision_attributes: 1
            }, {
                collision_data_index: 1,
                collision_attributes: 1
            }, {
                collision_data_index: 1,
                collision_attributes: 1
            }],
            // 2: small square
            [{
                collision_data_index: 2,
                collision_attributes: 1
            }, {
                collision_data_index: 2,
                collision_attributes: 1
            }, {
                collision_data_index: 2,
                collision_attributes: 1
            }, {
                collision_data_index: 2,
                collision_attributes: 1
            }],
            // 3: angle ◢   TODO:  ◤  ◣
            [{
                collision_data_index: 1,
                collision_attributes: 1
            }, {
                collision_data_index: 3,
                collision_attributes: 1 | 2
            }, {
                collision_data_index: 1,
                collision_attributes: 1
            }, {
                collision_data_index: 3,
                collision_attributes: 1 | 2
            }],
            // 4: angle ◥
            [{
                collision_data_index: 1,
                collision_attributes: 1
            }, {
                collision_data_index: 4,
                collision_attributes: 1 | 2
            }, {
                collision_data_index: 3,
                collision_attributes: 1
            }, {
                collision_data_index: 1,
                collision_attributes: 1 | 2
            }],
            // X: magic
            [{
                collision_data_index: 2,
                collision_attributes: 1
            }, {
                collision_data_index: 2,
                collision_attributes: 1
            }, {
                collision_data_index: 2,
                collision_attributes: 1
            }, {
                collision_data_index: 2,
                collision_attributes: 1,
                info: magic
            }]
        ],
        tiles: [
            0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 1, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 0, 2, 0, 0, 0,  0, 0, 0, 0, 0, 4, 0, 0,
            0, 0, 0, 1, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 2, 2, 0,  0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 1, 2, 0,  0, 1, 1, 1, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 1, 0,  0, 0, 0, 0, 0, 0, 1, 0,
            0, 0, 0, 0, 0, 0, 0, 1,  0, 0, 0, 0, 1, 0, 0, 0,

            0, 0, 0, 0, 0, 0, 0, 1,  0, 0, 0, 0, 0, 0, 1, 0,
            0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 1, 1, 1, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 0, 0,  0, 1, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 1, 1,  1, 0, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0,  0, 0, 1, 0, 0, 0, 0, 1,
            1, 0, 1, 1, 1, 0, 0, 0,  0, 0, 1, 0, 0, 0, 0, 1,
            1, 4, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 3, 1,
            1, 1, 1, 1, 1, 1, 1, 1,  1, 1, 1, 1, 1, 1, 1, 1
        ],
        box_collision: null,
        point_collision: [
            [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [16,16,16,16, 4, 4, 4, 4, 4, 4, 4, 4,16,16,16,16],
            [15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0],
            [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
        ]
    };

    collision.box_collision = collision.point_collision.map(Collide.ComputeBoxCollision);
    var ctx;

    var WIDTH = 512, HEIGHT = 512;

    export function load(cb) {
        var canvasElement = <HTMLCanvasElement>document.querySelector("#canvas");
        canvasElement.width = WIDTH;
        canvasElement.height = HEIGHT;
        ctx = canvasElement.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        return Sound.load(cb);
    }

    export function start() {
        var time = Date.now();

        function play() {
            var now = Date.now();
            var dt = now - time;
            time = now;
            if(update(dt)) {
                render();
            }
            requestAnimationFrame(play);
        }

        play();
    }

    function render() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = "black";
        var tileIndex = 0;
        for(var y = 0; y < collision.height; y++)
        for(var x = 0; x < collision.width; x++, tileIndex++) {
            var tile = collision.tiles[tileIndex];
            switch(tile) {
                case 0:
                    break;
                case 1:
                    ctx.fillRect(x*16, y*16, 16, 16);
                    break;
                case 2:
                    ctx.fillRect(x*16 + 4, y*16 + 4, 8, 8);
                    break;
                case 3:
                    ctx.moveTo(x*16, y*16+16);
                    ctx.lineTo(x*16+16, y*16);
                    ctx.lineTo(x*16+16, y*16+16);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 4:
                    ctx.moveTo(x*16, y*16);
                    ctx.lineTo(x*16+16, y*16);
                    ctx.lineTo(x*16+16, y*16+16);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    // TODO: case 4:
                    ctx.save();
                    ctx.fillStyle = magic.color;
                    ctx.fillRect(x*16 + 4, y*16 + 4, 8, 8);
                    ctx.restore();
                    break;
            }
        }
        ctx.fillStyle = player.color;

        ctx.fillRect(player.rect.left, player.rect.top,
            player.rect.right - player.rect.left,
            player.rect.bottom - player.rect.top);
    }

    var frame = 0;
    function update(dt: number) {
        frame += dt;
        var ticked = false;
        while(frame >= 17) {
            frame -= 17;
            tick();
            ticked = true;
        }
        return ticked;
    }

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;

    var pad = {
        left: false,
        right: false,
        up: false,
        down: false,
    }

    function setPad(keyCode, value) {
        switch(keyCode) {
        case KEY_LEFT:
            pad.left = value;
            break;
        case KEY_RIGHT:
            pad.right = value;
            break;
        case KEY_UP:
            pad.up = value;
            break;
        case KEY_DOWN:
            pad.down = value;
            break;
        }
    }

    window.addEventListener("keydown", (event) => {
        setPad(event.keyCode, true);
        event.preventDefault();
    });

    window.addEventListener("keyup", (event) => {
        setPad(event.keyCode, false);
        event.preventDefault();
    });

    module CollisionAttributes {
        export var SOLID = 1;
        export var STEPS = 2;
    }

    function moveRect(rect: Collide.Rect, delta: { x: number; y: number; }) {
        rect.left += delta.x;
        rect.right += delta.x;
        rect.top += delta.y;
        rect.bottom += delta.y;
    }

    module World {
        export var environment = collision;
        export var obstacles: {
            collision: Collide.Collision;
            x: number;
            y: number;
        }[] = [];

        export function collide(info: {
            rect: Collide.Rect;
            delta: { x: number; y: number; };
            mask: number;
            result?: Collide.Result;
        }) {
            var collided = false;
            var flags = { x: 0, y: 0 };
            var result = new Collide.Result();

            if(Collide.collide({
                collision: environment,
                rect: info.rect,
                delta: info.delta,
                result: info.result,
                mask: info.mask
            })) {
                collided = true;
            }

            obstacles.forEach((obstacle) => {
                var result = { x: 0, y: 0 };

                if(World.collide({
                    rect: info.rect,
                    delta: info.delta,
                    result: info.result,
                    mask: info.mask,
                    offset: obstacle
                })) {
                    collided = true;
                }
            });

            return collided;
        }
    };


    function movePlayer() {
        if(player.vx > 0) {
            player.vx >>= 1;
        } else {
            player.vx = -((-player.vx) >> 1);
        }

        if(pad.left) {
            player.vx = Math.max(player.vx-ftofp(1), -ftofp(3));
        }

        if(pad.right) {
            player.vx = Math.min(player.vx+ftofp(1), +ftofp(3));
        }

        if(pad.up && player.collisionInfo.down && player.collisionInfo.down.attributes) {
            player.vy =  -ftofp(5);
            player.subpixel.y = 0;
            player.collisionInfo.down = null;
            Sound.sfx('jump');
        }

        player.vy = Math.min(player.vy+ftofp(0.3), ftofp(3));

        player.subpixel.x += player.vx;
        player.subpixel.y += player.vy;

        var motion = {
            x: fptoi(player.subpixel.x),
            y: fptoi(player.subpixel.y)
        };

        var delta = { x: motion.x, y: motion.y };

        player.subpixel.x &= FPMASK;
        player.subpixel.y &= FPMASK;

        var result = new Collide.Result();

        World.collide({
            rect: player.rect,
            delta: delta,
            result: result,
            mask: 1
        });

        if(result.x.attributes & CollisionAttributes.STEPS)
        {
            delta = { x: 0, y: -1 };

            if(!World.collide({
                rect: player.rect,
                delta: delta,
                mask: 1
            })) {
                moveRect(player.rect, delta);

                delta = { x: motion.x, y: motion.y };

                World.collide({
                    rect: player.rect,
                    delta: delta,
                    result: result,
                    mask: 1
                });
            }
        }

        moveRect(player.rect, delta);

        if(player.collisionInfo.down && player.collisionInfo.down.attributes & CollisionAttributes.STEPS) {
            var suck = { x: 0, y: 3 };

            if(World.collide({
                rect: player.rect,
                delta: suck,
                result: result,
                mask: 1
            }) && suck.y > 0) {
                moveRect(player.rect, suck);
            }
        }

        if (motion.x < 0) {
            player.collisionInfo.left = result.x;
            player.collisionInfo.right = null;
        } else if(motion.x > 0) {
            player.collisionInfo.left = null;
            player.collisionInfo.right = result.x;
        }

        if (motion.y < 0) {
            player.collisionInfo.up = result.y;
            player.collisionInfo.down = null;
        } else if(motion.y > 0) {
            player.collisionInfo.up = null;
            player.collisionInfo.down = result.y;
        }

        if(player.collisionInfo.down) {
            player.collisionInfo.down.tiles.forEach((tile) => {
                if(tile.info)
                    tile.info.color = 'red';
            });
        }

        if(result.x.attributes) {
            player.vx = 0;
            player.subpixel.x = 0;
        }
        if(result.y.attributes) {
            player.vy = 0;
            player.subpixel.y = 0;
        }
    }

    function fptoi(x: number) {
        return x < 0 ? -((-x) >> FPSHIFT) : x >> FPSHIFT;
    }

    function itofp(x: number) {
        return x < 0 ? -((-x) << FPSHIFT) : x << FPSHIFT;
    }

    function ftofp(x: number) {
        return (x*(1<<FPSHIFT)) | 0;
    }

    var FPSHIFT = 4;
    var FPMASK = 0xF;

    var player = {
        rect: {
            left: 40,
            right: 40 + 3,
            top: 150,
            bottom: 150 + 3
        },
        collisionInfo: {
            up: <Collide.AxisResult>null,
            left: <Collide.AxisResult>null,
            right: <Collide.AxisResult>null,
            down: <Collide.AxisResult>null
        },
        color: 'red',
        vx: 0,
        vy: 0,
        subpixel: { x: 0, y: 0 }
    };

    function tick() {
        movePlayer();
    }
}
