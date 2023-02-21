<template>
  <mo-dashboard
    title="Dashboard"
    :tab-items="tabItems"
    @search="searchQuery = $event"
  >
    <template #users>
      <users :search-query="searchQuery" />
    </template>
    
    <template #data-usage>
      <Data :search-query="searchQuery"/>
    </template>
 
    <template #maintenance-companies>
      <vendors :search-query="searchQuery" />
    </template>
    <template #printing-houses>
      <printing-houses :search-query="searchQuery" />
    </template>
    <template #decorating-companies>
      <decorating-houses :search-query="searchQuery" />
    </template>
    <template #retailers>
      <retailers :search-query="searchQuery" />
    </template>
    <template #warehouses>
      <warehouses :search-query="searchQuery" />
    </template>
    <template #brands>
      <brands :search-query="searchQuery" />
    </template>
    <template #visual-materials>
      <visual-materials :search-query="searchQuery" ref="visualMaterial" />
    </template>
  </mo-dashboard>
</template>

<script>
import Users from "@/views/shared/user/Users";
import Vendors from "@/views/user/maintenance/Vendors";
import PrintingHouses from "@/views/user/visuals/printing/View";
import DecoratingHouses from "@/views/user/visuals/decorating/View";
import Retailers from "@/views/user/dashboard/retailers/Retailers";
import Brands from "@/views/user/dashboard/brands/Brands";
import Warehouses from "@/views/user/dashboard/warehouse/Warehouses";
import VisualMaterials from "@/views/user/dashboard/visual-material/View";
import Data from "@/views/user/dashboard/data/Data";

export default {
  name: "UserProfile",
  components: {
    Warehouses,
    Data,
    Users,
    Vendors,
    DecoratingHouses,
    PrintingHouses,
    Retailers,
    Brands,
    VisualMaterials,
    
  },
  data() {
    return {
      searchQuery: ""
    };
  },
  computed: {
    tabItems() {
      return [
        "Users",
        "Data Usage",
        "Maintenance companies",
        "Printing houses",
        "Decorating companies",
        "Retailers",
        "Brands",
        "Warehouses",
        "Visual Materials"
      ];
    }
  }
};
</script>
