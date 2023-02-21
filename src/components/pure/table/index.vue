<template>
  <b-table
    :id="tableId"
    :class="
      `mo-table h-100 w-100 ${hasCheckbox &&
        'mo-table__checkbox'} ${tableClass}`
    "
    :empty-text="emptyText"
    thead-class="mo-table__head"
    :fields="moFields"
    :filter="filters"
    :filter-function="searchQuery ? null : filterRow"
    :filter-included-fields="filterFields"
    :items="items"
    :busy="loading"
    :sticky-header="maxHeight"
    :fixed="fixed"
    responsive
    show-empty
    striped
    hover
    @filtered="onFiltered"
  >
    <template v-if="showSelectAll" #head(select)>
      <b-form-checkbox v-model="selectAll" />
    </template>

    <template v-for="(field, i) of filterFields">
      <template
        :slot="`head(${typeof field === 'object' ? field.name : field})`"
      >
        <label
          style="margin: 0 0 0 10px"
          class="d-flex align-items-center"
          :key="i"
        >
          <!--  TODO: fix the issue when "dropdown" of multiselect is hidden on overflow        -->
          <multiselect
            v-if="typeof field === 'object' && field.multi"
            v-model="filters[field.name]"
            :options="extractOptions(field.name, items)"
            :multiple="true"
            :searchable="false"
            :close-on-select="false"
            placeholder="Choose filters"
            open-direction="top"
          >
            <template slot="selection" slot-scope="{ values, search, isOpen }"
              ><span
                class="multiselect__single"
                v-if="values.length &amp;&amp; !isOpen"
                >{{ values.length }} options selected</span
              ></template
            >
          </multiselect>
          <select v-else v-model="filters[field]">
            <option value="">{{ getLabelForField(field) }}</option>
            <option
              v-for="value of extractOptions(field, items)"
              :key="value"
              :value="value"
              >{{ value }}</option
            >
          </select>
          <template v-if="collapsableFields.includes(field)">
            <i
              style="cursor: pointer"
              v-if="isCollapsed(field, i)"
              class="fas fa-expand-arrows-alt mh-2"
              @click="onExpand(field, i)"
            />
            <i
              v-else
              style="cursor: pointer"
              class="fas fa-compress-arrows-alt mh-2"
              @click="onCollapse(field, i)"
            />
          </template>
        </label>
      </template>
    </template>

    <template #cell(select)="{item}">
      <b-form-checkbox v-if="idKey(item)" v-model="selected[idKey(item)]" />
    </template>

    <template #table-busy>
      <div class="w-100 d-flex justify-content-center">
        <div class="text-center mo-text__primary my-2">
          <b-spinner class="align-middle"></b-spinner>
          <strong class="ml-2">Loading...</strong>
        </div>
      </div>
    </template>

    <!-- forward slots to b-table component -->
    <!-- (used for rendering custom columns, etc)   -->
    <!-- solution was taken from bellow gist   -->
    <!-- https://gist.github.com/loilo/73c55ed04917ecf5d682ec70a2a1b8e2 -->
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot :name="name" v-bind="slotData" />
    </template>
    <slot v-for="(_, name) in $slots" :name="name" :slot="name" />

    <template #cell(options)="row">
      <slot
        v-if="idKey(row.item) && !row.item.hideOptions"
        name="options"
        v-bind="row"
      />
      <b-button
        v-if="idKey(row.item) && !row.item.hideOptions && showEditButton"
        class="mo-table__edit"
        @click="onEdit(row.item)"
      >
        <i class="far fa-cog" />
      </b-button>
    </template>
  </b-table>
</template>

<script>
import { deep } from "@/utils/utils";
import Multiselect from "vue-multiselect";

