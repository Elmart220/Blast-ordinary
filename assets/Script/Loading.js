cc.Class({
    extends: cc.Component,

    properties: {
    },


    //Прогружает все спрайты, которые будут меняться в процессе игры:
    loadTileSprites: function() {
        Global.spriteFrames = new Array(Global.spriteUrls.length);
        Global.bonusSpriteFrames = new Array(Global.bonusUrls.length);
        Global.soundClips = new Array(Global.soundUrls.length);
        //Загрузка спрайтов для тайлов:
        for (let i = 0; i < Global.spriteUrls.length; i++) {
            //Загружаем необходимый спрайт:
            cc.loader.loadRes(Global.spriteUrls[i], cc.SpriteFrame, function (err, spriteFrame) {        
                Global.spriteFrames[i] = spriteFrame;
            });
        }
        //Загрузка спрайтов-бонусов для тайлов:
        for (let i = 0; i < Global.bonusUrls.length; i++) {
            //Загружаем необходимый спрайт:
            cc.loader.loadRes(Global.bonusUrls[i], cc.SpriteFrame, function (err, spriteFrame) {        
                Global.bonusSpriteFrames[i] = spriteFrame;
            });
        }
        //Загрузка звуков для тайлов:
        for (let i = 0; i < Global.soundUrls.length; i++) {
            //Загружаем необходимый спрайт:
            cc.loader.loadRes(Global.soundUrls[i], cc.AudioClip, function (err, audio) {        
                Global.soundClips[i] = audio;            
            });
        }
    },

    onLoad: function () {
        //Прогрузка спрайтов:
        this.loadTileSprites();
    },
    start: function() {
        //Загрузка сцены меню:
        cc.director.loadScene("menu");
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
