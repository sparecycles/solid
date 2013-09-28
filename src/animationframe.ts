module AnimationFrame {
    export var request = window.requestAnimationFrame
        || window['webkitRequestAnimationFrame']
        || window['mozRequestAnimationFrame']
        || window['msRequestAnimationFrame'];
        ;

    export var cancel = window.cancelAnimationFrame
        || window['webkitCancelAnimationFrame']
        || window['webkitRequestCancelAnimationFrame']
        || window['mozCancelAnimationFrame']
        || window['mozCancelRequestAnimationFrame']
        || window['msCancelAnimationFrame']
        || window['msCancelRequestAnimationFrame'];

    if(request) {
        request = request.bind(window);
    }
    if(cancel) {
        cancel = cancel.bind(window);
    }

    var actionRegistry: { [index:number]: boolean; } = {};
    var actionRegistryIndex = 0;
    var nextTimeoutActions: { (): void; }[] = null;
    function nextTimeout(action: () => void): void {
        if(!nextTimeoutActions) {
            nextTimeoutActions = [];
        }
        
        nextTimeoutActions.push(action);

        setTimeout(() => {
            var actions = nextTimeoutActions;
            nextTimeoutActions = null;
            actions.forEach(action => { try { action(); } catch(ex) {} });
        }, 1000/60);
    }

    if(!request) {
        request = nextTimeout;
    }

    if(!cancel) {
        request = (originalRequestMethod) => {
            return (action) => {
                var index = ++actionRegistryIndex;
                actionRegistry[index] = true;
                var cancelableAction = () => {
                    try {
                        if(actionRegistry[index]) {
                            action();
                        }
                    } finally {
                        delete actionRegistry[index];
                    }
                }

                originalRequestMethod(cancelableAction);

                return index;
            }
        }(request);

        cancel = (index: number) => delete actionRegistry[index];
    }
}