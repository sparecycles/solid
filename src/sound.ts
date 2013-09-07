declare var T : any;
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

    class SFX {
        static jump() {
            var xline = T("param", { value: 500 }).linTo(1000, ".5sec");
            var freq = T("sin", { freq: xline, mul: 10 });

            return T("env", {table: [.4, [1, 500], [0, 200]]},
                        T("sin", {freq: freq })).bang(); 
        }
    }

    export function sfx(name: string) {
        if(SFX[name]) {
            Core.playSFX(SFX[name]());
        }
    }

}