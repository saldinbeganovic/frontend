<template>
  <mo-dashboard-body>
    <template #body>
      <mo-screen-wrapper-modal
        dialog-class="mo-edit-decorating-order-modal"
        ref="viewEditDecoratingOrder"
        #body="{props}"
      >
        <mo-edit-decorating-order-modal
          :decorating-order-id="props.printOrderId"
        />
      </mo-screen-wrapper-modal>
      <mo-screen-wrapper-modal
        dialog-class="mo-edit-printing-order-modal"
        ref="viewEditPrintingOrder"
        #body="{props}"
      >
        <mo-edit-printing-order-modal :printing-order-id="props.printOrderId" />
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        modal-id="order-printing-modal"
        message="Submit printing order ?"
        description="Do you want to send this order to the printing houses ? You can't change printing info later.."
        @right="onOrderPrinting"
      />
      <b-col>
        <b-row>
          <b-col cols="2">
            <mo-image :image="image" width="150px" height="150px" disabled />
          </b-col>
          <b-col cols="4" class="d-flex flex-column justify-content-center">
            <b-row>
              <h5 style="word-break: break-all;">{{ title }}</h5>
            </b-row>
            <b-row>
              <p style="word-break: break-all;">{{ description }}</p>
            </b-row>
          </b-col>
        </b-row>
        <b-row class="mt-3">
          <b-col>
            <b-tabs
              class="mo-dashboard-layout__tab-nav d-flex flex-column h-100"
              active-nav-item-class="mo-tab__active"
              nav-class="mo-tab-nav mb-3"
              content-class="mt-3 flex-1 h-100"
            >
              <b-tab title="Submitted Prints" active class="h-100">
                <b-col>
                  <b-row>
                    <mo-table
                      empty-text="No Printing Order to show"
                      table-class="mo-printing-order-table"
                      :search-query="searchQuery"
                      :items="printing_orders"
                      :fields="fields"
                      :show-id-field="false"
                    >
                      <template #cell(status)="{item}">
                        <mo-status-badge
                          :clickable="false"
                          :variant="getStatusOrder()[item.status - 1].variant"
                          :title="getStatusOrder()[item.status - 1].text"
                        />
                      </template>
                      <template #cell(actions)="{item}">
                        <b-button
                          class="mo-table__edit"
                          @click="onEditPrinting(item.id)"
                        >
                          <i class="far fa-eye" />
                        </b-button>
                      </template>
                    </mo-table>
                  </b-row>
                </b-col>
              </b-tab>
              <b-tab
                v-if="decorating_orders.length > 0"
                title="Submitted Decoratings"
                active
                class="h-100"
              >
                <mo-table
                  empty-text="No Printing Order to show"
                  table-class="mo-printing-order-table"
                  :search-query="searchQuery"
                  :items="decorating_orders"
                  :fields="fields2"
                  :show-id-field="false"
                >
                  <template #cell(status)="{item}">
                    <mo-status-badge
                      :clickable="false"
                      :variant="getStatusOrder()[item.status - 1].variant"
                      :title="getStatusOrder()[item.status - 1].text"
                    />
                  </template>
                  <template #cell(actions)="{item}">
                    <b-button
                      class="mo-table__edit"
                      @click="onEditDecorating(item.id)"
                    >
                      <i class="far fa-eye" />
                    </b-button>
                  </template>
                </mo-table>
              </b-tab>
            </b-tabs>
          </b-col>
        </b-row>
      </b-col>
    </template>
    <template v-if="!isArchived" #footer-left> </template>
  </mo-dashboard-body>
</template>

<script>
import {
  getVisualCampaign,
  orderPrinting
} from "@/api/user/campaigns/campaigns";

import { formatDate, formatShippingType } from "@/utils/utils";
import MoStatusBadge from "../../../../../components/pure/MoStatusBadge.vue";
import MoEditPrintingOrderModal from "@/views/user/visuals/printing-order/Edit";
import MoEditDecoratingOrderModal from "@/views/user/visuals/decorating-order/Edit";

export default {
  name: "Overview",
  components: {
    MoStatusBadge,
    MoEditPrintingOrderModal,
    MoEditDecoratingOrderModal
  },
  data() {
    return {
      image: null,

      isSubmitting: false,
      isArchived: true,
      decoratingSubmitted: null,
      decoratingInfoAdded: null,
      printingSubmitted: null,
      title: "",
      description: "",
      items: [],
      data: {},
      printing_orders: [],
      decorating_orders: [],
      fields: [
        {
          key: "visuals",
          label: "Selected visuals",
          formatter: value => {
            return value.length;
          }
        },
        {
          key: "status",
          label: "Status"
        },
        {
          key: "shipping_type",
          label: "Delivery type",
          formatter: formatShippingType
        },
        { key: "deadline", label: "Delivery date", formatter: formatDate },
        { key: "created_at", label: "Creation date", formatter: formatDate },
        { key: "actions", label: "" }
      ],
      fields2: [
        {
          key: "visuals",
          label: "Selected visuals",
          formatter: value => {
            return value.length;
          }
        },
        {
          key: "status",
          label: "Status"
        },
        {
          key: "shipping_type",
          label: "Delivery type",
          formatter: formatShippingType
        },

        {
          key: "deadline_start",
          label: "Delivery date",
          formatter: formatDate
        },
        { key: "deadline_end", label: "Finish date", formatter: formatDate },
        { key: "created_at", label: "Creation date", formatter: formatDate },
        { key: "actions", label: "" }
      ]
    };
  },
  props: {
    campaignId: {
      type: Number,
      required: true
    }
  },
  mounted() {
    this.fetchData();
    // prefetch campaign info for edit screens
    this.$store.dispatch("fetchExistingCampaignInfo", this.campaignId);
  },
  methods: {
    onEditDecoratingInfo() {
      this.$emit("exit", this.campaignId);
    },
    onOrderPrinting() {
      this.$bvModal.hide("order-printing-modal");
      this.isSubmitting = true;
      orderPrinting(this.campaignId)
        .then(() => {
          this.fetchData();
          this.$bvToast.toast(
            "Order was successfully sent to printing houses!"
          );
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
    onEdit() {
      this.$emit("exit", this.campaignId);
    },
    fetchData() {
      this.$store.dispatch("fetchExistingCampaignInfo", this.campaignId);
      this.handleFetch(getVisualCampaign(this.campaignId)).then(data => {
        this.data = data;
        this.printing_orders = data.printing_orders;
        this.decorating_orders = data.decorating_orders;
        this.title = data.title;
        this.description = data.description;
        // 0 represents "archived" status
        this.isArchived = data.status === 3;
        // this.decoratingSubmitted = !!data.decorating_orders;
        this.image = data.cover_photo;
        // if decorating house field is null (on any details items)
        // this means the user did not edit decoration house info yet
        this.printingSubmitted = !!data.printing_submitted;
        this.decoratingInfoAdded = !!data.details[0].decorating_house;
        this.items = data.details;
      });
    },
    onEditPrinting(id) {
      this.$refs.viewEditPrintingOrder.show({
        printOrderId: id
      });
    },
    onEditDecorating(id) {
      this.$refs.viewEditDecoratingOrder.show({
        printOrderId: id
      });
    }
  }
};
</script>
<style lang="scss">
.mo-no-top-border {
  border-top: 0;
}
</style>
