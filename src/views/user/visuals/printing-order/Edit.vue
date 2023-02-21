<template>
  <form @submit.prevent="onSubmit" class="h-100 w-100">
    <mo-dashboard-body :loading="isLoading">
      <template #body>
        <b-col class="h-100" cols="4">
          <b-row>
            <b-col>
              <b-row v-if="printOrderData.user">
                <b-col> <b>Ordered by: </b> </b-col>
                <b-col
                  >{{ printOrderData.user.first_name }}
                  {{ printOrderData.user.last_name }}
                </b-col>
              </b-row>
              <b-row>
                <b-col> <b>Decorating house: </b> </b-col>
                <b-col>{{ printingHouse.name }} </b-col></b-row
              >
              <b-row>
                <b-col> <b>Delivery type: </b> </b-col>
                <b-col>
                  {{ formatShippingType(printOrderData.shipping_type) }}
                </b-col>
              </b-row>

              <b-row v-if="printOrderData.purchase_order_number">
                <b-col><b>Order number: </b> </b-col>
                <b-col>{{ printOrderData.purchase_order_number }} </b-col>
              </b-row>
              <b-row>
                <b-col><b>Print date: </b> </b-col>
                <b-col>{{ formatDate(printOrderData.deadline) }} </b-col>
              </b-row>
              <b-row v-if="orderStatus[printOrderData.status - 1]">
                <b-col><b>Order status: </b> </b-col>
                <b-col>
                  <mo-status-badge
                    :clickable="false"
                    :variant="orderStatus[printOrderData.status - 1].variant"
                    :title="orderStatus[printOrderData.status - 1].text"
                  />
                </b-col>
              </b-row>
              <b-row>
                <b-col><b>Addresses:</b> </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <ul
                    v-for="address in printOrderData.addresses"
                    :key="address.id"
                  >
                    <li>{{ address.name }}</li>
                  </ul>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
          <b-row class="mt-3 mb-3">
            <b-col>
              <h5>Visual roll-out:</h5>
            </b-col>
          </b-row>
          <b-row v-if="printOrderData.visual_campaign">
            <b-col>
              <b-row>
                <b-col>
                  <mo-image
                    :image="printOrderData.visual_campaign.cover_photo"
                    width="150px"
                    height="150px"
                    disabled
                  />
                </b-col>
              </b-row>
            </b-col>
            <b-col>
              <!-- <b-row>{{ printOrderData }}</b-row> -->
              <b-row>
                <b-col
                  ><b>Title: </b> {{ printOrderData.visual_campaign.title }}
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b> Description: </b>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  {{ printOrderData.visual_campaign.description }}
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </b-col>
        <b-col v-if="printOrderData.visuals">
          <b-row>
            <b-col>
              <h5>Visuals:</h5>
            </b-col>
          </b-row>
          <b-row>
            <b-col>
              <mo-table
                empty-text="No Printing Order to show"
                table-class="mo-printing-order-table-modal"
                :search-query="searchQuery"
                :items="printOrderData.visuals"
                :fields="fields"
                :show-id-field="false"
              >
                <template #cell(photo)="{item}">
                  <img
                    style="cursor: pointer"
                    v-if="isImage(item.photo)"
                    :src="toS3Url(item.photo)"
                    alt="Visual roll-out cover photo"
                  />
                  <i v-else class="fas fa-ban" />
                </template>
                <template #cell(notes)="{item}">
                  <span :title="item.notes">{{ item.notes }}</span>
                </template>
                <template #cell(unit.title)="{item}">
                  <span :title="item.unit.title">{{ item.unit.title }}</span>
                </template>
                <template #cell(unit.point_of_sale.name)="{item}">
                  <span :title="item.unit.point_of_sale.name">{{
                    item.unit.point_of_sale.name
                  }}</span>
                </template>
              </mo-table>
            </b-col>
          </b-row>
        </b-col>
      </template>
      <template #footer-left> </template>
      <template #footer-right> </template>
    </mo-dashboard-body>
  </form>
</template>

<script>
import {
  getPrintingOrder,
  updatePrintingOrder
} from "@/api/user/campaigns/printing-orders";
import { getPrintingHouse } from "@/api/user/campaigns/printing-houses";
import { uploadCampaignGraphic } from "@/api/user/campaigns/campaigns";

export default {
  name: "PrintingOrderEdit",
  data() {
    return {
      printOrderData: {},
      isSubmitting: false,
      isLoading: false,
      loadingPercentage: 0,
      showAnotherButton: false,
      showNextButton: false,
      title: "",
      path: null,
      file: null,
      printingHouse: {},
      fields: [
        {
          key: "notes",
          label: "Visuals"
        },
        {
          key: "type.name",
          label: "Type",
          sortable: false
        },
        {
          key: "material.name",
          label: "Material",
          sortable: false
        },
        {
          key: "photo",
          label: "Photo",
          sortable: false
        },
        {
          key: "unit.title",
          label: "Unit",
          sortable: false
        },
        {
          key: "unit.point_of_sale.name",
          label: "PoS",
          sortable: false
        }
      ]
    };
  },
  props: {
    printingOrderId: {
      required: true
    },
    searchQuery: {
      type: String,
      required: true
    }
  },
  computed: {
    loadingDescription() {
      return "Uploading graphics ...";
    },
    isVideo() {
      const videoTypes = ["mp4", "mov", "mkv"];
      return videoTypes.includes(this.fileType(this.path));
    },
    graphicData() {
      return {
        title: this.title
      };
    },
    uploadBody() {
      return [
        { key: "title", value: this.title },
        { key: "company_id", value: this.$store.getters.companyId }
      ];
    },
    isNew() {
      return this.graphicId === "new";
    },
    fileSrc() {
      return `${process.env.VUE_APP_S3_HOST}/${this.path}`;
    },
    orderStatus() {
      return this.getStatusOrder();
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    onSubmit() {
      if (this.isNew) {
        if (!this.file) {
          this.$bvToast.toast("Please choose a file!", { variant: "danger" });
          return;
        }
        this.$bvModal.show("loading-progress-modal");
        const formData = new FormData();
        formData.append("title", this.title);
        formData.append("company_id", this.$store.getters.companyId);
        formData.append("file", this.file);
        this.isSubmitting = true;
        const { response, cancel } = uploadCampaignGraphic(
          formData,
          progress => {
            this.loadingPercentage = progress;
          }
        );
        this.$refs.cancel = cancel;
        response
          .then(res => {
            this.onUploadSuccess(this.file, res.data);
          })
          .catch(e => {
            this.$bvToast.toast(e.response.data.message, { variant: "danger" });
          })
          .finally(() => {
            this.isSubmitting = false;
            this.$bvModal.hide("loading-progress-modal");
            this.$emit("upload-finished");
          });
      } else {
        this.handleUpdate(
          updatePrintingOrder(this.graphicId, this.graphicData),
          "Graphic"
        );
      }
    },
    fetchData() {
      if (!this.isNew) {
        this.handleFetch(getPrintingOrder(this.printingOrderId)).then(data => {
          this.printOrderData = data;

          this.handleFetch(getPrintingHouse(data.printing_house_id)).then(
            printingHouse => {
              this.printingHouse = printingHouse;
            }
          );
        });
      }
    }
  }
};
</script>
<style lang="scss">
.mo-printing-order-table-modal {
  td,
  th {
    max-width: 100px;
    overflow: hidden;
  }
  .unit-title {
    max-width: 150px;
  }
  .photo {
    text-align: center;
  }
}
</style>
