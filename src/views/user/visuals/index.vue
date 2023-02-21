<template>
  <mo-dashboard
    title="Visuals"
    :tab-items="tabItems"
    @search="searchQuery = $event"
  >
    <template #visual-roll-outs>
      <campaigns
        :search-query="searchQuery"
        @refetch-archive="onRefetchArchive"
      />
      <archive ref="archive" :search-query="searchQuery" />
    </template>
    <template #library-of-files>
      <graphics
        :search-query="searchQuery"
        @refetch-archive="onRefetchArchive"
      />
      <graphics
        ref="graphicsArchive"
        :search-query="searchQuery"
        :is-archive="true"
      />
    </template>
    <template #printing-orders>
      <printing-orders
        ref="printingOrders"
        :search-query="searchQuery"
        @fetch-parent="onRefetchPrintingOrder"
      />
      <printing-orders
        ref="printingOrdersComplete"
        :completed="true"
        :search-query="searchQuery"
        @fetch-parent="onRefetchPrintingOrder"
      />
    </template>
    <template #decorating-orders>
      <decorating-orders
        ref="decoratingOrders"
        :search-query="searchQuery"
        @fetch-parent="onRefetchDecoratingOrder"
      />
      <decorating-orders
        ref="decoratingOrdersComplete"
        :completed="true"
        :search-query="searchQuery"
        @fetch-parent="onRefetchDecoratingOrder"
      />
    </template>
  </mo-dashboard>
</template>

<script>
import Campaigns from "@/views/user/visuals/Campaigns";
import Graphics from "@/views/user/visuals/graphic/View";
import Archive from "@/views/user/visuals/Archive";
import PrintingOrders from "@/views/user/visuals/printing-order/View";
import DecoratingOrders from "@/views/user/visuals/decorating-order/View";

export default {
  name: "index",
  components: {
    Campaigns,
    Graphics,
    Archive,
    PrintingOrders,
    DecoratingOrders
  },
  data() {
    return {
      searchQuery: ""
    };
  },
  computed: {
    tabItems() {
      return [
        "Visual Roll-outs",
        "Library of Files",
        "Printing Orders",
        "Decorating Orders"
      ];
    }
  },
  methods: {
    onRefetchArchive() {
      this.$refs.archive.fetchData();
      this.$refs.graphicsArchive.fetchData();
    },
    onRefetchPrintingOrder() {
      this.$refs.printingOrders.fetchData();
      this.$refs.printingOrdersComplete.fetchData();
    },
    onRefetchDecoratingOrder() {
      this.$refs.decoratingOrders.fetchData();
      this.$refs.decoratingOrdersComplete.fetchData();
    }
  }
};
</script>
