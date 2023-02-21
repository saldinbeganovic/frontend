<template>
  <form @submit.prevent="onSubmit" class="h-100 w-100">
    <mo-dashboard-body :loading="isLoading">
      <template #body>
        <b-col class="h-100" cols="5">
          <b-row>
            <b-col>
              <b-row v-if="data.user">
                <b-col> <b>Ordered by: </b> </b-col>
                <b-col
                  >{{ data.user.first_name }}
                  {{ data.user.last_name }}
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="6"> <b>Decorating house: </b> </b-col>
                <b-col>{{ decoratingHouse.name }} </b-col></b-row
              >
              <b-row>
                <b-col cols="6"> <b>Delivery type: </b> </b-col>
                <b-col>
                  {{ formatShippingType(data.shipping_type) }}
                </b-col>
              </b-row>
              <b-row v-if="data.purchase_order_number">
                <b-col><b>Order number: </b> </b-col>
                <b-col>{{ data.purchase_order_number }} </b-col>
              </b-row>
              <b-row>
                <b-col cols="6"><b>Decorating deadline period: </b> </b-col>
                <b-col
                  >{{ formatDate(data.deadline_start) }} -
                  <span v-if="data.deadline_end">{{
                    formatDate(data.deadline_end)
                  }}</span>
                  <span v-else>/</span>
                </b-col>
              </b-row>
              <b-row>
                <b-col cols="6"><b>Order status: </b> </b-col>
                <b-col>
                  <mo-status-badge
                    :clickable="false"
                    :variant="getStatusOrder()[data.status - 1].variant"
                    :title="getStatusOrder()[data.status - 1].text"
                  />
                </b-col>
              </b-row>
              <b-row>
                <b-col><b>Addresses:</b> </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <ul v-for="address in data.addresses" :key="address.id">
                    <li>{{ address.name }}</li>
                  </ul>
                </b-col>
              </b-row>
            </b-col>
          </b-row>
          <b-row class="mt-3">
            <b-col>
              <h5>Visual roll-out:</h5>
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="6">
              <b-row>
                <b-col>
                  <mo-image
                    :image="data.visual_campaign.cover_photo"
                    width="150px"
                    height="150px"
                    disabled
                  />
                </b-col>
              </b-row>
            </b-col>
            <b-col>
              <!-- <b-row>{{ data }}</b-row> -->
              <b-row>
                <b-col><b>Title: </b> {{ data.visual_campaign.title }} </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b> Description: </b>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  {{ data.visual_campaign.description }}
                </b-col>
              </b-row>
            </b-col>
          </b-row>
        </b-col>
        <b-col v-if="data">
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
                :items="data.visuals"
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
  getDecoratingOrder,
  updateDecoratingOrder
} from "@/api/user/campaigns/decorating-orders";
import { getDecoratingHouse } from "@/api/user/campaigns/decorating-houses";
import { uploadCampaignGraphic } from "@/api/user/campaigns/campaigns";

export default {
  name: "DecoratingOrderEdit",
  data() {
    return {
      data: {},
      isSubmitting: false,
      isLoading: false,
      loadingPercentage: 0,
      showAnotherButton: false,
      showNextButton: false,
      decoratingHouse: {},
      title: "",
      path: null,
      file: null,
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
    searchQuery: {
      type: String,
      required: true
    },
    decoratingOrderId: {
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
    }
  },
  mounted() {
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
          updateDecoratingOrder(this.graphicId, this.graphicData),
          "Graphic"
        );
      }
    },
    fetchData() {
      if (!this.isNew) {
        this.handleFetch(getDecoratingOrder(this.decoratingOrderId)).then(
          data => {
            this.data = data;

            this.handleFetch(getDecoratingHouse(data.decorating_house_id)).then(
              decoratingHouse => {
                this.decoratingHouse = decoratingHouse;
              }
            );
          }
        );
      }
    }
  }
};
</script>
