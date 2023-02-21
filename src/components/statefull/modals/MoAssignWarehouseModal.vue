<template>
  <b-modal
    :id="modalId"
    hide-footer
    hide-header
    size="lg"
    centered
    content-class="mo-input-modal"
    body-class="mo-input-modal-body"
  >
    <h3 class="text-center font-weight-light mb-5">
      Choose a warehouse
    </h3>
    <form @submit.prevent="onSubmit">
      <multiselect
        id="players"
        class="w-100 mb-4"
        v-model="warehouse"
        :options="posOptions"
        :multiple="false"
        :close-on-select="true"
        :clear-on-select="false"
        :preserve-search="true"
        placeholder="Select Warehouse"
        label="name"
        track-by="name"
        searchable
      />
      <mo-button title="Submit" width="100%" type="submit" />
    </form>
  </b-modal>
</template>

<script>
import Multiselect from "vue-multiselect";
import { getUnitMetadata } from "@/api/admin/company/unit/unit";

export default {
  name: "MoAssignWarehouseModal",
  components: {
    Multiselect
  },
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      warehouse: null,
      posOptions: []
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      getUnitMetadata(this.$store.getters.companyId).then(data => {
        this.posOptions = data.warehouses;
      });
    },
    onSubmit() {
      if (!this.warehouse) {
        this.$bvToast.toast("Please select a Warehouse", { variant: "info" });
      } else {
        this.$emit("submit", this.warehouse.id);
      }
    }
  }
};
</script>
