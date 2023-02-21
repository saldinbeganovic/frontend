<template>
  <mo-dashboard-body
    aligned-class="mo-campaigns-table__aligned"
    body-class=" pb-3"
  >
    <template #body>
      <mo-image-gallery
        modal-id="campaign-image-modal"
        :images="currentCampaignPhoto"
      />
      <mo-prompt-modal
        modal-id="delete-modal"
        message="Are you sure you want to delete this visual campaign ?"
        @right="onDeleteCampaignConfirm"
      />
      <mo-prompt-modal
        modal-id="archive-campaign-modal"
        :message="archiveMessage"
        @right="onArchive"
        @left="onArchiveCancel"
      />
      <h5>Active</h5>

      <mo-table
        empty-text="No campaigns to show"
        table-class="mo-campaigns-table  mo-table__multiple"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
      >
        <template #cell(actions)="{item}">
          <b-button class="mo-table__edit" @click="onEditCampaign(item.id)">
            <i class="far fa-eye" />
          </b-button>
          <b-button
            v-if="item.status === 1 && $store.getters.hasAdminRole"
            class="mo-table__delete"
            @click="onDeleteCampaign(item.id)"
          >
            <i class="fas fa-trash" />
          </b-button>
        </template>
        <template #cell(title)="{item}">
          <span style="white-space: nowrap">{{ item.title }}</span>
        </template>
        <template #cell(image)="{item}">
          <img
            style="cursor: pointer"
            v-if="isImage(item.cover_photo)"
            :src="toS3Url(item.cover_photo)"
            alt="Campaign cover photo"
            @click="onShowPreview(item.cover_photo)"
          />
          <i v-else class="fas fa-ban" />
        </template>
        <template #cell(status)="{item}">
          <mo-select-badge
            width="145px"
            :value="item.status"
            :variant="badgeVariants[item.status]"
            :options="statusOptions(item.status === 1)"
            label-class="text-left"
            :select-class="item.status === 1 ? 'draft' : ''"
            :disabled="item.status === 1 || !$store.getters.hasAdminRole"
            @click="item.status === 1 && onOrderEdit(item.id)"
            @change="onUpdateStatus(item.id, $event)"
          />
        </template>
      </mo-table>
      <mo-screen-wrapper-modal
        scrollable
        dialog-class="mo-edit-campaign-modal__dialog"
        ref="editCampaignModal"
        #body="{props}"
      >
        <mo-edit-campaign-modal
          :campaign-id="props.campaignId"
          @exit="onExitEdit"
        />
      </mo-screen-wrapper-modal>
      <mo-screen-wrapper-modal
        ref="viewCampaignModal"
        dialog-class="mo-edit-campaign-modal__dialog"
        #body="{props}"
      >
        <mo-view-campaign-modal
          :campaign-id="props.campaignId"
          @exit="onExitView"
        />
      </mo-screen-wrapper-modal>
    </template>
    <template #footer-left>
      <mo-button
        v-if="$store.getters.hasAdminRole"
        @click="onAddCampaign"
        title="Add visual roll-out"
        width="250px"
      />
    </template>
  </mo-dashboard-body>
</template>

<script>
import {
  getVisualCampaignsOfCompany,
  updateCampaignStatus,
  deleteVisualCampaign
} from "@/api/user/campaigns/campaigns";
import { formatText } from "@/utils/utils";

import MoEditCampaignModal from "@/views/user/visuals/campaign/edit";
import MoViewCampaignModal from "@/views/user/visuals/campaign/view";
import MoImageGallery from "../../../components/pure/modals/MoImageGallery";

