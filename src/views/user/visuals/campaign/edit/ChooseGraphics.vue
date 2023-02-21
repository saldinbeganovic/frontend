<template>
  <mo-dashboard-body>
    <template #body>
      <mo-file-modal
        modal-id="upload-pic-modal"
        api-endpoint="/api/units/upload"
        :body-fields="[{ key: 'type', value: 'cover' }]"
        @success="onImageUploaded"
      />
      <mo-prompt-modal
        modal-id="delete-unit-image-modal"
        message="Are you sure you want to delete this image ?"
        @right="onDeleteCoverImage"
      />
      <mo-image-gallery
        modal-id="preview-modal"
        :images="currentPreviewPhoto"
      />
      <mo-screen-wrapper-modal ref="editGraphicsModal" #body="{props}">
        <mo-add-graphics-modal
          @done="fetchData"
          :campaign-id="props.campaignId"
        />
      </mo-screen-wrapper-modal>
      <mo-screen-wrapper-modal ref="addGraphicModal" #body="{props}">
        <mo-edit-graphic-modal
          :graphic-id="props.graphicId"
          @done="fetchData"
        />
      </mo-screen-wrapper-modal>
      <b-col>
        <b-row class="mt-3">
          <b-col>
            <b-row>
              <b-col>
                <h4>Add general info</h4>
              </b-col>
            </b-row>
            <b-row class="my-2">
              <b-col cols="2">
                <mo-image
                  :image="image"
                  :show-delete="true"
                  width="150px"
                  height="150px"
                  @edit="$bvModal.show('upload-pic-modal')"
                  @delete="$bvModal.show('delete-unit-image-modal')"
                />
              </b-col>
              <b-col cols="4">
                <b-row>
                  <b-col>
                    <b-form-group class="w-100" label="Title" label-for="title">
                      <b-form-input
                        id="title"
                        v-model="title"
                        :disabled="isDecoratingEdit"
                        class="mo-input__light-sm"
                        type="text"
                        required
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
                <b-row>
                  <b-col>
                    <b-form-group
                      class="w-100"
                      label="Description"
                      label-for="description"
                    >
                      <b-form-input
                        id="description"
                        :disabled="isDecoratingEdit"
                        v-model="description"
                        class="mo-input__light-sm"
                        type="text"
                        required
                      ></b-form-input>
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-col>
            </b-row>
          </b-col>
        </b-row>
        <b-row class="mt-2">
          <b-col>
            <span>Selected {{ selectedItems.length }} graphics</span>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <mo-table
              empty-text="No graphics to show"
              :items="items"
              :fields="fields"
              :loading="isLoading"
              :initial-selected="selected"
              @edit="onEdit"
              @select="selectedItems = $event"
            >
              <template #cell(preview)="{item}">
                <img
                  style="cursor: pointer"
                  v-if="isImage(item.path)"
                  :src="toS3Url(item.path)"
                  alt="Graphic preview"
                  @click="onShowPreview(item.path)"
                />
                <i v-else class="fas fa-ban" />
              </template>
              <template #cell(size)="{item}">
                <span>{{
                  item.size ? formatBytes(item.size) : getFallbackSize(item.id)
                }}</span>
              </template>
              <template #cell(path)="{item}">
                <span>{{
                  fileType(item.path) || getFallbackType(item.id)
                }}</span>
              </template>
            </mo-table>
          </b-col>
        </b-row>
      </b-col>
    </template>
    <template #footer-left>
      <mo-button
        v-if="$store.getters.hasAdminRole"
        class="mr-2"
        title="Add another graphic file"
        @click="onAddAnother"
      />
    </template>
    <template #footer-right>
      <mo-button
        v-if="$store.getters.hasAdminRole"
        title="Save"
        @click="onSave"
      />
    </template>
  </mo-dashboard-body>
</template>

<script>
import { getGraphicsOfCompany } from "@/api/user/campaigns/graphics";
import { formatDate } from "@/utils/utils";
import { getVisualCampaign } from "@/api/user/campaigns/campaigns";
import MoAddGraphicsModal from "@/components/statefull/modals/MoEditGraphicsModal";
import MoEditGraphicModal from "@/views/user/visuals/graphic/Edit";
import MoImageGallery from "@/components/pure/modals/MoImageGallery";
import {
  createVisualCampaign,
  updateCampaign
} from "@/api/user/campaigns/campaigns";

