cc.Class({
    extends: cc.Component,

    properties: {
        menuEvent: {
            default : null,
            serializable: false
        }
    },
    //Устанавливает правило отображения кнопки:
    setLoad: function(level, posit, self) {
        this.menuEvent = self;  // - связь с меню
        this.levelNumber = level;   // - номер уровня
        this.posit = posit; // - позиция
    },
    //Событие клика по кнопке:
    click: function() {
        this.menuEvent.btLevelClick(this.levelNumber);    // - высов нужного уровня
    },
    //При отображении:
    onLoad: function () {
        this.node.setPosition(this.posit);
        this.node.getComponent(cc.Label).string = this.levelNumber + 1;
    },
});
