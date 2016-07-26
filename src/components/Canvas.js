import React, { Component } from 'react';
import {WebView, Image, View, Dimensions} from 'react-native';
import CanvasSource from '../utils/CanvasSource';

class Canvas extends Component {
  render() {
    return (
      <WebView
        source={{html: CanvasSource}}
        style={this.props.style}
        javaScriptEnabledAndroid={true}
        injectedJavaScript={ canvasJS }
      />
    )
  }
};

// const {height, width} = Dimensions.get('window');

const canvasJS = `

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");
var height = window.innerHeight;
var width = window.innerWidth;
var cellSize = 20;
var cols = Math.floor(width/cellSize) + 1
var rows = Math.floor(height/cellSize) + 1

var board = [];
var i=0,j=0;
for(i=0; i<=cols; i++) {
  board[i] = [];
  for(j=0; j<=rows; j++) {
    board[i][j] = 0;
  }
}


var body = document.getElementById('bod')
body.style.margin = 0;
body.style.padding = 0;

var canvas = document.getElementById('canvas')
context = canvas.getContext('2d');
window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
drawStuff();
}

resizeCanvas();

function drawStuff() {
  for(x=0; x<cols; x++) {
    for(y=0; y<rows; y++) {
      ctx.strokeRect(x*(cellSize), y*(cellSize), cellSize, cellSize)
    }
  }
}

function clamp(c, boardc){
  if (c<0){
    return 0;
  }
  if (c>=boardc){
    return boardc - 1;
  }
  return c;
}

function renderShape(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize)
}

function setTileState(indexX, indexY, state) {
  board[indexX][indexY] = state;
}

var colorHash = {
  1: "black",
  2: "blue",
  3: "red"
}

function changeColors(theme) {
  colorHash = theme;
}

var render = function() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  for(s=0;s<board.length;s++) {
    for(e=0;e<board[s].length;e++) {
      if(board[s][e]!=0) {
        renderShape(s, e, colorHash[board[s][e]]);
      }
      if(board[s][e]===0){
        // ctx.strokeRect(x*(cellSize), y*(cellSize), cellSize, cellSize)
      }
    }
  }
}

function pixelToTile(pixelx, pixely, width, height, func) {
  var tiley = Math.floor(pixely/cellSize)
  var tilex = Math.floor(pixelx/cellSize)

  tilex = func(tilex, width)
  tiley = func(tiley, height)

  var pixely = tiley * cellSize;
  var pixelx = tilex * cellSize;

  return {x: pixelx, y: pixely, tilex: tilex, tiley: tiley}
}

canvas.addEventListener("touchstart", handleStart, false);
canvas.addEventListener("touchend", handleStart, false);
canvas.addEventListener("touchcancel", handleStart, false);
canvas.addEventListener("touchmove", handleStart, false);

var ongoingTouches = new Array();
function copyTouch(touch) {
    return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

function handleStart(evt) {
    evt.preventDefault();
    var ctx = canvas.getContext("2d");
    var touches = evt.changedTouches;
    for(var i=0; i < touches.length; i++) {
        ongoingTouches.push(copyTouch(touches[i]));
        var currentTile = pixelToTile(touches[i].pageX, touches[i].pageY, cols, rows, clamp)
        setTileState(currentTile.tilex, currentTile.tiley, 1)
        renderShape(currentTile.tilex, currentTile.tiley, "black")
    }
}

function isAlive(cell) {
 if (cell > 0) {
   return true
 }else {
   return false
 }
}

function getNeighborCoordinates(x, y) {
  coordinates = [
  {x: x-1,y: y-1},
  {x: x,y: y-1},
  {x: x+1,y: y-1},
  {x: x+1,y: y},
  {x: x+1,y: y+1},
  {x: x,y: y+1},
  {x: x-1,y: y+1},
  {x: x-1,y: y}
  ]
  coordinates.slice(0).forEach(function(item){
    if (item.x < 0 || item.x > cols-1 || item.y < 0 || item.y > rows-1) {
        coordinates.splice(coordinates.indexOf(item), 1)
    }
  });
  return coordinates;
}

function countNeighbors(coordinates, oldBoard) {
  var neighborCount = 0;
    coordinates.forEach(function(coordinatePair){
      if(isAlive(oldBoard[coordinatePair.x][coordinatePair.y])) {
        neighborCount++
      }
    })
  return neighborCount;
}

function neighborRules(count, alive) {
  if(alive) {
    if(count < 2) {
      return 0;
    } else if(count===2 || count===3){
      return 1;
    } else if(count > 3) {
      return 0;
    }
  } else {
    if(count == 3) {
      return 1;
    } else {
      return 0;
    }
  }
}


function step(gBoard) {
  newBoard = [];
  x = 0;
  y = 0;
  for(x=0;x<=cols-1;x++) {
    newBoard[x] = [];
    for(y=0;y<=rows-1;y++) {
      coordinates = getNeighborCoordinates(x,y);
      numNeighbors = countNeighbors(coordinates, gBoard)
      newBoard[x].push(neighborRules(numNeighbors, isAlive(gBoard[x][y])));
    }
  }
  return newBoard;
}

setInterval(function() {
  board = step(board);
  render();
}, 100);

`;

export default Canvas;
