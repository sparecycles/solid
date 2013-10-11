
module CanvasExtensions {

    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext('2d');

    var _imageSmoothingEnabledPropertyNames = [
        'webkitImageSmoothingEnabled',
        'mozImageSmoothingEnabled',
        'msImageSmoothingEnabled',
        'oImageSmoothingEnabled',
    ];

    export var imageSmoothingSupported = 
    ('imageSmoothingEnabled' in ctx) || _imageSmoothingEnabledPropertyNames.some((imageSmoothingEnabledPropertyName) => {
        if(imageSmoothingEnabledPropertyName in ctx) {
            Object.defineProperty(CanvasRenderingContext2D.prototype, 'imageSmoothingEnabled', {
                get: function() {
                    return this[imageSmoothingEnabledPropertyName];
                },
                set: function(value: boolean) {
                    this[imageSmoothingEnabledPropertyName] = value;
                },
                configurable: false,
                enumerable: true
            });
            return true; 
        }
    });
    
    if(!imageSmoothingSupported) {
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'imageSmoothingEnabled', {
            get: function() {
                return false;
            },
            set: function(value: boolean) {
                // ignore
            },
            configurable: false,
            enumerable: true
        });
    }


    var _backingStorePixelRatioPropertyNames = [
        'webkitBackingStorePixelRatio',
        'mozBackingStorePixelRatio',
        'msBackingStorePixelRatio',
        'oBackingStorePixelRatio',
    ];

    export var backingStorePixelRatioSupported = 
    ('backingStorePixelRatio' in ctx) || _backingStorePixelRatioPropertyNames.some((backingStorePixelRatioPropertyName) => {
        if(backingStorePixelRatioPropertyName in ctx) {
            Object.defineProperty(CanvasRenderingContext2D.prototype, 'backingStorePixelRatio', {
                get: function() {
                    return this[backingStorePixelRatioPropertyName];
                },
                set: function(value: number) {
                    this[backingStorePixelRatioPropertyName] = value;
                },
                configurable: false,
                enumerable: true
            });
            return true;
        }
    });
    
    if(!backingStorePixelRatioSupported) {
        Object.defineProperty(CanvasRenderingContext2D.prototype, 'backingStorePixelRatio', {
            get: function() {
                return 1;
            },
            set: function(value: boolean) {
                // ignore
            },
            configurable: false,
            enumerable: true
        });
    }
}

interface CanvasRenderingContext2D {
    imageSmoothingEnabled: boolean;
    backingStorePixelRatio: number;
}
