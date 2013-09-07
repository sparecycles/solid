module Collide {
	export interface PointCollision {
		[_:number]: number; // .length = 16
	}

	export interface BoxCollision {
		[_:number]: number; // .length = 31
	}

	export interface Collision {
		width: number;
		height: number;
		palette: CollisionType[];
		tiles: number[];
		box_collision: BoxCollision[];
		point_collision: PointCollision[];
	}

	export interface CollisionInfo {
		collision_data_index: number;
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

	export interface CollsionInfo {
		collision: Collision;
		direction: number;
		tileIndex: number;
		enterExitIndex: number;
		minDent: number;
		attribute_mask: any;
		result: {
			occured: boolean;
			attributes: number;
			dent: number;
		};
	}

	export enum CollisionDirection {
		Left,
		Right,
		Up,
		Down,
	};

	export class DoCollisionParams {
		constructor(
			public collision: Collision,
			public collision_direction: CollisionDirection,
			public attribute_mask: number)
		{

		}

		collision_tile_index: number = 0;
		collision_enter_exit_index: number = 0;

		min_dent: number = 0;

		result: {
			collision_occured: boolean;
			attributes: number;
			dent: number;
		} = {
			collision_occured: false,
			attributes: 0,
			dent: 0
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
			result: {
				x: number;
				y: number;
			};
			mask: number;
		}
	): boolean {
		var rect = options.rect;
		var result: boolean = false;
		var collision = options.collision;
		var dx = options.delta.x | 0;
		var dy = options.delta.y | 0;
		var current_x = 0;
		var current_y = 0;
		var remaining_x = dx;
		var remaining_y = dy;

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

		return result;

		function choice() {
			// initialize collision params for x and y motions

			// initialize inline bresenham line variables

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
				min_dent = rect.right - (tile_x << 4);
			} else {
				var current_tile_x = (current_x + rect.left);
				tile_x = current_tile_x >> 4;
				delta = current_tile_x & 0xF;
				if (0 == delta) delta = 16, tile_x--;
				if (delta > -remaining_x) delta = -remaining_x;
				dent = ((16 - current_tile_x) & 0xF) + delta;
				min_dent = (tile_x << 4) + 16 - rect.left;
			}

			if (min_dent < 0)
				min_dent = 0;

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

				options.delta.x = current_x = next;
				options.result.x |= do_collision_params_x.result.attributes;
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
				min_dent = rect.bottom - (tile_yindex << 4);
			} else {
				var current_tile_y = (current_y + rect.top);
				tile_yindex = (current_tile_y >> 4);
				delta = current_tile_y & 0xF;
				if (0 == delta) delta = 16, tile_yindex--;
				if (delta > -remaining_y) delta = -remaining_y;
				dent = ((16 - current_tile_y) & 0xf) + delta;
				min_dent = (tile_yindex << 4) + 16 - rect.top;
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

				options.delta.y = current_y = next;
				options.result.y |= do_collision_params_y.result.attributes;
				remaining_y = 0;
				result = true;
			}
		}
	}

	function DoPointCollision(params: DoCollisionParams, start: number, end: number): number {
		var palette_index = params.collision.tiles[params.collision_tile_index];
		var info = params.collision.palette[palette_index][params.collision_direction];
		var attribute_mask = (params.attribute_mask & info.collision_attributes);

		if (attribute_mask) {
			var i;
			var min_collision_at = 16;

			for (i = start; i < end; i++) {
				var collision_at = params.collision.point_collision[info.collision_data_index][i];

				if (collision_at < params.result.dent && collision_at >= params.min_dent && collision_at < min_collision_at) {
					min_collision_at = collision_at;
				}
			}

			if (min_collision_at < 16) {
				params.result.collision_occured = true;
				params.result.attributes = info.collision_attributes;
				params.result.dent = min_collision_at;

				return info.collision_attributes;
			}
		}

		return 0;
	}

	function DoCollision(params: DoCollisionParams): number {
		var palette_index = params.collision.tiles[params.collision_tile_index];
		var info = params.collision.palette[palette_index][params.collision_direction];
		var attribute_mask = (params.attribute_mask & info.collision_attributes);

		if (attribute_mask) {
			var collision_at = params.collision.box_collision[info.collision_data_index][params.collision_enter_exit_index];

			if (collision_at < params.result.dent && collision_at >= params.min_dent) {
				params.result.collision_occured = true;
				params.result.attributes = info.collision_attributes;
				params.result.dent = collision_at;

				return info.collision_attributes;
			}
		}

		return 0;
	}

	function clamp(x, lo, hi) {
		return x < lo ? lo : x > hi ? hi : x;
	}

	export function ComputeBoxCollision(point_collision: PointCollision): BoxCollision
	{
		var least = 16;
		var box_collision:BoxCollision = new Array(31);

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
