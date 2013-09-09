declare var T: any, timbre: any;

/*
{
    (type: string, options?: object, any...: input[]): any;
};
*/

module Sound {
    module Core {
        var sfx: { [_:number]:any; } = {};
        var ambient: { [_:string]:any; } = {};
        var paused = false;
        var nextSFXHandle = 0;

        export function playSFX(t: any):number {
            if(paused) throw new Error("PlaySFX while paused");

            var handle = nextSFXHandle++;       
            sfx[handle] = t.play();
            t.on("ended", function() {
                this.pause();
                delete sfx[handle];
            })
            return handle;
        }

        export function startAmbient(name: string, t: any) {
            if(paused) throw new Error("playAmbient while paused");
            
            pauseAmbient(name);
            (ambient[name] = t).bang().play();
        }

        export function pauseAmbient(name: string) {
            if(ambient[name]) {
                ambient[name].pause();
                delete ambient[name];
            }
        }

        export function clearAmbient() {
            for(var key in ambient) {
                ambient[key].pause();
                delete ambient[key];
            }
        }

        export function pauseAll() {
            for(var key in ambient) {
                ambient[key].pause();
            }
            for(var key in sfx) {
                sfx[key].pause();
            }
            paused = true;
        }

        export function resumeAll() {
            for(var key in ambient) {
                ambient[key].play();
            }
            for(var key in sfx) {
                sfx[key].play();
            }
            paused = false;
        }
    }

    module SFXData {
        export enum SoundFlags {
            Common = 1,
            Rare = 2,
            Small = 4,
            Large = 8
        };

        interface SFX {
            (): any;
        };

        function shouldRecord(recording_flags: number) { return true; };

        export function sample(recording_flags: number, sound: SFX) {
            if(shouldRecord(recording_flags)) {
                return record(sound);
            } else {
                return () => sound();
            }
        }

        var recording_queue = [];

        function record(sound) {
            var buffer;

            recording_queue.push(function (next) {
                timbre.rec(function(output) {
                    var t = sound();
                    var done = false;
                    output.send(t);
                    T("timeout", { timeout: "1s" }, () => {
                        if(!done) {
                            t.pause();
                            output.done();
                            done = true;
                        }
                    });
                    t.on("ended", function() {
                        if (!done) {
                            output.done();
                            done = true;
                        }
                    });
                }).then((result) => {
                    buffer = result;
                    next();
                });
            });

            return () => T("buffer", { buffer: buffer });
        }

        export function recordSounds(cb) {
            function recordNext() {
                if(recording_queue.length == 0) {
                    cb();
                } else {
                    recording_queue.pop()(function() { 
                        setTimeout(recordNext, 1);
                    });
                }
            }
            recordNext();
        }
    }

    module SFX {
        export var jump = SFXData.sample(SFXData.SoundFlags.Common | SFXData.SoundFlags.Small, () => {
            var xline = T("param", { value: 300 }).linTo(700, ".5sec") ;

            var tone = T("env", {table: [.7, [1, ".3sec"], [0, ".2sec"]]},
                        T("sin", {freq: xline, mul: 2})).bang();
            return tone;            
        });

        export var attack = SFXData.sample(SFXData.SoundFlags.Common | SFXData.SoundFlags.Small, () => {
            var tone = T("env", {table: [.7, [1, ".1sec"], [0, ".1sec"]]},
                        T("pink")).bang();
            return tone;            
        });
    }

    export function sfx(name: string) {
        if(SFX[name]) {
            Core.playSFX(SFX[name]());
        }
    }
    
    var next: Function;

    export function load(cb) {
        SFXData.recordSounds(cb);
    }



}