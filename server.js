var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var spawn = require('child_process').spawn;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/client.js', function (req, res) {
  res.sendFile(__dirname + '/client.js');
});

app.get('/style.css', function (req, res) {
  res.sendFile(__dirname + '/style.css');
});

var deamon = spawn(__dirname + '/deamon');

var queue = [];

var snake;
var dir;
var food;
var gameover = true;;
var length;
var turned;

var array = [];
for (var i = 0; i < 8*8; ++i) {
  array[i] = {x: Math.floor(i/8), y: i%8};
}


var reset = function () {
  snake = [{x: 4, y: 4}];
  dir = {x: 0, y: -1};
  food = {x: 2, y: 3};
  length = 1;
  turned = false;
  gameover = false;
};

var clear = function () {
  deamon.stdin.write('r\n');
};

var draw = function () {
  snake.forEach(function (seg) {
    deamon.stdin.write('s ' + seg.x + ' ' + seg.y + '\n');
  });  
  deamon.stdin.write('s ' + food.x + ' ' + food.y + '\n');
};

var obstructed = function(pos) {
  return snake.some(function (seg) {
    if (seg == snake[snake.length-1]) return false;
    return seg.x == pos.x && seg.y == pos.y;
  });
}

var update = function() {
  turned = false;
  var head = snake[0];
  var next = {x: head.x + dir.x, y: head.y + dir.y};
  if (next.x == -1) {
    next.x = 7;
  } else if (next.x == 8) {
    next.x = 0;
  } else if (next.y == -1) {
    next.y = 7;
  } else if (next.y == 8) {
    next.y = 0;
  }

  if (obstructed(next)) {
    gameover = true;
    return;
  }

  snake.unshift(next);
  snake = snake.slice(0, length);
  head = snake[0];

  if (next.x == food.x && next.y == food.y) {
    length += 1;
    var free = array.filter(function (pos) { return !obstructed(pos); });
    food = free[Math.floor(Math.random() * free.length)];
  }
};

var init = function (socket) {
  console.log('initializing user');
  setTimeout(function callback () {
    clear();
    if (!gameover) {
      update();
      draw();
      setTimeout(callback, 700);
    } else {
      socket.emit('gameover', snake.length); 
      socket.removeAllListeners('turn');
      queue.push(queue.shift());
      init(queue[0]);
    }
  }, 1000);

  socket.on('disconnect', function () {
    console.log('user disconnected');
    gameover = true;
  });

  socket.on('turn', function (turn_dir) {
    if (turned) return;

    turned = true;
    if (turn_dir == 'right') {
      if (dir.x != 0) {
        dir.y = dir.x;
        dir.x = 0;
      } else {
        dir.x = -dir.y;
        dir.y = 0;
      }
    } else {
      if (dir.x != 0) {
        dir.y = -dir.x;
        dir.x = 0;
      } else {
        dir.x = dir.y;
        dir.y = 0;
      }
    }
  });
  reset();
  socket.emit('start');
};

io.on('connection', function (socket) {
  console.log('user connected');
  queue.push(socket);
  if (queue.length == 1) {
    init(socket);
  }

});

http.listen(80, function() {
  console.log('Server listening on port 80');
});
