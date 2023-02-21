<template>
  <b-modal
    :id="modalId"
    dialog-class="mo-send-photos-docs-modal__dialog"
    body-class="p-2"
    hide-footer
    hide-header
    centered
  >
    <mo-file-modal
      modal-id="send-docs-photos-upload-image-modal"
      api-endpoint="/api/units/upload"
      :body-fields="[{ key: 'type', value: 'images' }]"
      @success-path="onUploadImageSuccess"
    />
    <mo-file-modal
      modal-id="send-docs-photos-upload-document-modal"
      accept="*"
      api-endpoint="/api/units/upload"
      :body-fields="[{ key: 'type', value: 'documents' }]"
      @success-path="onUploadDocumentSuccess"
      @added="tempDocumentTitle = $event.name"
    >
      <template #body>
        <b-row class="mt-2">
          <b-form-group class="w-100" label="Title" label-for="title">
            <b-form-input
              id="title"
              v-model="tempDocumentTitle"
              class="mo-input__light-sm"
              placeholder="Title"
              type="text"
              required
            ></b-form-input>
          </b-form-group>
        </b-row>
      </template>
    </mo-file-modal>
    <mo-image-gallery
      modal-id="send-docs-photos-gallery-modal"
      :initial-index="0"
      :images="currentImages"
    />
    <form class="m-3" @submit.prevent="onSendDocsAndPhotos">
      <b-row class="mb-3">
        <h3 class="m-auto">Send document & photos</h3>
      </b-row>
      <b-row class="mb-2">
        <b-col cols="6">
          <b-form-group id="input-group-4">
            <b-form-input
              id="input-2"
              v-model="email"
              placeholder="Email"
              type="email"
              class="mo-input"
              autocomplete="email"
              required
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <mo-table
            empty-text="No documents to show"
            :fields="documentFields"
            :items="documentItems"
            :loading="isLoading"
            :show-edit-button="false"
            :show-id-field="false"
            @select="selectedDocuments = $event"
          />
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col>
          <button
            class="mo-multiselect__add mt-3"
            @click.prevent="
              $bvModal.show('send-docs-photos-upload-document-modal')
            "
          >
            <i class="fas fa-plus" />
            Add document
          </button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <mo-table
            empty-text="No photos to show"
            :fields="photosFields"
            :items="photoItems"
            :loading="isLoading"
            :show-edit-button="false"
            :show-id-field="false"
            @select="selectedPhotos = $event"
          >
            <template #cell(preview)="{item}">
              <img
                class="mr-2"
                style="cursor: pointer"
                :key="index"
                alt=""
                :src="toS3Url(item.path)"
                @click="onViewImage(item)"
              />
            </template>
          </mo-table>
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col>
          <button
            class="mo-multiselect__add mt-3"
            @click.prevent="
              $bvModal.show('send-docs-photos-upload-image-modal')
            "
          >
            <i class="fas fa-plus" />
            Add image
          </button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <mo-button :loading="isSubmitting" type="submit" title="Send" />
        </b-col>
      </b-row>
    </form>
  </b-modal>
</template>
<script>
import {
  createUnitDocumentation,
  getUnitDocuments
} from "@/api/admin/company/unit/documentation";
import { formatDate } from "@/utils/utils";
import { createUnitPhoto, getUnitPhotos } from "@/api/admin/company/unit/photo";
import { sendDocsAndPhotos } from "@/api/admin/company/unit/unit";
import MoImageGallery from "@/components/pure/modals/MoImageGallery";

export default {
  name: "MoSendDocsAndPhotosModal",
  components: { MoImageGallery },
  props: {
    modalId: {
      type: String,
      required: true
    },
    unitId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentDeleteId: null,
      tempDocumentTitle: "",
      isLoading: false,
      isSubmitting: false,
      email: "",
      currentImages: [],
      documentItems: [],
      photoItems: [],
      selectedDocuments: [],
      selectedPhotos: [],
      documentFields: [
        { key: "select" },
        { key: "title", label: "Title" },
        { key: "path", label: "Type", formatter: this.parseFileType },
        { key: "updated_at", label: "Date", formatter: formatDate }
      ],
      photosFields: [
        { key: "select" },
        { key: "preview", label: "Preview" },
        { key: "path", label: "Type", formatter: this.parseFileType },
        { key: "updated_at", label: "Date", formatter: formatDate }
      ]
    };
  },
  computed: {
    isNew() {
      return this.unitId === "new";
    }
  },
  watch: {
    selected(value) {
      this.$emit("select", value);
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onUploadDocumentSuccess(path) {
      this.handleCreate(
        createUnitDocumentation(this.unitId, {
          title: this.tempDocumentTitle,
          path
        })
      ).then(() => {
        this.fetchData();
        this.$emit("fetch-docs");
        this.$bvModal.hide("send-docs-photos-upload-document-modal");
      });
    },
    onUploadImageSuccess(path) {
      this.handleCreate(createUnitPhoto(this.unitId, { path }), "Image").then(
        () => {
          this.fetchData();
          this.$emit("fetch-images");
          this.$bvModal.hide("send-docs-photos-upload-image-modal");
        }
      );
    },
    onSendDocsAndPhotos() {
      if (
        this.selectedPhotos.length === 0 &&
        this.selectedDocuments.length === 0
      ) {
        this.$bvToast.toast(
          "Please select photos & documents you want to send.",
          { variant: "info" }
        );
      } else {
        this.handleCreate(
          sendDocsAndPhotos(this.unitId, {
            email: this.email,
            documentation: this.selectedDocuments,
            photos: this.selectedPhotos
          }),
          "Send order"
        ).then(() => {
          this.$emit("done");
          this.$bvModal.hide(this.modalId);
        });
      }
    },
    fetchData() {
      if (this.unitId !== "new") {
        this.handleFetch(
          Promise.all([
            getUnitDocuments(this.unitId),
            getUnitPhotos(this.unitId)
          ])
        ).then(([documents, photos]) => {
          this.documentItems = documents;
          this.photoItems = photos.map(e => e.photos).flat();
        });
      }
    },
    onViewImage(photo) {
      this.currentImages = [photo];
      this.$bvModal.show("send-docs-photos-gallery-modal");
    },
    parseFileType(path) {
      return path.split(".")[1];
    }
  }
};
</script>
<style lang="scss">
.mo-send-photos-docs-modal {
  &__dialog {
    max-width: 800px;
  }
}
</style>
