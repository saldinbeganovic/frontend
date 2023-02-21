<template>
  <b-table-simple table-class="mo-campaign-table mo-table__bordered">
    <b-thead class="mo-table__head">
      <b-tr>
        <b-th></b-th>
        <b-th
          role="columnheader"
          :aria-sort="getSortType('brand')"
          class="table-b-table-default"
          @click="onSortBy('brand')"
        >
          <b>Visual</b> {{ items }}
        </b-th>
        <b-th
          role="columnheader"
          :aria-sort="getSortType('country')"
          class="table-b-table-default"
          @click="onSortBy('country')"
        >
          <b>Country</b>
        </b-th>
        <b-th
          role="columnheader"
          :aria-sort="getSortType('city')"
          class="table-b-table-default"
          @click="onSortBy('city')"
        >
          <b>City</b>
        </b-th>
        <b-th
          role="columnheader"
          :aria-sort="getSortType('pos')"
          class="table-b-table-default"
          @click="onSortBy('pos')"
        >
          <b>Pos</b>
          <b-form-select
            v-if="editable"
            class="mo-input__light-sm mo-header-select d-inline-block ml-2 align-items-center mo-visuals-table__select"
            v-model="selectedPosId"
            :options="posOptions"
          ></b-form-select>
        </b-th>
        <b-th
          role="columnheader"
          :aria-sort="getSortType('unit')"
          class="table-b-table-default"
          @click="onSortBy('unit')"
        >
          <b>Unit</b>
          <b-form-select
            v-if="editable"
            class="mo-input__light-sm mo-header-select d-inline-block ml-2 align-items-center mo-visuals-table__select"
            v-model="selectedUnitId"
            :disabled="unitOptions.length === 0 || !selectedPosId"
            :options="unitOptions"
          ></b-form-select>
        </b-th>
        <b-th
          role="columnheader"
          :aria-sort="getSortType('visual')"
          class="table-b-table-default"
          @click="onSortBy('visual')"
        >
          <b>Visual</b>
        </b-th>
        <b-th v-if="showPrintingOptions">
          <b>Printing info</b>
        </b-th>
        <b-th v-if="showDecoratingOptions">
          <b>Decorating info</b>
        </b-th>
      </b-tr>
    </b-thead>
    <b-tbody>
      <template v-if="items.length === 0">
        <b-tr>
          <b-td class="text-center" colspan="8">
            No Visual items exist. Did you add Visuals under Unit settings ?
          </b-td>
        </b-tr>
      </template>
      <template v-for="visualGroup in sortedItems">
        <b-tr v-for="(item, j) in visualGroup" :key="item.id">
          <b-td v-if="j === 0" :rowspan="visualGroup.length">
            <b-form-checkbox
              v-if="editable"
              v-model="selectedPos[item.posId]"
            />
          </b-td>
          <b-td>{{ item.visual }}</b-td>
          <b-td>{{ item.country }}</b-td>
          <b-td>{{ item.city }}</b-td>
          <b-td>{{ item.pos }}</b-td>
          <b-td>{{ item.unit }}</b-td>
          <b-td style="width: 150px">
            <b-form-checkbox
              class="d-inline mr-2"
              v-if="editable"
              v-model="selectedVisuals[item.id]"
            />
            {{ item.visual }}
          </b-td>
          <b-td
            v-if="j === 0 && showPrintingOptions"
            :class="editable ? 'text-center' : ''"
            :rowspan="visualGroup.length"
          >
            <b-button
              :class="
                `mo-plain-button m-auto d-block ${
                  showOptionsForPos(item.posId) || !editable ? '' : 'invisible'
                } text-left`
              "
              :disabled="!editable"
              variant="light"
              @click="onChoosePrintingOptions(item.posId)"
            >
              <template v-if="editable">
                <span class="mr-2">Edit</span>
                <i
                  v-if="isValidPrintingOption(item.posId)"
                  class="fas fa-check mo-text__success"
                />
                <i v-else class="fas fa-times mo-text__danger" />
              </template>
              <template v-else>
                <div
                  v-if="printingHousesInfoMap[item.posId]"
                  class="d-flex flex-column"
                >
                  <div v-if="printingHouseEmail">
                    <a :href="`mailto:${printingHouseEmail(item.posId)}`">{{
                      printingHouseEmail(item.posId)
                    }}</a>
                  </div>
                  <div>{{ printingHouseTitle(item.posId) }}</div>
                  <div>
                    Deadline:
                    <span class="mo-text__primary">{{
                      printingHouseDeadline(item.posId)
                    }}</span>
                  </div>
                </div>
                <div v-else class="d-flex flex-column justify-content-start">
                  <div>Printing house was deleted</div>
                </div>
              </template>
            </b-button>
            <b-button
              v-if="
                showOptionsForPos(item.posId) &&
                  isValidPrintingOption(item.posId) &&
                  selectedPosCount > 1 &&
                  editable
              "
              class="mt-4 d-block mo-plain-button"
              variant="light"
              @click="applyToAllPrinting(item.posId)"
              >Apply to all</b-button
            >
          </b-td>
          <b-td
            v-if="j === 0 && showDecoratingOptions"
            :class="editable ? 'text-center' : ''"
            :rowspan="visualGroup.length"
          >
            <b-button
              :class="
                `mo-plain-button m-auto d-block ${
                  showOptionsForPos(item.posId) || !editable ? '' : 'invisible'
                } text-left`
              "
              :disabled="!editable"
              variant="light"
              @click="onChooseDecoratingOptions(item.posId)"
            >
              <template v-if="editable">
                <span class="mr-2">Edit</span>
                <i
                  v-if="isValidDecoratingOptions(item.posId)"
                  class="fas fa-check mo-text__success"
                />
                <i v-else class="fas fa-times mo-text__danger" />
              </template>
              <template v-else>
                <div
                  v-if="decoratingHousesInfoMap[item.posId]"
                  class="d-flex flex-column justify-content-start"
                >
                  <div v-if="decoratingHouseEmail">
                    <a :href="`mailto:${decoratingHouseEmail(item.posId)}`">{{
                      decoratingHouseEmail(item.posId)
                    }}</a>
                  </div>
                  <div>{{ decoratingHouseTitle(item.posId) }}</div>
                  <div class="text-left">
                    Deadline:
                    <span class="mo-text__primary">
                      {{ decoratingHouseDeadline(item.posId) }}
                    </span>
                  </div>
                </div>
                <div v-else class="d-flex flex-column justify-content-start">
                  <div>Decorating house was deleted</div>
                </div>
              </template>
            </b-button>
            <b-button
              v-if="
                showOptionsForPos(item.posId) &&
                  isValidDecoratingOptions(item.posId) &&
                  selectedPosCount > 1 &&
                  editable
              "
              class="mt-4 d-block mo-plain-button"
              variant="light"
              @click="applyToAllDecorating(item.posId)"
              >Apply to all</b-button
            >
          </b-td>
        </b-tr>
      </template>
    </b-tbody>
  </b-table-simple>
