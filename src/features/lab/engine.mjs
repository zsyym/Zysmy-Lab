// An action describes one legal transition and its matching Objective-C excerpt.
export function action(label, reason, code, enabled, apply) {
  return { label, reason, code, enabled, apply };
}

export function advance(model, before, type, sequence) {
  const command = model.actions[type];
  if (!command?.enabled(before)) return null;
  const after = command.apply(before);
  return { type, sequence, before, after, reason: command.reason };
}
