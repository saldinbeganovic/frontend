<template>
  <b-tabs
    class="d-flex flex-column w-100 h-100 block"
    nav-wrapper-class="mo-dashboard-layout__tab-nav pb-1"
    content-class="mo-dashboard-layout__tab-body flex-1 overflow-auto"
    active-nav-item-class="mo-tab__active"
    v-model="tabIndex"
  >
    <b-tab title="Choose graphics" @click="onGraphicsTabClick">
      <choose-graphics
        :campaignId="campaignId"
        @on-next="onNext"
        @exit="onExit"
      />
    </b-tab>
  </b-tabs>
</template>

<script>
import ChooseGraphics from "@/views/user/visuals/campaign/edit/ChooseGraphics";

export default {
  name: "AddCampaign",
  components: {
    ChooseGraphics
  },
  props: {
    campaignId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return { tabIndex: 0, visualsTabDisabled: true };
  },
  methods: {
    onNext() {
      Promise.all([this.enableVisualsTab()]).then(() => {
        this.tabIndex = 1;
      });
    },
    onBack() {
      this.tabIndex = 0;
      this.disableVisualsTab();
    },
    enableVisualsTab() {
      this.visualsTabDisabled = false;
    },
    disableVisualsTab() {
      this.visualsTabDisabled = false;
    },
    onGraphicsTabClick() {
      this.disableVisualsTab();
    },
    onExit(campaignId) {
      this.$emit("exit", campaignId);
    }
  }
};
</script>
