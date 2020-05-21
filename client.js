var socket = io();

var leftCallback = function (e) {
  if (e) {
    e.preventDefault();
  }
  socket.emit('turn', 'left');
};

var rightCallback = function (e) {
  if (e) {
    e.preventDefault();
  }
  socket.emit('turn', 'right');
};

var left = document.getElementById('left');
left.addEventListener('touchstart', leftCallback);
var right = document.getElementById('right');
right.addEventListener('touchstart', rightCallback);

window.addEventListener('keydown', function (e) {
  if (e.code == 'KeyA') {
    leftCallback();
  } else if (e.code == 'KeyD') {
    rightCallback();
  }
});

socket.on('start', function () {
  console.log('starting game');
  document.getElementById('container').style.display = 'block'; 
});

socket.on('gameover', function (score) {
  document.getElementById('container').style.display = 'none'; 
  alert('Score: ' + score); 
});
