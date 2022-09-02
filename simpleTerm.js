// simpleTerm - a simple terminal interface for vt100/bbs ansi style terminals

exports.simpleTerm = simpleTerm;

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

const ansiColors = [30,34,32,36,31,35,33,37];

function simpleTerm() {
  this.inBuffer = [];
  this.inResolve = null;
  this.inReject = null;
  this.window = [1,1,80,24]
  this.x = 1;
  this.y = this.window[3];
  this.currAttr = 7;
  this.process = process;
  this.buffer=[];
  this.aBuffer = [];
  // bit 7 (128) =blink, lower 4 bits = fg, bit 4-6 = bg
  for (var i=1;i<25;i++) {
    this.aBuffer[i-1] = [];
    this.buffer[i-1] = [];
    for (var j=1;j<81;j++) {
      this.aBuffer[i-1].push(this.currAttr); 
      this.buffer[i-1].push(" ");
    }
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on('data', function(data) {
    this.handleInput(data);
  }.bind(this));

  this.close = function(){
    this.process.stdin.pause();
    //    process.exit();
  }

  this.endSession = function(){
    this.close();
  }
  
  this.setColor = async function (fg,bg){
    // 0=black 1=blue 2=green 3=cyan 4=red 5=magenta 6=brown 7=white +8=bold
    var fgStr = ansiColors[fg&7].toString();
    var bgStr = (ansiColors[bg&7] + 10).toString();
    this.currentAttr = (fg&15) + ((bg&7)*16);
    if (fg>7) {
      iStr = "1;"
    } else {
      iStr = ""
    }
    var cStr = "\x1b[0;" + fgStr + ";" + iStr + bgStr + "m";
    process.stdout.write(cStr);
  }

  this.clearScreen = async function() {
    process.stdout.write('\x1b[2J');
    for (var i=this.window[1];i<this.window[3] + 1;i++) {
      for (var j=this.window[0];j<this.window[2] + 1;j++) {
        this.buffer[i-1][j] = " ";
        this.aBuffer[i-1][j] = this.currentAttr; 
      }
    }
    await this.gotoXY(1,1);
  }


  this.gotoXY = async function(x,y) {
    if ((x>= this.window[0]) && (x<= this.window[2]) && (y>=this.window[1]) && (y<= this.window[3])) {
      process.stdout.write("\x1b[" + y.toString() + ";" + x.toString() + "H");
      this.x = x;
      this.y = y;
    }
  }
  
  this.getXY = async function() {
    return({x:this.x, y:this.y});
  }

  this.handleInput = function(data) {
    var str = data.toString();
    for (var i=0;i<str.length;i++) {
      var ch = str.charAt(i);
      if (ch >= ' ') {
        var chValid = true;
      } else {
        var chValid = false;
      }
      switch(ch) {
        case '\u0003':
          process.exit();
          break;
        case '\b':
        case '\r':
        case '\t':
        case '\x1b':
          chValid = true;
      }
      if (chValid) {
        this.inBuffer.push(ch);
        if (typeof this.inResolve === "function") {
          this.inResolve(true);
        }
      }
    }
  }

  this.keysAvailable = function() {
    return(this.inBuffer.length > 0);
  }

  this.waitKey = function() {
    return new Promise(function(resolve,reject) {
      if (!this.keysAvailable()) {
        this.inResolve = resolve;
        this.inReject = reject;
      } else {
        this.inResolve = null;
        this.inReject = null;
        resolve(true);
      }
    }.bind(this));
  }

  this.getKey = async function() {
    try {var st = await this.waitKey();
      ch = this.inBuffer.shift();
      return(ch);
    } catch (error) {
      console.log(error.message);
    }
  }

  this.scrollBuffer = function(x1,y1,x2,y2,dir,num){
    if (typeof num === "undefined") {
      num = 1;
    }
    x1 = x1 - 1;
    y1 = y1 - 1;
    x2 = x2 - 1;
    y2 = y2 - 1;
    switch (dir){
      case "U":
        for (i=y1; i<= y2; i++) {
          for (j=x1; j<=x2; j++) {
            if ((i + num) > y2) {
              this.buffer[i][j] = " ";
              this.aBuffer [i][j] = this.currentAttr;
            } else {
              this.buffer[i][j] = this.buffer[i+num][j];
              this.aBuffer[i][j] = this.aBuffer[i+num][j];
            }
          }
        }
        break;
      case "D":
        for (i=y2;i>=y1;i--){
          for (j=x1;j<=x2;j++) {
            if ((i - num) < y1) {
              this.buffer[i][j] = " ";
              this.aBuffer[i][j] = this.currAttr;
            } else {
              this.buffer[i][j] = this.buffer[i-num][j];
              this.aBuffer[i][j] = this.aBuffer[i-num][j];
            }
          }
        }
        break;
      case "L":
        for (i=y2;i>=y1;i--){
          for (j=x1;j<=x2;j++) {
            if ((i - num) < y1) {
              this.buffer[i][j] = " ";
              this.aBuffer[i][j] = this.currAttr;
            } else {
              this.buffer[i][j] = this.buffer[i-num][j];
              this.aBuffer[i][j] = this.aBuffer[i-num][j];
            }
          }
        }
        break;
      case "R":
        for (j=x2;j>=x1;j--){
          for (i=y1;i<=y2;i++) {
            if ((j - num) < x1) {
              this.buffer[i][j] = " ";
              this.aBuffer[i][j] = this.currAttr;
            } else {
              this.buffer[i][j] = this.buffer[i][j-num];
              this.aBuffer[i][j] = this.aBuffer[i][j-num];
            }
          }
        }
        break;
    }
  }
  
  this.sendChar = async function(ch) {
    switch (ch) {
      case "\b":
        this.x--;
        if (this.x < 1) {
          this.x=this.window[0];
        }
        break;
      case "\n":
        this.y++;
        if (this.y > this.window[3]) {
          this.y=this.window[3];
          this.scrollBuffer(this.window[0],this.window[1],this.window[2],this.window[3] -1,"U");
        }
        break;
      case "\r":
        this.x = this.window[0];
        break;
      default:
        this.buffer[this.y-1][this.x-1] = ch;
        this.aBuffer[this.y-1][this.x-1] = this.currAttr;
        this.x++;
        if (this.x > this.window[2]) {
          this.x=this.window[0];
          this.y++;
          if (this.y > this.window[3]) {
            this.y=this.window[3];
            this.scrollBuffer(this.window[0],this.window[1],this.window[2],this.window[3]-1,"U");
          }
        }
        break;
    }
    process.stdout.write(ch);
  }
  
  this.sendString = async function(str) {
    for (var i=0;i< str.length;i++) {
      await this.sendChar(str.charAt(i));
    }
  }
  
  this.sendBackSpace = async function() {
    await this.sendString('\b \b');
  }
  
  this.sendNL = async function () {
    await this.sendString('\r\n');
  }

  this.getInput = async function(inStr) {
    var done = false;
    var chCount = 0;
    var inStr = "";
    var code = 0;
    var ch = "";
    while (!done) {
      ch = await this.getKey();
      code = ch.charCodeAt(0);
      switch(true) {
        case (code==8):
        case (code==0x7f):
          if (chCount > 0) {
            chCount--;
            inStr = inStr.substring(0,chCount);
            await this.sendBackSpace();
          }
          break;
        case (code == 13): 
          done = true;
          break;
        case (code >=32 && code <= 0x7e):
          chCount++;
          inStr = inStr.concat(ch)
          await this.sendString(ch);
          break;
      }
    }
    return(inStr);
  }

  
}



