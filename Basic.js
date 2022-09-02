exports.Basic = Basic;

var fs = require("fs");

Array.prototype.peek = function() {
  return this.slice(-1)[0];
}

const tokenType = {
  none: 0,
  alpha: 1,
  keyword: 2,
  variable: 3,
  stringLiteral: 4,
  numericLiteral: 5,
  separator: 6,
  operator: 7,
  argSeparator: 8,
  variableString: 9,
  variableInteger: 10,
  variableSP: 11,
  variableDP: 12,
  variableImplied: 13,
  userFunctionString: 14,
  userFunctionInteger: 15,
  userFunctionSP: 16,
  userFunctionDP: 17,
  userFunctionImplied: 18,
  openParen: 19,
  closeParen: 20,
  openBracket: 21,
  closeBracket: 22,
  lineNumber: 23,
  impliedLet: 24,
  functionArgEnd: 25,
  unaryMinus: 26,
  operNE: 27,
  operGE: 28,
  operLE: 29,
  userFunctionArg: 30
}

const operatorTokens = {
  26: {prec:14, assoc:"R"},    // unary minus
  19: {prec:13, assoc:"L"},    // (
  20: {prec:13, assoc:"L"},    // )
  237: {prec:12, assoc:"R"},   // ^
  235: {prec:11, assoc:"L"},   // *
  236: {prec:11, assoc:"L"},   // /
  244: {prec:10, assoc:"L"},   // \
  243: {prec:9, assoc:"L"},    // MOD
  233: {prec:8, assoc:"L"},    // +
  234: {prec:8, assoc:"L"},    // -
   27: {prec:7, assoc:"L"},    // <>
   28: {prec:7, assoc:"L"},    // >=
   29: {prec:7, assoc:"L"},    // <=
  231: {prec:7, assoc:"L"},    // =
  232: {prec:7, assoc:"L"},    // <
  230: {prec:7, assoc:"L"},    // >
  211: {prec:6, assoc:"L"},    // NOT
  238: {prec:5, assoc:"L"},    // AND
  239: {prec:4, assoc:"L"},    // OR
  240: {prec:3, assoc:"L"},    // XOR
  241: {prec:2, assoc:"L"},    // EQV
  242: {prec:1, assoc:"L"},    // IMP
};

const basicKeywords = [
  {token:129, cmd: "END"},
  {token:130, cmd: "FOR"},
  {token:131, cmd: "NEXT"},
  {token:132, cmd: "DATA"},
  {token:133, cmd: "INPUT"},
  {token:134, cmd: "DIM"},
  {token:135, cmd: "READ"},
  {token:136, cmd: "LET"},
  {token:137, cmd: "GOTO"},
  {token:138, cmd: "RUN"},
  {token:139, cmd: "IF"},
  {token:140, cmd: "RESTORE"},
  {token:141, cmd: "GOSUB"},
  {token:142, cmd: "RETURN"},
  {token:143, cmd: "REM"},
  {token:144, cmd: "STOP"},
  {token:145, cmd: "PRINT"},
  {token:146, cmd: "CLEAR"},
  {token:147, cmd: "LIST"},
  {token:148, cmd: "NEW"},
  {token:149, cmd: "ON"}, // **TODO** ON ERROR
  {token:150, cmd: "WAIT"}, // NA wait for port
  {token:151, cmd: "DEF"},
  {token:152, cmd: "POKE"}, // NA 
  {token:153, cmd: "CONT"}, // TODO** Continue from STOP END  ^BREAK repeats input
  {token:156, cmd: "OUT"},
  {token:157, cmd: "LPRINT"},
  {token:158, cmd: "LLIST"},
  {token:160, cmd: "WIDTH"}, // TODO** WIDTH size or WIDTH "SCRN:" size
  {token:161, cmd: "ELSE"},
  {token:162, cmd: "TRON"},
  {token:163, cmd: "TROFF"},
  {token:164, cmd: "SWAP"},
  {token:165, cmd: "ERASE"}, 
  {token:166, cmd: "EDIT"}, // NA
  {token:167, cmd: "ERROR"},
  {token:168, cmd: "RESUME"},
  {token:169, cmd: "DELETE"}, 
  {token:170, cmd: "AUTO"}, // NA
  {token:171, cmd: "RENUM"}, 
  {token:172, cmd: "DEFSTR"}, 
  {token:173, cmd: "DEFINT"},
  {token:174, cmd: "DEFSNG"},
  {token:175, cmd: "DEFDBL"},
  {token:176, cmd: "LINE"}, // NA
  {token:177, cmd: "WHILE"}, 
  {token:178, cmd: "WEND"}, 
  {token:179, cmd: "CALL"}, // NA
  {token:183, cmd: "WRITE"},
  {token:184, cmd: "OPTION"},
  {token:185, cmd: "RANDOMIZE"},
  {token:186, cmd: "OPEN"},
  {token:187, cmd: "CLOSE"},
  {token:188, cmd: "LOAD"},
  {token:189, cmd: "MERGE"},
  {token:190, cmd: "SAVE"},
  {token:191, cmd: "COLOR"},
  {token:192, cmd: "CLS"},
  {token:193, cmd: "MOTOR"},
  {token:194, cmd: "BSAVE"},
  {token:195, cmd: "BLOAD"},
  {token:196, cmd: "SOUND"},
  {token:197, cmd: "BEEP"},
  {token:198, cmd: "PSET"},
  {token:199, cmd: "PRESET"},
  {token:200, cmd: "SCREEN"},
  {token:201, cmd: "KEY"}, // NA
  {token:202, cmd: "LOCATE"},
  {token:204, cmd: "TO"},
  {token:205, cmd: "THEN"},
  {token:206, cmd: "TAB"}, // position on line, if before current next line
  {token:207, cmd: "STEP"},
  {token:208, cmd: "USR"},
  {token:209, cmd: "FN"},
  {token:210, cmd: "SPC"}, // INSERTS X Spaces in PRINT statement
  {token:211, cmd: "NOT"},
  {token:212, cmd: "ERL"},
  {token:213, cmd: "ERR"},
  {token:214, cmd: "STRING$"},
  {token:215, cmd: "USING"},
  {token:216, cmd: "INSTR"},
  {token:217, cmd: "'"},
  {token:218, cmd: "VARPTR"},
  {token:219, cmd: "CSRLIN"},
  {token:220, cmd: "POINT"},
  {token:221, cmd: "OFF"},
  {token:222, cmd: "INKEY$"},
  {token:230, cmd: ">"},
  {token:231, cmd: "="},
  {token:232, cmd: "<"},
  {token:233, cmd: "+"},
  {token:234, cmd: "-"},
  {token:235, cmd: "*"},
  {token:236, cmd: "/"},
  {token:237, cmd: "^"},
  {token:238, cmd: "AND"},
  {token:239, cmd: "OR"},
  {token:240, cmd: "XOR"},
  {token:241, cmd: "EQV"},
  {token:242, cmd: "IMP"},
  {token:243, cmd: "MOD"},
  {token:244, cmd: "\\"},
  {token:0xfd81, cmd: "CVI"},
  {token:0xfd82, cmd: "CVS"},
  {token:0xfd83, cmd: "CVD"},
  {token:0xfd84, cmd: "MKI$"},
  {token:0xfd85, cmd: "MKS$"},
  {token:0xfd86, cmd: "MKD$"},
  {token:0xfd8b, cmd: "EXTERR"},
  {token:0xfe81, cmd: "FILES"},
  {token:0xfe82, cmd: "FIELD"},
  {token:0xfe83, cmd: "SYSTEM"},
  {token:0xfe84, cmd: "NAME"},
  {token:0xfe85, cmd: "LSET"},
  {token:0xfe86, cmd: "RSET"},
  {token:0xfe87, cmd: "KILL"},
  {token:0xfe88, cmd: "PUT"},
  {token:0xfe89, cmd: "GET"},
  {token:0xfe8a, cmd: "RESET"},
  {token:0xfe8b, cmd: "COMMON"},
  {token:0xfe8c, cmd: "CHAIN"},
  {token:0xfe8d, cmd: "DATE$"},
  {token:0xfe8e, cmd: "TIME$"},
  {token:0xfe8f, cmd: "PAINT"},
  {token:0xfe90, cmd: "COM"},
  {token:0xfe91, cmd: "CIRCLE"},
  {token:0xfe92, cmd: "DRAW"},
  {token:0xfe93, cmd: "PLAY"},
  {token:0xfe94, cmd: "TIMER"},
  {token:0xfe95, cmd: "ERDEV"},
  {token:0xfe96, cmd: "IOCTL"},
  {token:0xfe97, cmd: "CHDIR"},
  {token:0xfe98, cmd: "MKDIR"},
  {token:0xfe99, cmd: "RMDIR"},
  {token:0xfe9a, cmd: "SHELL"},
  {token:0xfe9b, cmd: "ENVIRON"},
  {token:0xfe9c, cmd: "VIEW"},
  {token:0xfe9d, cmd: "WINDOW"}, // NA
  {token:0xfe9e, cmd: "PMAP"}, // NA
  {token:0xfe9f, cmd: "PALETTE"},
  {token:0xfea0, cmd: "LCOPY"},
  {token:0xfea1, cmd: "CALLS"},
  {token:0xfea7, cmd: "LOCK"},
  {token:0xfea8, cmd: "UNLOCK"},
  {token:0xff81, cmd: "LEFT$"},
  {token:0xff82, cmd: "RIGHT$"},
  {token:0xff83, cmd: "MID$"},
  {token:0xff84, cmd: "SGN"},
  {token:0xff85, cmd: "INT"},
  {token:0xff86, cmd: "ABS"},
  {token:0xff87, cmd: "SQR"},
  {token:0xff88, cmd: "RND"},
  {token:0xff89, cmd: "SIN"},
  {token:0xff8a, cmd: "LOG"},
  {token:0xff8b, cmd: "EXP"},
  {token:0xff8c, cmd: "COS"},
  {token:0xff8d, cmd: "TAN"},
  {token:0xff8e, cmd: "ATN"},
  {token:0xff8f, cmd: "FRE"},
  {token:0xff90, cmd: "INP"},
  {token:0xff91, cmd: "POS"},
  {token:0xff92, cmd: "LEN"},
  {token:0xff93, cmd: "STR$"},
  {token:0xff94, cmd: "VAL"},
  {token:0xff95, cmd: "ASC"},
  {token:0xff96, cmd: "CHR$"},
  {token:0xff97, cmd: "PEEK"},
  {token:0xff98, cmd: "SPACE$"},
  {token:0xff99, cmd: "OCT$"},
  {token:0xff9a, cmd: "HEX$"},
  {token:0xff9b, cmd: "LPOS"},
  {token:0xff9c, cmd: "CINT"},
  {token:0xff9d, cmd: "CSNG"},
  {token:0xff9e, cmd: "CDBL"},
  {token:0xff9f, cmd: "FIX"},
  {token:0xffa0, cmd: "PEN"},
  {token:0xffa1, cmd: "STICK"},
  {token:0xffa2, cmd: "STRIG"},
  {token:0xffa3, cmd: "EOF"},
  {token:0xffa4, cmd: "LOC"},
  {token:0xffa5, cmd: "LOF"},
  {token:0xfffa, cmd: "QUIT"}
];

const rnd_step = 4455680;
const rnd_period = 16777216;
const rnd_multiplier = 214013;
const rnd_increment = 2531011;
const rnd_initialSeed = 5228370;

