//Сцена - меню:

cc.Class({
    extends: cc.Component,

    properties: {
        levels: {
            default: null,
            type: cc.Prefab
        },
        menuPane: {
            default: null,
            type: cc.Node
        }
    },
    //Загружает первый уровень при клике на старт:
    btStartClick: function() {
        if (Global.level < Global.missing.length) {
            cc.director.loadScene("game");
        } else {
            Global.level = 0;
            cc.director.loadScene("game");
        }
        
    },
    //Нажатие на кнопку меню уровней:
    btLevels: function() {
        if (this.levelsShow) {
            this.menuPane.runAction(this.setScaleDown());
            this.levelsShow = false;
        } else {
            this.menuPane.runAction(this.setScaleUp());
            this.levelsShow = true;
        }
    },
    //Показать меню уровней:
    setScaleUp: function() {
        let show = cc.scaleTo(0.3, 1, 1);
        return cc.sequence(show);
    },
    //Спрятать меню уровней:
    setScaleDown: function() {
        let noshow = cc.scaleTo(0.3, 0, 0);
        return cc.sequence(noshow);
    },
    //Загружает нужный уровень:
    btLevelClick: function(level) {
        Global.level = level;
        cc.director.loadScene("game");
    },
    //Расставляет кнопки в зависимости от уровней:
    spavnButtons: function() {
        let y = 40;
        let x = -this.menuPane.width/2.3;
        for (let i = 0; i < Global.missing.length; i++) {
            if (x > this.menuPane.width/2.3) {
                x = -this.menuPane.width/2.3;
                y -= 30;
            }
            let btLevel = cc.instantiate(this.levels);
            btLevel.getComponent(cc.Label).string = i;
            btLevel.getComponent("LevelButton").setLoad(i, cc.p(x, y), this);
            this.menuPane.addChild(btLevel);
            x += 30;
        }
    },
    //При загрузке:
    onLoad: function () {
        this.levelsShow = false;
        this.spavnButtons();
    },
});
