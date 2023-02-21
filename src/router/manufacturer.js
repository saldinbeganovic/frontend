export default [
  {
    path: "/manufacturer/profile",
    name: "Dashboard",
    icon: "fa-user",
    component: () => import("@/views/manufacturer/Profile")
  },
  {
    path: `/manufacturer/unit`,
    name: "Units",
    icon: "fa-store",
    component: () => import("@/views/manufacturer/units")
  },
  {
    path: `/manufacturer/unit/:unitId`,
    name: "Edit unit",
    hiddenFromSidebar: true,
    component: () => import("@/views/manufacturer/units/EditUnit")
  },
  {
    path: `/manufacturer/batch/:batchId`,
    name: "Edit batch",
    hiddenFromSidebar: true,
    component: () => import("@/views/manufacturer/units/EditBatch")
  }
];
