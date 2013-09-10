module Collide {
    export class TileSideData {
        public point: number[];
        public box: number[];

        constructor(
            _0:number, _1:number, _2:number, _3:number,
            _4:number, _5:number, _6:number, _7:number,
            _8:number, _9:number, _A:number, _B:number,
            _C:number, _D:number, _E:number, _F:number
        );
        
        constructor(
            point: number[]
        );

        constructor(
            _0:any, _1?:number, _2?:number, _3?:number,
            _4?:number, _5?:number, _6?:number, _7?:number,
            _8?:number, _9?:number, _A?:number, _B?:number,
            _C?:number, _D?:number, _E?:number, _F?:number
        ) {
            if(typeof _0 === 'number') {
                this.point = Array.prototype.slice.call(arguments, 0, 16);
            } else {
                this.point = <number[]>_0;
            }

            if(this.point.length != 16) {
                throw new Error("wrong number of arguments to new TileSideData");
            }

            this.box = ComputeBoxCollision(this.point);
        }
    }

    export interface Collision {
        width: number;
        height: number;
        palette: CollisionType[];
        tiles: number[];
    }

    export interface CollisionInfo {
        side: TileSideData;
        collision_attributes: number;
    }

    export interface CollisionType {
        [_:number]: CollisionInfo; // .length = 4
    }

    export interface Rect {
        left: number;
        top: number;
        right: number;
        bottom: number;
    }

    export enum CollisionDirection {
        Left,
        Right,
        Up,
        Down,
    }

    class DoCollisionParams {
        constructor(
            public collision: Collision,
            public collision_direction: CollisionDirection,
            public attribute_mask: number)
        {
        }

        collision_tile_index: number = 0;
        collision_enter_exit_index: number = 0;

        min_dent: number = 0;

        result = {
            collision_occured: false,
            attributes: 0,
            dent: 0,
            tiles: <any[]>[]
        };
    }

    export interface AxisResult {
        attributes: number;
        tiles: any[];
    };

    export class Result {
        x: AxisResult = {
           attributes: 0,
           tiles: []
        };
        y: AxisResult = {
           attributes: 0,
           tiles: []
        };
    }

    export function collide(
        options: {
            rect: Rect;
            collision: Collision;
            delta: {
                x: number;
                y: number;
            };
            offset?: {
                x: number;
                y: number;
            };
            result?: Result;
            mask: number;
        }
    ): boolean {
        // initialize collision params for x and y motions
        var rect = options.rect;
        var result: boolean = false;
        var collision = options.collision;
        var dx = options.delta.x | 0;
        var dy = options.delta.y | 0;
        var remaining_x = dx;
        var remaining_y = dy;
        var offset_x = 0;
        var offset_y = 0;

        if(options.offset) {
            offset_x = -options.offset.x;
            offset_y = -options.offset.y;
        }

        var current_x = offset_x;
        var current_y = offset_y;

        var collision_direction_x: number;
        var collision_direction_y: number;

        if ((dx | dy) == 0) {
            return null;
        }

        if (dx < 0) {
            collision_direction_x = CollisionDirection.Left;
        } else {
            collision_direction_x = CollisionDirection.Right;
        }

        if (dy < 0) {
            collision_direction_y = CollisionDirection.Up;
        } else {
            collision_direction_y = CollisionDirection.Down;
        }

        var do_collision_params_x = new DoCollisionParams(collision, collision_direction_x, options.mask);
        var do_collision_params_y = new DoCollisionParams(collision, collision_direction_y, options.mask);

        // initialize inline bresenham line variables
        var b_tile_dx = remaining_x;
        var b_tile_dy = remaining_y;
        var b_tile_dx_abs = b_tile_dx > 0 ? (b_tile_dx + 15) >> 4 : (-b_tile_dx + 15) >> 4;
        var b_tile_dy_abs = b_tile_dy > 0 ? (b_tile_dy + 15) >> 4 : (-b_tile_dy + 15) >> 4;
        var b_tile_x = b_tile_dx_abs >> 1;
        var b_tile_y = b_tile_dy_abs >> 1;

        var step = null;

        choice();
        while(step) {
            step();
            choice();
        }

        options.delta.x = current_x - offset_x;
        options.delta.y = current_y - offset_y;
        if(options.result) {
            if(do_collision_params_x.result.attributes) {
                options.result.x.attributes |= do_collision_params_x.result.attributes;
                options.result.x.tiles.push.apply(options.result.x.tiles, do_collision_params_x.result.tiles);
            }
            if(do_collision_params_y.result.attributes) {
                options.result.y.attributes |= do_collision_params_y.result.attributes;
                options.result.y.tiles.push.apply(options.result.y.tiles, do_collision_params_y.result.tiles);
            }
        }

        return result;

        function choice() {
            // reentry point for bresenham selector.
            // the bresenham selector chooses whether to
            // check tiles in the x or y directions.

            if (b_tile_dx_abs > b_tile_dy_abs) {
                b_tile_y += b_tile_dy_abs;
                if (b_tile_y >= b_tile_dx_abs) {
                    b_tile_y -= b_tile_dx_abs + b_tile_dy_abs;
                    if (remaining_y) return void (step = move_y);
                }
                if (remaining_x) return void (step = move_x);
            } else {
                b_tile_x += b_tile_dx_abs;
                if (b_tile_x >= b_tile_dy_abs) {
                    b_tile_x -= b_tile_dy_abs + b_tile_dx_abs;
                    if (remaining_x) return void (step = move_x);
                }
                if (remaining_y) return void (step = move_y);
            }

            // clear out remaining x and y motions when the bresenham terminates.
            // (does this need to be done?)
            if (remaining_x) return void (step = move_x);
            if (remaining_y) return void (step = move_y);

            // nothing remaining, exit loop.
            return void (step = null);
        }

        function move_x() {
            var span0 = clamp(current_y + rect.top, 0, collision.height << 4);
            var span1 = clamp(current_y + rect.bottom, 0, collision.height << 4);

            var width = collision.width;
            var tile_y = ((span0) >> 4) * width;
            var end_tile_y = ((span1 + 15) >> 4) * width;
            var tile_x;
            var delta;
            var dent; // the initial number of pixels that we penetrate the collision tile.
            var min_dent; // the minimum penetration that we are interested in

            // calculate penetration into collision tile,
            // (the min_dent is the penetration already attained,
            // for discarding collision already passed).
            if (dx > 0) {
                var current_tile_x = (current_x + rect.right);
                tile_x = current_tile_x >> 4;
                delta = 16 - (current_tile_x & 0xF);
                if (delta > remaining_x) delta = remaining_x;
                dent = (current_tile_x & 0xF) + delta;
                min_dent = rect.right + offset_x - (tile_x << 4) ;
            } else {
                var current_tile_x = (current_x + rect.left);
                tile_x = current_tile_x >> 4;
                delta = current_tile_x & 0xF;
                if (0 == delta) delta = 16, tile_x--;
                if (delta > -remaining_x) delta = -remaining_x;
                dent = ((16 - current_tile_x) & 0xF) + delta;
                min_dent = (tile_x << 4) + 16 - rect.left - offset_x;
            }

            if (min_dent < 0) {
                min_dent = 0;
            }

            // early out, tile_x is outside the collision area.
            if (tile_x < 0 || tile_x >= collision.width) {
                if (dx > 0) {
                    remaining_x -= delta;
                    current_x += delta;
                } else {
                    remaining_x += delta;
                    current_x -= delta;
                }

                return; // go back to bresenham selector
            }

            do_collision_params_x.min_dent = min_dent;
            do_collision_params_x.result.dent = dent;
            do_collision_params_x.collision_tile_index = tile_x + tile_y;

            // handle first tile (exiting)
            if (tile_y < end_tile_y) {
                do_collision_params_x.collision_enter_exit_index = (span0 & 0xF) + 15;

                if (span1 < (span0 & ~0xF) + 16) {
                    if (span0 & 0xF) {
                        // only on the first tile could we do point collision, otherwise
                        // the rectangle spans an edge of a tile.
                        DoPointCollision(do_collision_params_x, span0 & 0xF, span1 & 0xF);
                    } else {
                        do_collision_params_x.collision_enter_exit_index = ((span1 - 1) & 0xF);
                        DoCollision(do_collision_params_x);
                    }
                } else {
                    DoCollision(do_collision_params_x);
                }
                do_collision_params_x.collision_tile_index += width;

                // handle middle tiles (complete)
                do_collision_params_x.collision_enter_exit_index = 15;

                while (do_collision_params_x.collision_tile_index < end_tile_y - width) {
                    DoCollision(do_collision_params_x);
                    do_collision_params_x.collision_tile_index += width;
                }

                // handle last offset (entering)
                if (do_collision_params_x.collision_tile_index < end_tile_y) {
                    do_collision_params_x.collision_enter_exit_index = ((span1 - 1) & 0xF);
                    DoCollision(do_collision_params_x);
                }
            }

            if (dx > 0) {
                remaining_x -= delta;
                current_x += delta;
            } else {
                remaining_x += delta;
                current_x -= delta;
            }

            // resolve collision to results and stop moving in this direction
            if (do_collision_params_x.result.collision_occured) {
                var next;

                do_collision_params_x.result.collision_occured = false;

                if (dx > 0) {
                    next = (tile_x << 4) + do_collision_params_x.result.dent - rect.right;
                } else {
                    next = (tile_x << 4) + 16 - do_collision_params_x.result.dent - rect.left;
                }

                current_x = next;
                remaining_x = 0;
                result = true;
            }
        }

        function move_y() {
            var span0 = clamp(current_x + rect.left, 0, collision.width << 4);
            var span1 = clamp(current_x + rect.right, 0, collision.width << 4);

            var tile_x = ((span0) >> 4);
            var end_tile_x = ((span1 + 15) >> 4);
            var tile_y;
            var tile_yindex;
            var delta;
            var dent; // the initial number of pixels that we penetrate the collision tile.
            var min_dent; // the minimum penetration that we are interested in

            // calculate penetration into collision tile,
            // (the min_dent is the penetration already attained,
            // for discarding collision already passed).
            if (dy > 0) {
                var current_tile_y = (current_y + rect.bottom);
                tile_yindex = (current_tile_y >> 4);
                delta = 16 - (current_tile_y & 0xF);
                if (delta > remaining_y) delta = remaining_y;
                dent = (current_tile_y & 0xf) + delta;
                min_dent = rect.bottom + offset_y - (tile_yindex << 4);
            } else {
                var current_tile_y = (current_y + rect.top);
                tile_yindex = (current_tile_y >> 4);
                delta = current_tile_y & 0xF;
                if (0 == delta) delta = 16, tile_yindex--;
                if (delta > -remaining_y) delta = -remaining_y;
                dent = ((16 - current_tile_y) & 0xf) + delta;
                min_dent = (tile_yindex << 4) + 16 - rect.top - offset_y;
            }

            if (min_dent < 0)
                min_dent = 0;

            // early out, tile_y is outside the collision area.
            if (tile_yindex < 0 || tile_yindex >= collision.height) {
                if (dy > 0) {
                    remaining_y -= delta;
                    current_y += delta;
                } else {
                    remaining_y += delta;
                    current_y -= delta;
                }

                return; // go back to bresenham selector
            }

            tile_y = tile_yindex * collision.width;

            do_collision_params_y.collision_tile_index = tile_x + tile_y;
            do_collision_params_y.min_dent = min_dent;
            do_collision_params_y.result.dent = dent;

            // handle first tile (exiting)
            if (tile_x < end_tile_x) {
                do_collision_params_y.collision_enter_exit_index = (span0 & 0xF) + 15;
                if (span1 < (span0 & ~0xF) + 16) {
                    if (span0 & 0xF) {
                        // only on the first tile could we do point collision, otherwise
                        // the rectangle spans an edge of a tile.
                        DoPointCollision(do_collision_params_y, span0 & 0xF, span1 & 0xF);
                    } else {
                        do_collision_params_y.collision_enter_exit_index = ((span1 - 1) & 0xF);
                        DoCollision(do_collision_params_y);
                    }
                } else {
                    DoCollision(do_collision_params_y);
                }
                tile_x++;
                do_collision_params_y.collision_tile_index++;

                // handle middle tiles (complete)
                do_collision_params_y.collision_enter_exit_index = 15;

                while (tile_x < end_tile_x - 1) {
                    DoCollision(do_collision_params_y);
                    tile_x++;
                    do_collision_params_y.collision_tile_index++;
                }

                // handle last offset (entering)
                if (tile_x < end_tile_x) {
                    do_collision_params_y.collision_enter_exit_index = ((span1 - 1) & 0xF);

                    DoCollision(do_collision_params_y);
                }
            }

            if (dy > 0) {
                remaining_y -= delta;
                current_y += delta;
            } else {
                remaining_y += delta;
                current_y -= delta;
            }

            // resolve collision to results and stop moving in this direction
            if (do_collision_params_y.result.collision_occured) {
                var next;

                do_collision_params_y.result.collision_occured = false;

                if (dy > 0) {
                    next = (tile_yindex << 4) + do_collision_params_y.result.dent - rect.bottom;
                } else {
                    next = ((tile_yindex << 4) + 16 - do_collision_params_y.result.dent) - rect.top;
                }

                current_y = next;
                remaining_y = 0;
                result = true;
            }
        }
    }

    function DoPointCollision(params: DoCollisionParams, start: number, end: number) {
        var palette_index = params.collision.tiles[params.collision_tile_index];
        var info = params.collision.palette[palette_index][params.collision_direction];
        var attribute_mask = (params.attribute_mask & info.collision_attributes);

        if (attribute_mask) {
            var i;
            var min_collision_at = 16;

            for (i = start; i < end; i++) {
                var collision_at = info.side.point[i];

                if (collision_at < params.result.dent && collision_at >= params.min_dent && collision_at < min_collision_at) {
                    min_collision_at = collision_at;
                }
            }

            if (min_collision_at < 16) {
                params.result.collision_occured = true;
                params.result.attributes = info.collision_attributes;
                params.result.dent = min_collision_at;
                params.result.tiles = [info];
            }
        }
    }

    function DoCollision(params: DoCollisionParams) {
        var palette_index = params.collision.tiles[params.collision_tile_index];
        var info = params.collision.palette[palette_index][params.collision_direction];
        var attribute_mask = (params.attribute_mask & info.collision_attributes);

        if (attribute_mask) {
            var collision_at = info.side.box[params.collision_enter_exit_index];

            if (collision_at < params.result.dent) {
                if (collision_at > params.min_dent) {
                    params.result.tiles = [info];
                    params.result.attributes = info.collision_attributes;
                    params.result.dent = collision_at;
                    params.result.collision_occured = true;
                } else if(collision_at == params.min_dent) {
                    params.result.tiles.push(info);
                    params.result.attributes |= info.collision_attributes;
                    params.result.collision_occured = true;
                    params.result.dent = collision_at;
                }
            }
        }
    }

    function clamp(x, lo, hi) {
        return x < lo ? lo : x > hi ? hi : x;
    }

    function ComputeBoxCollision(point_collision: number[]): number[]
    {
        var least = 16;
        var box_collision:number[] = new Array<number>(31);

        for(var index = 0; index < 16; index++)
        {
            if(point_collision[index] < least)
            {
                least = point_collision[index];
            }

            box_collision[index] = least;
        }

        least = 16;
        for(var index = 15; index >= 0; index--)
        {
            if(point_collision[index] < least)
            {
                least = point_collision[index];
            }

            box_collision[index + 15] = least;
        }

        return box_collision;
    }
}
