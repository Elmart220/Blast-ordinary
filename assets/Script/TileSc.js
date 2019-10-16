import {ActTile as ActTile} from "./Details";
import {Weapon as Weapon} from "./Details";

//CC описание:
cc.Class({
    extends: cc.Component,
    //Параметры:
    properties: {
        //Скорость падения:
        moveDuration: 0,
        //Скорость появления/исчезновения:
        scaleDuration: 0,
        //Время, когда тайл исчезнет после окончания игры:
        dontShowTimeRn: 0,
        //Связь с данными игры:
        game: {
            default: null,
            serializable: false
        }
    },
    /* 
        -------------------------------------
        Процесс инициализации тайла:
        -------------------------------------
    */
    //Устанавливает правила отображения (в начале игры):
    setLoad: function(posit, mposit, self) {
        this.game = self;   // - доступ к методам игры
        this.colorCount = this.game.colorCount;
        let color = Math.round(Math.random()*(this.colorCount-1));
        //Позиция и цвет:
        this.tileDat = new ActTile(mposit.x, mposit.y, color, false);
        this.wth = this.game.tileWth; // - ширина
        this.hg = this.game.tileHg;   // - высота
        this.moveStep = this.hg + this.game.dist;   // - единица шага
        this.posit = posit; // - позиция на поле
        this.time = 0;  // - время отчета
        this.weapon = false;
        this.opacit = 0;
        this.rnOpacit = Math.random()*10;
    },
    //Загружает и отображает данный элемент на игровом поле (в начале игры):
    loadSprite: function() {
        this.node.addComponent(cc.Sprite).spriteFrame = Global.spriteFrames[this.tileDat.c]; 
        this.node.width = this.wth; // - задали ширину
        this.node.height = this.hg; // - задали высоту
        this.node.setPosition(this.posit);  // - установили заданную позицию на поле
    },
    //Метод слушателя клика, который сообщает игра, что надо делать просчеты:
    onClick: function() {
        this.game.tileEvent(this.tileDat);
    },
    //При загрузке:
    onLoad: function () {
        //Отодражаем на игровом поле:
        this.loadSprite();
        //Активируем слушатель прикосновения пером:
        this.node.on(cc.Node.EventType.TOUCH_START, this.onClick, this);
    },
    /* 
        -------------------------------
        Процесс поведения тайла в игре:
        -------------------------------
    */
    //Изменяет уже существующий спрайт тайла (в процессе игры):
    setSprite: function() {
        //Если тайл имеет цвет:
        if (this.tileDat.c >= 0) {
            if (this.tileDat.isBonus) {
                //Устанавливаем бонусный спрайт из ранее загруженных:
                this.node.getComponent(cc.Sprite).spriteFrame = Global.bonusSpriteFrames[this.tileDat.c];    
                this.node.width = this.wth; // - задали ширину
                this.node.height = this.hg; // - задали высоту
                this.node.opacity = 255;    // - делаем видимым
            } else {
                //Устанавливаем спрайт из ранее загруженных:
                this.node.getComponent(cc.Sprite).spriteFrame = Global.spriteFrames[this.tileDat.c];    
                this.node.width = this.wth; // - задали ширину
                this.node.height = this.hg; // - задали высоту
                this.node.opacity = 255;    // - делаем видимым
            }
        } else {
            this.node.opacity = 0;  // - делаем невидимым
        }
        this.node.setPosition(this.posit);  // - установили заданную позицию на поле
        this.node.setScale(1, 1);   // - установили исходный размер
    },
    //Анимирует падение на величину s:
    setTileMove: function(s) {
        let smove = cc.moveBy(this.moveDuration/2,cc.v2(0, -s*this.moveStep)).easing(cc.easeCubicActionIn());
        return cc.sequence(smove);
    },
    //Анимирует уменьшение (в процессе игры):
    setTileScale: function() {
        let scal = cc.scaleTo(this.scaleDuration,0, 0);
        return cc.sequence(scal);
    },
    //Анимирует появление (в процессе игры):
    setTileShow: function() {
        let show = cc.scaleTo(this.scaleDuration,1, 1);
        return cc.sequence(show);
    },
    //Анимирует исчезновение спустя некоторое время:
    setTileDontShow: function () {
        let sleep = cc.delayTime(Math.random()*this.dontShowTimeRn);
        let noshow = cc.scaleTo(this.scaleDuration,0, 0);
        return cc.sequence(sleep, noshow);
    },
    //Задает данному тайлу исчезновение (в конце игры):
    tileDonShow: function() {
        this.node.stopAllActions();
        this.node.runAction(this.setTileDontShow());
    },
    //Данный тайл был или нажат, или уничтожен (в процессе игры):
    Clatc: function() {
        //Визуализируем исчезновение:
        this.node.runAction(this.setTileScale());
        this.Animation();
        this.tileDat.isBonus = false;
    },
    //На тайл повлияла гравитация:
    tileRun: function(s) {
        this.node.runAction(this.setTileMove(s));
        this.Animation();
    },
    //Процесс анимации:
    Animation: function() {
        setTimeout(() => {
            if (this.game.isEnabled) {
                //this.node.stopAllActions(); // - останавливаем все движение
                //Если тайл утратил цвет:
                if (this.tileDat.c < 0 && !this.tileDat.isBonus) {
                    //Генерируем ему цвет:
                    let color = Math.round(Math.random()*(this.colorCount-1));
                    this.tileDat.c = color; // - устанавливаем этот цвет
                    this.node.setScale(0, 0);   // - делаем тайл сжатым
                    this.node.runAction(this.setTileShow());  // - запускаем анимацию расширения
                } 
                this.setSprite(); // - меняем спрайт
            } 
        }, (this.moveDuration + this.scaleDuration)*1000);
    },
    toBonus: function(skin, weapon) {
        this.node.setScale(0, 0);   // - установили исходный размер
        setTimeout(() => {
            this.tileDat.isBonus = true;
            this.tileDat.c = skin;
            this.weapon = weapon;
            if (this.game.isEnabled) {
                this.setSprite();
                this.node.setScale(0, 0);   // - установили исходный размер
                this.node.runAction(this.setTileShow());
            }
        },(this.moveDuration + this.scaleDuration)*1000)
    },
    //Обновление кадра:
    update: function (dt) {
        this.opacit += dt;
        this.node.opacity -= 0.2;
        if (this.opacit > this.rnOpacit) {
            this.rnOpacit = Math.random()*10;
            this.opacit = 0;
            this.node.opacity = 255;
        }
    },
});
