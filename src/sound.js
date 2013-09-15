/*
{
(type: string, options?: object, any...: input[]): any;
};
*/
var Sound;
(function (Sound) {
    var Core;
    (function (Core) {
        var sfx = {};
        var ambient = {};
        var paused = false;
        var nextSFXHandle = 0;

        function playSFX(t) {
            if (paused)
                return -1;
            var handle = nextSFXHandle++;
            sfx[handle] = t.play();
            t.on("ended", function () {
                delete sfx[handle];
            });
            return handle;
        }
        Core.playSFX = playSFX;

        var Sound = (function () {
            function Sound(t) {
                var _this = this;
                this.t = t;
                this.shouldplay = false;
                this.playing = false;
                t.on("play", function () {
                    _this.playing = true;
                }).on("pause", function () {
                    _this.playing = false;
                });
            }
            Sound.prototype.play = function () {
                this.t.play();
            };
            Sound.prototype.pause = function () {
                this.t.pause();
            };
            return Sound;
        })();

        function startAmbient(name, t) {
            pauseAmbient(name);
            var sound = ambient[name] = new Sound(t.bang());
            if (!paused) {
                sound.play();
            }
        }
        Core.startAmbient = startAmbient;

        function pauseAmbient(name) {
            var sound = ambient[name];
            if (sound) {
                sound.pause();
                delete ambient[name];
            }
        }
        Core.pauseAmbient = pauseAmbient;

        function getAmbient(name) {
            return (ambient[name] || {
                t: null
            }).t;
        }
        Core.getAmbient = getAmbient;

        function clearAmbient() {
            for (var key in ambient) {
                ambient[key].pause();
                delete ambient[key];
            }
        }
        Core.clearAmbient = clearAmbient;

        function pauseAll() {
            for (var key in ambient) {
                ambient[key].pause();
            }
            for (var key in sfx) {
                sfx[key].pause();
            }
            timbre.pause();
            paused = true;
        }
        Core.pauseAll = pauseAll;

        function resumeAll() {
            timbre.play();

            for (var key in ambient) {
                ambient[key].play();
            }
            for (var key in sfx) {
                sfx[key].play();
            }
            paused = false;
        }
        Core.resumeAll = resumeAll;
    })(Core || (Core = {}));

    var SFXData;
    (function (SFXData) {
        (function (SoundFlags) {
            SoundFlags[SoundFlags["Common"] = 1] = "Common";
            SoundFlags[SoundFlags["Rare"] = 2] = "Rare";
            SoundFlags[SoundFlags["Small"] = 4] = "Small";
            SoundFlags[SoundFlags["Large"] = 8] = "Large";
        })(SFXData.SoundFlags || (SFXData.SoundFlags = {}));
        var SoundFlags = SFXData.SoundFlags;
        ;

        ;

        function shouldRecord(recording_flags) {
            return true;
        }
        ;

        function sample(recording_flags, sound) {
            if (shouldRecord(recording_flags)) {
                return record(sound);
            } else {
                return function () {
                    return sound();
                };
            }
        }
        SFXData.sample = sample;

        var recording_queue = [];

        function record(sound) {
            var buffer;

            recording_queue.push(function (next) {
                timbre.rec(function (output) {
                    var t = sound();
                    var done = false;
                    output.send(t);
                    T("timeout", {
                        timeout: "1s"
                    }, function () {
                        if (!done) {
                            t.pause();
                            output.done();
                            done = true;
                        }
                    });
                    t.on("ended", function () {
                        if (!done) {
                            output.done();
                            done = true;
                        }
                    });
                }).then(function (result) {
                    buffer = result;
                    next();
                });
            });

            return function () {
                return T("buffer", {
                    buffer: buffer
                });
            };
        }

        function recordSounds(cb) {
            function recordNext() {
                if (recording_queue.length == 0) {
                    timbre.pause();
                    cb();
                } else {
                    recording_queue.pop()(function () {
                        setTimeout(recordNext, 1);
                    });
                }
            }
            recordNext();
        }
        SFXData.recordSounds = recordSounds;
    })(SFXData || (SFXData = {}));

    var SFX;
    (function (SFX) {
        SFX.jump = SFXData.sample(SFXData.SoundFlags.Common | SFXData.SoundFlags.Small, function () {
            var xline = T("param", {
                value: 300
            }).linTo(700, ".5sec");

            var tone = T("env", {
                table: [
                    .7,
                    [1, ".3sec"],
                    [0, ".2sec"]
                ]
            }, T("sin", {
                freq: xline,
                mul: 2
            })).bang();
            return tone;
        });

        SFX.attack = SFXData.sample(SFXData.SoundFlags.Common | SFXData.SoundFlags.Small, function () {
            var tone = T("env", {
                table: [
                    .7,
                    [1, ".1sec"],
                    [0, ".1sec"]
                ]
            }, T("pink")).bang();
            return tone;
        });
    })(SFX || (SFX = {}));

    function sfx(name) {
        if (SFX[name]) {
            Core.playSFX(SFX[name]());
        }
    }
    Sound.sfx = sfx;

    function music(name, t) {
        if (t === undefined)
            return Core.getAmbient(name);
else if (t === false)
            Core.pauseAmbient(name);
else
            Core.startAmbient(name, t);
    }
    Sound.music = music;

    var next;

    function load(cb) {
        SFXData.recordSounds(cb);
    }
    Sound.load = load;

    function enable(enable) {
        if (enable) {
            Core.resumeAll();
        } else {
            Core.pauseAll();
        }
    }
    Sound.enable = enable;
})(Sound || (Sound = {}));
