cc.Class({
    extends: cc.Component,
    properties: {
        //Конец шкалы успеха:
        progressEnd: {
            default: null,
            type: cc.Node
        },
        //Линия шкалы успеха:
        progressLine: {
            default: null,
            type: cc.Node
        }
    },
    //Устанавливает положение кончика шкалы успеха:
    setProgressy: function(val) {
        let xline = this.progressLine.x;
        let total = this.getComponent(cc.ProgressBar).totalLength;
        this.progressEnd.x = xline + total*val;
    }

    // use this for initialization
    /*onLoad: function () {

    },*/

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
