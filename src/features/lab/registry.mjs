import * as arc from "./models/arc.mjs";
import * as runtime from "./models/runtime.mjs";
import * as gcd from "./models/gcd.mjs";
import * as runloop from "./models/runloop.mjs";
import * as block from "./models/block.mjs";
export const models = {
  "arc-reference-counting": arc,
  "runtime-message-send": runtime,
  "gcd-queues": gcd,
  "runloop-modes": runloop,
  "block-captures": block,
};
