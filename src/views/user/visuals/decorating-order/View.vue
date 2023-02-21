<template>
  <mo-dashboard-body
    aligned-class="mo-decorating-order-table__aligned"
    body-class="pb-3"
  >
    <template #body>
      <mo-screen-wrapper-modal ref="pdfWrapperModal" #body="{props}">
        <iframe :src="toS3Url(props.pdf)" class="pdf-view"> </iframe>
      </mo-screen-wrapper-modal>
      <mo-screen-wrapper-modal
        ref="viewCampaignModal"
        dialog-class="mo-edit-campaign-modal__dialog"
        #body="{props}"
      >
        <mo-view-campaign-modal :campaign-id="props.campaignId" />
      </mo-screen-wrapper-modal>
      <mo-screen-wrapper-modal
        ref="orderDecoratingModal"
        dialog-class="mo-order-decorating-modal__dialog"
        #body="{props}"
      >
        <mo-decorating-order-modal
          :existing-order="props.existingOrder"
          :campaign-id="props.campaignId"
          :visuals="props.visuals"
          @done="onOrderDecoratingDone"
        />
      </mo-screen-wrapper-modal>
      <mo-image-gallery
        :modal-id="printingOrderPreviewModalModalId"
        :images="currentPhoto"
      />
      <mo-prompt-modal
        :modal-id="deletePrintingOrderModalId"
        :message="`Are you sure you want to delete this decorating order ?`"
        @right="onDeletePrintingOrder"
      />
      <h5 v-if="!completed">Decorating Order</h5>
      <h5 v-else>Completed Decorating Order</h5>

      <mo-table
        empty-text="No Decorating Order to show"
        table-class="mo-decorating-order-table mo-table__multiple"
        :search-query="searchQuery"
        :items="items"
        :fields="fields"
        :loading="isLoading"
        :fixed="true"
        @select="selected = $event"
        @edit="onEdit"
      >
        <template #cell(visual_campaign_title)="{item}">
          <a @click="onViewEditCampaign(item.visual_campaign.id)">{{
            item.visual_campaign.title
          }}</a>
        </template>
        <template #cell(created_at)="{item}">
          {{ formatDate(item.created_at) }}
        </template>
        <template #cell(deadline_start)="{item}">
          {{ formatDate(item.deadline_start) }}
        </template>
        <template #cell(deadline_end)="{item}">
          {{ formatDate(item.deadline_end) }}
        </template>

        <template #cell(status)="{item}">
          <mo-select-badge
            width="150px"
            :variant="getStatusOrder()[item.status - 1].variant"
            :value="item.status"
            :options="getStatusOrder(item.id)"
            :disabled="!$store.getters.hasAdminRole"
            @change="onStatusChange(item.id, $event)"
          />
        </template>
        <template #cell(preview)="{item}">
          <img
            style="cursor: pointer"
            v-if="isImage(item.visual_campaign.cover_photo)"
            :src="toS3Url(item.visual_campaign.cover_photo)"
            alt="Campaign cover photo"
            @click="onViewEditCampaign(item.visual_campaign.id)"
          />
          <i
            v-else
            class="fas fa-ban"
            style="cursor: pointer"
            @click="onViewEditCampaign(item.visual_campaign.id)"
          />
        </template>
        <template #cell(actions)="{item}">
          <b-button
            v-if="item.pdf_path"
            title="Show PDF"
            class="mo-table__edit"
            @click="onOpenPdf(item.pdf_path)"
          >
            <i class="far fa-file-pdf" />
          </b-button>
          <b-button
            v-if="$store.getters.hasAdminRole"
            title="Duplicate"
            class="mo-table__edit"
            @click.prevent="onOrderDecorating(item)"
          >
            <i class="fas fa-copy" />
          </b-button>
          <b-button class="mo-table__edit" @click="onEdit(item.id)">
            <i class="far fa-eye" />
          </b-button>
          <b-button
            v-if="item.status === 1 && $store.getters.hasAdminRole"
            class="mo-table__delete"
            @click="showDeletePrintingOrderConformationModal(item.id)"
          >
            <i class="fas fa-trash" />
          </b-button>
        </template>
      </mo-table>
    </template>
    <template #footer-left>
      <mo-screen-wrapper-modal
        dialog-class="mo-edit-decorating-order-modal"
        ref="viewEditDecoratingOrder"
        #body="{props}"
      >
        <mo-edit-decorating-order-modal
          :decorating-order-id="props.printOrderId"
        />
      </mo-screen-wrapper-modal>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { getDecoratingOrders } from "@/api/admin/company/company";
