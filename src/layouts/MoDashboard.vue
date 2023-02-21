<template>
  <b-container class="mo-dashboard-layout" fluid>
    <!-- admin modal for choosing group id -->
    <mo-picker-modal
      label="Group"
      message="Please, choose the group you would like to access"
      modal-id="admin-company-picker-modal"
      :entity-items="companyItems"
      @submit="onPickAdminCompany"
    />
    <mo-picker-modal
      label="Group"
      message="Please, choose the group you would like to access"
      modal-id="user-company-picker-modal"
      :entity-items="availableCompanyItems"
      @submit="onPickUserCompany"
    />
    <mo-prompt-modal
      modal-id="password-change-modal"
      message="Do you want to change your password ?"
      description="A link will be sent to your email for you to set a new password."
      @right="onChangePassword"
    />
    <div
      v-if="!hideHeader"
      id="container"
      class="mo-dashboard-layout__header__containter"
    >
      <div id="start" class="mo-dashboard-layout__header__containter__start">
        <div
          v-if="companyName"
          class="mo-dashboard-layout__header__company-name"
        >
          <b> Group: {{ companyName }} </b>
        </div>
        <div v-else style="width:170px"></div>
      </div>
      <div id="center" class="mo-dashboard-layout__header__containter__center">
        <div class="mo-dashboard-layout__header__navigation ">
          <div class="d-flex justify-content-center">
            <router-link
              v-for="route of sidebarRoutes"
              :key="route.path"
              :to="route.path"
              replace
              :class="[
                'mo-dashboard-layout__header__navigation__link',
                $route.path === route.path ? 'mo-selected' : ''
              ]"
            >
              <i
                v-b-tooltip:hover.right
                :class="[
                  $route.path === route.path ? 'fas' : 'far',
                  route.icon
                ]"
              />
              <span>{{ route.name }}</span>
            </router-link>
          </div>
        </div>
      </div>
      <div id="end" class="mo-dashboard-layout__header__containter__end">
        <b-form-input
          v-if="!isSearchDisabled"
          id="input-2"
          v-model="searchQuery"
          class="mo-input__light-sm mo-dashboard-layout__header__search"
          placeholder="Search ..."
          type="text"
        ></b-form-input>

        <mo-dropdown :title="dropdownTitle" :iconName="iconNameMap[pathPrefix]">
          <template v-if="role === 2">
            <b-dropdown-item
              v-if="isAdminDashboard"
              link-class="d-flex justify-content-between align-items-center"
              @click="onOpenAdminCompanyPicker"
            >
              Switch to Group
              <i class="pl-2 fas fa-building" />
            </b-dropdown-item>
            <b-dropdown-item
              v-else
              link-class="d-flex justify-content-between align-items-center"
              @click="onAdminDashboard"
            >
              Switch to Admin
              <i class="pl-2 fas fa-user-crown" />
            </b-dropdown-item>
          </template>
          <template v-if="showChangeGroup">
            <b-dropdown-item v-if="role === 2" @click="onOpenAdminCompanyPicker">
              Change group
              <i class="pl-5 fas fa-door-open"></i>
            </b-dropdown-item>
            <b-dropdown-item v-else @click="onOpenUserCompanyPicker">
              Change group
              <i class="pl-5 fas fa-door-open"></i>
            </b-dropdown-item>
          </template>
          <b-dropdown-item
            link-class="d-flex justify-content-between align-items-center"
            @click="onChangePassword"
          >
            Change password
            <i class="pl-2 fas fa-key" />
          </b-dropdown-item>
          <b-dropdown-item
            link-class="d-flex justify-content-between align-items-center"
            @click="onLogout"
          >
            Sign out
            <i class="pl-2 fas fa-sign-out-alt" />
          </b-dropdown-item>
        </mo-dropdown>
      </div>
    </div>
    <b-row v-if="hideHeader" class="mt-3 mb-3" />
    <b-row v-else class="mo-dashboard-layout__header d-flex align-items-center">
      <b-col>
        <b-row>
          <b-col class="d-flex justify-content-between">
            <b-row>
              <b-col cols="1">
                <button
                  :style="breadcrumbsListStyle"
                  @click="onBack"
                  class="mo-back-btn p-2 mr-3"
                >
                  <i class="fas fa-chevron-left" />
                </button>
              </b-col>
              <b-col class="pl-2 d-flex align-items-center">
                <ul :style="breadcrumbsListStyle" class="mo-history-path">
                  <li v-for="(item, i) in history" :key="i">
                    <a :class="''" @click="onNavigateToPath(item.url)">
                      {{ item.name || item.path }}
                    </a>
                    <i
                      v-if="i !== history.length - 1"
                      class="fas fa-chevron-right mx-1"
                    />
                  </li>
                </ul>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
    <b-row class="mo-dashboard-layout__body px-5 flex-grow-1">
      <slot v-if="tabItems.length === 0" name="body"></slot>
      <slot v-else name="body-tabbed">
        <b-tabs
          class="d-flex flex-column w-100 h-100"
          v-model="tabIndex"
          nav-wrapper-class="mo-dashboard-layout__tab-nav pb-1"
          content-class="mo-dashboard-layout__tab-body flex-1"
          active-nav-item-class="mo-tab__active"
          @activate-tab="onTabChange"
        >
          <b-tab
            :key="name"
            v-for="{ title, name } in tabs"
            :title="title"
            title-link-class=""
            active
            class="h-100"
          >
            <slot :name="name"></slot>
          </b-tab>
        </b-tabs>
      </slot>
    </b-row>
  </b-container>
</template>

