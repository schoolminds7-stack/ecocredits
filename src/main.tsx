import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree";
import { StoreHydrate } from "@/components/store-hydrate";
import { AppErrorComponent } from "@/lib/error-component";
import "./styles.css";

const router = createRouter({
  routeTree,
  defaultErrorComponent: AppErrorComponent,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreHydrate>
      <RouterProvider router={router} />
    </StoreHydrate>
  </StrictMode>,
);
