var Collide;
(function (Collide) {
    var TileSideData = (function () {
        function TileSideData(_0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _A, _B, _C, _D, _E, _F) {
            if (typeof _0 === 'number') {
                this.point = Array.prototype.slice.call(arguments, 0, 16);
            } else {
                this.point = _0;
            }

            if (this.point.length != 16) {
                throw new Error("wrong number of arguments to new TileSideData");
            }

            this.box = ComputeBoxCollision(this.point);
        }
        return TileSideData;
    })();
    Collide.TileSideData = TileSideData;

    (function (CollisionDirection) {
        CollisionDirection[CollisionDirection["Left"] = 0] = "Left";
        CollisionDirection[CollisionDirection["Right"] = 1] = "Right";
        CollisionDirection[CollisionDirection["Up"] = 2] = "Up";
        CollisionDirection[CollisionDirection["Down"] = 3] = "Down";
    })(Collide.CollisionDirection || (Collide.CollisionDirection = {}));
    var CollisionDirection = Collide.CollisionDirection;

    var DoCollisionParams = (function () {
        function DoCollisionParams(collision, collision_direction, attribute_mask) {
            this.collision = collision;
            this.collision_direction = collision_direction;
            this.attribute_mask = attribute_mask;
            this.collision_tile_index = 0;
            this.collision_enter_exit_index = 0;
            this.min_dent = 0;
            this.result = {
                collision_occured: false,
                attributes: 0,
                dent: 0,
                tiles: []
            };
        }
        return DoCollisionParams;
    })();

    ;

    var Result = (function () {
        function Result() {
            this.x = {
                attributes: 0,
                tiles: []
            };
            this.y = {
                attributes: 0,
                tiles: []
            };
        }
        return Result;
    })();
    Collide.Result = Result;

    function collide(options) {
        // initialize collision params for x and y motions
        var rect = options.rect;
        var result = false;
        var collision = options.collision;
        var dx = options.delta.x | 0;
        var dy = options.delta.y | 0;
        var remaining_x = dx;
        var remaining_y = dy;
        var offset_x = 0;
        var offset_y = 0;

        if (options.offset) {
            offset_x = -options.offset.x;
            offset_y = -options.offset.y;
        }

        var current_x = offset_x;
        var current_y = offset_y;

        var collision_direction_x;
        var collision_direction_y;

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

        while (iterate()) {
        }

        options.delta.x = current_x - offset_x;
        options.delta.y = current_y - offset_y;
        if (options.result) {
            if (do_collision_params_x.result.attributes) {
                options.result.x.attributes |= do_collision_params_x.result.attributes;
                options.result.x.tiles.push.apply(options.result.x.tiles, do_collision_params_x.result.tiles);
            }
            if (do_collision_params_y.result.attributes) {
                options.result.y.attributes |= do_collision_params_y.result.attributes;
                options.result.y.tiles.push.apply(options.result.y.tiles, do_collision_params_y.result.tiles);
            }
        }

        return result;

        function iterate() {
            if (b_tile_dx_abs > b_tile_dy_abs) {
                b_tile_y += b_tile_dy_abs;
                if (b_tile_y >= b_tile_dx_abs) {
                    b_tile_y -= b_tile_dx_abs + b_tile_dy_abs;
                    if (remaining_y)
                        return move_y();
                }
                if (remaining_x)
                    return move_x();
            } else {
                b_tile_x += b_tile_dx_abs;
                if (b_tile_x >= b_tile_dy_abs) {
                    b_tile_x -= b_tile_dy_abs + b_tile_dx_abs;
                    if (remaining_x)
                        return move_x();
                }
                if (remaining_y)
                    return move_y();
            }

            if (remaining_x)
                return move_x();
            if (remaining_y)
                return move_y();

            // nothing remaining, exit loop.
            return false;
        }

        function move_x() {
            var span0 = clamp(current_y + rect.top, 0, collision.height << 4);
            var span1 = clamp(current_y + rect.bottom, 0, collision.height << 4);

            var width = collision.width;
            var tile_y = ((span0) >> 4) * width;
            var end_tile_y = ((span1 + 15) >> 4) * width;
            var tile_x;
            var delta;
            var dent;
            var min_dent;

            if (dx > 0) {
                var current_tile_x = (current_x + rect.right);
                tile_x = current_tile_x >> 4;
                delta = 16 - (current_tile_x & 0xF);
                if (delta > remaining_x)
                    delta = remaining_x;
                dent = (current_tile_x & 0xF) + delta;
                min_dent = rect.right + offset_x - (tile_x << 4);
            } else {
                var current_tile_x = (current_x + rect.left);
                tile_x = current_tile_x >> 4;
                delta = current_tile_x & 0xF;
                if (0 == delta)
                    delta = 16, tile_x--;
                if (delta > -remaining_x)
                    delta = -remaining_x;
                dent = ((16 - current_tile_x) & 0xF) + delta;
                min_dent = (tile_x << 4) + 16 - rect.left - offset_x;
            }

            if (min_dent < 0) {
                min_dent = 0;
            }

            if (tile_x < 0 || tile_x >= collision.width) {
                if (dx > 0) {
                    remaining_x -= delta;
                    current_x += delta;
                } else {
                    remaining_x += delta;
                    current_x -= delta;
                }

                return true;
            }

            do_collision_params_x.min_dent = min_dent;
            do_collision_params_x.result.dent = dent;
            do_collision_params_x.collision_tile_index = tile_x + tile_y;

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
            return true;
        }

        function move_y() {
            var span0 = clamp(current_x + rect.left, 0, collision.width << 4);
            var span1 = clamp(current_x + rect.right, 0, collision.width << 4);

            var tile_x = ((span0) >> 4);
            var end_tile_x = ((span1 + 15) >> 4);
            var tile_y;
            var tile_yindex;
            var delta;
            var dent;
            var min_dent;

            if (dy > 0) {
                var current_tile_y = (current_y + rect.bottom);
                tile_yindex = (current_tile_y >> 4);
                delta = 16 - (current_tile_y & 0xF);
                if (delta > remaining_y)
                    delta = remaining_y;
                dent = (current_tile_y & 0xf) + delta;
                min_dent = rect.bottom + offset_y - (tile_yindex << 4);
            } else {
                var current_tile_y = (current_y + rect.top);
                tile_yindex = (current_tile_y >> 4);
                delta = current_tile_y & 0xF;
                if (0 == delta)
                    delta = 16, tile_yindex--;
                if (delta > -remaining_y)
                    delta = -remaining_y;
                dent = ((16 - current_tile_y) & 0xf) + delta;
                min_dent = (tile_yindex << 4) + 16 - rect.top - offset_y;
            }

            if (min_dent < 0)
                min_dent = 0;

            if (tile_yindex < 0 || tile_yindex >= collision.height) {
                if (dy > 0) {
                    remaining_y -= delta;
                    current_y += delta;
                } else {
                    remaining_y += delta;
                    current_y -= delta;
                }

                return true;
            }

            tile_y = tile_yindex * collision.width;

            do_collision_params_y.collision_tile_index = tile_x + tile_y;
            do_collision_params_y.min_dent = min_dent;
            do_collision_params_y.result.dent = dent;

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

            return false;
        }
    }
    Collide.collide = collide;

    function DoPointCollision(params, start, end) {
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

    function DoCollision(params) {
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
                } else if (collision_at == params.min_dent) {
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

    function ComputeBoxCollision(point_collision) {
        var least = 16;
        var box_collision = new Array(31);

        for (var index = 0; index < 16; index++) {
            if (point_collision[index] < least) {
                least = point_collision[index];
            }

            box_collision[index] = least;
        }

        least = 16;
        for (var index = 15; index >= 0; index--) {
            if (point_collision[index] < least) {
                least = point_collision[index];
            }

            box_collision[index + 15] = least;
        }

        return box_collision;
    }
})(Collide || (Collide = {}));