export default {
  name: "ChooseGraphics",
  components: { MoImageGallery, MoAddGraphicsModal, MoEditGraphicModal },
  data() {
    return {
      currentPreviewPhoto: [],
      items: [],
      selected: {},
      selectedItems: [],
      isLoading: false,
      fields: [
        { key: "select", label: "" },
        { key: "title", label: "File name" },
        {
          key: "size",
          label: "File size",
          formatter: this.formatBytes
        },
        {
          key: "path",
          label: "File type",
          formatter: value => this.fileType(value)
        },
        { key: "preview", label: "Preview" },
        { key: "created_at", label: "Uploaded date", formatter: formatDate },
        { key: "options", label: "" }
      ]
    };
  },
  props: {
    campaignId: {
      type: [String, Number],
      required: true
    }
  },
  computed: {
    isDecoratingEdit() {
      return this.$store.getters.isDecoratingEdit;
    },
    title: {
      set(value) {
        this.$store.commit("setTitle", value);
      },
      get() {
        return this.$store.getters.title;
      }
    },
    description: {
      set(value) {
        this.$store.commit("setDescription", value);
      },
      get() {
        return this.$store.getters.description;
      }
    },
    image: {
      set(value) {
        this.$store.commit("setImage", value);
      },
      get() {
        return this.$store.getters.getImage;
      }
    },
    isNew() {
      return this.campaignId === "new";
    }
  },
  async mounted() {
    //set image to null, so it does not copy the old path in route
    if (this.isNew) this.image = null;
    this.selected = this.$store.getters.selectedGraphicsMap;
    await this.fetchData();
  },
  methods: {
    syncGraphics() {
      // store only selected visuals
      this.$store.commit(
        "setGraphics",
        this.items.filter(e =>
          this.selectedItems.map(parseFloat).includes(e.id)
        )
      );
    },
    onSave() {
      if (this.selectedItems.length === 0) {
        return this.$bvToast.toast("Please select at least 1 graphic.", {
          variant: "danger"
        });
      }
      this.syncGraphics();

      (this.campaignId === "new"
        ? createVisualCampaign(this.$store.getters.creationData)
        : updateCampaign(this.campaignId, this.$store.getters.creationData)
      )
        .then(data => {
          this.$bvToast.toast("Campaign info saved!");
          //emit to parent, to close this modal and open campaign with that ID
          this.$emit("exit", data.id);
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    },
    onDeleteCoverImage() {
      this.image = null;
    },
    onImageUploaded(e, response) {
      this.image = response.message;
    },
    onShowPreview(path) {
      this.currentPreviewPhoto = [{ path }];
      this.$bvModal.show("preview-modal");
    },
    onAddAnother() {
      this.$refs.editGraphicsModal.show();
    },
    onEdit(graphicId) {
      // this.$router.push(`/user/campaign/graphic/${graphicId}`);
      this.$refs.addGraphicModal.show({
        graphicId: graphicId
      });
    },
    getFallbackSize(id) {
      return this.$store.getters.getGraphicSizeMap[id]
        ? this.formatBytes(this.$store.getters.getGraphicSizeMap[id].size)
        : "-";
    },
    getFallbackType(id) {
      return this.$store.getters.getGraphicSizeMap[id]
        ? this.fileType(this.$store.getters.getGraphicSizeMap[id].path)
        : "-";
    },

    fetchData() {
      return this.handleFetch(
        Promise.all([
          getGraphicsOfCompany(this.$store.getters.companyId),
          this.isNew ? null : getVisualCampaign(this.campaignId)
        ]).then(([graphicsData, campaignData]) => {
          this.items = graphicsData;
          if (!this.isNew) {
            this.title = campaignData.title;
            this.description = campaignData.description;
            this.image = campaignData.cover_photo;
            // map campaign attachment ids to "selected" map
            this.selected = Object.assign(
              {},
              this.selected,
              campaignData.attachments
                .map(a => a.id)
                .reduce((p, id) => Object.assign(p, { [id]: true }), {})
            );
          }
        })
      );
    }
  }
};
</script>

<style lang="scss">
td.preview {
  text-align: center;
}
</style>
