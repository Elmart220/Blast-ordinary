//Оружие, которое ссылается на нужный метод уничтожения тайлов
export function Weapon(method, isOne) {
    this.method = method;   // - ччылка на метод
    this.isOne = isOne; // - одноразово/многоразово
}
//Класс, содержащий информацию о цвете и координатах тайла в массиве
export function ActTile(x, y, col, isBonus) {
    this.x = x; // - координаты
    this.y = y;
    this.c = col;   // - цвет
    this.isBonus = isBonus
}
