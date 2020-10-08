// Настройка «холста»
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
// Получаем ширину и высоту элемента canvas
var width = canvas.width;
var height = canvas.height;
// Вычисляем ширину и высоту в ячейках
var blockSize = 20;
var widthInBlocks = width / blockSize;
var heightInBlocks = height / blockSize;
// Устанавливаем счет 0
var score = 0;

// Рисуем рамку
var drawBorder = function () {
  ctx.fillStyle = "Black";

  ctx.fillRect(0, 0, width, blockSize);
  ctx.fillRect(0, height - blockSize, width, blockSize);
  ctx.fillRect(0, 0, blockSize, height);
  ctx.fillRect(width - blockSize, 0, blockSize, height);

  //рисуем сетку внутри холста
  for (var x = 1; x < 640; x += 20) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 640);
  }
  for (var y = 1; y < 640; y += 20) {
    ctx.moveTo(0, y);
    ctx.lineTo(640, y);
  }
  ctx.strokeStyle = "rgba(5, 2, 2, 0.4)";
  ctx.stroke();
};

// Выводим счет игры в левом верхнем углу
var drawScore = function () {
  ctx.font = "40px Bold";
  ctx.fillStyle = "Red";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Счет: " + score, blockSize, blockSize);
};

// Отменяем действие setInterval и печатаем сообщение «Конец игры»
var gameOver = function () {
  clearInterval(intervalId);
  ctx.font = "60px Bold";
  ctx.fillStyle = "Red";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Конец игры", width / 2, height / 2);
};
//ЧАСТЬ 2
// Рисуем окружность
function circle(x, y, radius, fillCircle) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  if (fillCircle) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
}
// Задаем конструктор Block (ячейка)
function Block(col, row) {
  this.col = col; //столбец
  this.row = row; //строка
}

/*добавление метода drawSquare к Block.prototype, делает
 *его доступным для всех объектов-ячеек.
 *Рисуем квадрат в позиции ячейки*/
Block.prototype.drawSquare = function (color) {
  var x = this.col * blockSize; //вычисление значения координаты x
  var y = this.row * blockSize; //вычисление значения координаты y
  //присваиваем свойству контекста рисования fillStyle значение цвета,
  //переданное в аргументе color
  ctx.fillStyle = color;
  //вызываем метод ctx.fillRect, передавая ему вычисленные значения x и y, а также blockSize
  //в качестве ширины и высоты прямоугольника.
  ctx.fillRect(x, y, blockSize, blockSize);
};

// Рисуем круг в позиции ячейки
Block.prototype.drawCircle = function (color) {
  //вычисление координат центра окружности
  //умножаем свойства col и row на blockSize и прибавляем blockSize / 2,
  //поскольку нам нужны координаты центра окружности, который находится в середине ячейки
  var centerX = this.col * blockSize + blockSize / 2;
  var centerY = this.row * blockSize + blockSize / 2;
  ctx.fillStyle = color;
  circle(centerX, centerY, blockSize / 2, true);
};
// Проверяем, находится ли эта ячейка в той же позиции, что и ячейка
// otherBlock
Block.prototype.equal = function (otherBlock) {
  return this.col === otherBlock.col && this.row === otherBlock.row;
};

// Задаем конструктор Snake (змейка)
var Snake = function () {
  this.segments = [new Block(7, 5), new Block(6, 5), new Block(5, 5)];
  this.direction = "right";
  this.nextDirection = "right";
};
// Рисуем квадратик для каждого сегмента тела змейки
Snake.prototype.draw = function () {
  for (var i = 0; i < this.segments.length; i++) {
    this.segments[i].drawSquare("Blue");
  }
};
//Проверка метода snake.draw()
var snake = new Snake();
// Создаем новую голову и добавляем ее к началу змейки,
// чтобы передвинуть змейку в текущем направлении
Snake.prototype.move = function () {
  var head = this.segments[0];
  var newHead;
  this.direction = this.nextDirection;
  if (this.direction === "right") {
    newHead = new Block(head.col + 1, head.row);
  } else if (this.direction === "down") {
    newHead = new Block(head.col, head.row + 1);
  } else if (this.direction === "left") {
    newHead = new Block(head.col - 1, head.row);
  } else if (this.direction === "up") {
    newHead = new Block(head.col, head.row - 1);
  }
  if (this.checkCollision(newHead)) {
    gameOver();
    return;
  }
  this.segments.unshift(newHead);
  if (newHead.equal(apple.position)) {
    score++;
    apple.move();
  } else {
    this.segments.pop();
  }
};

