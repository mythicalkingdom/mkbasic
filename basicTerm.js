// basicTerm - a simple readline based terminal

exports.basicTerm = basicTerm;

var readline = require('readline');
var util = require('util');

function basicTerm() {
  this.inBuffer = [];
  this.rl = readline.createInterface(process.stdin, process.stdout);

  
  this.handleInputLine = function(line) {
    this.inBuffer.push(line.trim()); 
    if (typeof(this.inResolve) === "function") {
      this.inResolve(true);
    }
  }
  
  this.rl.on('line', function(line) {
    this.handleInputLine(line);
  }.bind(this));
  
  this.rl.on('close', function() {
    this.rl.close(0);
  }.bind(this));
  
  this.endSession = async function(){
    this.rl.close();  
  };
  
  this.inputAvailable = function() {
    return(this.inBuffer.length > 0);
  };

  this.waitInput = function() {
    return new Promise(function(resolve,reject) {
      if (!this.inputAvailable()) {
        this.inResolve = resolve;
        this.inReject = reject;
      } else {
        this.inResolve=null;
        this.inReject=null;
        resolve(true);
      }
    }.bind(this));
  };

  this.cursorToPromise = util.promisify(readline.cursorTo);

  this.cursorTo = async function(x,y) {
    await this.cursorToPromise (process.stdout,x,y);
  }

  this.getCursorPos = async function() {
    return(this.rl.getCursorPos());
  }

  this.getInput = async function() {
    var st = await this.waitInput();
    var str = this.inBuffer.shift();
    return(str);
  };

  this.throwAway = function(line) {
  }

  this.outputChar = async function(ch) {
    process.stdout.write(ch);
  }
  
  this.outputString = async function(str) {
    for (var i=0; i<str.length; i++) {
      await this.outputChar(str[i]);
    }
  }

}