export default {
  name: "MoTable",
  components: {
    Multiselect
  },
  props: {
    idField: {
      type: String,
      default: "id"
    },
    maxHeight: {
      type: String,
      default: "var(--mo-content-height)"
    },
    filterValues: {
      type: Object,
      default: () => ({})
    },
    emptyText: {
      type: String,
      default: "No items to show"
    },
    fields: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    initialSelected: {
      type: Object,
      default: () => ({})
    },
    searchQuery: {
      type: String,
      default: ""
    },
    tableClass: {
      type: String,
      default: ""
    },
    showSelectAll: {
      type: Boolean,
      default: true
    },
    showEditButton: {
      type: Boolean,
      default: true
    },
    showIdField: {
      type: Boolean,
      default: true
    },
    fixed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      totalRows: 0,
      tableId: null,
      filters: {},
      selectAll: false,
      selected: this.initialSelected,
      collapsed: {},
      filteredRows: [],
      initialChange: true
    };
  },
  watch: {
    filterValues: {
      deep: true,
      handler: function() {
        this.updateFiltersViaProps();
      }
    },
    searchQuery(value) {
      this.filters = value;
    },
    initialSelected(value) {
      // react only on first change
      if (this.selected !== {}) {
        this.selected = value;
      }
    },
    selected: {
      deep: true,
      handler: function() {
        this.$emit("select", this.selectedItems);
      }
    },
    selectAll(value) {
      const selected = this.filteredRows
        .filter(e => this.idKey(e))
        .reduce(
          (p, c) => Object.assign(p, { [deep(c, this.idField)]: value }),
          {}
        );
      this.$set(this, "selected", selected);
    },
    items(value) {
      // when items change reset selected status
      if (this.initialChange) {
        this.initialChange = false;
      } else {
        // select a subset of currently selected units
        // that are still present in new this.items array
        this.$set(
          this,
          "selected",
          this.items
            .filter(e => !!this.selected[e.id])
            .reduce((p, c) => ({ ...p, [c.id]: true }), {})
        );
      }
      this.filteredRows = value;
      this.totalRows = value.length;
    }
  },
  computed: {
    collapsableFields() {
      return this.moFields.filter(e => !!e.collapsable).map(e => e.key);
    },
    filterFields() {
      return this.moFields.filter(e => !!e.filterable).map(e => e.key);
    },
    defaultFilters() {
      return this.filterFields.reduce((p, c) => ({ ...p, [c]: "" }), {});
    },
    hasCheckbox() {
      return this.moFields.filter(e => e.key === "select").length > 0;
    },
    moFields() {
      // filter these fields by their formatted value
      const filterByFormattedWhitelist = [
        "id",
        "created_at",
        "updated_at",
        "status"
      ];
      // exclude these fields from sorting
      const sortableBlacklist = ["options", "select", "duplicate"];
      // inject "sortable" option to all fields except select & options
      const configurable = this.fields.map(f => ({
        class: f.key.replaceAll(".", "-"),
        sortable: !sortableBlacklist.includes(f.key),
        filterByFormatted: filterByFormattedWhitelist.includes(f.key),
        sortByFormatted: filterByFormattedWhitelist.includes(f.key),
        ...f
      }));
      if (configurable.filter(e => e.key === this.idField).length > 0) {
        // use externally defined column ordering
        return configurable;
      }
      // inject ID column to every other table that doesn't externally define it
      const global = this.showIdField
        ? [
            {
              key: this.idField,
              class: "id",
              label: "ID",
              formatter: value => (value ? value : "-")
            }
          ]
        : [];
      return [...global, ...configurable];
    },
    slots() {
      return Object.keys(this.$slots);
    },
    selectedItems() {
      return Object.keys(this.selected).filter(
        id => this.selected[id] === true
      );
    }
  },
  mounted() {
    this.tableId = `mo-table-${Math.round(Math.random() * 10000)}`;
    this.updateFiltersViaProps();
    this.filters = { ...this.defaultFilters, ...this.filters };
  },
  methods: {
    setSelectedRows(value) {
      this.$set(
        this,
        "selected",
        value.reduce((p, c) => ({ ...p, [c]: true }), {})
      );
    },
    updateFiltersViaProps() {
      let tempFilters = {};
      if (this.$store.getters.getActivateFilter) {
        this.$store.commit("setActivateFilter", false);
        tempFilters = this.$store.getters.getTableFilters;
      } else {
        tempFilters = this.filterValues;
      }
      // exclude object properties with falsely values (e.g. null, undefined)
      const newFilters = Object.keys(tempFilters)
        .filter(key => !!tempFilters[key])
        .reduce((p, key) => ({ ...p, [key]: tempFilters[key] }), {});
      this.filters = { ...this.filters, ...newFilters };
    },
    filterRow(row, filter) {
      return this.tableRowFilterFunction(row, filter, this.filterFields);
    },
    isCollapsed(field, index) {
      const f = field.replaceAll(".", "-");
      const id = `${this.tableId}-${f}-${index}`;
      return !!this.collapsed[id];
    },
    onCollapse(field, index) {
      const f = field.replaceAll(".", "-");
      const id = `${this.tableId}-${f}-${index}`;
      this.$set(this.collapsed, id, true);
      const style = document.createElement("style");
      style.id = id;
      style.innerText = `
        #${this.tableId} td.${f},
        #${this.tableId} th.${f} {
          max-width: 20px !important
        }
        #${this.tableId} th.${f} select {
          display: none;
        }
      `;
      document.body.appendChild(style);
    },
    onExpand(field, index) {
      const f = field.replaceAll(".", "-");
      const id = `${this.tableId}-${f}-${index}`;
      const style = document.querySelector(`#${id}`);
      document.body.removeChild(style);
      this.$set(this.collapsed, id, false);
    },
    onEdit(item) {
      // this event includes only item id (kept mostly for compatibility)
      this.$emit("edit", item.id);
      this.$emit("edit-item", item);
    },
    idKey(item) {
      return deep(item, this.idField);
    },
    convertObjectStringKey(object, key) {
      let split = key.split(".");
      split.forEach(element => {
        if (object == null) {
          return;
        }
        if (element in object) {
          object = object[element];
        } else {
          return;
        }
      });
      return object;
    },
    extractOptions(field, values) {
      // this.$store.mutations.setTableFilters(this.filters);
      if (!this.$store.getters.getActivateFilter)
        this.$store.commit("setTableFilters", this.filters);

      //check git history if options on table are making problems to revert any problems
      //this now should filter based on selection ex. country=France, will show only Retailers/cities/brands from France
      return [
        ...new Set(
          values
            .filter(e => {
              for (const [key, value] of Object.entries(this.filters)) {
                // if (!this.convertObjectStringKey(e, key)) return false;
                if (value && this.convertObjectStringKey(e, key)) {
                  return this.convertObjectStringKey(e, key) === value;
                }
              }
              return true;
            })
            .map(e => deep(e, field))
        )
      ]
        .filter(e => !!e)
        .sort();
    },
    getLabelForField(fieldPath) {
      const field = this.moFields.filter(e => e.key === fieldPath)[0];
      if (!field) {
        throw new Error(`Field "${fieldPath}" not found`);
      }
      return field.label;
    },
    onFiltered(filteredItems) {
      this.filteredRows = filteredItems;
      this.totalRows = filteredItems.length;
    }
  }
};
</script>
