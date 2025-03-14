import { createRouter, createWebHistory, MyRouteMeta, RouteRecordRaw } from "vue-router";
import Index from "../views/Index.vue";
import Editor from "../views/Editor.vue";
import Download from "../views/Download.vue";
import { SVG } from "@svgdotjs/svg.js";

declare module "vue-router" {
  interface MyRouteMeta {
    title?: string;
    disableLoading?: boolean;
  }
}

const routes: RouteRecordRaw[] =  [
  {
    path: "/",
    name: "index",
    component: Index,
    meta: { title: "logo智能设计", disableLoading: true },
  },
  {
    path: "/editor/:id",
    name: "editor",
    component: Editor,
    meta: { title: "编辑我的设计" },
  },
  {
    path: "/download/:id",
    name: "download",
    component: Download,
    meta: { title: "下载", disableLoading: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from) => {
  const { title } = to.meta as MyRouteMeta;
  if (title) {
    document.title = title;
  }
  if (from.name === "editor" && to.name === "download") {
    localStorage.setItem("downloadsvg", SVG(".svg0").svg());
  } else {
    localStorage.setItem("downloadsvg", "");
  }
  return true;
});
export default router;