function Basic(term) {
  this.term = term;
  this.x = 1;
  this.y = 1;
  this.currentLine = 0;
  this.statementIdx = 0;
  this.lineIdx = 0;
  this.stopRun = false;
  this.program = [];
  this.goSubStack = [];
  this.forStack = [];
  this.condStack = [];
  this.whileStack = [];
  this.dataStatementIdx = 1;
  this.dataLineIdx = 0;
  this.dataBuffer = [];
  this.trace = false;
  this.onErrorLine = 0;
  this.ignoreRemainderOfLine = false;
  this.rnd_seed = 5228370;
  this.varStr = {}; // regular variables
  this.varInt = {};
  this.varSP = {};
  this.varDP = {};
  this.impliedType = [];
  for (var i=0; i<26;i++) {
    this.impliedType.push(tokenType.variableSP);
  }
  

  if (typeof this.term.outputChar == "function") {
     this.outputChar = this.term.outputChar.bind(this.term);
  } else {
     this.outputChar = async function(ch) {
       process.stdout.write(ch);
       switch(ch) {
         case "\b":
           this.x--;
           if (this.x < 1) {
             this.x = 1;
           }
           case "\n":
             this.y++;
             if (this.y > 24) {
               this.y = 24;
             }
             break;
           case "\r":
             this.x = 1;
             break;
           default:
             this.x++;
             if (this.x > 80) {
               this.x = 1;
               this.y++;
               if (this.y > 24) {
                 this.y=24;
               } 
             }
             break;
           break;
       }
     }
  }

  if (typeof this.term.outputString == "function") {
     this.outputString = this.term.outputString.bind(this.term);
  } else {
    this.outputString = async function(str) {
      for (var i=0; i<str.length; i++) {
        await this.outputChar(str[i]);
      }
    }
  }
  
  if (typeof this.term.setColor == "function") {
     this.setColor = this.term.setColor.bind(this.term);
  } else {
    this.setColor = async function(fg,bg) {
    }
  }
  
  if (typeof this.term.clearScreen == "function") {
    this.clearScreen = this.term.clearScreen.bind(this.term);
  } else {
    this.clearScreen = async function() {
      var tmp="\r\n".repeat(24);
      this.outputString(tmp);
      this.x = 1;
      this.y = 1;
    }
  }

  if (typeof this.term.gotoXY == "function") {
    this.gotoXY = this.term.gotoXY.bind(this.term);
  } else {
    this.gotoXY = async function(x,y) {
      this.x = x;
      this.y = y;
    }
  }


  if (typeof this.term.getXY == "function") {
    this.getXY = this.term.getXY.bind(this.term);
  } else {
    this.getXY = async function() {
      return({x:this.x,y:this.y});
    }
  }
 
  if (typeof this.term.getInput == "function") {
    this.getInput = this.term.getInput.bind(this.term);
  } else {
    var readline = require('readline');
    this.inBuffer = [];
    this.rl = readline.createInterface(process.stdin, process.stdout);
    this.rl.on('line', function(line) {
      this.inBuffer.push(line.trim()); 
      if (typeof(this.inResolve) === "function") {
        this.inResolve(true);
      }
    }.bind(this));
    this.rl.on('close', function() {
      this.rl.close(0);
    }.bind(this));
    this.inputAvailable = function() {
      return(this.inBuffer.length > 0);
    }
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
      }.bind(this))
    }  
    this.getInput = async function() {
      var st = await this.waitInput();
      var str = this.inBuffer.shift();
      return(str);
    }
  }

  if (typeof term.endSession == "function") {
    this.endSession = this.term.endSession.bind(this.term);
  } else {
    this.endSession = async function(){
      this.rl.close();  
    }
  }

  this.reportError = async function (errorMsg) {
    // TODO handle on error 
    if (this.currentLine < 0) {
      await this.outputString("\r\nERROR - " + errorMsg + "\n");
    } else {
      await this.outputString("\r\nERROR - Line: " + this.currentLine + " - " + errorMsg + "\r\n");
    }
    this.stopRun = true;
  }
  
  this.isDigit = function(ch) {
    return ((ch >= "0") && (ch <= "9"))
  }

  this.isNumericChar = function(ch) {
    const numList = "&H-+E.";
    ch = ch.toUpperCase();
    return ((this.isDigit(ch)) || (numList.indexOf(ch) >= 0));
  }

  this.isNameChar = function(ch) {
    return(this.isDigit(ch) || this.isLetter(ch) || (ch == "."));
  }

  this.isHexDigit = function(ch) {
    ch = ch.toUpperCase();
    return ((ch >= "0") && (ch <= "9")) || ((ch >= "A") && (ch <= "F"));
  }
  
  this.isLetter = function(ch) {
    return ch.toLowerCase() != ch.toUpperCase();
  }
  
  this.isWhiteSpace = function(ch) {
    return ((ch == " ") || (ch == "\t"));
  }
  
  this.isRemark = function(ch) {
    return (ch == "'");
  }

  this.isPrintUsingStringChar = function(ch) {
    const puList = "!\\&";
    return (puList.indexOf(ch) >= 0);
  }
  
  this.isPrintUsingNumChar = function(ch) {
    const puList = "#.+-*$,^";
    return (puList.indexOf(ch) >= 0);
  }
  
  this.isPrintUsingChar = function(ch) {
    return(this.isPrintUsingStringChar(ch) || this.isPrintUsingNumChar(ch));
  }
  
  
  this.isOperator = function(ch) {
    const operList = ">=<+-*/^\\";
    return(operList.indexOf(ch) >= 0);
  }
  
  this.isVarType = function(ch) {
    const typeList = "%#$!";
    return(typeList.indexOf(ch) >= 0);
  }

  this.isStatementTerm = function(ch) {
    const stList = "':";
    return(stList.indexOf(ch) >= 0);
  }

  this.isArgSeparator = function (ch) {
    const asList = ";,";
    return(asList.indexOf(ch) >= 0);
  }

  this.isTokenTerm = function(ch) {
    return (this.isWhiteSpace(ch) || this.isOperator(ch) || 
    this.isStatementTerm(ch));
  }  

  this.isTokenUserFunction = function(token) {
    switch(token){
      case tokenType.userFunctionString: 
      case tokenType.userFunctionInteger: 
      case tokenType.userFunctionSP:
      case tokenType.userFunctionDP:
      case tokenType.userFunctionImplied:
        answer = true;
        break;
      default:
        answer = false;
    }
    return(answer);
  }
  
  
  this.isTokenVariable = function(token) {
    switch(token){
      case tokenType.variableString: 
      case tokenType.variableInteger: 
      case tokenType.variableSP:
      case tokenType.variableDP:
      case tokenType.variableImplied:
        answer = true;
        break;
      default:
        answer = false;
    }
    return(answer);
  }
  
  
  this.isTokenOperator = function(token) {
    switch(token) {
      case 26: // unary -
      case 27: // <>
      case 28: // >=
      case 29: // <=
      case 211: // NOT
      case 230: // >
      case 231: // =
      case 232: // <
      case 233: // +
      case 234: // -
      case 235: // *
      case 236: // /
      case 237: // ^
      case 238: // AND
      case 239: // OR
      case 240: // XOR
      case 241: // EQV
      case 242: // IMP
      case 243: // MOD
      case 244: // \
        answer = true;
        break;
      default:
        answer = false;
        break;
    }
    return(answer);
  }

  this.isTokenArgSeparator = function(token) {
    return(token == tokenType.argSeparator);
  }

  this.isTokenOpen = function(token){
    return (((token == tokenType.openParen) || (token == tokenType.openBracket)));
  }
  
  this.isTokenClose = function(token){
    return (((token == tokenType.closeParen) || (token == tokenType.closeBracket)));
  }
  
  this.isTokenFunctionNoArgs = function(token) {
     var answer=false;
     switch(token) {
      case 0xfe94: // TIMER
      case 0xfe8d: // DATE$
      case 0xfe8e: // TIME$
        answer = true;
        break;
      default:
        break;
    }
    return(answer);
  }
  
  this.isTokenFunction = function(token) {
    var answer = false;
    switch(token) {
      case 206: // TAB
      case 210: // SPC
      case 214: // STRING$
      case 216: // INSTR
      case 0xff81: // LEFT$
      case 0xff82: // RIGHT$
      case 0xff83: // MID$
      case 0xff84: // SGN
      case 0xff85: // INT
      case 0xff86: // ABS
      case 0xff87: // SQR
      case 0xff88: // RND
      case 0xff89: // SIN
      case 0xff8a: // LOG
      case 0xff8b: // ExP
      case 0xff8c: // COS
      case 0xff8d: // TAN
      case 0xff8e: // ATN
      case 0xff8f: // FRE
      case 0xff92: // LEN
      case 0xff93: // STR$
      case 0xff94: // VAL
      case 0xff95: // ASC
      case 0xff96: // CHR$
      case 0xff99: // OCT$
      case 0xff9a: // HEX$
      case 0xff9f: // FIX
        answer = true;
        break;
      default:
        break;
    }
    return(answer);
  }


  this.isTokenLiteral = function(token) {
    return ((token == tokenType.numericLiteral) || (token == tokenType.stringLiteral));
  }
  
  
  this.getNextToken = async function(line) {
    var answer = {};
    line = line.trim();
    answer.type = tokenType.none;
    var i = 0;
    var done = false;
    var fChar = line.charAt(0);
    var typeChar = "";
    switch (true) {
      case fChar == "\"":
        answer.type = tokenType.stringLiteral;
        i++;
        while (!done) {
          if (i == line.length) {
            done = true;
            console.log ("***ERROR*** Unterminated String");
          }
          if (line.charAt(i) == "\"") {
            done = true;
          }
          i++;
        }
        break;
      case fChar == "?":
        answer.type = 145;
        i = 1;
        done = true;
        break;
      case fChar == "(":
        answer.type = tokenType.openParen;
        i = 1;
        done = true;
        break;
      case fChar == "[":
        answer.type = tokenType.openBracket;
        i = 1;
        done = true;
        break;
      case fChar == "]":
        answer.type = tokenType.closeBracket;
        i = 1;
        done = true;
        break;
      case fChar == ")":
        answer.type = tokenType.closeParen;
        i = 1;
        done = true;
        break;
      case this.isRemark(fChar):
        answer.type = 217;
        i = line.length;
        done = true;
        break;
      case this.isOperator(fChar):
        answer.type = tokenType.operator;
        i = 1;
        done = true;
        break;
      case ((this.isNumericChar(fChar)) && (fChar.toUpperCase() != "E") &&
      (fChar.toUpperCase() != "H")):
        answer.type = tokenType.numericLiteral;
        var validPlusMinus = false;
        var isHex = false;
        while (!done) {
          i++;
          var ch = line.charAt(i).toUpperCase();
          if (ch == "H") {
            isHex = true;
          }
          if (!this.isNumericChar(ch)) {
            done = true;
            if ((this.isHexDigit(ch)) && (isHex)) {
              done = false
            }
          }
          if (i == line.length) {
            done = true;
          }
          if ((ch == "-") && (!validPlusMinus)) {
            done = true;
          }
          if ((ch == "+") && (!validPlusMinus)) {
            done = true;
          }
          validPlusMinus = false;
          if (ch == "E") {
            validPlusMinus = true;
          }
        }
        break;
      case this.isStatementTerm(fChar):
        answer.type = tokenType.separator;
        i = 1;
        done = true;
        break;
      case this.isArgSeparator(fChar):
        answer.type = tokenType.argSeparator;
        i = 1;
        done = true;
        break;
      case this.isLetter(fChar): 
        answer.type = tokenType.alpha;
        while(!done) {
          i++;
          if (!this.isNameChar(line.charAt(i))) {
            done=true;
          }
          if (i == line.length) {
            done = true;
          }
          if (this.isVarType(line.charAt(i))) {
            done = true;
            typeChar = line.charAt(i);
            i++;
            answer.type = tokenType.variable;
          }
        }
        break;
      default:
        i++;
        console.log("Character not recognized", fChar);
        answer.type = 143;
        done=true;
        break;
    }
    
    if (answer.type == tokenType.stringLiteral) {
      answer.tokenStr = line.substring(0,i);
    } else {
      answer.tokenStr = line.substring(0,i).toUpperCase();
    }
    answer.remainStr = line.substring(i);
    if ((answer.type === tokenType.alpha)||
    (answer.type === tokenType.operator) ||
    (answer.type === tokenType.variable)) {
      var tokenIndex = basicKeywords.findIndex( function(x){
        return x.cmd == answer.tokenStr;
      });
      if (tokenIndex >= 0) {
        answer.type = basicKeywords[tokenIndex].token;
      } else {
        answer.type =tokenType.variable;
      }
    }
    if (answer.type == 143){
      i = line.length;
      answer.remainStr = "";
      answer.tokenStr = line.substring(4);
      done = true;
    }
    if (answer.type == 217) {
      answer.tokenStr = answer.tokenStr.substring(1);
    }
    
    
    if (answer.type == tokenType.variable) {
      var twoChar = answer.tokenStr.substring(0,2);
      switch (answer.tokenStr.slice(-1)){
        case "$":
          if (twoChar == "FN") {
            answer.type = tokenType.userFunctionString;
          } else {
            answer.type = tokenType.variableString;
          }
          answer.tokenStr = answer.tokenStr.slice(0,-1);
          break;
        case "%":
          if (twoChar == "FN") {
            answer.type = tokenType.userFunctionInteger;
          } else {
            answer.type = tokenType.variableInteger;
          }
          answer.tokenStr = answer.tokenStr.slice(0,-1);
          break;
        case "!":
          if (twoChar == "FN") {
            answer.type = tokenType.userFunctionSP;
          } else {
            answer.type = tokenType.variableSP;
          }
          answer.tokenStr = answer.tokenStr.slice(0,-1);
          break;
        case "#":
          if (twoChar == "FN") {
            answer.type = tokenType.userFunctionDP;
          } else {
            answer.type = tokenType.variableDP;
          }
          answer.tokenStr = answer.tokenStr.slice(0,-1);
          break;
        default:
          if (twoChar == "FN") {
            answer.type = tokenType.userFunctionImplied;
          } else {
            answer.type = tokenType.variableImplied;
          }
          break;
      }
    }
    return(answer);
  }
  
  this.evalToArray = async function(exp) {
    var result=[];
    for (var j=0; j < exp.length; j++) {
      switch(typeof exp[j]) {
         case "number":
         case "string":
         case "boolean":
           result.push(exp[j]);
           break;
         case "object":
           break;
         
      }
    }
    return(result);
  }

  this.evalUserFunction = async function (uf) {
    uf.token = await this.getFunctionImpliedType(uf);
    var fname = uf.arg.substring(2);
    vars = 0;
    switch (uf.token) {
      case tokenType.userFunctionString:
        vars = this.varStr;
        break;
      case tokenType.userFunctionInteger:
        vars = this.varInt;
        break;
      case tokenType.userFunctionSP:
        vars = this.varSP;
        break;
      case tokenType.userFunctionDP:
        vars = this.varDP;
        break;
    }
    if (typeof vars[fname] == "undefined") {
      var exp = [];
    } else {
      if (typeof vars[fname].userfunction == "undefined") {
        var exp = [];
      } else {
        var exp = vars[fname].userfunction;
      }
    }
    var ufArgs =  await this.evalToArray(await this.evaluateExpression(await this.parseExpression(uf.dims)));
    var answer = await this.evaluateExpression(await this.parseExpression(exp),ufArgs);
    return(answer[0]);
  }

  
  this.evaluateExpression = async function(expObj,ufArgs=[]) {
    var elStack = [];
    var outputQ = [];
    var argStack = [];
    var fdepth = 0;
    var ctr;
    for (ctr = 0; ctr<expObj.length; ctr++) {
      // collect arguments for function
      if (this.isTokenFunction(expObj[ctr].token)) {
        fdepth--;
        argStack = [];
        while ((elStack.length > 0) && (elStack.peek().token != 25)) {
          if (elStack.peek().token == 8) {
            // throw away separator
          } else {
            argStack.push(elStack.pop());
          }
        }
        if (elStack.length > 0) {
          elStack.pop();
        }
        argStack = argStack.reverse();
      }
      // handle token types
      switch(expObj[ctr].token) {
        case 25:
          fdepth++;
          elStack.push(expObj[ctr]);
          break;
        case 26: // unary minus
          elStack.push(-elStack.pop());
          break;
        case 21: // (
          break;
        case 8: // arg separator
          if (fdepth == 0) {
            if (elStack.length > 0) {
              outputQ.push(elStack.pop());
            }
          outputQ.push(expObj[ctr]);
          } 
          break;
        case tokenType.numericLiteral:
          elStack.push(expObj[ctr].arg);
          break;
        case tokenType.stringLiteral:
          elStack.push(expObj[ctr].arg);
          break;
        case tokenType.variableString:
        case tokenType.variableSP:
        case tokenType.variableImplied:
        case tokenType.variableDP:
        case tokenType.variableInteger:
          elStack.push(await this.getVar(expObj[ctr]));
          break;
        case 30: // user function argument
          elStack.push(ufArgs[expObj[ctr].arg]);
          break;
        case tokenType.userFunctionString:
        case tokenType.userFunctionInteger:
        case tokenType.userFunctionSP:
        case tokenType.userFunctionDP:
        case tokenType.userFunctionImplied:
          elStack.push(await this.evalUserFunction(expObj[ctr]));
          break;
        case 206: // TAB
          if (fdepth == 0) {
            if (elStack.length > 0) {
              outputQ.push(elStack.pop());
            }
          expObj[ctr].num=argStack[0];
          outputQ.push(expObj[ctr]);
          } 
          break;
        case 210: // SPC
          if (argStack.length == 1) {
            elStack.push(" ".repeat(argStack[0]));
          } else {
            await this.reportError("SPC requires 1 argument");
          }
          break;
        case 211: // NOT
          tmp = elStack.pop()
          elStack.push(!tmp);
          break;
        case 214: // STRING$
          var argCount = argStack.length;
          if (argCount == 2) {
            if(typeof argStack[1] == "number") {
              var ch = String.fromCharCode(argStack[1]);
            } else {
              var ch = argStack[1].substring(0,1);
            }
            var tmp =  ch.repeat(argStack[0]);
            elStack.push(tmp);
          } else {
            await this.reportError("STRING$ requires 2 arguments");
          }
          break;
        case 216: // INSTR
          var insResult = 0;
          var argCount = argStack.length;
          if ((argCount > 1) && (argCount < 4)) {
            if (argCount == 2) {
              var n=1;
              var x=argStack[0];
              var y=argStack[1];
            } else {
              var n=argStack[0];
              var x=argStack[1];
              var y=argStack[2];
            }
            if ((n < 1) || (n > 255)) {
              await this.reportError("Invalid argument to INSTR");
            }
            if ((n > x.length) || (x.length==0)) {
              var insResult = 0;
            } else {
              n--;
              insResult = x.indexOf(y,n);
              insResult++;
            }
          } else {
            await this.reportError("INSTR requires 2 or 3 arguments");
          }
          elStack.push(insResult);
          break;
        case  27: // <>
          var tmp= elStack.pop();
          elStack.push(elStack.pop() != tmp);
          break;
        case  28: // >=
          var tmp=elStack.pop();
          elStack.push(elStack.pop() >= tmp);
          break;
        case 29: // <=
          var tmp=elStack.pop();
          elStack.push(elStack.pop() <= tmp);
          break;
        case 230: // >
          var tmp = elStack.pop();
          elStack.push(elStack.pop() > tmp);
          break;
        case 231: // =
          var tmp = elStack.pop();
          elStack.push(elStack.pop() == tmp);
          break;
        case 232: // <
          var tmp = elStack.pop();
          elStack.push(elStack.pop() < tmp);
          break;
        case 233: // +
          var tmp = elStack.pop();
          elStack.push(elStack.pop() + tmp);
          break;
        case 234: // -
          elStack.push(-elStack.pop() + elStack.pop());
          break;
        case 235: // *
          elStack.push(elStack.pop() * elStack.pop());
          break;
        case 236: // /
          var tmp = elStack.pop();
          elStack.push(elStack.pop() / tmp);
          break;
        case 238: // AND
          var tmp = elStack.pop();
          elStack.push(elStack.pop() && tmp);
          break;
        case 239: // OR
          var tmp = elStack.pop();
          elStack.push(elStack.pop() || tmp);
          break;
        case 240: // XOR
          var tmp = elStack.pop();
          var tmp2 = elStack.pop();
          elStack.push((tmp ? !tmp2: tmp2));
          break;
        case 241: // EQV
          var tmp = elStack.pop();
          elStack.push(elStack.pop() == tmp);
          break;
        case 242: // IMP
          var tmp = elStack.pop();
          var tmp2 = elStack.pop();
          elStack.push(!tmp2 || tmp);
          break;
        case 243: // MOD
          var tmp = Math.round(elStack.pop());
          var tmp2 = Math.round(elStack.pop());
          elStack.push(tmp2 % tmp);
          break;
        case 244: // \ (integer division)
          var tmp = Math.round(elStack.pop());
          var tmp2 = Math.round(elStack.pop());
          elStack.push(Math.trunc(tmp2/tmp));
          break;
        case 0xfe8d: // DATE$
          var d = new Date();
          var mm = (d.getMonth() + 1).toString();
          var dd = d.getDate().toString();
          var yyyy = d.getFullYear().toString();
          if (mm.length < 2) {mm = "0" + mm}
          if (dd.length < 2) {dd = "0" + dd};
          elStack.push(mm + "-" + dd + "-" + yyyy);
          break;
        case 0xfe8e: // TIME$
          var d= new Date();
          var hh = d.getHours().toString();
          var mm = d.getMinutes().toString();
          var ss = d.getSeconds().toString();
          hh = ("00" + hh).substr(-2,2);
          mm = ("00" + mm).substr(-2,2);
          ss = ("00" + ss).substr(-2,2);;
          elStack.push(hh + ":" + mm + ":" + ss);
          break;
        case 0xfe94: // TIMER
          var d = new Date(), e=new Date(d);
          var s = (e-d.setHours(0,0,0,0))/1000;
          elStack.push(s);
          break;
        case 0xff81: // LEFT$
          var argCount = expObj[ctr].num;
          var argCount = argStack.length;
          if (argCount <1) {
            await this.reportError("No parameters given to LEFT$");
            str = "";
          } else {
            if (argCount < 2) {
              argStack[1] = argStack[0].length;
            }
            str = argStack[0].substring(0,argStack[1]);
          } 
          elStack.push(str);
          break;
        case 0xff82: // RIGHT$
          var argCount = expObj[ctr].num;
          var argCount = argStack.length;
          if (argCount <1) {
            await this.reportError("No parameters given to RIGHT$");
            str = "";
          } else {
            if (argCount < 2) {
              str = argStack[0];
            } else {
              str = argStack[0].substring(argStack[0].length-argStack[1]);
            }
          } 
          elStack.push(str);
          break;
        case 0xff83: // MID$
          var argCount = expObj[ctr].num;
          var argCount = argStack.length;
          if (argCount <1) {
            await this.reportError("No parameters given to MID$");
            str = "";
          } else {
            if (argCount < 3) {
              argStack[2] = argStack[0].length;
            }
            if (argCount < 2) {
              argStack[1] = 1;
            }
            str = argStack[0].substring(argStack[1]-1,argStack[1]+argStack[2]-1);
          } 
          elStack.push(str);
          break;
        case 0xff84: // SGN
          elStack.push(Math.sign(argStack[0]));
          break;
        case 0xff85: // INT
          var tmp = argStack[0];
          if (tmp < 0) {
            elStack.push(Math.floor(tmp));
          } else {
            elStack.push(Math.trunc(tmp));
          }
          break;
        case 0xff86: // ABS
          if (isNaN(argStack[0])) {
            await this.reportError("Illegal Arguement to ABS");
          } else {
            if (argStack[0] < 0) {
              elStack.push(-argStack[0]);
            } else {
              elStack.push(argStack[0]);
            }
          }
          break;
        case 0xff88: // RND
          switch(argStack.length) {
            case 0: // get new
              this.rndCycle();
              break;
            case 1: // decide based on value
              switch (Math.sign(argStack[0])) {
                case -1:
                  this.cmdRandomize(argStack[0]);
                  break;
                case 0:
                  break;
                case 1:
                  this.rndCycle();
                  break;
              }
              break;
            default:
              await this.reportError("Syntax error in RND");
          }
          elStack.push(this.rnd_seed / rnd_period);
          break;
        case 0xff89: // SIN
          if ((argStack.length !=1) || (isNaN(argStack[0]))){
            await this.reportError("Illegal arguments to ATN");
          } else {
            elStack.push(Math.sin(argStack[0]));
          }
          break;
        case 0xff8a: // LOG
          if ((argStack.length !=1) || (isNaN(argStack[0]))){
            await this.reportError("Illegal arguments to ATN");
          } else {
            elStack.push(Math.log(argStack[0]));
          }
          break;
        case 0xff8b: // EXP
          if ((argStack.length !=1) || (isNaN(argStack[0]))){
            await this.reportError("Illegal arguments to ATN");
          } else {
            elStack.push(Math.exp(argStack[0]));
          }
          break;
        case 0xff8c: // COS
          if ((argStack.length !=1) || (isNaN(argStack[0]))){
            await this.reportError("Illegal arguments to ATN");
          } else {
            elStack.push(Math.cos(argStack[0]));
          }
          break;
        case 0xff8d: // TAN
          if ((argStack.length !=1) || (isNaN(argStack[0]))){
            await this.reportError("Illegal arguments to ATN");
          } else {
            elStack.push(Math.tan(argStack[0]));
          }
          break;
        case 0xff8e: // ATN
          if ((argStack.length !=1) || (isNaN(argStack[0]))){
            await this.reportError("Illegal arguments to ATN");
          } else {
            elStack.push(Math.atan(argStack[0]));
          }
          break;
        case 0xff8f: // FRE
          elStack.push(14542);
          break;
        case 0xff92: // LEN
          if ((argStack.length != 1) ||
          (typeof argStack[0] != "string")) {
            await this.reportError("Illegal Arguments to LEN");
          } else {
            elStack.push(argStack[0].length);
          }
          break;
        case 0xff93: // STR$
          if ((argStack.length !=1) || (isNaN(argStack[0]))) {
             await this.reportError("Illegal argument to STR$");
          } else {
            var tmpStr = argStack[0].toString();
            if ((tmpStr[0]>= "0") && (tmpStr[0] <= "9")) {
              tmpStr = " " + tmpStr;
            }
            elStack.push(tmpStr);
          }
          
          break;
        case 0xff94: // VAL
          if ((argStack.length != 1) ||
          (typeof argStack[0] != "string") ||
          (argStack[0].length < 1) ||
          (isNaN(argStack[0]))) {
            await this.reportError("Illegal Arguments to VAL");
          } else {
            elStack.push(Number(argStack[0]));
          }
          break;
        case 0xff95: // ASC
          if ((typeof argStack[0] != "string") ||
          (argStack[0].length < 1)) {
            await this.reportError("Illegal Function Call");
          } else {
            elStack.push(argStack[0].charCodeAt(0));
          }
          break;
        case 0xff96: // CHR$
          if ((argStack.length !=1) || (isNaN(argStack[0]))||
          (argStack[0] < 0) || (argStack[0] > 255)){
             await this.reportError("Illegal argument to CHR$");
          } else {
            elStack.push(String.fromCharCode(argStack[0]));
          }
          break;
        case 0xff99: // OCT$
          if ((argStack.length !=1) || (isNaN(argStack[0]))||
          (argStack[0] < -32768) || (argStack[0] > 65535)){
             await this.reportError("Illegal argument to HEX$");
          } else {
            if (argStack[0] < 0) {argStack[0] = argStack[0] + 65536}
            elStack.push(argStack[0].toString(8));
          }
          break;
        case 0xff9a: // HEX$
        case 0xff9f: // FIX
          elStack.push(Math.trunc(argStack[0]));
          break;
        default:
          console.log("Unknown token in expression evaluation: ", expObj[ctr]);
      }
    }
    if (elStack.length > 0) {
      outputQ.push(elStack.pop());
    }
    return(outputQ);
  }

  this.parseExpression = async function(lineObj) {
    var ctr;
    var outputQ = [];
    var opStack = [];
    // fix unary minus tokens
    var pState = 1;
    for (ctr=0; ctr<lineObj.length; ctr++){
      switch(true) {
        case (lineObj[ctr].token == 234): // -
          if (pState == 1) {
            lineObj[ctr].token = 26; // unary minus
          }
          pState = 0;
          break;
        case (lineObj[ctr].token == 19): // (
        case (lineObj[ctr].token == 21): // [
          pState = 1;
          break;
        case this.isTokenArgSeparator(lineObj[ctr].token):
          pState = 1;
          break;
        case this.isTokenOperator(lineObj[ctr].token):
          pState = 1;
          break;
        default:
          pState=0;
          break;
      }
      // fix <> <= >= tokens
      if (ctr < lineObj.length - 1) {
        switch(lineObj[ctr].token) {
          case 231: // =
            if (lineObj[ctr+1].token == 232) {
              lineObj.splice(ctr,2,{token:29, arg:"<="});
            } else if (lineObj[ctr+1].token == 230) {
              lineObj.splice(ctr,2,{token:28, arg:">="});
            }
            break;
          case 232: // <
            if (lineObj[ctr+1].token==231) {
              lineObj.splice(ctr,2,{token:29, arg:"<="});
            } else if (lineObj[ctr+1].token == 230) {
              lineObj.splice(ctr,2,{token:27, arg:"<>"});
            }
            break;
          case 230: // >
            if (lineObj[ctr+1].token==231) {
              lineObj.splice(ctr,2,{token:28, arg:">="});
            } else if (lineObj[ctr+1].token == 232) {
              lineObj.splice(ctr,2,{token:27, arg:"<>"});
            }
            break;
        }
      }
    }
    for (ctr=0; ctr<lineObj.length; ctr++){
      tObj = lineObj[ctr];
      if (this.isTokenLiteral(tObj.token) 
      || this.isTokenFunctionNoArgs(tObj.token)
      || tObj.token == 30
      || this.isTokenUserFunction(tObj.token)
      || this.isTokenVariable(tObj.token)) { // Literal Variable or User Function
        outputQ.push(tObj);
      } else if (this.isTokenFunction(tObj.token)) { // Function
        opStack.push(tObj);
        outputQ.push({"token":tokenType.functionArgEnd});
      } else if (this.isTokenOpen(tObj.token)) { // Open (
        opStack.push(tObj);
      } else if (this.isTokenClose(tObj.token)) { // Close )
        while ((opStack.length > 0) 
        && (!this.isTokenOpen(opStack.peek().token))) { // remove until (
          outputQ.push(opStack.pop());
        }
        if ((opStack.length > 0) &&
        (this.isTokenOpen(opStack.peek().token))) {
          opStack.pop();  // remove the (
        }
        if ((opStack.length > 0) 
        && (this.isTokenFunction(opStack.peek().token))) {
          outputQ.push(opStack.pop());
        }
      } else if (this.isTokenArgSeparator(tObj.token)) { // Arg separator
        while ((opStack.length > 0) 
        && !this.isTokenOpen(opStack.peek().token)) {
          outputQ.push(opStack.pop());
        }
        outputQ.push(tObj);
      } else if (this.isTokenOperator(tObj.token)) { // Operator
        while 
          (  (opStack.length > 0) 
             && (this.isTokenOperator(opStack.peek().token)) 
             && (((operatorTokens[opStack.peek().token].prec > operatorTokens[tObj.token].prec))
             || ((operatorTokens[opStack.peek().token].prec == operatorTokens[tObj.token].prec)
             && (operatorTokens[tObj.token].assoc  == "L"))
             && (!this.isTokenOpen(operatorTokens[opStack.peek().token])) )
          ) {
          outputQ.push(opStack.pop());
        }
        opStack.push(tObj);
      }
    }
    while (opStack.length > 0) {
      outputQ.push(opStack.pop());
    }
    return outputQ;
  }


  this.fixArrayVars = function(lineObj) {
    var ctr = 0;
    var fixLineObj = [];
    while (ctr < lineObj.length) {
      if ((ctr < lineObj.length - 1) 
      &&  ((this.isTokenVariable(lineObj[ctr].token)||
           (this.isTokenUserFunction(lineObj[ctr].token))
         ))
      && ((lineObj[ctr + 1].token == tokenType.openParen) ||
      ((lineObj[ctr + 1].token == tokenType.openBracket)))) {
      var tmpToken = lineObj[ctr];
        ctr++;
        ctr++
        pCtr = 1;
        dimObj = [];
        while ((pCtr > 0) && (ctr < lineObj.length)) {
          if ((lineObj[ctr].token == tokenType.openParen) ||
          (lineObj[ctr].token == tokenType.openBracket)){
            pCtr++;
          }
          if ((lineObj[ctr].token == tokenType.closeParen) ||
          (lineObj[ctr].token == tokenType.closeBracket)) {
            pCtr--;
          } 
          if (pCtr > 0) {
            dimObj.push(lineObj[ctr]);
          }
          ctr++;
        }
        ctr--;
        tmpToken.dims = this.fixArrayVars(dimObj);
        fixLineObj.push(tmpToken);
      } else {
        fixLineObj.push(lineObj[ctr]);
      }
      ctr++;
    }
    return(fixLineObj);
  }

  this.parseLine = async function(lineObj) {
    parsedLine = [];
    parsedLine.push(lineObj[0]);
    var ctr = 1;
    // Count number of arguments to each function
    while (ctr < lineObj.length) {
      if (this.isTokenFunction(lineObj[ctr].token)) {
        var argCount = 1;
        var pCtr = 1;
        var i = 3;
        while ((pCtr > 0) && ((ctr + i) < lineObj.length)) {
          if (this.isTokenOpen(lineObj[ctr + i].token)) {
            pCtr++;
          }
          if (this.isTokenClose(lineObj[ctr + i].token)) {
            pCtr--;
          }
          if (this.isTokenArgSeparator(lineObj[ctr+i].token)) {
            argCount++;
          }
          i++;
        }
        lineObj[ctr].num = argCount;
      }
      ctr++;
    }
    lineObj = this.fixArrayVars(lineObj);
    ctr = 1;
    var lineStart = true;
    var currLine = [];
    while (ctr < lineObj.length) {
      if (lineStart) {
        switch (true) {
          case this.isTokenVariable(lineObj[ctr].token):
            if (ctr < lineObj.length - 1) {
              if (lineObj[ctr+1].token == 231) {
                currLine.push({token:24});
              } else {
                await this.reportError("Missing =");
              }
            }
            break;
          default:
            break;
        }
      }
      if (lineObj[ctr].token == tokenType.separator) {
        lineStart = true;
        parsedLine.push(currLine);
        currLine = [];
      } else if (lineObj[ctr].token == 205 ) { // THEN
        currLine.push(lineObj[ctr]);
        lineStart = true;
        parsedLine.push(currLine);
        currLine = [];
      } else if (lineObj[ctr].token == 161) { // ELSE
        lineStart = true;
        parsedLine.push(currLine);
        currLine = [];
        currLine.push(lineObj[ctr]);
        parsedLine.push(currLine);
        currLine = [];
      } else {
        currLine.push(lineObj[ctr]);
        lineStart = false;
      }
      ctr++;
    }
    if (currLine.length > 0) {
      parsedLine.push(currLine);
      currLine = [];
    }
    return(parsedLine);
  }

  this.tokenizeLine = async function(line) {
    var cLine = [];
    var cStatement = {};
    var cTokenized = [];
    var wLine = line.trim();
    this.haveMinus = false;
    this.currentLine = wLine;
    var ctr = 0;
    var lineNum = "";
    var hasLineNum = false;
    while(this.isDigit(wLine.charAt(ctr))) {
      lineNum = lineNum + wLine.charAt(ctr).toString();
      hasLineNum = true;
      ctr++;
    }
    wLine = wLine.substring(ctr).trim();
    var cToken = {};
    cToken.token = tokenType.lineNumber;
    if (hasLineNum) {
      cToken.arg = Number(lineNum);
    } else {
      cToken.arg = -1;
    }
    cTokenized.push(cToken);
    while (wLine.length > 0) {
      var result = await this.getNextToken(wLine);
      cToken = {}
      cToken.token = result.type;
      cToken.arg = result.tokenStr;
      switch(result.type) {
        case tokenType.numericLiteral:
          result.tokenStr = result.tokenStr.trim();
          if (result.tokenStr[0] == "&") {
            if (result.tokenStr[1].toUpperCase() == "H") {
              result.tokenStr = "0x" + result.tokenStr.substring(2);
            } else {
              if (!isNaN(result.tokenStr.substring(1))) {
                result.tokenStr = parseInt(result.tokenStr.substring(1),8);
              }
            }
          }
          if (isNaN(result.tokenStr)) {
            await this.reportError("Invalid numeric: " + result.tokenStr);
          } else {
            cToken.arg = Number(result.tokenStr);
          }
          break;
        case tokenType.stringLiteral:
          cToken.arg = result.tokenStr.slice(1,-1);
          break;
        case tokenType.argSeparator:
          cToken.arg = result.tokenStr;
          break;
        case 143:
        case 217:
          cToken.arg = result.tokenStr;
          break;
        case tokenType.variable:
        case tokenType.variableString:
        case tokenType.variableInteger:
        case tokenType.variableSP:
        case tokenType.variableDP:
        case tokenType.variableImplied:
          cToken.arg = result.tokenStr;
          break;
        case tokenType.userFunctionString:
        case tokenType.userFunctionInteger:
        case tokenType.userFunctionSP:
        case tokenType.userFunctionDP:
        case tokenType.userFunctionImplied:
          cToken.arg = result.tokenStr;
          break;
      }
      cTokenized.push(cToken);
      wLine = result.remainStr;
    }
    return(cTokenized);
  }

  this.saveArrayVar = async function (vToken, v, value){
    var errMsg = "";
    var lv = await this.evaluateExpression(await this.parseExpression(vToken.dims));
    lv = await this.evalToArray(lv);
    var vname = vToken.arg;
    // define variable if needed
    if (typeof v[vname] == "undefined") {
      v[vname] = {};
    }
    if (typeof v[vname].data == "undefined") {
      v[vname].data = [];
    }
    // if dims not set create array with 10 for each element same length lv
    if (typeof v[vname].dims === "undefined") {
      v[vname].dims=[];
      for (var i=0; i< lv.length;i++) {
        v[vname].dims.push(10);
      }
    }
    // number of levels doesnt match
    if (lv.length != v[vname].dims.length) {
      errMsg = "SUBSCRIPT ERROR";
    }
    // a level is out of range
    if (errMsg.length == 0) {
      for (var i=0;i< lv.length;i++) {
        if (lv[i] > v[vname].dims[i]) {
          errMsg = "SUBSCRIPT ERROR";
        }
      } 
    }
    if (errMsg.length == 0) {
      var numLevels = v[vname].dims.length;
      var tv=v[vname].data;
      for (i=0;i< numLevels -1;i++) {
        if(typeof tv[lv[i]] === "undefined") {
          tv[lv[i]] = [];
        }
        var tv= tv[lv[i]];
      }
    }
    if (errMsg.length == 0) {
      var token = vToken.token;
      if (token == tokenType.variableImplied) {
        token = await this.getImpliedType(vToken);
      }
      switch(token) {
        case tokenType.variableSP:
        case tokenType.variableDP:
          if (isNaN(value)) {
            await this.reportError("Type Mismatch " + value);
          } else {
            tv[lv[lv.length-1]] = Number(value);
          }
          break;
        case tokenType.variableInteger:
          if (isNaN(value)) {
            await this.reportError("Type Mismatch " + value);
          } else {
            tv[lv[lv.length-1]] = Math.round(value);
          }
          break;	
        case tokenType.variableString:
          if (typeof value != "string") {
            tv[lv[lv.length-1]] = value.toString();
          } else {
            tv[lv[lv.length-1]] = value;
          }
          break;
        default:
          tv[lv[lv.length-1]] = value;
          break;
      }
    } else {
      await this.reportError(errMsg);
    }
  }
  
  

  this.getArrayVar = async function (vToken, v){
    var errMsg = "";
    var lv = await this.evaluateExpression(await this.parseExpression(vToken.dims));
    var lv = await this.evalToArray(lv);
    var vname = vToken.arg;
    // define variable if needed
    if (typeof v[vname] == "undefined") {
      v[vname] = {};
    }
    if (typeof v[vname].data == "undefined") {
      v[vname].data = [];
    }
    // if dims not set create array with 10 for each element same length lv
    if (typeof v[vname].dims === "undefined") {
      v[vname].dims=[];
      for (var i=0; i< lv.length;i++) {
        v[vname].dims.push(10);
      }
    }
    // number of levels doesnt match
    if (lv.length != v[vname].dims.length) {
      errMsg = "SUBSCRIPT ERROR";
    }
    // a level is out of range
    if (errMsg.length == 0) {
      for (var i=0;i< lv.length;i++) {
        if (lv[i] > v[vname].dims[i]) {
          errMsg = "SUBSCRIPT ERROR";
        }
      } 
    }
    if (errMsg.length == 0) {
      var numLevels = v[vname].dims.length;
      var tv=v[vname].data;
      for (i=0;i< numLevels -1;i++) {
        if(typeof tv[lv[i]] === "undefined") {
          tv[lv[i]] = [];
        }
        var tv= tv[lv[i]];
      }
    }
    if (errMsg.length == 0) {
      if (typeof tv[lv[lv.length-1]] == "undefined") {
        if (vToken.token == tokenType.variableString) {
          var value = "";
        } else {
          var value = 0;
        }
      } else {
        value = tv[lv[lv.length-1]];
      }
    } else {
      await this.reportError(errMsg);
    }
    return(value);
  }
  
  this.getFunctionImpliedType = async function (vToken) {
    var token= vToken.token;
    if (token == tokenType.userFunctionImplied) {
      var j = vToken.arg.charCodeAt(0) - 65;
      switch (this.impliedType[j]) {
        case tokenType.variableString:
          token = tokenType.userFunctionString;
          break;
        case tokenType.variableInteger:
          token = tokenType.userFunctionInteger;
          break;
        case tokenType.variableSP:
          token = tokenType.userFunctionSP;
          break;
        case tokenType.variableDP:
          token = tokenType.userFunctionDP;
          break;
        default:
          break;
      }
    }
    return(token);
  }
  
  this.getImpliedType = async function(vToken) {
    var token = vToken.token;
    if (token == tokenType.variableImplied) {
      var j = vToken.arg.charCodeAt(0) - 65;
      token = this.impliedType[j];
    }
    return(token);
  }
  
  this.setVars = async function(vToken) {
    var vars = 0;
    var token = vToken.token;
    if (token == tokenType.variableImplied) {
      token = await this.getImpliedType(vToken);
    }
    switch (token) {
      case tokenType.variableString:
        vars = this.varStr;
        break;
      case tokenType.variableInteger:
        vars = this.varInt;
        break;
      case tokenType.variableSP:
        vars = this.varSP;
        break;
      case tokenType.variableDP:
        vars = this.varDP;
        break;
      default:
        await this.reportError("Unknown Var Type: " + token);
        break;
    }
    return(vars);
  }

  this.saveVar = async function (vToken, value) {
    var vars = await this.setVars(vToken);
    if (typeof vars[vToken.arg] == "undefined") {
      vars[vToken.arg] = {};
    }
    if (typeof vToken.dims != "undefined") {
      await this.saveArrayVar(vToken, vars, value);
    } else {
      token = vToken.token;
      if (token == tokenType.variableImplied) {
        token = await this.getImpliedType(vToken);
      }
      switch(token) {
        case tokenType.variableSP:
        case tokenType.variableDP:
          if (isNaN(value)) {
            await this.reportError("Type Mismatch " + value);
          } else {
            vars[vToken.arg].value = Number(value);
          }
          break;
        case tokenType.variableInteger:
          if (isNaN(value)) {
            await this.reportError("Type Mismatch " + value);
          } else {
            vars[vToken.arg].value = Math.round(value);
          }
          break;	
        case tokenType.variableString:
          if (typeof value != "string") {
            vars[vToken.arg].value = value.toString();
          } else {
            vars[vToken.arg].value = value;
          }
          break;
        default:
          vars[vToken.arg].value = value;
          break;
      }
    }
  }
  
  this.eraseVar = async function(vToken) { // Clears array variable
    var vars = await this.setVars(vToken);
    if (typeof vars[vToken.arg] != "undefined") {
      delete vars[vToken.arg].data;
      delete vars[vToken.arg].dims;
    }
  }
  

  this.getVar = async function(vToken, value) {
    var vars = await this.setVars(vToken);
    token = await this.getImpliedType(vToken);
    if (typeof(vToken.dims) == 'undefined') {
      var notDefined = false;
      if (typeof vars[vToken.arg] == 'undefined') {
        notDefined = true;
      } else if (typeof vars[vToken.arg].value == 'undefined') {
        notDefined = true;
      }
      if (notDefined) {
        if (token == tokenType.variableString) {
          var value = "";
        } else {
          var value = 0;
        }
      } else {
        var value = vars[vToken.arg].value;
      }
    } else {
      value = await this.getArrayVar(vToken,vars);
    }
    return(value);
  }

  this.findLine = async function(tLine) {
    var low = 0;
    var high = this.program.length;
    if (high == 0) {
      return(-1);
    } else {
      while (low < high) {
        var mid = (low + high) >>> 1;
        if (this.program[mid][0].arg < tLine) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      if (this.program[low][0].arg == tLine) {
        return(low); 
      } else {
        return(-1);
      }
    }
  }

  this.findLineOrLower = async function(tLine) {
    var low = 0;
    var high = this.program.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      if (this.program[mid][0].arg < tLine) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return(low);
  }
  
  
  this.runCurrentLine = async function(cLine) {
    // set current line number
    if ((typeof cLine != "undefined") ) {
      if (typeof cLine[0].arg == "number") {
        this.currentLine = cLine[0].arg;
      } else {
        this.currentLine = -1;
      }
      // if tracing print line number
      if (this.trace) {
        var tmpStr = "[" + this.currentLine + "] ";
        await this.outputString(tmpStr);
      }
      // process whole line
      while ((!this.stopRun) && (this.statementIdx < cLine.length) 
      && (!this.ignoreRemainderOfLine)) {
        if ((this.whileStack.length > 0) && (! this.whileStack.peek().state)) {
          switch(cLine[this.statementIdx][0].token) {
            case 177: // WHILE
              this.whileStack.peek().nested++;
              break;
            case 178: // WEND
              if (this.whileStack.peek().nested > 0) {
                this.whileStack.peek().nested--;
              } else {
                this.whileStack.pop();
              }
              break; 
            default:
              break;
          }
        } else {
          if (this.condStack.length > 0) {
            tmpObj = this.condStack.peek();
            var state = tmpObj.state;
            switch(state) {
              case 0: // process until ELSE
                if (cLine[this.statementIdx][0].token == 5) {
                  var tLine = cLine[this.statementIdx].slice();
                  tLine.unshift({token:137, arg:'GOTO'});
                  await this.processStatement(tLine);
                } else {
                  await this.processStatement(cLine[this.statementIdx]);
                }
                break;
              case 1: // skip until ELSE
                switch (cLine[this.statementIdx][0].token) {
                  case 139: // IF
                    this.condStack.peek().nestedIf++;
                    break;
                  case 161: // ELSE
                    if (this.condStack.peek().nestedIf > 0) {
                      this.condStack.peek().nestedIf--;
                    } else {
                      var tmpObj = this.condStack.pop();
                      tmpObj.state = 3;
                      this.condStack.push(tmpObj);
                    }
                    break;
                }
                break;
              case 2: // skip until eol
                break;
              case 3: // process until eol
                if (cLine[this.statementIdx][0].token == 5) {
                  var tLine = cLine[this.statementIdx].slice();
                  tLine.unshift({token:137, arg:'GOTO'});
                  await this.processStatement(tLine);
                } else {
                  await this.processStatement(cLine[this.statementIdx]);
                }
                break;
              case 4: // skipping until WEND
                break;
              default:
                await this.reportError("Internal Error condition stack state");
                break;
            }
          } else {
            await this.processStatement(cLine[this.statementIdx]);
          }
        }
        if ((!this.ignoreRemainderOfLine) && (!this.stopRun)) {
          this.statementIdx ++;
        }
      }
    } else {
      // empty line
    }
  }

  this.findNewTarget = async function(aRenum, target) {
    var m=0;
    var newTarget = -1;
    // find target in aRenum
    while (m< aRenum.length) {
      if (aRenum[m][0] == target) {
        newTarget = aRenum[m][1];
        m = aRenum.length
      }
      m++;
    }
    return newTarget;
  }

  this.cmdGoto = async function(tLine) {
    this.lineIdx = await this.findLine(tLine);
    if (this.lineIdx < 0) {
      await this.reportError("Error line not found " + tLine);
    } else {
      this.lineIdx--;
      this.statementIdx = 99999;
      this.condStack = [];
    }
  }

  this.cmdGosub = async function(tLine) {
    tmpObj={};  
    tmpObj.lineIdx = this.lineIdx;
    tmpObj.statementIdx = this.statementIdx;
    tmpObj.condStack = this.condStack;
    this.condStack = [];
    this.goSubStack.push(tmpObj);
    this.lineIdx = await this.findLine(tLine);
    if (this.lineIdx < 0) {
      await this.reportError ("ERROR Line not found: " + tLine);
    } else {
      this.lineIdx--;
      this.statementIdx = 99999;
    }
  }

  this.cmdRenum = async function (lnNew, lnStart, lnIncr){
    errMsg = "";
    aRenum = [];
    var st = await this.findLineOrLower(lnStart);
    // Check that renumbering doesn't put lines out of order
    if ((st > 0) && (this.program[st -1][0].arg > lnNew)) {
      errMsg = "New startling line lower than preceding line";
    }
    // Check that new ending line isn't too large
    var newEnd = ((this.program.length) - st * lnIncr) + lnNew;
    if (newEnd > 65536) { 
      errMsg = "Error program ending line number out of range";
    }
    if (errMsg.length == 0) {
      // Step through renumbered lines, save old/new in array, renumber lines
      for (var j=st;j<this.program.length;j++) {
        var tmp = [this.program[j][0].arg, lnNew];
        this.program[j][0].arg = lnNew;
        aRenum.push(tmp);
        lnNew = lnNew + lnIncr;
      }
      // Update line number targets for commands like GOTO
      for (j=0;j<this.program.length;j++) {
        for (var k=1;k< this.program[j].length;k++) {
          switch(this.program[j][k][0].token) {
            case 137: // GOTO
            case 138: // RUN
            case 140: // RESTORE
            case 141: // GOSUB
              var target = this.program[j][k][1].arg;
              if (target >= lnStart) { // only do lines that were renumbered
                var newTarget = await this.findNewTarget(aRenum,target);
                if (newTarget < 0) {
                  // report error target not found
                  this.currentLine = this.program[j][0].arg;
                  await this.reportError("Target line number not found");
                } else {
                  // update target from target to newTarget
                  this.program[j][k][1].arg = newTarget;
                }
              }
              break;
            case 161: // ELSE
            case 139: // IF
              if ((this.program[j][k][this.program[j][k].length-1].token == 205) ||
              (this.program[j][k][0].token == 161)) {
                if (this.program[j][k+1][0].token == 5) {
                  // renumber IF goto
                  target =  this.program[j][k+1][0].arg;
                  if (target >= lnStart) { // only do lines that were renumbered
                    var newTarget = await this.findNewTarget(aRenum,target);
                    if (newTarget < 0) {
                      // report error target not found
                      this.currentLine = this.program[j][0].arg;
                      await this.reportError("Target line number not found");
                    } else {
                      // update target from target to newTarget
                      this.program[j][k+1][0].arg = newTarget;
                    }
                  }
                  
                }
              }
              break;
            case 168: // RESUME
            case 212: // ERL
            case 149: // ON
              // TODO handle other special cases
              break;
            default:
              // Ignore any other lines
              break;
          }
        }
      }
    }
    if (errMsg.length > 0) {
      await this.reportError(errMsg);
    }
  }

  this.cmdDefType = async function(cStmt, tt) {
    var j = 1;
    var st = -1;
    var range = false;
    while (j < cStmt.length) {
      switch(true){
        case this.isTokenVariable(cStmt[j].token): // var
          if (range) {
            var en = cStmt[j].arg.charCodeAt(0) - 65;
            for (k=st; k<= en; k++) {
              this.impliedType[k] = tt;
            }
          } else {
            st = cStmt[j].arg.charCodeAt(0) - 65;
            this.impliedType[st] = tt;
          }
          break;
        case this.isTokenArgSeparator(cStmt[j].token): // ,
          st = -1;
          range = false;
          break;
        case (cStmt[j].token == 234):  // -
          if (st < 0) {
            await this.reportError ("Syntax Error Range Missing Starting Value");
            j = cStmt.length;
          } else {
            range = true;
          }
          break;
      }
      j++
    }
  }

  this.running = async function() {
    if (this.program.length > 0) {
      while (!this.stopRun) {
        this.ignoreRemainderOfLine = false;
        this.condStack = [];  
        await this.runCurrentLine(this.program[this.lineIdx]);
        if ((typeof this.program[this.lineIdx] != "undefined") &&
        (this.statementIdx >= this.program[this.lineIdx].length)) {
          this.lineIdx++;
          this.ignoreRemainderOfLine = false;
          this.condStack = [];
          this.statementIdx = 1;
          if (this.lineIdx >= this.program.length) {
            this.stopRun = true;
          }
        }
      }
    }
  }

  this.getNextDataStatement = async function() {
    var done = false;
    var negItem = false;
    while (!done) {
      if(this.program[this.dataLineIdx][this.dataStatementIdx][0].token != 132) {
        this.dataStatementIdx++;        
        if (this.dataStatementIdx = this.program[this.dataLineIdx].length) {
          this.dataLineIdx++;
          this.dataStatementIdx = 1;
        }
        if (this.dataLineIdx == this.program.length) {
          done = true;
        } 
      }
      if(( this.dataLineIdx < this.program.length) &&
      (this.program[this.dataLineIdx][this.dataStatementIdx][0].token == 132)) {
        done = true;
        var j=1;
        var dataDone = false;
        while (!dataDone) {
          var cItem = this.program[this.dataLineIdx][this.dataStatementIdx][j];
          if (this.isTokenArgSeparator(cItem.token)) {
            // arg separators
            negItem = false;
          } else if ((cItem.token == 26) || (cItem.token == 234)) {
            negItem = !negItem;
          } else if (this.isTokenLiteral(cItem.token)) {
            if (negItem && cItem.token == tokenType.numericLiteral) {
              this.dataBuffer.push(-cItem.arg);
            } else {
              this.dataBuffer.push(cItem.arg);
            }
            negItem = false;
          } else if (false) {
            dataDone = true;
          }
          j++;
          if (j==this.program[this.dataLineIdx][this.dataStatementIdx].length) {
            dataDone = true;
          }
        }
        this.dataStatementIdx++;
        if (this.dataStatementIdx = this.program[this.dataLineIdx].length) {
          this.dataLineIdx++;
          this.dataStatementIdx = 1;
        }
      } 
    }
  }

  this.getNextDataItem = async function(){
    if (this.dataBuffer.length == 0) {
      await this.getNextDataStatement();
    }
    if (this.dataBuffer.length == 0) {
      await this.reportError("READ but no more DATA");
    } else {
      return this.dataBuffer.shift();
    }
  }

  this.rndCycle = async function() {
    this.rnd_seed = (this.rnd_seed * rnd_multiplier + rnd_increment) % rnd_period;
  }

  this.cmdRestore = async function(startLine) {
    this.dataStatementIdx = 1;
    this.dataLineIdx = 0;
    this.dataBuffer = [];
    if (typeof(startLine) == "number") {
      this.dataLineIdx = await this.findLine(startLine);
    } 
    if (this.lineIdx < 0) {
      await this.reportError ("ERROR Restore Line not found: " + startLine);
    } 
  }
  
  
  this.cmdRun = async function(startLine){
    this.statementIdx = 1;
    this.lineIdx = 0;
    this.stopRun = false;
    await this.cmdClear();
    if (typeof(startLine) == "number") {
      this.lineIdx = await this.findLine(startLine);
    } 
    if (this.lineIdx < 0) {
      await this.reportError ("ERROR Line not found: " + startLine);
    } else {
      await this.running();
    }
  }

  this.printItem = async function(item, supressSpace){
    var tmpStr = "";
    var spacer = " ";
    if (supressSpace) {
      spacer = "";
    }
    this.supressSpace = false;
    if (item.token > 128) {
      var tokenIndex = basicKeywords.findIndex( function(x){
        return(x.token == item.token);
      });
      tmpStr = tmpStr + spacer + basicKeywords[tokenIndex].cmd;
      switch(item.token) {
        case 143:
          tmpStr = tmpStr + spacer + item.arg;
          break;
      }
    } else {
      switch(item.token) {
        case tokenType.stringLiteral:
          tmpStr = tmpStr + spacer + "\"" + item.arg + "\"";
          break;
        case tokenType.argSeparator:
          tmpStr = tmpStr + item.arg;
          break;
        case tokenType.variableImplied:
        case tokenType.userFunctionImplied:
          tmpStr = tmpStr + spacer + item.arg;
          break;
        case tokenType.variableString:
        case tokenType.userFunctionString:
          tmpStr = tmpStr + spacer + item.arg + "$";
          break;
        case tokenType.variableInteger:
        case tokenType.userFunctionInteger:
          tmpStr = tmpStr + spacer + item.arg + "%";
          break;
        case tokenType.variableSP:
        case tokenType.userFunctionSP:
          tmpStr = tmpStr + spacer + item.arg + "!";
          break;
        case tokenType.variableDP:
        case tokenType.userFunctionDP:
          tmpStr = tmpStr + spacer + item.arg + "#";
          break;
        case tokenType.openParen:
        case tokenType.openBracket:
          tmpStr = tmpStr + item.arg;
          this.supressSpace = true;
          break;
        case tokenType.unaryMinus:
          tmpStr = tmpStr + spacer + item.arg;
          this.suppressSpace = true;
          break;
        case tokenType.numericLiteral:
          tmpStr = tmpStr + spacer + item.arg;
          break;
        case tokenType.closeParen:
        case tokenType.closeBracket:
          tmpStr = tmpStr + item.arg;
          break;
        case tokenType.impliedLet:
          break;
        default:
          tmpStr = tmpStr + spacer + "?";
          break;
     }
     if (this.isTokenVariable(item.token)) {
       if (typeof item.dims != "undefined" ) {
         tmpStr = tmpStr + "(";
         this.supressSpace = true;
         for (var k=0; k< item.dims.length; k++) {
           tmpStr = tmpStr + await this.printItem(item.dims[k], this.supressSpace);
           }
         tmpStr = tmpStr + ")";
       }
     }
     if (this.isTokenUserFunction(item.token)) {
       if (typeof item.dims != "undefined" ) {
         tmpStr = tmpStr + "(";
         this.supressSpace = true;
         for (var k=0; k< item.dims.length; k++) {
           tmpStr = tmpStr + await this.printItem(item.dims[k], this.supressSpace);
           }
         tmpStr = tmpStr + ")";
       }
     }
    }
    return(tmpStr);
  }
  
  this.cmdRandomize = async function(seed) {
    seed = seed & 0x7fff;
    this.rnd_seed = seed;
    this.rndCycle();
  }

  this.cmdClear = async function(){
      this.ignoreRemainderOfLine = false;
      await this.cmdRestore();
      this.rnd_seed = rnd_initialSeed;
      this.varStr = {}; // regular variables
      this.varInt = {};
      this.varSP = {};
      this.varDP = {};
      this.varAStr = {}; // array variables
      this.varAInt = {};
      this.varASP = {};
      this.varADP = {};
      this.whileStack = [];
      this.forStack = [];
      this.condStack = [];
      this.goSubStack = [];
      
  // clear user functions, common
  // clears on error
  // set err and erl to zero
  // clears loop stack
  }

  this.deleteLines = async function(low, high) {
    var st = await this.findLineOrLower(low);
    var en = await this.findLineOrLower(high);
    if (en < this.program.length) {
      if (this.program[en][0].arg == high) {
        en++
      }
    } else {
      // 
    }
    if ((en-st) > 0) {
      this.program.splice(st,en-st);
    }
  }

  this.listProgram = async function(low, high){
    var st = await this.findLineOrLower(low);
    var done = false;
    var i= st;
    while ((i<this.program.length) && !done) {
      var tmpStr = "";
      if (this.program[i][0].arg <= high) {
        tmpStr = this.program[i][0].arg;
        for (var j=1; j<this.program[i].length;j++){
          for (var k=0; k< this.program[i][j].length; k++) {
            tmpStr = tmpStr + await this.printItem(this.program[i][j][k], 
            this.supressSpace);
          }
          if (j < this.program[i].length - 1) {
            if ((this.program[i][j+1][0].token != 161) &&
            (this.program[i][j][this.program[i][j].length-1].token != 161) &&
            (this.program[i][j][this.program[i][j].length-1].token != 205) ) {  
              tmpStr = tmpStr + ":";
            }
          }
        }
        await this.outputString(tmpStr + "\r\n");
        i++;
      } else {
        done = true;
        i=99999;
      }
    }
  }

  this.askRandomSeed = async function() {
    var inDone = false;
    var rsResult;
    while (!inDone) {
      await this.outputString("Random number seed (-32768 to 32767)? ");
      var inStr = await this.getInput();
      inStr = inStr.trim();
      if (inStr.length > 0) {
        if (!isNaN(inStr)) {
          rsResult = Number(inStr);
          inDone = true;
        }
      } else {
        inDone = true;
        rsResult = 0;
      }
    }
    return(rsResult);
  }
   
  this.handleInput = async function (inVars, inPrompt) {
    var inDone = false;
    var inData;
    var haveQuote = false;
    var inputOk = true;
    inPrompt = inPrompt + " ";
    while (!inDone) {
      inData = [];
      // quotes removed around strings, quotes and commas allowed after
      // initial quote
      await this.outputString(inPrompt);
      var inStr = await this.getInput();
      var j=0;
      var tmpStr = "";
      var endQuote = false;
      while(j< inStr.length) {
        switch (inStr[j]) {
          case "\"":
            if (haveQuote) {
              inData.push(tmpStr);
              tmpStr = "";
              haveQuote = false;
              endQuote = true;
            } else {
              if (tmpStr.length == 0) {
                haveQuote = true;
              } else {
                inData.push(tmpStr);
                tmpStr = "";
                haveQuote = true;
              }
            }
            break;
          case " ":
            if ((haveQuote)||(tmpStr.length>0)) {
              tmpStr = tmpStr + inStr[j];
            }
            break;
          case ",":
            if (haveQuote) {
              tmpStr = tmpStr + inStr[j];
            } else {
              if ((!endQuote) || (j==0)) {
                inData.push(tmpStr);
                tmpStr = "";
              }
            }
            break;
          default:
            tmpStr = tmpStr + inStr[j];
            endQuote = false;
            break;
        }
        j++;
      }
      if (tmpStr.length > 0) {
        inData.push(tmpStr);
      }
      inputOk = true;
      if (inData.length == inVars.length) {
        for (j=0;j<inData.length;j++){
          if (inVars[j].token == tokenType.variableString) {
            await this.saveVar(inVars[j],inData[j]);
          } else {
            if (inData[j] == "") {
              await this.saveVar(inVars[j],0);
            } else {
              if (isNaN(inData[j])) {
                inputOk = false;
              } else {
                await this.saveVar(inVars[j], Number(inData[j]));
              }
            }
          }
        }  
      } else {
        inputOk = false;
      }
      if (inputOk) {
        inDone = true;
      } else {
        inputOk = false;
        await this.outputString("?Redo from start\r\n");
      }
    }
  }
  
  this.formatNumber = async function(n,before,after,useDollar,useStar,
   bSign,aSign,useCommas) {
    pn = Math.abs(n);
    if (after < 0) {
      var st = pn.toFixed(0);
    } else {
      var st =  pn.toFixed(after);
    }
    var decPos = st.indexOf('.');
    if (decPos < 0) {
      decPos = st.length;
    }
    var fc = before - decPos 
    if (useDollar) {
      st = "$" + st;
      fc--;
    }
    switch(bSign) {
      case "+":
        if (n < 0) {
          st = "-" + st;
        } else {
          st = "+" + st;
        }
        break;
      default:
        if (aSign!="+" && aSign!="-") {
          if (n<0) {
            st = "-" + st;
          }
        }
        break;
    }
    if (fc > 0) {
      if (useStar) {
        st = "*".repeat(fc) + st;
      } else {
        st = " ".repeat(fc) + st;
      }
    }
    if (after == 0) {
     st = st + ".";
    }
    if (useCommas) {
      var cPos = st.indexOf('.');
      if (cPos < 0) { 
        cPos = st.length 
      }
      cPos--;
      while (cPos > 2) {
       if (this.isDigit(st[cPos]) && this.isDigit(st[cPos - 1]) &&
       this.isDigit(st[cPos-2]) && this.isDigit(st[cPos - 3])) {
         st = st.slice(0,cPos - 2) + "," + st.slice(cPos-2);
       }
       cPos = cPos - 3;
      }
    }
    switch (aSign) {
      case "+":
        if (n<0) {
          st = st + "-";
        } else {
          st = st + "+";
        }
        break;
      case "-":
        if (n < 0) {
          st = st+"-";
        } else {
          st = st+ " ";
        }
        break;
    }
    return(st);
  }

  this.parseUsing = async function(usingFormat) {
    var usingFA = [];
    var state = 0;
    var leading = "";
    var i=0;
    while (i < usingFormat.length) {
      switch (state) {
        case 0: // check for format type
          if (this.isPrintUsingStringChar(usingFormat[i])) {
            var fObj = {};
            fObj.type = "S";
            fObj.leading = leading;
            fObj.trailing = "";
            fObj.len = 1;
            if (usingFormat[i] == "!") {
              state = 4;
            } else {
              if (usingFormat[i] == "&") {
                state = 4;
                fObj.len = -1;
              } else {
                state = 1;
              }
            } 
          } else if (this.isPrintUsingNumChar(usingFormat[i])) {
            fObj = {};
            fObj.type = "N";
            fObj.leading = leading;
            fObj.trailing = "";
            fObj.bLen = 0;
            fObj.aLen = -1;
            fObj.bSign = "";
            fObj.aSign = "";
            fObj.afterDec = false;
            fObj.useCommas = false;
            fObj.useStar = false;
            fObj.useDollar = false;
            fObj.useExp = false;
            state = 2;
            i--;
          } else {
            leading = leading + usingFormat[i];
            state = 3;
          }
          break;
        case 1: // accum \ string
          fObj.len++;
          if (usingFormat[i] == "\\") {
            state = 4;
          }
          break;
        case 2: // accum numeric
          if (this.isPrintUsingNumChar(usingFormat[i])) {
            switch (usingFormat[i]) {
              case "#":
                if (fObj.afterDec) {
                  fObj.aLen++;
                } else {
                  fObj.bLen++;
                }
                break;
              case "-":
              case "+":
                if ((fObj.afterDec) || (fObj.bLen > 0)) {
                  fObj.aSign = usingFormat[i];
                } else {
                  fObj.bSign = usingFormat[i];
                }
                break;
              case "$":
                if (fObj.afterDec) {
                  state = 4;
                  i--;
                } else {
                  if ((i < usingFormat.length - 1) && (usingFormat[i+1] == "$")) {
                    fObj.useDollar = true;
                    fObj.bLen++;
                  } else {
                    fObj.bLen++;
                  }
                }
                break;
              case "^":
                if ((i < usingFormat.length - 3) && (usingFormat[i+1] == "^")
                && (usingFormat[i+2] == "^") && (usingFormat[i+3] == "^")) {
                  fObj.useExp = true;
                  i = i+3;
                } else {
                  state = 4;
                  fObj.trailing = usingFormat[i];
                }
                break;
              case "*":
                if (fObj.afterDec) {
                  state = 4;
                  i--;
                } else {
                  if ((i < usingFormat.length - 1)  && (usingFormat[i+1] == "*")){
                    fObj.bLen++;
                    fObj.useStar = true;
                    if ((i < usingFormat.length - 2) && (usingFormat[i+2] == "$")) {
                      fObj.useDollar = true;
                    }
                  } else {
                    fObj.bLen++;
                  }
                }
                break;
              case ",":
                if (fObj.afterDec) {
                  state = 4;
                  i--;
                } else {
                  fObj.useCommas = true;
                }
                break;
              case ".":
                fObj.afterDec = true;
                fObj.aLen = 0;
                break;
              default:
                break;
            }
          } else {
            state = 4;
            fObj.trailing = "";
            i--;
          }
          break;
        case 3: // accum leading
          if (this.isPrintUsingChar(usingFormat[i])) {
            i--;
            state = 0;
          } else {
            leading = leading + usingFormat[i];
          }
          break;
        case 4: // accum trailing
          if (this.isPrintUsingChar(usingFormat[i])) {
            usingFA.push(fObj);
            leading = "";
            i--;
            state = 0;
          } else {
            fObj.trailing = fObj.trailing + usingFormat[i];
          }
          break;
        default:
          console.log("parsing Print Using unexpected state");
          break;
      }
      i++;
    }
    if (state != 0) {
      usingFA.push(fObj);
    }
    return usingFA;
  }


  this.processStatement = async function(cStmt) {
    if (typeof cStmt[0].token == "number") {
    switch(cStmt[0].token) {
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
        await this.reportError("Assignment missing = ");
        break;
      case 129: // END
        this.stopRun = true;
        break;
      case 130: // FOR
        var forVar = {};
        var value = 0;
        var toLimit = 0;
        var step = 1;
        if (cStmt[2].token == 231) {  // =
          var forVar = cStmt[1];  // Var for FOR loop
          var j=3;
          while ((j<cStmt.length) && (cStmt[j].token != 204 /* TO */ )) {
            j++;
          }
          if (j == cStmt.length) {
            await this.reportError("FOR statement has missing TO");
          } else {
            var ex = cStmt.slice(3,j);  // initial value for LOOP var
            var rpn = await this.parseExpression(ex);
            value = await this.evaluateExpression(rpn);
            k=j+1;
            while ((k<cStmt.length) && (cStmt[k].token != 207 /* STEP */)) {
              k++;
            }
            ex = cStmt.slice(j+1,k) // TO loop value
            rpn = await this.parseExpression(ex);
            toLimit = await this.evaluateExpression(rpn);
            if (k== cStmt.length) {
              step = [1];
            } else {
              ex = cStmt.slice(k+1);
              rpn = await this.parseExpression(ex);
              step = await this.evaluateExpression(rpn);  
            }
          }
        } else {
          await this.reportError("Missing = in for loop assign statement");
        }
        await this.saveVar(cStmt[1], value[0]);
        var tmp = {};
        tmp.lineIdx = this.lineIdx;
        tmp.statementIdx = this.statementIdx;
        tmp.forVar = forVar;
        tmp.toLimit = toLimit[0];
        tmp.step = step[0];
        this.forStack.push(tmp);
        break;
      case 131: // NEXT
        var nextArgs = [];
        var i = 1;
        while (i < cStmt.length) {
          if (this.isTokenVariable(cStmt[i].token)) {
            nextArgs.push(cStmt[i]);
          }
          i++;
        }
        var doneArgs = false;
        i = 0;
        while(!doneArgs) {
          tmp =  this.forStack.peek();   
          var forDone = false;
          // Search for matching variable
          if ((this.forStack.length > 1) && (tmp.forVar.arg != nextArgs[i].arg)) {
            var j= this.forStack.length - 1;
            var np = 0;
            while ((this.forStack[j].forVar.arg != nextArgs[i].arg) && (j>=0)) {
              j--;
              np++;
            }
            if (j>=0) { 
              while (np > 0) {
               this.forStack.pop();
               np--;
              }
              tmp =  this.forStack.peek();   
            }
          }
          if ((nextArgs.length == 0) || (tmp.forVar.arg == nextArgs[i].arg)) {
            var nv = await this.getVar(tmp.forVar) + tmp.step;
            await this.saveVar(tmp.forVar, nv);
            if (tmp.step < 0) {
              if (await this.getVar(tmp.forVar) < tmp.toLimit) {
                forDone = true;
              }
            } else {
              if (await this.getVar(tmp.forVar) > tmp.toLimit) {
                forDone = true;
              }
            }
            if (!forDone) {
              this.lineIdx = tmp.lineIdx;
              this.currentLine=this.program[this.lineIdx][0].arg;
              if (this.trace) {
                var tmpStr = "[" + this.currentLine + "] ";
                await this.outputString(tmpStr);
              }
              this.statementIdx = tmp.statementIdx + 1;
              this.ignoreRemainderOfLine = true;
              doneArgs = true;
            } else {
              this.forStack.pop();
              i++;
              if (i==nextArgs.length) {
                doneArgs=true;
              };
            }
          } else {
            await this.reportError("Mismatched For/Next: " +  nextArgs[i].arg + 
            " " + tmp.forVar.arg);
            done = true;
            doneArgs = true;
          }
          if (this.forStack.length == 0) {
            doneArgs = true;
          }
        }
        break;
      case 132: // DATA note:all processing done by READ
        break;
      case 133: // INPUT
        var inVars = [];
        var j=1;
        var inPrompt = "? ";
        while (j < cStmt.length) {
          if (this.isTokenVariable(cStmt[j].token)) {
            inVars.push(cStmt[j]);
          } else if (this.isTokenArgSeparator(cStmt[j].token)) {
            // ignore
          } else if ((cStmt[j].token = tokenType.stringLiteral) && (j==1)) {
            inPrompt = cStmt[j].arg;
          } else {
            j = 999999;
            this.reportError("Invalid input arguments");
          }
          j++;
        }
        if (j <= cStmt.length) {
          await this.handleInput(inVars, inPrompt);
        }
        break;
      case 134: // DIM
        var dimsDone = false;
        var errMsg = "";
        var j=1;
        while ((!dimsDone) && (errMsg.length==0)) {
          switch(true) {
            case this.isTokenVariable(cStmt[j].token):
              var dims = await this.evaluateExpression(await this.parseExpression(cStmt[j].dims));
              dims = await this.evalToArray(dims);
              var vars = await this.setVars(cStmt[j]);
              if (typeof vars[cStmt[j].arg] == "undefined") {
                vars[cStmt[j].arg] = {};
              }
              if (typeof vars[cStmt[j].arg].data == "undefined") {
                vars[cStmt[j].arg].data = [];
              }
              if (typeof vars[cStmt[j].arg].dims != "undefined") {
                await this.reportError("Dimensions already defined");
              } else {
                vars[cStmt[j].arg].dims = dims;
              }
              break;
            case this.isTokenArgSeparator(cStmt[j].token):
              // ignore separator
              break;
            default:
              errMsg = "Syntax error in DIM statment";
              break;
          }
          j++;
          if (j==cStmt.length) {
            dimsDone=true;
          }
        }
        break;
      case 135: // READ
        var j=1;
        var readDone=false;
        while(!readDone) {
          if(j>=cStmt.length) {
            readDone=true;
          } else {
            if (this.isTokenVariable(cStmt[j].token)) {
              await this.saveVar(cStmt[j], await this.getNextDataItem());
            } else {
              if (!this.isTokenArgSeparator) {
                await this.reportError("Syntax error in READ statement");
                readDone = true;
              }
            }
          }
          j++
        }
        break;
      case 24: // implied LET
      case 136: // LET 
        if (cStmt[2].token == 231 ) {
          var varName = cStmt[1].arg;
          rpn = await this.parseExpression(cStmt.slice(3));
          var value = await this.evaluateExpression(rpn);
          value = value[0];
          await this.saveVar(cStmt[1], value);
        } else {
          await this.reportError("Missing = in assign statement");
        }
        break;
      case 137: // GOTO
        if (typeof(cStmt[1].arg == "number")) {
          await this.cmdGoto(cStmt[1].arg);
        } else {
          await this.reportError("GOTO must have line number");
        }      
        break;
      case 138: // RUN
        if ((typeof (cStmt[1]) != "undefined") 
        && (typeof (cStmt[1].arg == "number"))){
          await this.cmdRun(cStmt[1].arg);
        } else {
          await this.cmdRun();
        }
        break;
      case 139: // IF
        var j=1;
        var done = false;
        while (!done) {
          if (cStmt[j].token == 205 /* THEN*/) {
            done = true;
          } else {
            j++;
          }
          if (j==cStmt.length) {
            done = true;
            await this.reportError("Missing THEN in IF statement");
          }
        }
        if (j < cStmt.length) { // check conditional expression
          rpn = await this.parseExpression(cStmt.slice(1,j));
          var conditional = await this.evaluateExpression(rpn);
        }
        var tmpObj = {};
        tmpObj.conditional = conditional[0];
        tmpObj.nestedIf = 0;
        if (conditional[0]) {
          tmpObj.state = 0;  // process until ELSE  then skip until EOL
        } else {
          tmpObj.state = 1;  // skip until ELSE
        }
        this.condStack.push(tmpObj);
        break;
      case 140: // RESTORE
        await this.cmdRestore();
        break;
      case 141: // GOSUB
        if (typeof(cStmt[1].arg == "number")) {
          await this.cmdGosub(cStmt[1].arg);
        } else {
          await this.reportError("GOTO must have line number");
        }      
        break;
      case 142: // RETURN
        if (this.goSubStack.length < 1) {
          await this.reportError("Missing GOSUB for RETURN");
        } else {
          tmpObj = this.goSubStack.pop();
          this.lineIdx = tmpObj.lineIdx;
          this.statementIdx = tmpObj.statementIdx + 1;
          this.condStack = tmpObj.condStack;
          this.ignoreRemainderOfLine = true;
        }
        break;
      case 217: // '
      case 143: // REM
        break;
      case 144: // STOP
        await this.outputString("\r\nBreak in line " + this.currentLine + "\r\n");
        this.stopRun = true;
        break;
      case 145: // PRINT
        var u=1;
        var uDone = false;
        if (cStmt.length < 2) {
          uDone = true;
          ex = [];
        }
        while (!uDone) {
          if (cStmt[u].token == 215) {
            uDone = true;
            if (u < cStmt.length - 3) {
              if (cStmt[u+1].token == tokenType.stringLiteral) {
                var usingFormat = cStmt[u+1].arg;
              } else {
                await this.reportError("PRINT USING requires string literal format");
              }
              if (cStmt[u+2].token == tokenType.argSeparator) {
                var usingEx=cStmt.slice(u+3);
              } else {
                await this.reportError("PRINT USING requires ; after format");
                usingEx = [];
              }
            } else {
              await this.reportError("Syntax Error on PRINT USING");
            }
          } else {
            u++;
            if (u == cStmt.length) { // USING not found
              uDone = true;
            }
          }
        }
        var ex = cStmt.slice(1,u);
        var k=0;
        while(k < ex.length - 1) {
          if (((this.isTokenLiteral(ex[k].token)) || (this.isTokenVariable(ex[k].token))) &&
          ((this.isTokenLiteral(ex[k+1].token)) || (this.isTokenVariable(ex[k+1].token)))) {
            ex.splice(k+1,0,{token:8,arg:";"});         
          }
          k++;
        }
        var rpn = await this.parseExpression(ex);
        var tmp = await this.evaluateExpression(rpn);
        var lastType = "";
        for (var j=0; j < tmp.length; j++) {
          lastType = typeof tmp[j];
          switch(typeof tmp[j]) {
            case "number":
              tmp[j] = tmp[j].toString();
              break;
            case "string":
              break;
            case "boolean":
              if (tmp[j]) {
                tmp[j] = 'true';
              } else {
                tmp[j] = 'false';
              }
              break;
            case "object":
              switch (tmp[j].token) {
                case 8:
                  switch(tmp[j].arg) {
                    case ";":
                      tmp[j] = "";
                      break;
                    case ",":
                      var xy = await this.getXY();
                      var n = 15-xy.x%14;
                      tmp[j] = " ".repeat(n);
                      break;
                    default:
                      tmp[j] = " "
                      break;
                  }
                  break;
                case 206: // TAB(N)
                  var n = tmp[j].num;
                  if (n > 80) { n = n%80}
                  if (n < 1) { n=1}
                  var xy = await this.getXY();
                  if (xy.x > n) {
                    tmp[j] = "'\r\n" + " ".repeat(n -1)
                  } else {
                    tmp[j] = " ".repeat(n - xy.x);
                  }
                  break;
                case 210: // SPC(N)
                  break;
                default:
                  tmp[j] = " ";
                  break;
              }
              break;
            default:
              await this.reportError("Internal Error in Print Statment");
              break;
          }
          await this.outputString(tmp[j]);
        }
        if (typeof usingEx != "undefined") {
          // parse usingFormat, apply and print
          ex = usingEx;
          var k=0;
          while(k < ex.length - 1) {
            if (((this.isTokenLiteral(ex[k].token)) || (this.isTokenVariable(ex[k].token))) &&
            ((this.isTokenLiteral(ex[k+1].token)) || (this.isTokenVariable(ex[k+1].token)))) {
              ex.splice(k+1,0,{token:8,arg:";"});         
            }
            k++;
          }
          var rpn = await this.parseExpression(ex);
          var tmp = await this.evaluateExpression(rpn);
          var usingFA = await this.parseUsing(usingFormat);
          if (usingFA.length < 1) {
            await this.reportError("Syntax Error in USING format");
          }
          var fCtr = 0;
          for (var j=0; j < tmp.length; j++) {
            lastType = typeof tmp[j];
            switch(typeof tmp[j]) {
              case "number":
                if (usingFA[fCtr].useExp) {
                  var st = tmp[j].toExponential(usingFA[fCtr].aLen);
                  var e = st.indexOf('e');
                  var a = st.substring(0,e);
                  a = await this.formatNumber(a, usingFA[fCtr].bLen,
                    usingFA[fCtr].aLen, usingFA[fCtr].useDollar, usingFA[fCtr].useStar,
                    usingFA[fCtr].bSign, usingFA[fCtr].aSign, usingFA[fCtr].useCommas);
                  var b = st.substring(e+1);
                  b = await this.formatNumber(b, 2,-1,false,false,"+","",false);
                  if (b[0] == " ") {
                    b = b.substring(1,2) + "0" + b.substring(2);
                  }
                  var ch = a.substr(-1);
                  if (ch==" " || ch=="+" || ch=="-") {
                    a=a.substring(0,a.length-1);
                    b=b+ch;
                  }
                  tmp[j] = a + "E" + b;
                } else {
                  tmp[j] = await this.formatNumber(tmp[j],usingFA[fCtr].bLen,
                    usingFA[fCtr].aLen, usingFA[fCtr].useDollar, usingFA[fCtr].useStar,
                    usingFA[fCtr].bSign, usingFA[fCtr].aSign, usingFA[fCtr].useCommas);
                }
                tmp[j] = usingFA[fCtr].leading + tmp[j] + usingFA[fCtr].trailing;
                fCtr++;
                if (fCtr >= usingFA.length) {
                  fCtr = 0;
                }
                break;
              case "string":
                if (fCtr < usingFA.length) {
                  if (usingFA[fCtr].type == "S") {
                    if (usingFA[fCtr].len > 0) {
                      tmp[j] = (tmp[j] + " ".repeat(usingFA[fCtr].len)).substring(0,usingFA[fCtr].len);
                    }
                  } else {
                    await this.reportError("Type Mismatch in PRINT USING");
                  }
                  tmp[j] = usingFA[fCtr].leading + tmp[j] + usingFA[fCtr].trailing;
                }
                fCtr++;
                if (fCtr >= usingFA.length) {
                  fCtr = 0;
                }
                break;
              case "boolean":
                if (tmp[j]) {
                  tmp[j] = 'true';
                } else {
                  tmp[j] = 'false';
                }
                break;
              case "object":
                tmp[j] = "";
                break;
              default:
                await this.reportError("Internal Error in Print Statment");
                break;
            }
            await this.outputString(tmp[j]);
          }
        }
        if (lastType != "object") {
          await this.outputString("\r\n");
        }
        break;
      case 146: // CLEAR
        await this.cmdClear();
        break;
      case 147: // LIST
        var low=0;
        var high = 999999;
        var lstate = 0;
        var k=1;
        var errMsg = ""
        while (k < cStmt.length) {
          switch (cStmt[k].token) {
            case tokenType.numericLiteral:
              if (lstate == 0) {
                low = cStmt[k].arg;
              } else {
                high = cStmt[k].arg;
              }
              break;
            case 234: // -
              lstate = 1;
              break;
            default:
              errMsg = "Syntax Error in LIST statement";
              break;
          }
          k++;
        }        
        if ((cStmt.length == 2) && (cStmt[1].token == tokenType.numericLiteral)) {
          low = cStmt[1].arg;
          high = cStmt[1].arg;
        }
        if (errMsg.length > 0) {
        } else {
          await this.listProgram(low,high);
        }
        break;
      case 148: // NEW
        this.program = [];
        this.stopRun = true;
        await this.cmdClear();
        break;
      case 149: // ON
        if (cStmt[1].token == 167) { // ON ERROR
          if ((cStmt.length >= 4) && (cStmt[2].token == 137)) { // ON ERROR GOTO
            if (cStmt[3].token == 5) { // ON ERROR GOTO numeric literal}
              this.onErrorLine = cStmt[3].arg;
            } else {
              await this.reportError("Syntax Error must give line number");
            }
          } else {
            await this.reportError("Syntax Error ON ERROR GOTO");
          }
        } else {
          var j=1;
          var done = false;
          var errorMsg = "";
          while (!done ) {
            if ((cStmt[j].token ==137) || (cStmt[j].token == 141)){
              done=true;
              var action = cStmt[j].token;
              ex = cStmt.slice(1,j);
              var rpn = await this.parseExpression(cStmt.slice(1,j));
              var tmp = await this.evaluateExpression(rpn);
              var tmpIdx = tmp[0];
              j++;
            } else {
              j++;
              if (j==cStmt.length) {
                done = true;
                errorMsg = "Syntax Error Mising GOTO GOSUB";
              }
            }
          }
          if (errorMsg == "") {
            if ((tmpIdx < 1) || (tmpIdx > 255)) {
              errorMsg = "On Value Out of Range";
            }
          }
          if (errorMsg == "") {
            done = false;
            while (!done) {
              if (cStmt[j].token == 5) {
                tmpIdx --;
                if (tmpIdx == 0) {
                  done = true;
                  var targetLine = cStmt[j].arg;
                } else {
                  j++;
                }
              } else {
                j++;
              }
              if (j == cStmt.length) {
                errorMsg = "Insufficient arguments";
              }
            }
          }
          if (errorMsg == "") {
            if (action==137) { // GOTO
              await this.cmdGoto(targetLine);
            } else {  // GOSUB
              await this.cmdGosub(targetLine);
            }
          }
          if (errorMsg != "") {
            await this.reportError(errorMsg);
          }
        }
        break;
      case 151: // DEF
        var j=0;
        if (cStmt[1].token == 209) {
          j=2;
        } else {
          j=1;
          if (this.isTokenUserFunction(cStmt[1].token)) {
            j=1;
          }
        }
        if ((j>0) && (cStmt.length > j+2) && (cStmt[j+1].token == 231 )) {
          if (j==1) {
            var name = cStmt[j].arg.substring(2);
          } else {
            var name = cStmt[j].arg;
            switch (cStmt[j].token) {
              case tokenType.variableString: cStmt[j].token = tokenType.userFunctionString; break;
              case tokenType.variableInteger: cStmt[j].token = tokenType.userFunctionInteger; break;
              case tokenType.variableSP: cStmt[j].token = tokenType.userFunctionSP; break;
              case tokenType.variableDP: cStmt[j].token = tokenType.userFunctionDP; break;
              case tokenType.variableImplied: cStmt[j].token = tokenType.userFunctionImplied; break;
            }
          }
          cStmt[j].token = await this.getFunctionImpliedType(cStmt[j]);
          var args = [];
          for (var k=0;k<cStmt[j].dims.length;k++) {
            if (this.isTokenVariable(cStmt[j].dims[k].token)) {
              cStmt[j].dims[k].token = await this.getImpliedType(cStmt[j].dims[k]);
              args.push(cStmt[j].dims[k]);
            }
          }
          var exp = cStmt.slice(j+2);
          for (var k=0;k< exp.length;k++) {
            exp[k].token = await this.getImpliedType(exp[k]);
            if (this.isTokenVariable(exp[k].token)) {
              for (var m=0; m< args.length; m++) {
                if ((exp[k].token == args[m].token) &&
                (exp[k].arg == args[m].arg)) {
                  exp[k].token = tokenType.userFunctionArg;
                  exp[k].arg = m;
                }
              }
            }
          }
          vars = 0;
          switch(cStmt[j].token){
            case tokenType.userFunctionString:
              vars = this.varStr;
              break;
            case tokenType.userFunctionInteger:
              vars = this.varInt;
              break;
            case tokenType.userFunctionSP:
              vars = this.varSP;
              break;
            case tokenType.userFunctionDP:
              vars = this.varDP;
              break;
            default:
              await this.reportError("Internal Error Unknown Function Type");
              break;
          }
          if (typeof vars[name] == "undefined") {
            vars[name] = {};
          }
          vars[name].userfunction = exp;
          // save var 
        } else {
          await this.reportError("Syntax Error in DEF FN");
        }
        break;
      case 161: // ELSE
        if (this.condStack.length > 0) {
          switch (this.condStack.peek().state) {
            case 0:
              this.condStack.peek().state = 2;
              break;
            case 1:
              var tmpObj = this.condStack.pop();
              tmpObj.state = 3;
              this.condStack.push(tmpObj);
              break;
            case 2:
              await this.reportError("Internal Error on ELSE 2");
              break;
            case 3:
              await this.reportError("Internal Error on ELSE 3");
              break;
          }
        } else {
          await this.reportError("ELSE without IF");
        }
        break;
      case 162: // TRON
        this.trace = true;
        break;
      case 163: // TROFF
        this.trace = false;
        break;
      case 164: // SWAP
        if ((this.isTokenVariable(cStmt[1].token)) &&
        (cStmt[1].token == cStmt[3].token) &&
        (this.isTokenArgSeparator(cStmt[2].token))) {
          var tmp1 = await this.getVar(cStmt[1]);
          var tmp2 = await this.getVar(cStmt[3]);
          await this.saveVar(cStmt[1], tmp2);
          await this.saveVar(cStmt[3], tmp1);
        } else {
          await this.reportError("Type Mismatch");
        }
        break;
      case 165: // ERASE
        var j=1;
        while (j < cStmt.length) {
          if (this.isTokenVariable(cStmt[j].token)) {
            await this.eraseVar(cStmt[j]);
          }
          j++;
        }
        break;
      case 169: // DELETE
        var low=0;
        var high = 999999;
        var lstate = 0;
        var k=1;
        var errMsg = ""
        while (k < cStmt.length) {
          switch (cStmt[k].token) {
            case tokenType.numericLiteral:
              if (lstate == 0) {
                low = cStmt[k].arg;
              } else {
                high = cStmt[k].arg;
              }
              break;
            case 234: // -
              lstate = 1;
              break;
            default:
              errMsg = "Syntax Error in LIST statement";
              break;
          }
          k++;
        }        
        if ((cStmt.length == 2) && (cStmt[1].token == tokenType.numericLiteral)) {
          low = cStmt[1].arg;
          high = cStmt[1].arg;
        }
        if (errMsg.length > 0) {
        } else {
          await this.deleteLines(low,high);
        }
        break;
      case 171: // RENUM
        var lnNew = 10;
        var lnStart = 0;
        var lnIncr = 10;
        var v = 0;
        for (var j= 1; j< cStmt.length; j++) {
          switch (cStmt[j].token) {
            case tokenType.numericLiteral:
              switch (v){
                case 0:
                  lnNew = cStmt[j].arg;
                  break;
                case 1:
                  lnStart = cStmt[j].arg;
                  break;
                case 2:
                  lnIncr = cStmt[j].arg;
                  break;
              }
              break;
            case tokenType.argSeparator:
              v++;
              break;
            default:
              await this.reportError("Syntax Error in RENUM");
              j = cStmt.length;
              break;
          }
        }
        await this.cmdRenum(lnNew, lnStart, lnIncr);
        break;
      case 172: // DEFSTR
        await this.cmdDefType(cStmt, tokenType.variableString);
        break;
      case 173: // DEFINT
        await this.cmdDefType(cStmt, tokenType.variableInteger);
        break;
      case 174: // DEFSNG
        await this.cmdDefType(cStmt, tokenType.variableSP);
        break;
      case 175: // DEFDBL
        await this.cmdDefType(cStmt, tokenType.variableDP);
        break;
      case 177: // WHILE
        var expr = await this.parseExpression(cStmt.slice(1));
        var res = await this.evaluateExpression(expr);
        var tmp={};
        tmp.expr = expr;
        tmp.lineIdx = this.lineIdx;
        tmp.statementIdx = this.statementIdx;
        tmp.state = res[0]; 
        tmp.nested = 0;
        this.whileStack.push(tmp);
        break;
      case 178: // WEND
        if (this.whileStack.length > 0) {
          tmp = this.whileStack.peek();
          if (tmp.nested > 0) {
            tmp.nested --;
          } else {
            var res = await this.evaluateExpression(tmp.expr);
            res = res[0];
            if (res) {
              this.lineIdx = tmp.lineIdx;
              this.statementIdx = tmp.statementIdx + 1;
              // this.condStack = tmpObj.condStack;
              this.ignoreRemainderOfLine = true;
            } else {
              this.whileStack.pop();
            }
          }
        } else {
          await this.reportError("WEND without matching WHILE");
        }
        break;
      case 185: // RANDOMIZE
        var seed = 1;
        if (cStmt.length > 1) {
          var seed = await this.evaluateExpression(await this.parseExpression(cStmt.slice(1)));
        } else {
          seed = await this.askRandomSeed();
        }
        this.cmdRandomize(seed);
        break;
      case 188: // LOAD
        var ex = cStmt.slice(1);
        var rpn = await this.parseExpression(ex);
        var tmp = await this.evaluateExpression(rpn);
        if (typeof tmp[0] == "string") {
          this.program = [];
          this.stopRun = true;
          await this.cmdClear();
          await this.loadFile(tmp[0]);
        } else {
          await this.reportError("Type Mismatch: " + tmp[0]);
        }
        break;
      case 191: // COLOR
        var tmp = await this.evaluateExpression(await this.parseExpression(cStmt.slice(1)));
        var tmp = await this.evalToArray(tmp);
        this.setColor(tmp[0],tmp[1]);
        break;
      case 192: // CLS
        // 0=all 1=graphics 2=text window
        this.clearScreen();
        break;
      case 197: // BEEP
        await this.outputString("\b");
        break;
      case 200: // SCREEN
        // ignored no effect on terminal programs
        break;
      case 202: // LOCATE
        var tmp = await this.evaluateExpression(await this.parseExpression(cStmt.slice(1)));
        var tmp = await this.evalToArray(tmp);
        await this.gotoXY(tmp[0],tmp[1]);
        break;
      case 0xfffa: // QUIT
      case 0xfe83: // SYSTEM
        this.endSession();
        break;
      case 0xff83: // MID$
        var errMsg = "";
        if ((!this.isTokenOpen(cStmt[1].token)) ||
        (cStmt[2].token != tokenType.variableString) ||
        (cStmt[3].token != tokenType.argSeparator)) {
          errMsg = "Syntax Error in MID$ assignment";
        }
        if (errMsg.length == 0) {
          var j=4;
          while ((!this.isTokenClose(cStmt[j].token))&&(j<cStmt.length)) {
            j++
          }
          if (j==cStmt.length) {
            errMsg = "MID$ missing close parenthesis";
          }
        }
        if (errMsg.length == 0) {
          var args = await this.evaluateExpression(await this.parseExpression(cStmt.slice(4,j)));
          if (args.length > 0) {
            var arg1 = args[0];
            if (args.length > 1) {
              arg2 = args[2];
            } else {
              arg2 = -1;
            }
          } else {
            var arg1 = 0;
            var arg2 = -1;
          }
        }
        if (errMsg.length == 0) {
          j++;
          if (cStmt[j].token != 231) {
            errMsg = "Syntax Error - MID$ statement missing assignment";
          }
        }
        if (errMsg.length == 0) {
          var expr = cStmt.slice(j+1);
          var value = await this.evaluateExpression(await this.parseExpression(expr));
        }
        if (errMsg.length == 0) {
          var inStr = await this.getVar(cStmt[2]);
          if (arg1 > inStr.length) {
            errMsg = "Error " + arg1 + " is greater then string length";
          } else {
            var tmp = Array.from(inStr);
            for (var k=0; k<arg2; k++){
              if (k < value[0].length) {
                if (arg1 + k - 1 > tmp.length - 1) {
                  tmp.push(value[0][k]);
                } else {
                  tmp[arg1+k-1] = value[0][k];
                }
              }
            }
            await this.saveVar(cStmt[2], tmp.join(""));
          }
        }
        if (errMsg.length > 0) {
          await this.reportError(errMsg);
        }
        break;
      default:
        await this.reportError("Cmd not implemented: " + cStmt[0].token);
        break;
    }
    } else {
      await this.reportError("Command not found");
    }  
  }
  
  this.processLine = async function(cLine) {
    this.currentLine = cLine[0].arg;
    var ctr = 1;
    while (ctr < cLine.length) {
      this.currentStatement = ctr - 1;
      if (!this.ignoreRemainderOfLine) {
        await this.processStatement(cLine[ctr],cLine);
      }
      ctr++;
    }
    this.ignoreRemainderOfLine = false;
  }

  this.deleteLine = async function(num) {
    var i = await this.findLine(num);
    if (i >= 0) {
      this.program.splice(i,1);
    }
  }

  this.addLine = async function(pLine) {
    var pLineNum = pLine[0].arg;
    if (this.program.length == 0) { // add to empty
      this.program.push(pLine);
    } else if (pLine[0].arg < this.program[0][0].arg) {  // add to begin
      this.program.unshift(pLine);
    } else if (pLine[0].arg > this.program[this.program.length-1][0].arg) {
      this.program.push(pLine);
    } else {
      var low = 0;
      var high = this.program.length;
      while (low < high) {
        var mid = (low + high) >>> 1;
        if (this.program[mid][0].arg < pLine[0].arg) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      if (this.program[low][0].arg == pLine[0].arg) {
        this.program.splice(low,1,pLine);
      } else {
        this.program.splice(low,0,pLine);
      }
    }
  }


  this.oneInputLine = async function(inLine) {
    try {
      inLine = inLine.trim();
      if (inLine.length > 0) {
        var cTokens = await this.tokenizeLine(inLine);
        var parsedLine = await this.parseLine(cTokens);
        if (parsedLine[0].arg < 0) {
          this.statementIdx = 1;
          this.stopRun = false;
          this.condStack = [];
          await this.runCurrentLine(parsedLine);
        } else {
          if (parsedLine.length > 1) {
            await this.addLine(parsedLine);
          } else {
            await this.deleteLine(parsedLine[0].arg);
          }
        }
      }
    } catch (err) {
      await this.reportError("Error: " + err);
    }
  }

  this.loadFile = async function(fname) {
    this.program = [];
    try {
      var filetext= await fs.promises.readFile(fname, "utf-8");
      var filelines = filetext.split("\n");
    } catch(err) {
      await this.reportError("Cannot load file " + fname);
      filelines = [];
    }
    for (let linenum=0; linenum < filelines.length; linenum++) {
      var cstr = filelines[linenum].trim();
      if (cstr.length > 0) {
       try {
         var cTokens = await this.tokenizeLine(cstr);
         var parsedLine = await this.parseLine(cTokens);
         if (parsedLine[0].arg < 0) {
           this.stopRun = false;
           this.condStack = [];
           this.statmentIdx = 1;
           await this.runCurrentLine(parsedLine);
         } else {
           if (parsedLine.length > 1) {
             await this.addLine(parsedLine);
           } else {
             await this.deleteLine(parsedLine[0].arg);
           }
         }
       } catch(err) {
         await this.reportError("Error:" + err);
       }
     }
    }
  }
  
  
}

