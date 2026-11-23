import test from "node:test";
import assert from "node:assert/strict";
import { models } from "../src/features/lab/registry.mjs";
import { advance } from "../src/features/lab/engine.mjs";

const [arc, runtime, gcd, loop, block] = [
  "arc-reference-counting",
  "runtime-message-send",
  "gcd-queues",
  "runloop-modes",
  "block-captures",
].map((key) => models[key]);
function walk(model, types, start = model.initial()) {
  return types.split(" ").reduce((state, type, i) => {
    const snapshot = structuredClone(state);
    const event = advance(model, state, type, i + 1);
    assert.ok(event, `unexpected disabled action: ${type}`);
    assert.deepEqual(event.before, snapshot);
    assert.equal(event.sequence, i + 1);
    assert.ok(event.reason);
    return event.after;
  }, start);
}
test("ARC creation and second strong owner", () =>
  assert.equal(walk(arc, "create add").owners, 2));
test("ARC releasing one owner keeps observed instance alive", () =>
  assert.equal(
    arc.view(walk(arc, "create add weak remove"))[2][1],
    "observer ⇢ 对象",
  ));
test("ARC last release clears weak slot", () =>
  assert.equal(
    arc.view(walk(arc, "create weak release"))[2][1],
    "observer = nil",
  ));
test("ARC prevents removal from empty state and resets", () => {
  assert.equal(advance(arc, arc.initial(), "release", 1), null);
  walk(arc, "create weak add remove release");
  assert.deepEqual(arc.initial(), { owners: 0, weak: false, created: false });
});
test("runtime cold miss scans local list", () =>
  assert.equal(walk(runtime, "send isa cache").phase, "检查本类"));
test("runtime warmed cache skips method lists, explicit flush clears it", () => {
  const hit = walk(runtime, "send isa cache methods send isa cache");
  assert.equal(hit.phase, "调用 IMP");
  assert.equal(walk(runtime, "clear", hit).cache, false);
});
test("runtime inherited method populates cache", () =>
  assert.equal(
    walk(runtime, "inherited send isa cache methods parent").cache,
    true,
  ));
test("runtime unresolved message traverses distinct forwarding stages", () => {
  const miss = walk(
    runtime,
    "missing send isa cache methods parent resolve fast signature invocation",
  );
  assert.equal(miss.phase, "未识别 selector");
  assert.equal(miss.cache, false);
});
test("serial queue preserves submission order", () => {
  const s = walk(gcd, "async async start");
  assert.deepEqual(s.running, [1]);
  assert.deepEqual(walk(gcd, "finish start finish", s).done, [1, 2]);
});
test("concurrent queue overlaps two tasks", () =>
  assert.deepEqual(walk(gcd, "parallel async async start").running, [1, 2]));
test("sync blocks submitter until matching completion", () => {
  const s = walk(gcd, "async sync start finish");
  assert.equal(s.wait, 2);
  assert.equal(advance(gcd, s, "async", 4), null);
  assert.equal(walk(gcd, "start finish", s).wait, 0);
});
test("main sync deadlock prevents scheduling", () =>
  assert.equal(advance(gcd, walk(gcd, "deadlock"), "start", 2), null));
test("group cannot notify before last completion", () => {
  const s = walk(gcd, "group async pause resume start");
  assert.equal(advance(gcd, s, "notify", 4), null);
  assert.equal(walk(gcd, "finish notify", s).group, false);
});
test("RunLoop fires due timer in default mode", () =>
  assert.equal(walk(loop, "timer start tick").fires, 1));
test("tracking pauses default timer; switching back resumes", () => {
  const s = walk(loop, "timer start mode tick");
  assert.equal(s.fires, 0);
  assert.equal(walk(loop, "mode tick", s).fires, 1);
});
test("RunLoop input sources and idle waiting", () => {
  const s = walk(loop, "start mode source0 source1 tick");
  assert.match(s.last, /Source0、Source1/);
  assert.equal(walk(loop, "tick", s).last, "等待唤醒");
  assert.equal(advance(loop, walk(loop, "stop", s), "tick", 8), null);
});
test("block captures scalar snapshot", () =>
  assert.equal(walk(block, "value create mutate call").result, "1"));
test("__block shares storage across copy", () =>
  assert.equal(walk(block, "byref create copy mutate call").result, "2"));
test("copied strong callback can form a cycle", () => {
  const s = walk(block, "strong create copy store drop call");
  assert.equal(s.copied, true);
  assert.equal(s.stored, true);
  assert.equal(s.result, "对象存活");
});
test("weak callback allows owner release", () => {
  const s = walk(block, "weak create copy store drop call");
  assert.equal(s.stored, false);
  assert.equal(s.result, "nil");
});
