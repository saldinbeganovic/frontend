import VueRouter from "vue-router";
import Login from "@/views/shared/auth/Login.vue";
import { isLoggedIn, logout, clearJwtCache } from "@/utils/auth";
import admin from "@/router/admin";
import user from "@/router/user";
import Register from "@/views/manufacturer/Register";
import manufacturer from "@/router/manufacturer";
import { getUserRole } from "@/utils/auth";

const routes = [
  {
    path: "/login",
    name: "Login",
    meta: {
      protected: false
    },
    component: Login
  },
  {
    path: "/first-login",
    name: "FirstLogin",
    meta: {
      protected: false
    },
    component: Login
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    meta: {
      protected: false
    },
    component: Login
  },
  {
    path: "/user-invite",
    name: "UserInvite",
    meta: {
      protected: false
    },
    component: Login
  },
  {
    path: "/confirm-user-invite",
    name: "ConfirmUserInvite",
    meta: {
      protected: false
    },
    component: Login
  },
  {
    path: "/manufacturer/register",
    name: "ManufacturerRegister",
    meta: {
      protected: false
    },
    component: Register
  },
  {
    path: "/manufacturer",
    component: () => import("@/views/manufacturer"),
    children: manufacturer
  },
  {
    path: "/admin",
    component: () => import("@/views/admin"),
    children: admin
  },
  {
    path: "/user",
    component: () => import("@/views/user"),
    children: user
  },
  {
    name: "Edit unit",
    path: "/public/unit",
    component: () => import("@/views/public/CreateUnit"),
    meta: {
      protected: false
    }
  },
  {
    path: "/admin/account/2fa/enable",
    component: () => import("@/views/shared/auth/Enable2Fa")
  },
  {
    path: "/user/account/2fa/enable",
    component: () => import("@/views/shared/auth/Enable2Fa")
  },
  {
    path: "*",
    component: () => import("@/views/shared/NotFound.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

const userRoleMap = {
  1: "user",
  2: "admin",
  3: "manufacturer"
};

router.beforeEach((to, from, next) => {
  //logout user, if he gets email invitation to group
  if (to.path == "/confirm-user-invite" || to.path == "/user-invite") {
    logout();
    clearJwtCache();
  }
  // also check that protected meta value is not set or is set to null
  const pathPrefix = to.path.split("/")[1];
  const roleName = userRoleMap[getUserRole()];
  // redirect homepage requests to login for now
  if (to.path === "/") {
    return next({ name: "Login", replace: true });
  }
  // redirect logged in users to their profile if they access non protected route
  if (to.meta.protected === false) {
    return isLoggedIn()
      ? next({
          path:
            roleName === "admin" || roleName === "user"
              ? `/${roleName}/unit`
              : `/${roleName}/profile`,
          replace: true
        })
      : next();
  }
  if (to.meta.protected !== false && !isLoggedIn()) {
    next({ name: "Login", replace: true });
  } else {
    // admin can only view user and admin dashboards
    // other users can only view their dashboards
    if (
      (roleName === "admin" &&
        (pathPrefix === "user" || pathPrefix === "admin")) ||
      roleName === pathPrefix
    ) {
      next();
    } else {
      next({ name: "Login", replace: true });
    }
  }
});

export default router;
