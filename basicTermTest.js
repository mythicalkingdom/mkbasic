var basic = require("./Basic");
var basicTerm = require("./basicTerm");
var bt=1

async function main() {
  while (true) {
    await basicI.outputString("> ");
    var instr = await basicI.getInput();
    await basicI.oneInputLine(instr);
    bt++;
  }
}

var term = new basicTerm.basicTerm();
var basicI = new basic.Basic(term);
main();
