import Profile from "../views/user/dashboard";
import VideoLibrary from "../views/user/video";
import Services from "@/views/user/maintenance";
import Campaigns from "@/views/user/visuals/index";
import EditCampaign from "@/views/user/visuals/campaign/edit/index";
import EditDecoratingHouse from "@/views/user/visuals/decorating/Edit";
import EditPrintingHouse from "@/views/user/visuals/printing/Edit";
import EditGraphic from "@/views/user/visuals/graphic/Edit";
import View from "@/views/user/visuals/campaign/view/index";
import ChooseGraphics from "@/views/user/visuals/campaign/edit/ChooseGraphics";
import EditVendor from "@/views/user/maintenance/EditVendor";
import { buildCommonRoutes } from "@/router/common";
import EditRetailer from "@/views/user/dashboard/retailers/Edit";
import EditBrand from "@/views/user/dashboard/brands/Edit";
import EditWarehouse from "@/views/user/dashboard/warehouse/Edit";

export default [
  {
    path: `/user/unit`,
    name: "PoS & Units",
    icon: "fa-house",
    routeKey: "unit",
    component: () => import("@/views/shared/units")
  },
  {
    path: `/user/units`,
    name: "Units",
    icon: "fa-puzzle-piece",
    routeKey: "units",
    component: () => import("@/views/shared/units2")
  },
  {
    path: "/user/profile",
    name: "Dashboard",
    icon: "fa-user",
    component: Profile
  },
  {
    path: `/user/profile/user/:userId`,
    name: "Edit user",
    hiddenFromSidebar: true,
    component: () => import("@/views/shared/user/Edit")
  },
  {
    path: "/user/video",
    name: "Video",
    routeKey: "video",
    icon: "fa-film",
    component: VideoLibrary
  },
  {
    path: "/user/maintenance",
    name: "Maintenance",
    routeKey: "maintenance",
    icon: "fa-headset",
    component: Services
  },
  {
    path: "/user/maintenance/vendor/:vendorId",
    name: "Edit vendor",
    hiddenFromSidebar: true,
    component: EditVendor
  },
  {
    path: "/user/campaign/:campaignId",
    hiddenFromSidebar: true,
    component: EditCampaign,
    // that path structure doesn't make sense,
    // but we don't have time to implement a better breadcrumbs solution
    children: [
      {
        path: "graphic/choose",
        name: "Choose Graphics and Files",
        component: ChooseGraphics
      }
    ]
  },
  {
    path: "/user/campaign/:campaignId/overview",
    name: "Campaign overview",
    hiddenFromSidebar: true,
    component: View
  },
  {
    path: "/user/campaign/decorating-house/:decoratingHouseId",
    name: "Edit decorating house",
    hiddenFromSidebar: true,
    component: EditDecoratingHouse
  },
  {
    path: "/user/campaign/printing-house/:printingHouseId",
    name: "Edit printing house",
    hiddenFromSidebar: true,
    component: EditPrintingHouse
  },
  {
    path: "/user/campaign/graphic/:graphicId",
    name: "Edit graphic",
    hiddenFromSidebar: true,
    component: EditGraphic
  },
  {
    path: "/user/retailer/:retailerId",
    name: "Edit retailer",
    hiddenFromSidebar: true,
    component: EditRetailer
  },
  {
    path: "/user/brand/:brandId",
    name: "Edit brand",
    hiddenFromSidebar: true,
    component: EditBrand
  },
  {
    path: "/user/warehouse/:warehouseId",
    name: "Edit warehouse",
    hiddenFromSidebar: true,
    component: EditWarehouse
  },
  {
    path: "/user/campaign",
    name: "Visuals",
    icon: "fa-gem",
    routeKey: "campaigns",
    component: Campaigns
  },
  ...buildCommonRoutes("user")
];
