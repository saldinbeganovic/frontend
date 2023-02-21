// store module used only for managing multi-step form state

// import Vue from "vue";

export default {
  state: () => ({
    tableFilters: {},
    activateFilter: false
  }),
  mutations: {
    setTableFilters(store, value) {
      store.tableFilters = value;
    },
    setActivateFilter(store, value) {
      store.activateFilter = value;
    }
  },
  getters: {
    getTableFilters(state) {
      return state.tableFilters;
    },
    getActivateFilter(state) {
      return state.activateFilter;
    }
  },
  actions: {}
};