export default {
  name: "ViewCampaigns",
  components: { MoImageGallery, MoEditCampaignModal, MoViewCampaignModal },
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentCampaignPhoto: [],

      isLoading: true,
      visualCampaignId: null,
      currentUser: null,
      items: [],
      currentStatusChangeId: null,
      tempStatus: null,
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
        {
          key: "id",
          label: "ID",
          formatter: value => `#${value}`
        },
        {
          key: "image",
          label: "Photo"
        },
        {
          key: "title",
          label: "Campaign name"
        },
        {
          key: "printing_orders",
          label: "Printing orders",
          sortable: false,
          formatter: value => {
            return value.length;
          }
        },
        {
          key: "decorating_orders",
          label: "Decorating orders",
          sortable: false,
          formatter: value => {
            return value.length;
          }
        },
        { key: "status", label: "Status" },
        { key: "actions", label: "Options" }
      ]
    };
  },
  computed: {
    archiveMessage() {
      return `Are sure you want to archive this visual roll-out ? You can't undo this action.`;
    },
    companyId() {
      return this.$store.getters.companyId;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onShowPreview(path) {
      this.currentCampaignPhoto = [{ path }];
      this.$bvModal.show("campaign-image-modal");
    },
    formatTitle(value) {
      return formatText(value, 30);
    },
    statusOptions(draft = true) {
      let status = [
        { value: 1, text: "Draft" },
        { value: 2, text: "Active" },
        { value: 3, text: "Completed" },
        { value: 4, text: "Canceled" }
      ];
      draft ? status : status.shift();

      return status;
    },
    onEditCampaign(campaignId) {
      // prefetch campaign info for edit screens
      this.$store.dispatch("fetchExistingCampaignInfo", campaignId);
      this.$refs.viewCampaignModal.show({
        campaignId: campaignId
      }); // this.$router.push(`/user/campaign/${campaignId}/overview`);
    },
    onDeleteCampaignConfirm() {
      this.handleDelete(
        deleteVisualCampaign(this.visualCampaignId),
        "Visual roll-out"
      )
        .then(() => {
          this.$bvModal.hide("delete-modal");
          this.visualCampaignId = null;
          this.fetchData();
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        });
    },
    onDeleteCampaign(id) {
      this.visualCampaignId = id;
      this.$bvModal.show("delete-modal");
    },
    onOrderEdit(campaignId) {
      // prefetch campaign info for edit screens
      this.$store.dispatch("fetchExistingCampaignInfo", campaignId);
      // this.$router.push(
      //   `/user/campaign/${campaignId}/graphic/choose/info?edit=true`
      // );
      this.$refs.editCampaignModal.show({
        campaignId: campaignId
      });
    },
    onArchiveCancel() {
      this.fetchData();
    },
    onArchive() {
      this.$bvModal.hide("archive-campaign-modal");
      this.handleArchive(
        updateCampaignStatus(this.currentStatusChangeId, {
          status: this.tempStatus
        }),
        "Visual roll-out"
      ).then(() => {
        this.currentStatusChangeId = null;
        this.$emit("refetch-archive");
      });
    },
    onUpdateStatus(id, status) {
      // if status=completed show prompt-modal to the user
      if (status === "3" || status === "4") {
        this.currentStatusChangeId = id;
        this.tempStatus = status;
        return this.$bvModal.show("archive-campaign-modal");
      }
      updateCampaignStatus(id, { status })
        .then(() => {
          this.fetchData();
          this.$bvToast.toast(
            `Status updated to: ${this.badgeMessages[status]}`
          );
        })
        .catch(() => {
          this.$bvToast.toast("Status update failed");
        });
    },
    fetchData() {
      this.handleFetch(
        getVisualCampaignsOfCompany(this.companyId),
        "Visual roll-out"
      ).then(data => {
        this.items = data;
      });
    },
    onAddCampaign() {
      // reset store, so that the user starts with empty options if he wants to add new campaign
      this.$store.dispatch("resetStore");
      // mo-edit-maintenance-modal is mounted only after calling .show
      this.$refs.editCampaignModal.show({
        campaignId: "new"
      });
    },
    onExitEdit(campaignId) {
      if (campaignId) {
        this.$refs.editCampaignModal.hide();
        this.$refs.viewCampaignModal.show({
          campaignId: campaignId
        });
      } else {
        this.$refs.editCampaignModal.hide();
      }
      this.fetchData();
    },
    onExitView(campaignId) {
      if (campaignId) {
        this.$refs.viewCampaignModal.hide();

        this.$refs.editCampaignModal.show({
          campaignId: campaignId
        });
      } else {
        this.$refs.viewCampaignModal.hide();
      }
      this.fetchData();
    }
  }
};
</script>
<style lang="scss">
select.draft {
  -webkit-appearance: none;
  -moz-appearance: none;
  text-indent: 1px;
  text-overflow: "";
}

.mo-campaigns-table {
  &__aligned {
    height: auto !important;
  }
  .title {
    max-width: 350px;
  }
}
td.image {
  text-align: center;
}
.mo-edit-campaign-modal {
  &__dialog {
    max-width: 80vw !important;
    overflow-y: auto;
  }
}
</style>
