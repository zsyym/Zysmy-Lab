import { models } from "./registry.mjs";
import { lanes } from "./diagram.mjs";
import { advance } from "./engine.mjs";

type Snapshot = Record<string, unknown>;
interface Model {
  snippet?(type: string, state: Snapshot): string;
  initial(): Snapshot;
  actions: Record<string, { label: string; enabled(s: Snapshot): boolean }>;
  view(s: Snapshot): string[][];
}
class Playground extends HTMLElement {
  private listeners?: AbortController;
  connectedCallback() {
    this.listeners = new AbortController();
    const model = models[
      this.dataset.model as keyof typeof models
    ] as unknown as Model;
    let state = model.initial();
    const get = <T extends HTMLElement>(selector: string) =>
      this.querySelector<T>(selector)!;
    const commands = [
      ...this.querySelectorAll<HTMLButtonElement>("[data-command]"),
    ];
    const snippets = [...this.querySelectorAll<HTMLElement>("[data-snippet]")];
    const log = get("ol");
    const announcement = get("[data-announcement]");
    const copy = get<HTMLButtonElement>("[data-copy]");
    const slots = this.querySelectorAll("dd");
    const diagram = get("[data-diagram]");
    const slug = this.dataset.model!;
    function draw(current: string) {
      const rows = lanes(slug, state) ?? [];
      diagram.replaceChildren(
        ...rows.map((cells) => {
          const lane = document.createElement("div");
          cells.forEach((text) => {
            const cell = document.createElement("span");
            cell.textContent = text;
            lane.append(cell);
          });
          return lane;
        }),
      );
      const values = model.view(state);
      values.forEach(([, value], i) => {
        slots[i].textContent = value;
      });
      commands.forEach((button) => {
        button.disabled =
          !model.actions[button.dataset.command!].enabled(state);
      });
      snippets.forEach((panel) => {
        panel.hidden = panel.dataset.snippet !== current;
      });
      copy.textContent = "复制代码";
    }
    const describe = (snapshot: Snapshot) =>
      model
        .view(snapshot)
        .map(([k, v]) => k + "：" + v)
        .join("；");
    this.addEventListener(
      "click",
      async (event) => {
        const button = (event.target as Element).closest("button");
        if (!button) return;
        if (button === copy) {
          const code = snippets
            .find((panel) => !panel.hidden)
            ?.querySelector("code")?.textContent;
          try {
            await navigator.clipboard.writeText(code || "");
            copy.textContent = "已复制";
          } catch {
            copy.textContent = "请选择代码复制";
          }
          return;
        }
        if (button.hasAttribute("data-reset")) {
          state = model.initial();
          log.replaceChildren();
          draw(commands[0].dataset.command!);
          announcement.textContent = "已重置。选择操作开始实验。";
          return;
        }
        const type = button.dataset.command!;
        const record = advance(model, state, type, log.children.length + 1);
        if (!record) return;
        state = record.after;
        draw(model.snippet?.(type, state) ?? type);
        const item = document.createElement("li");
        const detail = document.createElement("details");
        const summary = document.createElement("summary");
        const body = document.createElement("p");
        summary.textContent =
          record.sequence + " · " + model.actions[type].label;
        body.textContent =
          "操作前：" +
          describe(record.before) +
          "\n操作后：" +
          describe(record.after) +
          "\n" +
          record.reason;
        detail.append(summary, body);
        item.append(detail);
        log.append(item);
        announcement.textContent = summary.textContent + "。" + record.reason;
      },
      { signal: this.listeners.signal },
    );
    draw(commands[0].dataset.command!);
  }
  disconnectedCallback() {
    this.listeners?.abort();
  }
}
customElements.define("ios-playground", Playground);
