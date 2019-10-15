window.Global = {
    spriteUrls: ["tiles/star1", "tiles/star2", "tiles/star3", "tiles/star4", "tiles/star5"],
    spriteFrames: [],
    bonusUrls: ["tiles/bonus/atom", "tiles/bonus/bomb", "tiles/bonus/hor", "tiles/bonus/vert"],
    bonusSpriteFrames: [],
    soundUrls: ["sound/Tile", "sound/Tile1", "sound/Tile2"],
    soundClips: [],
    money: 100,
    level: 0,
    missing: [[100, 50, 2, 1, 4, 4], 
                [100, 50, 3, 2, 5, 5],
                [200, 30, 3, 2, 7, 7],
                [300, 30, 4, 3, 10, 10],
                [1000, 20, 2, 5, 10, 10],
                [2000, 30, 2, 2, 20, 20],
                [500, 80, 5, 5, 10, 10],
                [1000, 50, 5, 2, 7, 7],
                [1000, 20, 3, 2, 5, 5],
                [1500, 60, 5, 1, 10, 10],
                [7000, 100, 3, 2, 15, 15],
                [1000, 80, 5, 1, 7, 7],
                [1000, 30, 5, 3, 10, 10],
                [1000, 30, 5, 2, 10, 10],
                [50000, 100, 2, 10, 30, 30],
                [1000, 70, 5, 2, 10, 10],
                [10000, 50, 3, 2, 30, 30]]
};
/*
    missing: 
    0. Нужное число очков, 
    1. Доступные шаги, 
    2. кол-во цветов, 
    3. длина группы, 
    4. ширина, 
    5. высота.
*/