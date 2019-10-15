/*
    Файл логика игры
*/
import {Weapon as Weapon} from "./Details";

//Стек зафиксированных тайлов (точнее их цвет и положение в матрице):
const fixTileStack = [];

//CC описание:
cc.Class({
    extends: cc.Component,
    //Параметры игры:
    properties: {
        //Цена бустера "Бомба":
        bombPrice: 0,
        //Цена бустера "Перемешать":
        randPrice: 0,
        //Цена бустера "Переключающий цвет":
        colorPrice: 0,
        bombRadius: 0,
        //Дисплеи:
        //Оставшиеся шаги:
        freeStepDisplay: {
            default: null,
            type: cc.Label 
        },
        //Очки:
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        //Деньги:
        moneyDisplay: {
            default: null,
            type: cc.Label
        },
        //Минимальная группа:
        groupDisplay: {
            default: null,
            type: cc.Label
        },
        //Цена бустера "Бомба":
        bombPriceDisplay: {
            default: null,
            type: cc.Label
        },
        //Цена бустера "Перемешать":
        randPriceDisplay: {
            default: null,
            type: cc.Label
        },
        //Цена бустера "Переключающий цвет":
        colorPriceDisplay: {
            default: null,
            type: cc.Label
        },
        //Префаб тайла:
        tilePrefab: {
            default: null,
            type: cc.Prefab
        },
        //Игровое поле:
        playArea: {
            default: null,
            type: cc.Node
        },
        //Полоса успеха:
        progressBar: {
            default: null,
            type: cc.Node
        },
        //Сообщение о проигрыше или победе:
        gameStady: {
            default: null,
            type: cc.Label
        },
        //Кнопка перезагрузки данной сцены (видна в момент проигрыша/победы):
        btReload: {
            default: null,
            type: cc.Node
        },
        //Кнопка заново:
        btRel: {
            default: null,
            type: cc.Node
        },
        //Кнопка малое меню:
        btMenu: {
            default: null,
            type: cc.Node
        },
        //Кнопка главное меню:
        btMain: {
            default: null,
            type: cc.Node
        },
        paySound: {
            default: null,
            url: cc.AudioClip
        },
    },
    /* 
        -------------------------------------
        Процесс инициализации всех элементов:
        -------------------------------------
    */
    //Отображает на дисплеях все необходимые значения:
    showDisplays: function() {
        this.freeStepDisplay.string = this.steps;
        this.scoreDisplay.string = "0";
        this.bombPriceDisplay.string = this.bombPrice;
        this.randPriceDisplay.string = this.randPrice;
        this.colorPriceDisplay.string = this.colorPrice;
        this.moneyDisplay.string = Global.money;
        this.groupDisplay.string = this.clatcCount;
    },
    //Определяет все необходимые параметры, которые пригодятся в процессе игры:
    loadParams: function() {
        this.isHold = false;    // - блокировка пользовательских действий
        this.isEnabled = true;  // - игра активна
        this.matrix = [];   // - массив тайлов (никогда не изменяется после заполнения)
        this.score = 0; // - набранные очки
        this.btReload.opacity = 0;  // - делаем кнопку (Еще раз/Продолжить) невидимой
        this.btReload.getComponent(cc.Button).interactable = false;  // - и не активной
        this.win = false;   // - состояние победы
        this.gameStady.node.opacity = 0;    // - сообщение о победе/проигрыше
        this.weapon = new Weapon(this.floodFill, false);    // - перо уничтожения по умолчанию
        this.bonusTile = [cc.p(-1, -1), 0];    // - место появления бонусного тайла
        this.progressing = 0;   // - для плавного движения полосы успеха
        this.pausBt = false;    // - кнопка паузы не нажата
        this.btRel.setScale(0,0);   // - убираем кнопки малого меню
        this.btMain.setScale(0,0);  // - убираем кнопки малого меню
        this.bonusChance = false;
        //Текущий уровень:
        this.level = Global.level;
        //Необщодимое число очков для победы:
        this.scoreCount = Global.missing[this.level][0];
        //Оставшиеся шаги:
        this.steps = Global.missing[this.level][1];
        //Набор цветов:
        this.colorCount = Global.missing[this.level][2];
        //Минимальная длина группы разбиения:
        this.clatcCount = Global.missing[this.level][3];
        //Число столбцов:
        this.colCount = Global.missing[this.level][4];
        //Число строк:
        this.rowCount = Global.missing[this.level][5];
        //Отступы снизу и сверху игрового поля:
        this.marBotTop = this.playArea.getComponent("GamePoleParams").marginTB;
        //Отступы слева и справа:
        this.marLeftRight = this.playArea.getComponent("GamePoleParams").marginLR;
        //Расстояния между тайлами:
        this.dist = this.playArea.getComponent("GamePoleParams").distance;
        //Ширина тайла согласно данным выше:
        this.tileWth = (this.playArea.width - (this.colCount - 1)*this.dist - 2*this.marLeftRight)/this.colCount;
        //Высота тайла:
        this.tileHg = (this.playArea.height - (this.rowCount - 1)*this.dist - 2*this.marBotTop)/this.rowCount;
    },
    //Создает тайл в указанном месте и вносит ссылку на него в массив ссылок тайлов:
    spawnTiles: function() {
        //Для заданного числа строк и столбцов помещаем тайлы в ячейки:
        for (let i = 0; i < this.rowCount; i++) {
            this.matrix.push([]);    // - новая строка в матрице ссылок на тайлы
            for (let j = 0; j < this.colCount; j++) {
                //Создаем новый тайл:
                let newTile = cc.instantiate(this.tilePrefab);
                //Задаем позицию тайлу:
                let posit = cc.p(this.marLeftRight + this.tileWth/2 + (j*(this.tileWth + this.dist)), 
                                 this.marBotTop + this.tileHg/2 + i*(this.tileHg + this.dist));
                //Устанавливаем параметры его отображения:
                newTile.getComponent("TileSc").setLoad(posit, cc.p(j,i), this);
                //Добавляем тайл в дерево узлов (отображаем его):
                this.playArea.addChild(newTile);
                //Добавояем ссылку на тайл в массив:
                this.matrix[i].push(newTile);
            }
        }
    },
    //Загрузка содержимого:
    onLoad: function () {
        //Загружаем все необходимые параметры игры:
        this.loadParams();
        //Отображаем стартовую информацию на дисплеях:
        this.showDisplays();
        //Создаем необходимое количество тайлов для игры:
        this.spawnTiles();
        //Устанавливаем полосу успеха в ноль:
        this.setProgress(0);
    },
    /* 
        ----------
        Слушатели:
        ----------
    */
    //Выполняет действия относительно нажатого тайла:
    tileEvent: function(tileDat) {
        //Если действия пользователя не игнорируются и игра активна:
        if (!this.isHold && this.isEnabled) {
            this.isHold = true; // - блокируем действия пользователя
            let tile = this.matrix[tileDat.y][tileDat.x].getComponent("TileSc");
            //Если нажатый тайл бонусный:
            if (tileDat.isBonus) {
                //То усиливаем оружие:
                this.weapon = tile.weapon;
            }
            //Заливаем воображаемые цвета тайлов:
            this.weapon.method(cc.p(tileDat.x, tileDat.y), this);    // - вызываем метод текущего оружия
            //После процедуры заливки активирует необходимые тайлы:
            this.startClatcTile();
            //Если данное оружие одноразовое (бонусное):
            if (this.weapon.isOne) {
                //То ставим обычное оружие:
                this.weapon = new Weapon(this.floodFill, false);
            } else {
                //В противном случае есть вероятность, что тайл станет бонусным:
                this.bonusChance = true;
            }
            //После активации тайлов некоторые исчезли. Имитируем гравитацию:
            this.tileGrawity();
            //Обновляем состояние игры:
            this.gameControl();
            this.time = 0;  // - сбрасываем время
            
            setTimeout(() => {
                this.isHold = false;
            }, (tile.moveDuration + 2*tile.scaleDuration)*1000);
        }
    },
    btPauseClick: function() {
        if (this.pausBt) {
            this.btRel.runAction(this.setBtScale(true));
            this.btMain.runAction(this.setBtScale(true));
            this.pausBt = false;
            this.isEnabled = true;
        } else {
            this.btRel.runAction(this.setBtScale(false));
            this.btMain.runAction(this.setBtScale(false));
            this.pausBt = true;
            this.isEnabled = false;
        }
    },
    btRelClick: function() {
        cc.director.loadScene("game");
    },
    btMainClick: function() {
        cc.director.loadScene("menu");
    },
    //Кнопка покупки бомбы:
    btBombClick: function() {
        this.pay(this.bombPrice, new Weapon(this.bomb, true));
    },
    //Кнопка покупки всецветного:
    btColorisClick: function() {
        this.pay(this.colorPrice, new Weapon(this.coloris, true));
    },
    //Кнопка покупки перемешивания:
    btRandClick: function() {
        if (Global.money >= this.randPrice) {
            Global.money -= this.randPrice; // - делаем покупку
            this.randTiles(cc.p(0,0), this);    // - перемешиваем поле
            this.upAllDisplays(); // - обновляем дисплеи
            cc.audioEngine.playEffect(this.paySound, false);
        }
        
    },
    //Покупка бонуса:
    pay: function(price, weapon) {
        //Если в данный момент стоит обычное оружие и достаточно средств:
        if (!this.weapon.isOne && Global.money >= price) {
            Global.money -= price; // - делаем покупку
            this.weapon = weapon;    // - ставим бонусное оружие
            this.upAllDisplays(); // - обновляем дисплеи
            cc.audioEngine.playEffect(this.paySound, false);
        }
    },
    //Плавное появление и исчезновение кнопок:
    setBtScale: function(sk) {
        if (sk) {
            let noshow = cc.scaleTo(0.1,0, 0);
            return cc.sequence(noshow);
        } else {
            let noshow = cc.scaleTo(0.1,1, 1);
            return cc.sequence(noshow);
        }
        
    },
    /* 
        -------------------------------------
        Методы, управляющие игровым процессом:
        -------------------------------------
    */
    //Делает шаг:
    nextStep: function(points) {
        this.score += points;  // - увеличиваем очки на заданное число
        this.steps--;   // - отнимаем свободный шаг
    },
    //Устанавливает полосу успеха в заданное значение:
    setProgress(val) {
        let value = (val > 1)? 1: val;  // - значение не больше единицы
        this.progressBar.getComponent(cc.ProgressBar).progress = value; // - отображаем успех
        this.progressBar.getComponent("Progress").setProgressy(value);    // - перемещаем кончик полосы
    },
    //Устанавливает очки на дисплее:
    upAllDisplays: function() {
        this.scoreDisplay.string = this.score;
        this.freeStepDisplay.string = this.steps;
        this.moneyDisplay.string = Global.money;
    },
    //Состояние проигрыша:
    gameOver: function() {
        this.gameStady.string = "ВЫ ПРОИГРАЛИ!";    // - установили надпись сообщения
        this.gameStady.node.opacity = 255;  // - сделали его видимым
        this.isHold = true; // - заморозили действия пользователя
        this.isEnabled = false; // - игра стала не активной
        this.hideTile();  // - запустили процесс плавного исчезновения тайлов
        this.btReload.getComponent(cc.Label).string = "ЕЩЕ РАЗ";    // - задали надпись кнопке перезагрузки
        this.btReload.opacity = 255;    // - сделали её видимой
        this.btReload.getComponent(cc.Button).interactable = true;  // - и активной
    },
    gameWin: function() {
        this.gameStady.string = "ВЫ ПОБЕДИЛИ!"  // - установили надпись сообщения
        this.gameStady.node.opacity = 255;  // - сделали его видимым
        this.isHold = true; // - заморозили действия пользователя
        this.isEnabled = false; // - игра стала не активной
        this.hideTile();  // - запустили процесс плавного исчезновения тайлов
        this.win = true;    // - игра с победой
        this.btReload.getComponent(cc.Label).string = "ПРОДОЛЖИТЬ"; // - задали надпись кнопке перезагрузки
        this.btReload.opacity = 255;    // - сделали её видимой
        this.btReload.getComponent(cc.Button).interactable = true;  // - и активной
    },
    //Событие клика по кнопке "Еще раз/Продолжить":
    btContClick: function() {
        if (this.win) {
            //Если победа:
            Global.level++; // - переходим на следующий уроветь
            let dscore = Math.round(this.score/(this.rowCount + this.colCount));
            let freescore = this.score - this.scoreCount;
            Global.money += (dscore + freescore);   // - добавляем деньги
        }
        if (Global.level >= Global.missing.length) {
            cc.director.loadScene("menu");  // - открываем меню
        } else {
            cc.director.loadScene("game");  // - перезапускаем данную сцену
        }
        
    },
    /* 
        Управление тайлами (визуализация)
    */
    //Плавное исчезновение тайлов (в конце игры):
    hideTile: function() {
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < this.matrix[i].length; j++) {
                this.matrix[i][j].getComponent("TileSc").tileDonShow();
            }
        }
    },
    //Воспроизведение разрушения тайлов:
    tileSound: function() {
        let s = Math.round(cc.random0To1()*(Global.soundUrls.length-1));
        cc.audioEngine.playEffect(Global.soundClips[s], false);
    },
    //Устанавливает тайлу бонус и скин:
    setBonus: function(skin, weapon) {
        let bonus = this.matrix[this.bonusTile[0].y][this.bonusTile[0].x].getComponent("TileSc");
        bonus.toBonus(skin, weapon);
    },
    /*
        Обновление кадра:
    */
    update: function (dt) {
        if (this.progressing < this.score) {
            this.progressing += this.scoreCount/300;
            this.setProgress(this.progressing/this.scoreCount);
        }
    },
    /* 
        ----------------------
        Вспомагательные методы
        ----------------------
    */
    //Меняет характеристики тайлов местами:
    tilesReplece: function (t1, t2) {
        //Меняет цвет, оружие и бонусность у двух указанных тайлов:
        let color = t1.getComponent("TileSc").tileDat.c;
        let bonus = t1.getComponent("TileSc").tileDat.isBonus;
        let weapon = Object.assign({}, t1.getComponent("TileSc").weapon);
        t1.getComponent("TileSc").tileDat.c = t2.getComponent("TileSc").tileDat.c;
        t1.getComponent("TileSc").tileDat.isBonus = t2.getComponent("TileSc").tileDat.isBonus;
        t1.getComponent("TileSc").weapon = t2.getComponent("TileSc").weapon;
        t2.getComponent("TileSc").tileDat.c = color;
        t2.getComponent("TileSc").tileDat.isBonus = bonus;
        t2.getComponent("TileSc").weapon = weapon;
    },
    /* 
        -----------
        Логика игры
        -----------
    */
    //Физика падения тайлов (логическая перестановка):
    tileGrawity: function() {
        //Ссылка на необходимые данные тайла:
        let ind = (x,y) => (this.matrix[x][y].getComponent("TileSc").tileDat);
        //Берем каждый столбец матрицы:
        for (let i = 0; i < this.colCount; i++) {
            let start = 0;  // - метка начала (ищет первый пустой тайл)
            let end = 0;    // - метка конца (ищет первый закрашенный тайл)
            //Пока начало не достигло верхней части столбца:
            while (start < this.rowCount) {
                //Если тайл в данном сегменте не имеет цвет:
                if (ind(start,i).c < 0) {
                    //Берем в столбце позицию выше:
                    end = start + 1;
                    //И начинаем искать первый попавшийся тайл с цветом:
                    while (end < this.rowCount) {
                        //Если мы его обнаружили:
                        if (ind(end,i).c >= 0) {
                            //Меняем тайлы местами:
                            this.matrix[end][i].getComponent("TileSc").tileRun(end - start);
                            this.matrix[start][i].getComponent("TileSc").tileRun(0);
                            this.tilesReplece(this.matrix[start][i], this.matrix[end][i]);
                            break;
                        }
                        end++;
                    }
                }
                start++;
            };
        }
    },
    //Контролирует игровой процесс:
    gameControl: function() {
        if (this.bonusChance) {
            this.getBonusTile();
            this.bonusChance = false;
        }
        this.upAllDisplays();    // - обновляет значения на дисплеях
        //Проверка событий проигрыша и выигрыша:
        if (this.score >= this.scoreCount) {
            this.gameWin();
        } else if (this.steps <= 0) {
            this.gameOver();
        }
    },
    //Проверяет возможно бонусный тайл:
    getBonusTile: function() {
        if (this.bonusTile[1] > 30) {
            this.setBonus(0, new Weapon(this.atomBomb, true));
        } else if (this.bonusTile[1] > 15) {
            this.setBonus(1, new Weapon(this.bomb, true));
        } else if (this.bonusTile[1] > 7) {
            if (cc.random0To1() > 0.5) {
                this.setBonus(2, new Weapon(this.rowFill, true));
            } else {
                this.setBonus(3, new Weapon(this.colFill, true));
            }
        }
    },
    //Фиксирует указанный тайл:
    fixTile: function(point) {
        //Получаем необходимую информацию (положение в матрице и цвет):
        var dtile = this.matrix[point.y][point.x].getComponent("TileSc").tileDat;
        //Добавляем эту информацию в стек:
        fixTileStack.push(Object.assign({},dtile));
        //Задаем цвет данному тайлу пустым (алгоритм заливки перестанет его видеть:
        dtile.c = -1;
    },
    //Пробегает список заинтересованных тайлов и делает необходимые действия:
    startClatcTile: function() {
        this.bonusTile[1] = 0;  // - сбросили очки для бонуса
        //Если его длина больше минимальной:
        if (fixTileStack.length >= this.clatcCount) {
            this.nextStep(fixTileStack.length);   // - делаем шаг
            this.bonusTile[0] = fixTileStack[0];   // - координаты возможно бонусного тайла
            this.bonusTile[1] = fixTileStack.length;   // - бонусность тайла
            //Перебираем стек и активируем тайлы:
            while (fixTileStack.length > 0) {
                let ft = fixTileStack.pop();    // - взяли из него реквизиты тайла
                //Активировали сам тайл по реквизитам:
                this.matrix[ft.y][ft.x].getComponent("TileSc").Clatc();
            } 
            this.tileSound(); // - воспроизводим звук
        } else {
            //В противном случае перебираем стек и возвращаем тайлам удаленный цвет:
            while (fixTileStack.length > 0) {
                let ft = fixTileStack.pop();    // - берем элемент из стека
                //Закрашиваем соответствующим цветом в матрице:
                this.matrix[ft.y][ft.x].getComponent("TileSc").tileDat.c = ft.c;  
            }
            this.isHold = false;
        }
    },
    //Алгоритм заливки тайлов (стандартный бустер):
    floodFill: function(point, self) {
        const stack = [];   // - стек координат заинтересованных тайлов
        //Получаем цвет указанного тайла (с этим цветом будут сравнения в дальнейшем):
        var color = self.matrix[point.y][point.x].getComponent("TileSc").tileDat.c;
        //Если этот цвет не -1:
        if (color >= 0) {
            //Добавим данный элемент в стек и начнем процедуру заливки:
            stack.push(point);  
            //Пока стек содержит элементы:
            while (stack.length > 0) {
                var tpoint = stack.pop();   // - взяли последний элемент
                //Если данная точка принадлежит матрице:
                if (self.inMatrix(tpoint)) {
                    let dcolor = self.matrix[tpoint.y][tpoint.x].getComponent("TileSc").tileDat.c;
                    let bonus = self.matrix[tpoint.y][tpoint.x].getComponent("TileSc").tileDat.isBonus;
                    //Если его цвет совпал с нужным:
                    if (color === dcolor && !bonus) {
                        self.fixTile(tpoint); // - помечаем тайл
                        //Добавляем в стек 4 прилегающих тайла:
                        stack.push(cc.p(tpoint.x + 1, tpoint.y));
                        stack.push(cc.p(tpoint.x, tpoint.y + 1));
                        stack.push(cc.p(tpoint.x - 1, tpoint.y));
                        stack.push(cc.p(tpoint.x, tpoint.y - 1));
                    } else {
                        //При выходе за пределы массива:
                        continue;
                    }
                }
            }
        }
    },
    //Алгоритм заливки указанной строки (бонусный бустер):
    rowFill: function(point, self) {
        for (let i = 0; i < self.rowCount; i++) {
            self.fixTile(cc.p(i, point.y));
        }
    },
    //Алгоритм заливки указанного столбца (бонусный бустер):
    colFill: function(point, self) {
        for (let i = 0; i < self.colCount; i++) {
            self.fixTile(cc.p(point.x, i));
        }
    },
    //Алгоритм уничтожения всех тайлов (бонусный бустер):
    atomBomb: function(point, self) {
        for (let i = 0; i < self.rowCount; i++) {
            for (let j = 0; j < self.colCount; j++) {
                self.fixTile(cc.p(i, j));
            }
        }
    },
    //Алгоритм уничтожения всех тайлов в заданном радиусе (бонусный бустер):
    bomb: function(point, self) {
        for (let i = point.x - self.bombRadius; i <= point.x + self.bombRadius; i++) {
            let j = 0;
            let kat = Math.sqrt(Math.pow(self.bombRadius, 2) - Math.pow(point.x - i, 2));
            while (j <= kat) {
                if (self.inMatrix(cc.p(i, point.y + j))) {
                    self.fixTile(cc.p(i, point.y + j));
                }
                if (self.inMatrix(cc.p(i, point.y - j))) {
                    self.fixTile(cc.p(i, point.y - j));
                }
                j++;
            }
        }
    },
    //Алгоритм перемешывания тайлов (бонусный бустер):
    randTiles: function(point, self) {
        let tl = (x, y) => (self.matrix[x][y].getComponent("TileSc").tileDat);
        //Пробегаем половину матрицы (другая половина будет меняться с текущей):
        for (let i = 0; i < self.rowCount/2; i++) {
            for (let j = 0; j < self.colCount; j++) {
                //Берем случайный тайл из второй половины:
                let randx = Math.round(self.rowCount/2+ cc.random0To1()*(self.rowCount - 1)/2);
                //Берем тайл из любой колонки:
                let randy = Math.round(cc.random0To1()*(self.colCount - 1));
                //Меняем местами цвета, оружие и бонусность случайного и текущего тайла:
                this.tilesReplece(self.matrix[i][j], self.matrix[randx][randy]);
                self.matrix[i][j].getComponent("TileSc").setSprite();
                self.matrix[randx][randy].getComponent("TileSc").setSprite();
            }
        }
    },
    //Алгоритм всецветного тайлов (бонусный бустер /в задании не было):
    coloris: function(point, self) {
        for (let i = 0; i < self.colorCount; i++) {
            self.matrix[point.y][point.x].getComponent("TileSc").tileDat.c = i;
            self.floodFill(point, self);
        }
    },
    //Определяет принадлежность точки матрице:
    inMatrix: function(point) {
        if (point.x < 0 || point.x >= this.colCount) {
            return false;
        }
        if (point.y < 0 || point.y >= this.rowCount) {
            return false;
        }
        return true;
    },
});
