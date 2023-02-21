import Vue from "vue";
import Vuex from "vuex";
import { getAuthUser } from "@/api/authentication";
import campaign from "@/store/campaign";
import table from "@/store/table";
import { getCompany } from "@/api/admin/company/company";
import { getUserRoleName, isAdmin } from "@/utils/auth";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    campaign,
    table
  },
  state: {
    // store routes for the current user dashboard
    routes: [],
    user: null,
    company: null,
    error: null,
    maxDisplayId: null,
    isLoading: false,
    userRole: null,
    isSuperAdmin: false
  },
  mutations: {
    setRoutes(state, routes) {
      state.routes = routes;
    },
    setUser(state, user) {
      state.user = user;
    },
    setIsSuperAdmin(state, isSuperAdmin) {
      state.isSuperAdmin = isSuperAdmin;
    },
    setUserRole(state, userRole) {
      state.userRole = userRole;
    },
    setUserCompany(state, companyId) {
      state.user.company_id = companyId;
    },
    setCompany(state, value) {
      state.company = value;
    },
    setIsLoading(state, value) {
      state.isLoading = value;
    },
    setMaxDisplayId(state, value) {
      state.maxDisplayId = value;
    },
    setError(state, value) {
      state.error = value;
    },
    clearRootStore(state) {
      state.user = null;
      state.error = null;
      state.userRole = null;
      state.isLoading = false;
    }
  },
  getters: {
    routes(state) {
      return state.routes;
    },
    has2Fa(state) {
      return state.user ? state.user.has_2fa : null;
    },
    email(state) {
      return state.user ? state.user.email : null;
    },
    maxDisplayId(state) {
      return state.maxDisplayId;
    },
    companyId(state) {
      // if the user is a admin it will have 'company_id' set to 'null'
      return (
        (state.user ? state.user.company_id : null) ||
        localStorage.getItem("company-id")
      );
    },
    getUserRole(state) {
      return state.userRole;
    },
    getUser(state) {
      return state.user;
    },
    hasAdminRole(state) {
      return state.userRole == "admin" || state.isSuperAdmin;
    },
    companyAddress(state) {
      return state.company.address;
    },
    getCompanyName(state) {
      return state.company ? state.company.name : "";
    }
  },
  actions: {
    async fetchUser(context) {
      context.commit("setUser", await getAuthUser());
    },
    async fetchData({ commit, getters }) {
      try {
        commit("setIsLoading", true);
        commit("setUser", await getAuthUser());
        if (getters.companyId) {
          commit("setCompany", await getCompany(getters.companyId));
        }
        commit("setUserRole", getUserRoleName());
        commit("setIsSuperAdmin", isAdmin());
        commit("setError", null);

        commit("setIsLoading", false);
      } catch (e) {
        commit("setError", e);
      }
    }
  }
});