import {
  deleteDecoratingOrder,
  updateDecoratingOrder
} from "@/api/user/campaigns/decorating-orders";
import { formatShippingType } from "@/utils/utils";

import MoEditDecoratingOrderModal from "@/views/user/visuals/decorating-order/Edit";
import MoImageGallery from "../../../../components/pure/modals/MoImageGallery";
import MoDecoratingOrderModal from "@/components/statefull/modals/MoDecoratingOrderModal";
import MoSelectBadge from "../../../../components/pure/inputs/MoSelectBadge.vue";
import MoViewCampaignModal from "@/views/user/visuals/campaign/view";

export default {
  name: "DecoratingOrderView",
  components: {
    MoEditDecoratingOrderModal,
    MoImageGallery,
    MoDecoratingOrderModal,
    MoSelectBadge,
    MoViewCampaignModal
  },
  props: {
    searchQuery: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: true,
      currentUser: null,
      currentPhoto: [],
      selected: [],
      items: [],
      deleteId: null,
      fields: [
        {
          key: "preview",
          label: ""
        },
        {
          key: "visual_campaign_title",
          label: "Visual roll-out"
        },
        {
          key: "status",
          label: "Status",
          sortable: false
        },
        {
          key: "shipping_type",
          label: "Delivery type",
          formatter: formatShippingType
        },
        {
          key: "addresses",
          label: "Delivery addresses",
          formatter: value => {
            if (value) return value.map(e => e.name).join(", ");
          },
          sortable: false
        },
        {
          key: "deadline_start",
          label: "Delivery date"
        },
        {
          key: "deadline_end",
          label: "Finish date"
        },
        {
          key: "created_at",
          label: "Creation date"
        },
        {
          key: "actions",
          label: "",
          sortable: false
        }
      ]
    };
  },
  computed: {
    prefix() {
      return this.completed ? "completed_" : "";
    },
    printingOrderPreviewModalModalId() {
      return `${this.prefix}decorating-order-preview-modal`;
    },
    deletePrintingOrderModalId() {
      return `${this.prefix}mo-decorating-order-modal`;
    },
    getRequestData() {
      return {
        completed: this.completed ? 1 : 0
      };
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onOpenPdf(pdfPath) {
      this.$refs.pdfWrapperModal.show({ pdf: pdfPath });
    },
    onEdit(id) {
      this.$refs.viewEditDecoratingOrder.show({
        printOrderId: id
      });
    },
    fetchData() {
      this.handleFetch(
        getDecoratingOrders(this.$store.getters.companyId, this.getRequestData)
      )
        .then(data => {
          this.items = data;
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    onShowPreview() {
      this.$bvModal.show(this.printingOrderPreviewModalModalId);
    },
    showDeletePrintingOrderConformationModal(id) {
      this.deleteId = id;
      this.$bvModal.show(this.deletePrintingOrderModalId);
    },
    onDeletePrintingOrder() {
      this.handleDelete(
        deleteDecoratingOrder(this.deleteId),
        "Decorating order"
      ).then(() => {
        this.fetchData();
      });
    },
    onOrderDecorating(item) {
      return this.$refs.orderDecoratingModal.show({
        campaignId: item.visual_campaign.id,
        existingOrder: item,
        visuals: item.visuals
      });
    },
    onOrderDecoratingDone() {
      this.$refs.orderDecoratingModal.hide();
      this.fetchData();
    },
    onStatusChange(itemId, status) {
      this.handleUpdate(
        updateDecoratingOrder(itemId, {
          status: status
        }),
        "Decorating order"
      ).then(() => {
        this.fetchData();
        this.$emit("fetch-parent");
      });
    },
    onViewEditCampaign(campaignId) {
      // prefetch campaign info for edit screens
      this.$store.dispatch("fetchExistingCampaignInfo", campaignId);
      this.$refs.viewCampaignModal.show({
        campaignId: campaignId
      }); // this.$router.push(`/user/campaign/${campaignId}/overview`);
    }
  }
};
</script>
<style lang="scss">
.mo-edit-decorating-order-modal {
  max-width: 85vw;
}
.mo-decorating-order-table {
  min-width: 1732px;
  overflow-x: hidden;

  td,
  th {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  &__aligned {
    max-height: 800px !important;
    height: auto !important;
  }
  .id,
  .preview {
    width: 70px;
  }
  .status {
    width: 180px;
  }
  .addresses,
  .visual_campaign_title,
  .shipping_type,
  .deadline_start,
  .deadline_end,
  .created_at {
    width: 200px;
  }
}
</style>
