
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
      FRUIT: '#79D783',
      SNAKE_HEAD: '#6F6F6F',
      SNAKE_BODY: '#FFFFFF',
      BOARD: '#000000',
	  EGG: '#FFF5C3',
	  BLUEBERRY: '#064FBA', 
	  BANANA: '#FFE135',
	  GRAPES: '#421C52',
	  EXTRALIFE: '#E80505',
	  ROTTENFRUIT: '#A0522D'
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
	
	var egg = {
      x: -1,
      y: -1
    };
	
	var blueberry = {
		x: -1,
		y: -1
	};
	
	var banana = {
		x: -1,
		y: -1
	};
	
	var grapes = {
		x: -1,
		y: -1
	};
	
	var extraLife = {
		x: -1,
		y: -1
	};
	
	var rottenFruit = {
		x: -1,
		y: -1
	};

    var interval, tempDirection, isGameOver;
	var  levelAims = [2,3,4,5,6];
	var levelCountdown = [2,4,6,8,10];
    if (document.cookie === undefined) document.cookie = "highscore=0"
    $scope.score = 0;
    $scope.highscore = readHighscore(document.cookie);
	$scope.level =1;
    $scope.fruitCount = 0;
	$scope.levelAim = levelAims[$scope.level - 1];
	$scope.currentCountdown = levelCountdown[0];

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
      } else if (egg.x == row && egg.y == col) {
        return COLORS.EGG;
      } else if (blueberry.x == row && blueberry.y == col) {
        return COLORS.BLUEBERRY;
      } else if (banana.x == row && banana.y == col) {
        return COLORS.BANANA;
	  } else if (grapes.x == row && grapes.y == col) {
        return COLORS.GRAPES;
	  } else if (extraLife.x == row && extraLife.y == col) {
        return COLORS.EXTRALIFE;
	  } else if (rottenFruit.x == row && rottenFruit.y == col) {
        return COLORS.ROTTENFRUIT;
	  } else if (snake.parts[0].x == row && snake.parts[0].y == col) {
        return COLORS.SNAKE_HEAD;
      } else if ($scope.board[col][row] === true) {
        return COLORS.SNAKE_BODY;
      }
      return COLORS.BOARD;
    };

    function update() {
      var newHead = getNewHead();

      if (boardCollision(newHead) || selfCollision(newHead) || eggCollision(newHead)) {
        return gameOver();
      } else if (fruitCollision(newHead)) {
        eatFruit();
	  } else if (blueberryCollision(newHead)) {
		eatblueberry();  
	  } else if (bananaCollision(newHead)) {
		eatBanana();
	  } else if (grapesCollision(newHead)) {
		eatGrapes();
	  } else if (extraLifeCollision(newHead)) {
		eatExtraLife();
	  } else if (rottenFruitCollision(newHead)) {
		eatRottenFruit();
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
	
	function eggCollision(part) {
      return part.x === egg.x && part.y === egg.y;
    }
	
	function blueberryCollision(part) {
      return part.x === blueberry.x && part.y === blueberry.y;
    }
	
	function bananaCollision(part) {
	  return part.x === banana.x && part.y === banana.y;
	}
	
	function grapesCollision(part) {
	  return part.x === grapes.x && part.y === grapes.y;
	}
	
	function extraLifeCollision(part) {
	  return part.x === extraLife.x && part.y === extraLife.y;
	}
	
	function rottenFruitCollision(part) {
	  return part.x === rottenFruit.x && part.y === rottenFruit.y;
	}
	
    function resetFruit() {
      var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return resetFruit();
      }
      fruit = { x: x, y: y };
    }
	
	function setEgg() {
	  var oldTail = snake.parts.pop()
      $scope.board[oldTail.y][oldTail.x] = false;
	  egg = { x: oldTail.x, y: oldTail.y };
	  var countdownTimer = setInterval(function() {
		  $scope.currentCountdown--;
		  console.log($scope.currentCountdown);
		  if($scope.currentCountdown === 0) {
			  clearInterval(countdownTimer);
			  	$scope.level++;
				$scope.fruitCount = 0;
				$scope.levelAim = levelAims[$scope.level - 1];
				$scope.currentCountdown = levelCountdown[$scope.level - 1];
				setUpSnake();
				egg = { x: -1, y: -1};

		  }
	  },1000);
	  
    }

	function setblueberry() {
	  var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return setblueberry();
      }
      blueberry = { x: x, y: y };
	  $timeout(function () {
		 blueberry = { x: -1, y: -1 }; 
	  }, 10000);
	}
	
	function setBanana() {
	  var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return setBanana();
      }
      banana = { x: x, y: y };
	  $timeout(function () {
		 banana = { x: -1, y: -1 }; 
	  }, 9000);
	}
	
	function setGrapes() {
	  var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return setGrapes();
      }
      grapes = { x: x, y: y };
	  $timeout(function () {
		 grapes = { x: -1, y: -1 }; 
	  }, 8000);
	}
	
	function setExtraLife() {
	  var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return setExtraLife();
      }
      extraLife = { x: x, y: y };
	  $timeout(function () {
		 extraLife = { x: -1, y: -1 }; 
	  }, 7000);
	}
	
	function setRottenFruit() {
	  var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return setRottenFruit();
      }
      rottenFruit = { x: x, y: y };
	  $timeout(function () {
		 rottenFruit = { x: -1, y: -1 }; 
	  }, 10000);
	}
	
	function setUpSnake() {
	
		// Set up initial snake
			if (egg.x === -1)
				for (var i = 0; i < 5; i++) snake.parts.push({ x: 10 + i, y: 10 });
			else{
				var child = {
				direction: DIRECTIONS.LEFT,
				parts: [{
					x: -1,
					y: -1
				}]
			};
				
				snake = child;
				for (var i = 0; i < 5; i++) snake.parts.push({ x: 10 + i, y: 10 });
			}
      
		
	}
	
    function eatFruit() {
		$scope.score++;
		$scope.fruitCount++;

		// Grow by 1
		var tail = angular.copy(snake.parts[snake.parts.length - 1]);
		snake.parts.push(tail);
		resetFruit();
	 
		if ($scope.fruitCount % 5 === 0) {
			interval -= 15;
			var x = Math.floor(Math.random() * 5)
			switch (x) {
				case 0:
					setblueberry();
					break;
				case 1:
					setBanana();
					break;
				case 2:
					setGrapes();
					break;
				case 3:
					setExtraLife();
					break;
				case 4:
					setRottenFruit();
					break;
				}	
			}
		if ($scope.fruitCount === $scope.levelAim) {
			setEgg();
		}
    }
	
	function eatblueberry() {
		$scope.score+=3;
		blueberry = { x: -1, y: -1 }; 
    }
	
	function eatBanana() {
		$scope.score+=5;
		banana = {x: -1, y: -1 };
	}
	
	function eatGrapes() {
		$scope.score+=7;
		grapes = {x: -1, y: -1 };
	}
	
	function eatExtraLife() {
		extraLife = {x: -1, y: -1 };
	}
	
	function eatRottenFruit() {
		rottenFruit = {x: -1, y: -1 };
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
	  $scope.fruitCount = 0;
      snake = { direction: DIRECTIONS.LEFT, parts: [] };
      tempDirection = DIRECTIONS.LEFT;
      isGameOver = false;
      interval = 150;
	  setUpSnake();
      resetFruit();
      update();
    };

  });