</template>

<script>
import { getUnitsOfPos } from "@/api/admin/company/point-of-sale";
import { formatDate } from "@/utils/utils";

export default {
  name: "MoCampaignVisualsTable",
  props: {
    showDecoratingOptions: {
      type: Boolean,
      default: true
    },
    showPrintingOptions: {
      type: Boolean,
      default: true
    },
    editable: {
      type: Boolean,
      default: true
    },
    items: {
      type: Object,
      required: true
    }
  },
  computed: {
    sortedItems() {
      return this.items;
      // return this.sort(this.items.map((group) => this.sort(group)));
    },
    decoratingHousesInfoMap() {
      return this.$store.getters.decoratingHousesInfoMap;
    },
    printingHousesInfoMap() {
      return this.$store.getters.printingHousesInfoMap;
    },
    defaultSelectedVisuals() {
      return this.$store.getters.selectedVisuals;
    },
    defaultSelectedPos() {
      return this.$store.getters.selectedPos;
    },
    selectedPosCount() {
      const selectedPos = [
        ...new Set(
          Object.keys(this.selectedVisuals)
            .map(parseFloat)
            .map(id => this.$store.getters.visualsToPosMap[id])
        )
      ];
      return selectedPos.length;
    }
  },
  data() {
    return {
      sortBy: null,
      sortTypes: {},
      selectedPosId: null,
      selectedUnitId: null,
      selectedVisualId: null,
      // maps of selected items
      // e.g. if a visual is selected selectedVisuals[visualId] will map to true
      selectedVisuals: {},
      selectedPos: {},
      // table filtering options
      unitOptions: [],
      posOptions: []
    };
  },
  watch: {
    defaultSelectedVisuals(value) {
      this.selectedVisuals = value;
    },
    defaultSelectedPos(value) {
      this.selectedPos = value;
    },
    selectedPos: {
      deep: true,
      handler: function() {
        // first set all visual checkboxes to "unchecked"
        Object.keys(this.selectedVisuals).forEach(visualId => {
          this.$set(this.selectedVisuals, visualId, false);
        });
        // then set all visual checkboxes that belong to selected pos checkboxes to "checked"
        Object.keys(this.selectedPos)
          .filter(posId => !!this.selectedPos[posId])
          .forEach(posId => {
            const posVisuals = this.$store.getters.posToVisualsMap[posId];
            posVisuals.forEach(visualId => {
              this.$set(this.selectedVisuals, visualId, true);
            });
          });
        this.$store.commit("setSelectedVisuals", this.selectedVisuals);
        this.$store.commit("setSelectedPos", this.selectedPos);
      }
    },
    // selectedVisuals: {
    //   deep: true,
    //   handler: function() {
    //     Object.keys(this.selectedPos)
    //       .filter((posId) => !!this.selectedPos[posId])
    //       .forEach((posId) => {
    //         const visualsOfPos = this.$store.getters.posToVisualsMap[posId];
    //         // check that there is at least one visual selected for this pos
    //         const isAnyVisualSelectedForPos = visualsOfPos.reduce(
    //           (p, visualId) => p || this.selectedVisuals[visualId],
    //           false
    //         );
    //         if (!isAnyVisualSelectedForPos) {
    //           this.$set(this.selectedPos, posId, false);
    //         }
    //       });
    //     this.$store.commit("setSelectedVisuals", this.selectedVisuals);
    //   },
    // },
    selectedPosId(value) {
      this.$store.commit("setPosFilter", value);
      this.$store.commit("setUnitFilter", null);
      this.selectedUnitId = null;
      if (!this.$store.getters.isDecoratingEdit) {
        this.$store.dispatch("fetchNewCampaignInfo");
      }
      this.fetchUnitOptions();
    },
    selectedUnitId(value) {
      this.$store.commit("setUnitFilter", value);
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onSortBy(column) {
      this.$set(
        this.sortTypes,
        column,
        this.getSortType(column) === "descending" ? "ascending" : "descending"
      );
      this.sortBy = column;
    },
    getSortType(column) {
      return this.sortTypes[column] || "ascending";
    },
    sort(array) {
      const field = this.sortBy;
      const order = this.getSortType(this.sortBy);
      if (!field) {
        return array;
      }
      return array.sort((a, b) => {
        // if the element is itself an array just sort based on the first element in array
        a = a instanceof Array ? a[0] : a;
        b = b instanceof Array ? b[0] : b;
        if (a[field] < b[field]) {
          return order === "ascending" ? -1 : 1;
        }
        if (a[field] > b[field]) {
          return order === "ascending" ? 1 : -1;
        }
        return 0;
      });
    },
    showOptionsForPos() {},
    isValidPrintingOption(posId) {
      const opts = this.printingHousesInfoMap[posId];
      return opts && opts.houseId && opts.deadline;
    },
    isValidDecoratingOptions(posId) {
      const opts = this.decoratingHousesInfoMap[posId];
      return opts && opts.houseId && opts.deadline;
    },
    printingHouseDeadline(posId) {
      const o = this.printingHousesInfoMap[posId];
      return o ? formatDate(o.deadline) : null;
    },
    printingHouseTitle(posId) {
      const o = this.printingHousesInfoMap[posId];
      return o ? o.houseName : null;
    },
    printingHouseEmail(posId) {
      const o = this.printingHousesInfoMap[posId];
      return o ? o.email : null;
    },
    decoratingHouseDeadline(posId) {
      const o = this.decoratingHousesInfoMap[posId];
      return o ? formatDate(o.deadline) : null;
    },
    decoratingHouseTitle(posId) {
      return this.decoratingHousesInfoMap[posId].houseName;
    },
    decoratingHouseEmail(posId) {
      return this.decoratingHousesInfoMap[posId].email;
    },
    onChooseDecoratingOptions(posId) {
      this.$emit("choose-decorating", posId);
    },
    onChoosePrintingOptions(posId) {
      this.$emit("choose-printing", posId);
    },
    applyToAllPrinting(posId) {
      this.$emit("apply-all-printing", posId);
    },
    applyToAllDecorating(posId) {
      this.$emit("apply-all-decorating", posId);
    },
    fetchUnitOptions() {
      if (this.selectedPosId) {
        getUnitsOfPos(this.selectedPosId).then(data => {
          this.unitOptions = [
            { value: null, text: "All units" },
            ...data.map(e => ({ value: e.id, text: e.title }))
          ];
        });
      }
    },
    fetchData() {
      this.getPos().then(posData => {
        this.posOptions = [
          { value: null, text: "All points of sale" },
          ...posData.map(e => ({ value: e.id, text: e.name }))
        ];
        this.unitOptions = [{ value: null, text: "-" }];
      });
    }
  }
};
</script>
<style lang="scss">
.mo-visuals-table__select {
  max-width: 120px;
  max-height: 36px;
}
.mo-campaign-table {
  th {
    white-space: nowrap;
  }
}
</style>
