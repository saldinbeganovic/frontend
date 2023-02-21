/**
 * @description Generates routes for user/admin
 * @param userType = {admin|user}
 * @returns Array
 */
export function buildCommonRoutes(userType) {
  const prefix = userType === "admin" ? "admin/company/:companyId" : "user";
  return [
    {
      path: `/${userType}/profile/2fa/enable`,
      name: "Enable 2FA",
      hiddenFromSidebar: true,
      component: () => import("@/views/shared/auth/Enable2Fa")
    },
    {
      path: `/${prefix}/pos/:posId`,
      name: "Edit PoS",
      hiddenFromSidebar: true,
      component: () => import("@/views/shared/pos")
    },
    {
      path: `/${userType}/batch/:batchId`,
      name: "Edit batch",
      hiddenFromSidebar: true,
      component: () => import("@/views/shared/units/ViewBatch")
    },
    {
      path: `/${userType}/unit/:unitId`,
      hiddenFromSidebar: true,
      name: "Edit unit",
      component: () => import("@/views/shared/pos/EditUnit")
    }
  ];
}
