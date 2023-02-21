<template>
  <mo-dashboard-body
    aligned-class="mo-printing-order-table__aligned"
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
        <mo-view-campaign-modal
          :campaign-id="props.campaignId"
          :search-query="props.searchQuery"
        />
      </mo-screen-wrapper-modal>

      <mo-screen-wrapper-modal
        ref="orderPrintingModal"
        dialog-class="mo-order-decorating-modal__dialog"
        #body="{props}"
      >
        <mo-visual-order-modal
          :existing-visual-order="props.existingVisualOrder"
          :visuals="props.visuals"
          @done="onOrderPrintingDone"
        />
      </mo-screen-wrapper-modal>

      <mo-image-gallery
        :modal-id="printingOrderPreviewModalModalId"
        :images="currentPhoto"
      />
      <mo-prompt-modal
        :modal-id="deletePrintingOrderModalId"
        :message="`Are you sure you want to delete this printing order ?`"
        @right="onDeletePrintingOrder"
      />
      <h5 v-if="!completed">Printing Order</h5>
      <h5 v-else>Completed Printing Order</h5>

      <mo-table
        empty-text="No Printing Order to show"
        table-class="mo-printing-order-table mo-table__multiple"
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
        <template #cell(deadline)="{item}">
          {{ formatDate(item.deadline) }}
        </template>
        <template #cell(status)="{item}">
          <mo-select-badge
            width="150px"
            :variant="getStatusOrder()[item.status - 1].variant"
            :value="item.status"
            :options="getStatusOrder()"
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
            @click.prevent="onOrderPrinting(item)"
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
        dialog-class="mo-edit-printing-order-modal"
        ref="viewEditPrintingOrder"
        #body="{props}"
      >
        <mo-edit-printing-order-modal
          :printing-order-id="props.printOrderId"
          :search-query="props.searchQuery"
        />
      </mo-screen-wrapper-modal>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { getPrintingOrders } from "@/api/admin/company/company";
import {
  deletePrintingOrder,
  updatePrintingOrder
} from "@/api/user/campaigns/printing-orders";
import { formatShippingType } from "@/utils/utils";

import MoEditPrintingOrderModal from "@/views/user/visuals/printing-order/Edit";
import MoImageGallery from "../../../../components/pure/modals/MoImageGallery";
import MoVisualOrderModal from "@/components/statefull/modals/MoVisualOrderModal";
import MoSelectBadge from "../../../../components/pure/inputs/MoSelectBadge.vue";
import MoViewCampaignModal from "@/views/user/visuals/campaign/view";
export default {
  name: "PrintingOrderView",
  components: {
    MoEditPrintingOrderModal,
    MoImageGallery,
    MoVisualOrderModal,
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
          key: "deadline",
          label: "Delivery date"
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
      return `${this.prefix}printing-order-preview-modal`;
    },
    deletePrintingOrderModalId() {
      return `${this.prefix}mo-printing-order-modal`;
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
      this.$refs.viewEditPrintingOrder.show({
        printOrderId: id,
        searchQuery: this.searchQuery
      });
    },
    fetchData() {
      this.handleFetch(
        getPrintingOrders(this.$store.getters.companyId, this.getRequestData)
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
        deletePrintingOrder(this.deleteId),
        "Printing order"
      ).then(() => {
        this.fetchData();
      });
    },
    onOrderPrinting(item) {
      this.$refs.orderPrintingModal.show({
        existingVisualOrder: item,
        visuals: item.visuals
      });
    },

    onOrderPrintingDone() {
      this.$refs.orderPrintingModal.hide();
      this.fetchData();
    },
    onStatusChange(itemId, status) {
      this.handleUpdate(
        updatePrintingOrder(itemId, {
          is_archived: 0,
          status: status
        }),
        "Printing order"
      ).then(() => {
        this.fetchData();
        this.$emit("fetch-parent");
      });
    },
    onViewEditCampaign(campaignId) {
      // prefetch campaign info for edit screens
      this.$store.dispatch("fetchExistingCampaignInfo", campaignId);
      this.$refs.viewCampaignModal.show({
        campaignId: campaignId,
        searchQuery: this.searchQuery
      }); // this.$router.push(`/user/campaign/${campaignId}/overview`);
    }
  }
};
</script>
<style lang="scss">
.mo-edit-printing-order-modal {
  max-width: 80vw;
}
.mo-printing-order-table {
  min-width: 1525px;
  overflow-x: hidden;

  &__aligned {
    max-height: 800px !important;
    height: auto !important;
  }
  .id,
  .preview {
    width: 70px;
  }
  .status,
  .deadline,
  .created_at {
    width: 190px;
  }
  .visual_campaign_title,
  .shipping_type,
  .addresses {
    width: 200px;
  }
}
</style>
