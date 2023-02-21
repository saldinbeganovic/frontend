<template>
  <mo-dashboard
    title="PoS & Units"
    :tab-items="tabs"
    @search="searchQuery = $event"
  >
    <template #pos-&-units>
      <units-and-pos
        @refetch="$refs.archive.fetchData()"
        ref="units"
        :search-query="searchQuery"
      />
    </template>
    <template #warehoused-units>
      <units-and-pos
        ref="archive"
        :is-archive="true"
        @refetch="$refs.units.fetchData()"
        :search-query="searchQuery"
      />
    </template>
    <template #imported-tech-data-for-units>
      <batches :search-query="searchQuery" />
    </template>
  </mo-dashboard>
</template>

<script>
import UnitsAndPos from "@/views/shared/units/UnitsAndPos";
import Batches from "@/views/shared/units/ImportedUnits";

export default {
  name: "index",
  components: {
    UnitsAndPos,
    Batches
  },
  data() {
    return {
      searchQuery: ""
    };
  },
  computed: {
    tabs() {
      return [
        "PoS & Units",
        
      ];
    }
  }
};
</script>
