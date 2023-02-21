<template>
  <mo-dashboard-body
    aligned-class="mo-campaigns-table__aligned"
    body-class=" pb-3"
  >
    <template #body>
      <h5>Archive</h5>
      <mo-table
        table-class="mo-table__multiple"
        empty-text="No campaigns to show"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        @select="selected = $event"
        @edit="onEdit"
      >
        <template #cell(status)="{item}">
          <mo-select-badge
            width="120px"
            :value="item.status"
            :variant="badgeVariants[item.status]"
            :options="statusOptions()"
            :select-class="'draft'"
            label-class="text-left"
            :disabled="true"
          />
        </template>
      </mo-table>
      <mo-screen-wrapper-modal ref="viewCampaignModal" #body="{props}">
        <mo-view-campaign-modal :campaign-id="props.campaignId" />
      </mo-screen-wrapper-modal>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { getArchivedVisualCampaignsOfCompany } from "@/api/user/campaigns/campaigns";
import { formatDate, formatText } from "@/utils/utils";
import MoViewCampaignModal from "@/views/user/visuals/campaign/view";

export default {
  name: "ViewCampaigns",
  components: { MoViewCampaignModal },
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      currentUser: null,
      selected: [],
      items: [],
      badgeVariants: {
        1: "purple",
        2: "",
        3: "success",
        4: "danger"
      },
      badgeMessages: {
        1: "Draft",
        2: "Active",
        3: "Completed",
        4: "Canceled"
      },
      fields: [
        { key: "title", label: "Title" },
        {
          key: "description",
          label: "Description",
          formatter: value => formatText(value, 30)
        },
        {
          key: "created_at",
          label: "Created at",
          formatter: formatDate
        },
        {
          key: "status",
          label: "Status"
        },
        { key: "options", label: "" }
      ]
    };
  },
  computed: {
    archiveMessage() {
      return `Are sure you want to archive these ${this.selected.length} campaigns ?`;
    },
    companyId() {
      return this.$store.getters.companyId;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onEdit(campaignId) {
      this.$refs.viewCampaignModal.show({
        campaignId: campaignId
      });
    },
    fetchData() {
      this.handleFetch(
        getArchivedVisualCampaignsOfCompany(this.companyId),
        "Campaign archives"
      ).then(data => {
        this.items = data;
      });
    },
    statusOptions() {
      return [
        { value: 1, text: "Draft" },
        { value: 2, text: "Active" },
        { value: 3, text: "Completed" },
        { value: 4, text: "Canceled" }
      ];
    }
  }
};
</script>
