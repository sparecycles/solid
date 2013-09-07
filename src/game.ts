/// <reference path="collide.ts" />
module Game {

    var collision: Collide.Collision = {
        width: 16,
        height: 16,
        palette: [
            // empty block
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
            // solid block
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
            // small square
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
            // angle ◢
            [{
                collision_data_index: 1,
                collision_attributes: 1
            }, {
                collision_data_index: 3,
                collision_attributes: 1
            }, {
                collision_data_index: 1,
                collision_attributes: 1
            }, {
                collision_data_index: 3,
                collision_attributes: 1
            }],
        ],
        tiles: [
            0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 1, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 0, 2, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0,
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
            1, 2, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 3, 1,
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

    export function load() {
        var canvasElement = <HTMLCanvasElement>document.querySelector("#canvas");
        canvasElement.width = WIDTH;
        canvasElement.height = HEIGHT;
        ctx = canvasElement.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);

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


    function tick() {
        /*if(player.vy == 0 && pad.up) {
            player.vy = -8;
            pad.up = false;
        }*/
        
        if(player.vx > 0) {
            player.vx >>= 1;
        } else {
            player.vx = -((-player.vx) >> 1);
        }

        if(player.vy > 0) {
            player.vy >>= 1;
        } else {
            player.vy = -((-player.vy) >> 1);
        }

        if(pad.left) {
            player.vx = Math.max(player.vx-2, -1);
        }
        if(pad.right) {
            player.vx = Math.min(player.vx+2, +1);
        }
        if(pad.up) {
            player.vy = Math.max(player.vy-2, -1);
        }
        if(pad.down) {
            player.vy = Math.min(player.vy+2, +1);
        }

        
        //player.vy = Math.min(player.vy+1, 3);

        var delta = { x: player.vx, y: player.vy };
        var result = { x: 0, y: 0 };
        Collide.collide({
            collision: collision,
            rect: player.rect,
            delta: delta,
            result: result,
            mask: 1
        });

        if(result.x) player.vx = 0;
        if(result.y) player.vy = 0;

        player.rect.left += delta.x;
        player.rect.right += delta.x;
        player.rect.top += delta.y;
        player.rect.bottom += delta.y;
    }

    var player = {
        rect: {
            left: 250,
            right: 250 + 8,
            top: 300,
            bottom: 300 + 8
        },
        color: 'red',
        vx: 0,
        vy: 0
    };
}