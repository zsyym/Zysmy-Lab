import { SITE, SOCIALS } from "../consts";

export const profile = {
  name: SITE.author,
  headline: "Exploring iOS, from the inside out.",
  introduction: "这里记录我对 iOS 底层原理、Objective-C Runtime 和工程实践的探索。",
  interests: ["Objective-C", "Runtime", "内存管理", "多线程"],
  github: SOCIALS.find(link => link.icon === "github")!.url,
};