// Проверяем, не столкнулась ли змейка со стеной или собственным телом
Snake.prototype.checkCollision = function (head) {
  var leftCollision = head.col === 0; //проверяем не столкнулась ли змейка с левой стеной
  var topCollision = head.row === 0; //столкновение с верхней стеной
  var rightCollision = head.col === widthInBlocks - 1; //с правой стеной
  var bottomCollision = head.row === heightInBlocks - 1; //с нижней стеной

  //определяем, столкнулась ли змейка с какой-нибудь из стенок
  var wallCollision =
    leftCollision || topCollision || rightCollision || bottomCollision;

  //проверяем, не столкнулась ли змейка с собственным телом
  var selfCollision = false;

  //используем цикл for для перебора всех сегментов змеиного тела
  for (var i = 0; i < this.segments.length; i++) {
    //проверяем не находится ли какой-нибудь из сегментов в той же позиции, что и новая голова змейки
    if (head.equal(this.segments[i])) {
      /*Если обнаружится, что какой-либо из сегментов тела находится там же, где голова, 
	значит змейка столкнулась сама с собой, и тогда присваиваем selfCollision значение true*/
      selfCollision = true;
    }
  }
  /*если змейка столкнулась либо со стенкой, либо сама с собой,то возвращаем из метода 
wallCollision ||selfCollision  выражение  true */
  return wallCollision || selfCollision;
};

// Преобразуем коды клавиш в направления
var directions = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
};

/*задаем обработчик для событий keydown внутри элемента body. Этот обработ-
чик будет вызываться всякий раз, когда пользователь нажмет клавишу*/
// Задаем обработчик события keydown (клавиши-стрелки)
$("body").keydown(function (event) {
  var newDirection = directions[event.keyCode];
  /*сравниваем переменную newDirection с undefined и, если она не равна undefined, 
вызываем метод объекта-змейки setDirection, передавая ему строку newDirection*/
  if (newDirection !== undefined) {
    snake.setDirection(newDirection);
  }
});

// Задаем следующее направление движения змейки на основе нажатой клавиши
Snake.prototype.setDirection = function (newDirection) {
  /*если змейка движется вверх (this.direction равняется "up"), а игрок нажал стрелку вниз
(newDirection равняется "down"), мы должны совершить досрочный выход из метода с помощью return.*/
  if (this.direction === "up" && newDirection === "down") {
    return;
  } else if (this.direction === "right" && newDirection === "left") {
    return;
  } else if (this.direction === "down" && newDirection === "up") {
    return;
  } else if (this.direction === "left" && newDirection === "right") {
    return;
  }
  //Если направление newDirection является допустимым,то  присваиваем его свойству nextDirection в строке
  this.nextDirection = newDirection;
};

// Задаем конструктор Apple (яблоко)
var Apple = function () {
  this.position = new Block(10, 10);
};

// Рисуем кружок в позиции яблока
Apple.prototype.draw = function () {
  this.position.drawCircle("LimeGreen");
};

//Проверка работы метода draw
var apple = new Apple();

// Перемещаем яблоко в случайную позицию
Apple.prototype.move = function () {
  var randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
  var randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
  this.position = new Block(randomCol, randomRow);
};
// Создаем объект-змейку и объект-яблоко
var snake = new Snake();

// Запускаем функцию анимации через setInterval
var intervalId = setInterval(function () {
  ctx.clearRect(0, 0, width, height);
  drawScore();
  snake.move();
  snake.draw();
  // apple.move();//проверка работы метода move
  apple.draw(); //проверка работы метода draw
  drawBorder();
}, 100);
