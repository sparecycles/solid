/// <reference path="collide.ts" />
/// <reference path="sound.ts" />
Object.defineProperty(CanvasRenderingContext2D.prototype, 'imageSmoothingEnabled', {
    get: function () {
        return this.webkitImageSmoothingEnabled;
    },
    set: function (value) {
        this.webkitImageSmoothingEnabled = value;
    },
    configurable: false,
    enumerable: true
});

var Game;
(function (Game) {
    var magic = {
        color: 'blue'
    };

    var sides = {
        solid: new Collide.TileSideData(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
        nil: new Collide.TileSideData(16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16),
        bix: new Collide.TileSideData(16, 16, 16, 16, 4, 4, 4, 4, 4, 4, 4, 4, 16, 16, 16, 16),
        up: new Collide.TileSideData(15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0),
        down: new Collide.TileSideData(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)
    };

    var collision = {
        width: 16,
        height: 16,
        palette: [
            [
                {
                    side: sides.nil,
                    collision_attributes: 1
                },
                {
                    side: sides.nil,
                    collision_attributes: 1
                },
                {
                    side: sides.nil,
                    collision_attributes: 1
                },
                {
                    side: sides.nil,
                    collision_attributes: 1
                }
            ],
            [
                {
                    side: sides.solid,
                    collision_attributes: 1
                },
                {
                    side: sides.solid,
                    collision_attributes: 1
                },
                {
                    side: sides.solid,
                    collision_attributes: 1
                },
                {
                    side: sides.solid,
                    collision_attributes: 1
                }
            ],
            [
                {
                    side: sides.bix,
                    collision_attributes: 1
                },
                {
                    side: sides.bix,
                    collision_attributes: 1
                },
                {
                    side: sides.bix,
                    collision_attributes: 1
                },
                {
                    side: sides.bix,
                    collision_attributes: 1
                }
            ],
            [
                {
                    side: sides.solid,
                    collision_attributes: 1
                },
                {
                    side: sides.up,
                    collision_attributes: 1 | 2
                },
                {
                    side: sides.solid,
                    collision_attributes: 1
                },
                {
                    side: sides.up,
                    collision_attributes: 1 | 2
                }
            ],
            [
                {
                    side: sides.solid,
                    collision_attributes: 1
                },
                {
                    side: sides.down,
                    collision_attributes: 1
                },
                {
                    side: sides.up,
                    collision_attributes: 1
                },
                {
                    side: sides.solid,
                    collision_attributes: 1
                }
            ],
            [
                {
                    side: sides.bix,
                    collision_attributes: 1
                },
                {
                    side: sides.bix,
                    collision_attributes: 1
                },
                {
                    side: sides.bix,
                    collision_attributes: 1
                },
                {
                    side: sides.bix,
                    collision_attributes: 1,
                    info: magic
                }
            ],
            [
                {
                    side: sides.up,
                    collision_attributes: 1 | 2
                },
                {
                    side: sides.solid,
                    collision_attributes: 1
                },
                {
                    side: sides.solid,
                    collision_attributes: 1
                },
                {
                    side: sides.down,
                    collision_attributes: 1 | 2,
                    info: magic
                }
            ]
        ],
        tiles: [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            6,
            0,
            2,
            0,
            0,
            0,
            0,
            0,
            0,
            5,
            0,
            4,
            0,
            0,
            0,
            0,
            0,
            6,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            6,
            2,
            2,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            5,
            0,
            0,
            0,
            6,
            2,
            0,
            0,
            1,
            1,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            5,
            0,
            0,
            0,
            6,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            6,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            5,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            1,
            0,
            0,
            5,
            0,
            0,
            1,
            1,
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            4,
            0,
            1,
            1,
            0,
            1,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            3,
            4,
            1,
            1,
            4,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            6,
            0,
            0,
            3,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1
        ]
    };

    var bgctx, fgctx;

    function loadCtx(id) {
        var canvasElement = document.getElementById(id);
        canvasElement.width = WIDTH;
        canvasElement.height = HEIGHT;
        var ctx = canvasElement.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = false;
        return ctx;
    }

    function clearCtx(ctx) {
        if (true) {
            ctx.canvas.width = ctx.canvas.width;
        } else {
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }
    }

    var WIDTH = 256, HEIGHT = 256;

    function load(cb) {
        bgctx = loadCtx("game-bg");
        fgctx = loadCtx("game-fg");

        return Sound.load(cb);
    }
    Game.load = load;

    function start() {
        var time = null;

        function play(timestamp) {
            var dt = time ? timestamp - time : 0;
            time = timestamp;
            if (dt < 0)
                dt = 0;
            var ticks = update(dt);
            if (ticks > 2) {
                // prevent update-limited bottlenecking
                time = Date.now();
            }
            (document.getElementById("debug:ticks") || {}).textContent = ticks;
            if (ticks > 0) {
                render();
            }
            requestAnimationFrame(play);
        }

        requestAnimationFrame(play);
    }
    Game.start = start;

    function renderbg(ctx) {
        clearCtx(ctx);
        ctx.fillStyle = "black";
        var tileIndex = 0;
        for (var y = 0; y < collision.height; y++)
            for (var x = 0; x < collision.width; x++, tileIndex++) {
                var tile = collision.tiles[tileIndex];
                switch (tile) {
                    case 0:
                        break;
                    case 1:
                        ctx.fillRect(x * 16, y * 16, 16, 16);
                        break;
                    case 2:
                        ctx.fillRect(x * 16 + 4, y * 16 + 4, 8, 8);
                        break;
                    case 3:
                        ctx.beginPath();
                        ctx.moveTo(x * 16, y * 16 + 16);
                        ctx.lineTo(x * 16 + 16, y * 16);
                        ctx.lineTo(x * 16 + 16, y * 16 + 16);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case 4:
                        ctx.beginPath();
                        ctx.moveTo(x * 16, y * 16);
                        ctx.lineTo(x * 16 + 16, y * 16);
                        ctx.lineTo(x * 16 + 16, y * 16 + 16);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case 5:
                        ctx.save();
                        ctx.fillStyle = magic.color;
                        ctx.fillRect(x * 16 + 4, y * 16 + 4, 8, 8);
                        ctx.restore();
                        break;
                    case 6:
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(x * 16, y * 16);
                        ctx.lineTo(x * 16, y * 16 + 16);
                        ctx.lineTo(x * 16 + 16, y * 16 + 16);
                        ctx.closePath();
                        ctx.fillStyle = magic.color;
                        ctx.fill();
                        ctx.restore();
                        break;
                }
            }
    }

    function renderfg(ctx) {
        clearCtx(ctx);

        ctx.fillStyle = player.color;

        ctx.fillRect(player.rect.left, player.rect.top, player.rect.right - player.rect.left, player.rect.bottom - player.rect.top);
    }

    var once = 0;
    function render() {
        if (!once)
            renderbg(bgctx);
        once = 0;
        renderfg(fgctx);
    }

    var frame = 0;
    function update(dt) {
        var ticks = 0;
        frame += dt;
        if (!enabled) {
            frame = 0;
            return -1;
        }
        if (frame < 0) {
            frame = 0;
        }
        while (frame >= 17) {
            ticks++;
            frame -= 17;
            tick();
            if (ticks >= 5) {
                frame = 0;
            }
        }
        return ticks;
    }

    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;

    var pad = {
        left: false,
        right: false,
        up: false,
        down: false
    };

    function setPad(keyCode, value) {
        switch (keyCode) {
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

    window.addEventListener("keydown", function (event) {
        setPad(event.keyCode, true);
        event.preventDefault();
    });

    window.addEventListener("keyup", function (event) {
        setPad(event.keyCode, false);
        event.preventDefault();
    });

    var CollisionAttributes;
    (function (CollisionAttributes) {
        CollisionAttributes.SOLID = 1;
        CollisionAttributes.STEPS = 2;
    })(CollisionAttributes || (CollisionAttributes = {}));

    function moveRect(rect, delta) {
        rect.left += delta.x;
        rect.right += delta.x;
        rect.top += delta.y;
        rect.bottom += delta.y;
    }

    var World;
    (function (World) {
        World.environment = collision;
        World.obstacles = [];

        function collide(info) {
            var collided = false;
            var flags = { x: 0, y: 0 };
            var result = new Collide.Result();

            if (Collide.collide({
                collision: World.environment,
                rect: info.rect,
                delta: info.delta,
                result: info.result,
                mask: info.mask
            })) {
                collided = true;
            }

            World.obstacles.forEach(function (obstacle) {
                var result = { x: 0, y: 0 };

                if (World.collide({
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
        World.collide = collide;
    })(World || (World = {}));
    ;

    var count = 0;
    function movePlayer() {
        if (player.vx > 0) {
            player.vx >>= 1;
        } else {
            player.vx = -((-player.vx) >> 1);
        }

        if (pad.left) {
            player.vx = Math.max(player.vx + ftofp(-1), ftofp(-3));
        }

        if (pad.right) {
            player.vx = Math.min(player.vx + ftofp(1), +ftofp(3));
        }

        if (pad.up && player.collisionInfo.down && player.collisionInfo.down.attributes) {
            player.vy = ftofp(-5);
            player.subpixel.y = 0;
            player.collisionInfo.down = null;
            Sound.sfx('jump');
        }

        player.vy = Math.min(player.vy + ftofp(0.3), ftofp(3));

        player.subpixel.x += player.vx;
        player.subpixel.y += player.vy;

        var motion, original_motion = motion = {
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

        if (result.x.attributes & CollisionAttributes.STEPS) {
            motion = { x: motion.x - delta.x, y: motion.y - delta.y };
            delta = { x: 0, y: -1 };

            if (!World.collide({
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

        if (player.collisionInfo.down && player.collisionInfo.down.attributes & CollisionAttributes.STEPS) {
            var suck = { x: 0, y: 3 };

            if (World.collide({
                rect: player.rect,
                delta: suck,
                result: result,
                mask: 1
            }) && suck.y > 0) {
                moveRect(player.rect, suck);
            }
        }

        if (original_motion.x < 0) {
            player.collisionInfo.left = result.x;
            player.collisionInfo.right = null;
        } else if (original_motion.x > 0) {
            player.collisionInfo.left = null;
            player.collisionInfo.right = result.x;
        }

        if (original_motion.y < 0) {
            player.collisionInfo.up = result.y;
            player.collisionInfo.down = null;
        } else if (original_motion.y > 0) {
            player.collisionInfo.up = null;
            player.collisionInfo.down = result.y;
        }

        var stepping = false;
        if (player.collisionInfo.down) {
            player.collisionInfo.down.tiles.forEach(function (tile) {
                if (tile.info) {
                    stepping = true;
                }
            });
        }
        if (stepping) {
            if (magic.color != 'red') {
                Sound.music('stone', T("sin", { freq: 800 - player.rect.bottom }));
            } else {
                var tone = Sound.music('stone');
                if (tone)
                    tone.set('freq', 800 - player.rect.bottom);
            }
            magic.color = 'red';
        } else {
            magic.color = 'blue';
            Sound.music('stone', false);
        }

        if (result.x.attributes) {
            player.vx = 0;
            player.subpixel.x = 0;
        }
        if (result.y.attributes) {
            player.vy = 0;
            player.subpixel.y = 0;
        }
    }

    function fptoi(x) {
        return x < 0 ? -((-x) >> FPSHIFT) : x >> FPSHIFT;
    }

    function itofp(x) {
        return x < 0 ? -((-x) << FPSHIFT) : x << FPSHIFT;
    }

    function ftofp(x) {
        return (x * (1 << FPSHIFT)) | 0;
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
            up: null,
            left: null,
            right: null,
            down: null
        },
        color: 'red',
        vx: 0,
        vy: 0,
        subpixel: { x: 0, y: 0 }
    };

    function tick() {
        movePlayer();
    }
    var enabled = true;
    function enable(value) {
        enabled = value;
    }
    Game.enable = enable;
})(Game || (Game = {}));