<script>
import { logout, getUserRole } from "@/utils/auth";
import MoPickerModal from "@/components/pure/modals/MoPickerModal";
import { getCompanies } from "@/api/admin/company/company";
import { resetPassword } from "../api/authentication";
import { changeGroup } from "@/api/admin/company/user";

export default {
  name: "MoDashboard",
  components: {
    MoPickerModal
  },
  props: {
    title: {
      type: String,
      required: true
    },
    hideHeader: {
      type: Boolean,
      required: false
    },
    tabItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      tabIndex: 0,
      history: [],
      searchQuery: "",
      companyItems: [],
      availableCompanyItems: [],
      iconNameMap: {
        admin: "fa-user-crown",
        user: "fa-building",
        manufacturer: "fa-user-hard-hat"
      },
      dropdownTitleMap: {
        user: "My Profile",
        admin: "My Profile",
        manufacturer: "My Profile"
      }
    };
  },
  computed: {
    availableCompanies() {
      return this.$store.state.user.available_companies;
    },
    companyName() {
      return this.isAdminDashboard ? "" : this.$store.getters.getCompanyName;
    },
    user() {
      return this.$store.state.user;
    },
    routes() {
      return this.$store.getters.routes;
    },
    sidebarRoutes() {
      return this.routes.filter(route => !route.hiddenFromSidebar);
    },
    has2Fa() {
      return this.$store.getters.has2Fa;
    },
    breadcrumbsListStyle() {
      return {
        visibility: this.history.length > 1 ? "unset" : "hidden"
      };
    },
    isSearchDisabled() {
      // these rules determine if the screen contains no table view
      return (
        // if edit is opened as a separate screen (contains no hash postfix)
        (this.$route.name &&
          this.$route.name.startsWith("Edit") &&
          !this.$route.hash) ||
        (this.$route.name && this.$route.name.startsWith("Add")) ||
        this.$route.hash === "#overview"
      );
    },
    role() {
      return getUserRole();
    },
    isAdminDashboard() {
      return this.$route.path.startsWith("/admin");
    },
    dropdownTitle() {
      return this.dropdownTitleMap[this.pathPrefix];
    },
    hash() {
      return this.hashes[this.tabIndex];
    },
    tabs() {
      // convert tab titles to slot names
      return this.tabItems
        .filter(e => !!e)
        .map(k => ({
          title: k,
          name: k.replaceAll(" ", "-").toLowerCase()
        }));
    },
    hashes() {
      return this.tabs.map(t => `#${t.name}`);
    },
    showChangeGroup() {
      return !this.isManufacturerDashboard && !this.isAdminDashboard;
    }
  },
  mounted() {
    this.$nextTick(() => this.initTabNavigation());
    this.updateBreadcrumb();
  },
  watch: {
    searchQuery(value) {
      this.$emit("search", value);
    },
    $route(value) {
      this.tabIndex = this.hashes.findIndex(tab => tab === value.hash);
      this.updateBreadcrumb();
    }
  },
  methods: {
    matchesPath(expected, actual) {
      const expectedPrefix = expected.split("/")[2];
      const actualPrefix = actual.split("/")[2];
      return expectedPrefix === actualPrefix;
    },
    onOpenAdminCompanyPicker() {
      this.$bvModal.show("admin-company-picker-modal");
      this.handleFetch(getCompanies()).then(data => {
        this.companyItems = [
          { value: null, text: "Please choose a group" },
          ...data.map(e => ({
            value: e.id,
            text: e.name
          }))
        ];
      });
    },
    onOpenUserCompanyPicker() {
      this.$bvModal.show("user-company-picker-modal");

      this.availableCompanyItems = [
        { value: null, text: "Please choose a group" },
        ...this.availableCompanies.map(e => ({
          value: e.id,
          text: e.name
        }))
      ];
    },

    onPickAdminCompany(companyId) {
      // store company id in local storage so it isn't lost
      // if user refreshes the page
      window.localStorage.setItem("company-id", companyId);
      this.$bvModal.hide("admin-company-picker-modal");
      this.$router.replace("/user/unit");
      this.$store.dispatch("fetchData");
    },
    onPickUserCompany(companyId) {
      // store company id in local storage so it isn't lost
      // if user refreshes the page
      changeGroup(this.user.id, companyId)
        .then(() => {
          window.localStorage.setItem("company-id", companyId);
          this.$store.commit("setCompany", companyId);
          this.$store.commit("setUserCompany", companyId);
          this.$bvModal.hide("user-company-picker-modal");
          this.$router.replace("/user/unit");
          this.$store.dispatch("fetchData");
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        });
    },
    onChangePassword() {
      this.$bvModal.hide("password-change-modal");
      resetPassword({ email: this.$store.getters.email, change: true })
        .then(() => {
          this.$bvToast.toast("Password change email sent!");
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        });
    },
    onAdminDashboard() {
      this.$router.replace("/admin/unit");
    },
    onBack() {
      this.$router.back();
    },
    updateBreadcrumb() {
      this.history = this.$breadcrumb(this.$route.path);
    },
    onLogout() {
      logout().then(() => this.$router.replace("/login"));
    },
    initTabNavigation() {
      const initialIndex = this.hashes.findIndex(
        tab => tab === this.$route.hash
      );
      // if initial hash does not match any available hash set initial tab index to 0
      this.tabIndex = initialIndex < 0 ? 0 : initialIndex;
    },
    onTabChange(index) {
      // reset search query on tab change, so it doesn't impact other unrelated items
      this.searchQuery = "";
      const nextHash = this.hashes[index];
      // perform navigation only if current hash doesn't equal next hash
      // this avoids error thrown by vue router
      if (this.$route.hash !== nextHash) {
        this.$router.replace(nextHash);
      }
    },
    onNavigateToPath(path) {
      this.$router.replace(path);
    }
  }
};
</script>
