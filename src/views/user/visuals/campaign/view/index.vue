<template>
  <b-tabs
    class="d-flex flex-column w-100"
    nav-wrapper-class="mo-dashboard-layout__tab-nav pb-1"
    content-class="mo-dashboard-layout__tab-visual-roll-out flex-1 overflow-auto"
    active-nav-item-class="mo-tab__active"
  >
    <b-tab title="Overview" active>
      <overview :campaign-id="campaignId" @exit="onExit" />
    </b-tab>
    <b-tab title="Graphics And Files">
      <view-graphic :campaign-id="campaignId" />
    </b-tab>
  </b-tabs>
</template>

<script>
import Overview from "@/views/user/visuals/campaign/view/Overview";
import ViewGraphic from "@/views/user/visuals/campaign/view/Graphics";

export default {
  name: "ViewCampaign",
  components: {
    Overview,
    ViewGraphic
  },
  props: {
    campaignId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      tabItems: ["Overview", "Graphics and Files"]
    };
  },
  methods: {
    onExit(campaignId) {
      this.$emit("exit", campaignId);
    }
  }
};
</script>
