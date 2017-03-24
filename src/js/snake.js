
angular.module('aps_snake', [])

  .controller('snakeController', function ($scope, $timeout, $window) {
    var BOARD_SIZE = 30;

    var DIRECTIONS = {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40
    };

    var COLORS = {
      GAME_OVER: '#820303',
      FRUIT: '#E80505',
      SNAKE_HEAD: '#FFFFFF',
      SNAKE_BODY: '#DADADA',
      BOARD: '#000000'
    };

    var snake = {
      direction: DIRECTIONS.LEFT,
      parts: [{
        x: -1,
        y: -1
      }]
    };

    var fruit = {
      x: -1,
      y: -1
    };

    var interval, tempDirection, isGameOver;

    $scope.score = 0;
	var highscore = readHighscore(document.cookie);
	$scope.highscore = highscore;
	
	function readHighscore(fromCookie) {
		const regex = new RegExp(/([a-zA-Z=]w*)/g)
		const outputString = fromCookie.replace(regex, (match) => {
			return ""
		})
		const outputInt = parseInt(outputString)
		return outputInt
	}

    $scope.setStyling = function (col, row) {
      if (isGameOver) {
        return COLORS.GAME_OVER;
      } else if (fruit.x == row && fruit.y == col) {
        return COLORS.FRUIT;
      } else if (snake.parts[0].x == row && snake.parts[0].y == col) {
        return COLORS.SNAKE_HEAD;
      } else if ($scope.board[col][row] === true) {
        return COLORS.SNAKE_BODY;
      }
      return COLORS.BOARD;
    };

    function update() {
      var newHead = getNewHead();

      if (boardCollision(newHead) || selfCollision(newHead)) {
        return gameOver();
      } else if (fruitCollision(newHead)) {
        eatFruit();
      }

      // Remove tail
      var oldTail = snake.parts.pop();
      $scope.board[oldTail.y][oldTail.x] = false;

      // Pop tail to head
      snake.parts.unshift(newHead);
      $scope.board[newHead.y][newHead.x] = true;

      // Do it again
      snake.direction = tempDirection;
      $timeout(update, interval);
    }

    function getNewHead() {
      var newHead = angular.copy(snake.parts[0]);

      // Update Location
      if (tempDirection === DIRECTIONS.LEFT) {
        newHead.x -= 1;
      } else if (tempDirection === DIRECTIONS.RIGHT) {
        newHead.x += 1;
      } else if (tempDirection === DIRECTIONS.UP) {
        newHead.y -= 1;
      } else if (tempDirection === DIRECTIONS.DOWN) {
        newHead.y += 1;
      }
      return newHead;
    }

    function boardCollision(part) {
      return part.x === BOARD_SIZE || part.x === -1 || part.y === BOARD_SIZE || part.y === -1;
    }

    function selfCollision(part) {
      return $scope.board[part.y][part.x] === true;
    }

    function fruitCollision(part) {
      return part.x === fruit.x && part.y === fruit.y;
    }

    function resetFruit() {
      var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return resetFruit();
      }
      fruit = { x: x, y: y };
    }

    function eatFruit() {
      $scope.score++;

      // Grow by 1
      var tail = angular.copy(snake.parts[snake.parts.length - 1]);
      snake.parts.push(tail);
      resetFruit();

      if ($scope.score % 5 === 0) {
        interval -= 15;
      }
    }

    function gameOver() {
      isGameOver = true;
	  let currentScore = $scope.score;
	  if (currentScore > $scope.highscore) {
		  $scope.highscore = currentScore;
		  document.cookie = "highscore=" + currentScore;
	  }

      $timeout(function () {
        isGameOver = false;
      }, 500);

      setupBoard();
    }

    function setupBoard() {
      $scope.board = [];
      for (var i = 0; i < BOARD_SIZE; i++) {
        $scope.board[i] = [];
        for (var j = 0; j < BOARD_SIZE; j++) {
          $scope.board[i][j] = false;
        }
      }
    }
    setupBoard();

    $window.addEventListener("keyup", function (e) {
      if (e.keyCode == DIRECTIONS.LEFT && snake.direction !== DIRECTIONS.RIGHT) {
        tempDirection = DIRECTIONS.LEFT;
      } else if (e.keyCode == DIRECTIONS.UP && snake.direction !== DIRECTIONS.DOWN) {
        tempDirection = DIRECTIONS.UP;
      } else if (e.keyCode == DIRECTIONS.RIGHT && snake.direction !== DIRECTIONS.LEFT) {
        tempDirection = DIRECTIONS.RIGHT;
      } else if (e.keyCode == DIRECTIONS.DOWN && snake.direction !== DIRECTIONS.UP) {
        tempDirection = DIRECTIONS.DOWN;
      }
    });

    $scope.startGame = function () {
      $scope.score = 0;
      snake = { direction: DIRECTIONS.LEFT, parts: [] };
      tempDirection = DIRECTIONS.LEFT;
      isGameOver = false;
      interval = 150;

      // Set up initial snake
      for (var i = 0; i < 5; i++) {
        snake.parts.push({ x: BOARD_SIZE / 2 + i, y: BOARD_SIZE / 2 });
      }
      resetFruit();
      update();
    };

  });