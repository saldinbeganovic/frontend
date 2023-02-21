import { buildCommonRoutes } from "@/router/common";

export default [
  {
    path: "/admin/profile/2fa/enable",
    name: "Enable 2FA",
    hiddenFromSidebar: true,
    component: () => import("@/views/shared/auth/Enable2Fa")
  },
  {
    path: `/admin/unit`,
    name: "PoS & Units",
    icon: "fa-store",
    routeKey: "unit",
    component: () => import("@/views/shared/units")
  },
  {
    path: "/admin/manufacturer",
    name: "Manufacturers",
    icon: "fa-user-hard-hat",
    component: () => import("@/views/admin/Manufacturers")
  },
  {
    path: "/admin/group",
    name: "Groups",
    icon: "fa-building",
    component: () => import("@/views/admin/Companies")
  },
  {
    path: "/admin/company/:companyId",
    name: "Edit group",
    hiddenFromSidebar: true,
    component: () => import("@/views/admin/group")
  },
  {
    path: "/admin/company/:companyId/user/:userId",
    name: "Edit user",
    hiddenFromSidebar: true,
    component: () => import("@/views/shared/user/Edit")
  },
  {
    path: "/admin/logs",
    name: "System logs",
    icon: "fa-cogs",
    component: () => import("@/views/admin/SystemLogs")
  },
  {
    path: "/admin/device",
    name: "Devices",
    icon: "fa-desktop-alt",
    component: () => import("@/views/admin/Devices")
  },
  {
    path: "/admin/device/modem/:modemId",
    name: "Edit modem",
    hiddenFromSidebar: true,
    component: () => import("@/views/admin/device/modem/Edit")
  },
  {
    path: "/admin/device/player/:playerId",
    name: "Edit player",
    hiddenFromSidebar: true,
    component: () => import("@/views/admin/device/player")
  },
  ...buildCommonRoutes("admin")
];
