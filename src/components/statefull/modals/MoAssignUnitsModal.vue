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
      {{ message }}
    </h3>
    <form @submit.prevent="onSubmit">
      <multiselect
        id="players"
        class="w-100 mb-4"
        v-model="selectedPos"
        :options="posOptions"
        :multiple="false"
        :close-on-select="closeOnSelect"
        :clear-on-select="false"
        :preserve-search="true"
        placeholder="Select PoS"
        label="name"
        track-by="name"
        searchable
      />
      <mo-button :title="buttonTitle" width="100%" type="submit" />
    </form>
  </b-modal>
</template>

<script>
import Multiselect from "vue-multiselect";
import { getUnitMetadata } from "@/api/admin/company/unit/unit";

export default {
  name: "MoAssignUnitsModal",
  components: {
    Multiselect
  },
  props: {
    modalId: {
      type: String,
      required: true
    },
    posId: {
      type: [String, Number]
    },
    closeOnSelect: {
      type: Boolean
    },
    message: {
      type: String,
      default: "Please, choose the PoS"
    },
    buttonTitle: {
      type: String,
      default: "Submit"
    },
    description: {
      type: String
    }
  },
  data() {
    return {
      selectedPos: [],
      posOptions: []
    };
  },
  watch: {
    posId(value) {
      this.posId = value;
      this.findPosInOptions();
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      getUnitMetadata(this.$store.getters.companyId).then(data => {
        this.posOptions = data.points_of_sale;
        this.findPosInOptions();
      });
    },
    onSubmit() {
      if (!this.selectedPos) {
        this.$bvToast.toast("Please select a PoS", { variant: "info" });
      } else {
        this.$emit("submit", this.selectedPos.id);
      }
    },
    findPosInOptions() {
      this.selectedPos = this.posOptions.find(e => e.id === this.posId);
    }
  }
};
</script>
