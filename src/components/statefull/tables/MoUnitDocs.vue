<template>
  <div class="w-100">
    <mo-prompt-modal
      modal-id="delete-docs-modal"
      message="Are you sure you want to delete this document ?"
      @right="onDeleteConfirm"
    />
    <mo-table
      empty-text="No documents to show"
      :fields="fields"
      :items="items"
      :loading="isLoading"
      :show-edit-button="false"
      :show-id-field="false"
      @edit="onEdit"
      @select="selected = $event"
    >
      <template #cell(title)="{item}">
        <a :href="toS3Url(item.path)" target="_blank"> {{ item.title }} </a>
      </template>
      <template #options="{item}">
        test
        <b-button class="mo-table__edit" @click="onDelete(item)">
          <i class="far fa-trash mo-text__danger" />
        </b-button>
      </template>
    </mo-table>
  </div>
</template>
<script>
import {
  deleteUnitDocumentation,
  getUnitDocuments,
} from "@/api/admin/company/unit/documentation";
import { formatDate } from "@/utils/utils";

export default {
  name: "MoUnitDocs",
  props: {
    posId: {
      type: [Number, String],
      required: true,
    },
    unitId: {
      type: [Number, String],
      required: true,
    },
    documents: {
      type: Array,
    },
  },
  data() {
    return {
      currentDeleteId: null,
      isLoading: false,
      items: [],
      selected: [],
      fields: [
        { key: "title", label: "Title" },
        { key: "path", label: "Type", formatter: this.parseFileType },
        { key: "updated_at", label: "Date", formatter: formatDate },
        { key: "options", label: "Edit" },
      ],
    };
  },
  computed: {
    isNew() {
      return this.unitId === "new";
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onDelete(item) {
      this.currentDeleteId = item.id;
      this.$bvModal.show("delete-docs-modal");
    },
    onDeleteConfirm() {
      this.$bvModal.hide("delete-docs-modal");
      if (!this.isNew) {
        this.handleDelete(
          deleteUnitDocumentation(this.unitId, this.currentDeleteId),
          "Document"
        ).then(() => {
          this.fetchData();
          this.$emit("fetch-parent");
        });
      } else {
        this.documents.splice(
          this.documents.findIndex((e) => e == this.currentImageId),
          1
        );
        this.$emit("fetch-parent");
      }
    },
    onEdit() {
      this.$router.push(
        `/${this.companyPathPrefix}/pos/${this.posId}?unitId=${this.unitId}`
      );
    },
    fetchData() {
      if (!this.isNew) {
        this.handleFetch(getUnitDocuments(this.unitId)).then((data) => {
          this.items = data;
        });
      }
    },
    parseFileType(path) {
      return path ? path.split(".")[1] : path;
    },
  },
  watch: {
    documents() {
      this.items = this.documents;
    },
  },
};
</script>
