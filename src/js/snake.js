
angular.module('aps_snake', [])

  .controller('snakeController', function ($scope, $timeout, $window, $interval) {
    var BOARD_SIZE = 30;
    var DIRECTIONS = {
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      P: 80
    };

    var COLORS = {
      GAME_OVER: 'url(./src/img/Apple.png)',
      FRUIT: 'url(./src/img/Apple.png)',
      SNAKE_HEAD: 'url(./src/img/Grass.png)',
      SNAKE_BODY: 'url(./src/img/Grass.png)',
      SNAKE_HEAD_STAR: 'url(./src/img/Grass.png)',
      SNAKE_BODY_STAR: 'url(./src/img/Grass.png)',
      BOARD: 'url(./src/img/Rock.png)',
	  EGG: 'url(./src/img/Egg.png)',
	  BLUEBERRY: 'url(./src/img/Blueberry.png)',
	  BANANA: 'url(./src/img/Banana.png)',
	  STAR: 'url(./src/img/Star.png)',
	  EXTRALIFE: 'url(./src/img/Heart.png)',
	  ROTTENFRUIT: 'url(./src/img/Rotten.png)'
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

	var star = {
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

  var isInverted = false;
  var hasStar = false;
  var isPaused = false;
  var isStarted = false;
  var currentCountdown = 3;
  var interval, tempDirection, isGameOver, countdownTimer, countdownTimerStar, countdownTimerRotten, TimerBlueberry, TimerBanana, TimerStar, TimerExtraLive, TimerRottenFruit;

  if (document.cookie === "") document.cookie = "highscore=0"

  $scope.score = 0;
  $scope.highscore = readHighscore(document.cookie);
	$scope.level =1;
  $scope.fruitCount = 0;
	$scope.levelAim = 3;
  $scope.lives = 0;
	$scope.currentCountdown = "";

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
      } else if (star.x == row && star.y == col) {
        return COLORS.STAR;
      } else if (extraLife.x == row && extraLife.y == col) {
        return COLORS.EXTRALIFE;
      } else if (rottenFruit.x == row && rottenFruit.y == col) {
        return COLORS.ROTTENFRUIT;
      } else if (snake.parts[0].x == row && snake.parts[0].y == col && !hasStar) {
          return COLORS.SNAKE_HEAD;
        } else if ($scope.board[col][row] === true && !hasStar) {
          return COLORS.SNAKE_BODY;
        } else if (snake.parts[0].x == row && snake.parts[0].y == col && hasStar) {
          return COLORS.SNAKE_HEAD_STAR;
        } else if ($scope.board[col][row] === true && hasStar) {
          return COLORS.SNAKE_BODY_STAR;
        }
      //return COLORS.BOARD;
    };

    function update() {
      if (!isPaused) {
      var newHead = getNewHead();

      if ((boardCollision(newHead) || selfCollision(newHead) || eggCollision(newHead)) && $scope.lives === 0 && hasStar === false) {
        return gameOver();
      } else if (fruitCollision(newHead)) {
        eatFruit();
	  } else if (blueberryCollision(newHead)) {
		eatblueberry();
	  } else if (bananaCollision(newHead)) {
		eatBanana();
    } else if (starCollision(newHead)) {
		eatStar();
	  } else if (extraLifeCollision(newHead)) {
		eatExtraLife();
	  } else if (rottenFruitCollision(newHead)) {
		eatRottenFruit();
	  } else if ((boardCollision(newHead) || selfCollision(newHead) || eggCollision(newHead)) && $scope.lives > 0 && hasStar === false) {
		$scope.lives--;
    document.getElementById("lostLiveScreen").className = "pause";
    isPaused = true;
    var lostLiveCountdown = 3;
    lostLiveTimer = $interval(function() {
        lostLiveCountdown--;
        $scope.lostLiveCountdown=lostLiveCountdown;
		    if(lostLiveCountdown === 0) {
          document.getElementById("lostLiveScreen").className = "run";
          isPaused = false;
          update();
				  $interval.cancel(lostLiveTimer);
		    }
	  },1000);
    var oldLenght = snake.parts.length;
    for (var i = oldLenght; i > 1; i--) {
      var oldTail = snake.parts.pop();
      $scope.board[oldTail.y][oldTail.x] = false;
    }
    $scope.board[snake.parts[0].y][snake.parts[0].x] = false;
    var newHead = getNewHead();
    newHead.x = BOARD_SIZE/2;
    newHead.y = BOARD_SIZE/2;
    $scope.board[snake.parts[0].y][snake.parts[0].x] = true;
    for (var i = 0; i < oldLenght; i++) snake.parts.push({ x: newHead.x + i, y: newHead.y });
	  } else if (boardCollision(newHead)) {
		 return gameOver();
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
      if (hasStar) {
			     return false;
		  } else {
			     return $scope.board[part.y][part.x] === true;
		  }
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

	function starCollision(part) {
	  return part.x === star.x && part.y === star.y;
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
	  var currentCountdownCache = currentCountdown;
    $scope.currentCountdown=currentCountdownCache;
	  countdownTimer = $interval(function() {
      if (!isPaused) {
        currentCountdownCache--;
        $scope.currentCountdown=currentCountdownCache;
		    if(currentCountdownCache === 0) {
				  $interval.cancel(countdownTimer);
          document.getElementById("levelEndScreen").className = "pause";
          isPaused = true;
          var levelEndCountdown = 3;
          levelEndTimer = $interval(function() {
              levelEndCountdown--;
              $scope.levelEndCountdown=levelEndCountdown;
              if(levelEndCountdown === 0) {
                document.getElementById("levelEndScreen").className = "run";
                isPaused = false;
                update();
                $interval.cancel(levelEndTimer);
              }
          },1000);
			    $scope.level++;
				  $scope.fruitCount = 0;
				  $scope.levelAim+=2;
          $scope.currentCountdown="";
          currentCountdown+=3;
				  setUpSnake();
				  egg = { x: -1, y: -1};
		    }
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
      var CountdownBlueberry = 10;
  	  TimerBlueberry = $interval(function() {
        if (!isPaused) {
          CountdownBlueberry--;
  		    if(CountdownBlueberry === 0) {
  				  $interval.cancel(TimerBlueberry);
            blueberry = { x: -1, y: -1 };
  		    }
        }
  	  },1000);
	}

	function setBanana() {
	  var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return setBanana();
      }
      banana = { x: x, y: y };
      var CountdownBanana = 9;
      TimerBanana = $interval(function() {
        if (!isPaused) {
          CountdownBanana--;
          if(CountdownBanana === 0) {
            $interval.cancel(TimerBanana);
            banana = { x: -1, y: -1 };
          }
        }
      },1000);
	}

	function setStar() {
	  var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return setStar();
      }
      star = { x: x, y: y };
      var CountdownStar = 8;
      TimerStar = $interval(function() {
        if (!isPaused) {
          CountdownStar--;
          if(CountdownStar === 0) {
            $interval.cancel(TimerStar);
            star = { x: -1, y: -1 };
          }
        }
      },1000);
	}

	function setExtraLife() {
	  var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return setExtraLife();
      }
      extraLife = { x: x, y: y };
      var CountdownExtraLive = 7;
      TimerExtraLive = $interval(function() {
        if (!isPaused) {
          CountdownExtraLive--;
          if(CountdownExtraLive === 0) {
            $interval.cancel(TimerExtraLive);
            extraLive = { x: -1, y: -1 };
          }
        }
      },1000);
	}

	function setRottenFruit() {
	  var x = Math.floor(Math.random() * BOARD_SIZE);
      var y = Math.floor(Math.random() * BOARD_SIZE);

      if ($scope.board[y][x] === true) {
        return setRottenFruit();
      }
      rottenFruit = { x: x, y: y };
      var CountdownRottenFruit = 10;
      TimerRottenFruit = $interval(function() {
        if (!isPaused) {
          CountdownRottenFruit--;
          if(CountdownRottenFruit === 0) {
            $interval.cancel(TimerRottenFruit);
            rottenFruit = { x: -1, y: -1 };
          }
        }
      },1000);
	}

	function setUpSnake() {

			// Set up initial snake
			if (egg.x === -1)
				for (var i = 0; i < 5; i++) snake.parts.push({ x: 10 + i, y: 10 });
			else{
				var oldLenght = snake.parts.length;
				for (var i = oldLenght; i > 1; i--) {
					var oldTail = snake.parts.pop();
					$scope.board[oldTail.y][oldTail.x] = false;
				}
				var newHead = angular.copy(snake.parts[0]);
				$scope.board[snake.parts[0].y][snake.parts[0].x] = false;
				snake.parts[0] ={x: egg.x, y: egg.y};
				$scope.board[snake.parts[0].y][snake.parts[0].x] = true;
				for (var i = 0; i < 5; i++) snake.parts.push({ x: snake.parts[0].x + i, y: snake.parts[0].y });
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
      if (interval > 90) {
          interval -= 15;
      }
			var x = Math.floor(3/*Math.random() * 5*/)
			switch (x) {
				case 0:
					setblueberry();
					break;
				case 1:
					setBanana();
					break;
				case 2:
					setStar();
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
    interval += 15;
		blueberry = { x: -1, y: -1 };
    }

	function eatBanana() {
		$scope.score+=5;
    for(var i=0; i < snake.parts.length/2; i++) {
      var tail = angular.copy(snake.parts[snake.parts.length - 1]);
      snake.parts.pop(tail);
      $scope.board[tail.y][tail.x] = false;
    }
		banana = {x: -1, y: -1 };
	}

	function eatStar() {
		$scope.score+=7;
    hasStar = true;
    star = {x: -1, y: -1 };
    var currentCountdownStar = 10;
    $scope.currentCountdownStar=currentCountdownStar;
	  countdownTimerStar = $interval(function() {
      if (!isPaused) {
        currentCountdownStar--;
        $scope.currentCountdownStar=currentCountdownStar;
		    if(currentCountdownStar === 0) {
				  $interval.cancel(countdownTimerStar);
          $scope.currentCountdownStar="";
          hasStar = false;
		    }
      }
	  },1000);
	}

	function eatExtraLife() {
    $scope.lives+=1;
		extraLife = {x: -1, y: -1 };
	}

	function eatRottenFruit() {
		isInverted = true;
		rottenFruit = {x: -1, y: -1 };
    var currentCountdownRotten = 10;
    $scope.currentCountdownRotten=currentCountdownRotten;
	  countdownTimerRotten = $interval(function() {
      if (!isPaused) {
        currentCountdownRotten--;
        $scope.currentCountdownRotten=currentCountdownRotten;
		    if(currentCountdownRotten === 0) {
				  $interval.cancel(countdownTimerRotten);
          $scope.currentCountdownRotten="";
		      isInverted = false;
		    }
      }
	  },1000);
	}

    function gameOver() {
      isStarted = false;
      isGameOver = true;
      $interval.cancel(countdownTimerRotten);
      $interval.cancel(countdownTimerStar);
      $interval.cancel(countdownTimer);
      $interval.cancel(TimerBlueberry);
      $interval.cancel(TimerBanana);
      $interval.cancel(TimerStar);
      $interval.cancel(TimerExtraLive);
      $interval.cancel(TimerRottenFruit);
      hasStar = false;
      isInverted = false;
      let currentScore = $scope.score;
      if (currentScore > $scope.highscore) {
        $scope.highscore = currentScore;
        document.cookie = "highscore=" + currentScore;
      }

      $timeout(function () {
        isGameOver = false;
      }, 500);
		egg = {x: -1, y: -1};
		banana = {x: -1, y: -1};
		star = {x: -1, y: -1};
		blueberry = {x: -1, y: -1};
		extraLife = {x: -1, y: -1};
		rottenFruit = {x: -1, y: -1};
		$scope.level=1;
		$scope.levelAim= 2;
		$scope.currentCountdown="";
    $scope.currentCountdownStar="";
    $scope.currentCountdownRotten="";
    currentCountdown = 3;

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
      if (e.keyCode == DIRECTIONS.LEFT && snake.direction !== DIRECTIONS.RIGHT && !isInverted) {
        tempDirection = DIRECTIONS.LEFT;
      } else if (e.keyCode == DIRECTIONS.UP && snake.direction !== DIRECTIONS.DOWN && !isInverted) {
        tempDirection = DIRECTIONS.UP;
      } else if (e.keyCode == DIRECTIONS.RIGHT && snake.direction !== DIRECTIONS.LEFT && !isInverted) {
        tempDirection = DIRECTIONS.RIGHT;
      } else if (e.keyCode == DIRECTIONS.DOWN && snake.direction !== DIRECTIONS.UP && !isInverted) {
        tempDirection = DIRECTIONS.DOWN;
      } else if (e.keyCode == DIRECTIONS.LEFT && snake.direction !== DIRECTIONS.LEFT && isInverted) {
        tempDirection = DIRECTIONS.RIGHT;
      } else if (e.keyCode == DIRECTIONS.UP && snake.direction !== DIRECTIONS.UP && isInverted) {
        tempDirection = DIRECTIONS.DOWN;
      } else if (e.keyCode == DIRECTIONS.RIGHT && snake.direction !== DIRECTIONS.RIGHT && isInverted) {
        tempDirection = DIRECTIONS.LEFT;
      } else if (e.keyCode == DIRECTIONS.DOWN && snake.direction !== DIRECTIONS.DOWN && isInverted) {
        tempDirection = DIRECTIONS.UP;
      } else if (e.keyCode == DIRECTIONS.P) {
        if (isStarted) {
          if (document.getElementById("pauseScreen").className === "run") {
            document.getElementById("pauseScreen").className = "pause";
            isPaused = true;
          } else {
            document.getElementById("pauseScreen").className = "run";
            isPaused = false
            update();
          }
        }
      }
    });

    $scope.startGame = function () {
      isStarted = true;
      $scope.score = 0;
	     $scope.fruitCount = 0;
      snake = { direction: DIRECTIONS.LEFT, parts: [] };
      tempDirection = DIRECTIONS.LEFT;
      isGameOver = false;
      interval = 150;
	    setUpSnake();
      resetFruit();
      update();
	    egg = {x: -1, y: -1};
			banana = {x: -1, y: -1};
			star = {x: -1, y: -1};
			blueberry = {x: -1, y: -1};
			extraLife = {x: -1, y: -1};
			rottenFruit = {x: -1, y: -1};
			$scope.level=1;
			$scope.levelAim = 2;
			$scope.currentCountdown="";
      $scope.currentCountdownStar="";
      $scope.currentCountdownRotten="";
      currentCountdown = 3;
    };

    $scope.pauseGame = function () {
      if (isStarted) {
        document.getElementById("pauseScreen").className = "pause";
        isPaused = true;
      }
    };

    $scope.resumeGame = function () {
      document.getElementById("pauseScreen").className = "run";
      isPaused = false;
      update();
    };
  });
