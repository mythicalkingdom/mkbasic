var basic = require("./Basic");
var term = require("./simpleTerm");
var bt=1

async function main() {
  while (true) {
    await basicI.outputString("> ");
    var instr = await basicI.getInput();
    await bterm.sendNL();
    await basicI.oneInputLine(instr);
    bt++;
  }
}

var bterm = new term.simpleTerm();
bterm.outputChar = bterm.sendChar;
bterm.setColor(15,1);
bterm.clearScreen();
var basicI = new basic.Basic(bterm);
main();
