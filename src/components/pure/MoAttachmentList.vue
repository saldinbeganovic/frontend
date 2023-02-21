<template>
  <div class="mo-attachment-list w-100">
    <b-row>
      <b-col v-for="(item, index) in items" :key="index">
        <b-col class="w-25">
          <img
            :src="imagePath(item.path)"
            width="150"
            height="100"
            alt="Preview unavailable"
          />
          <a :href="imagePath(item.path)" target="_blank">
            {{ item.title }}
          </a>
          <button v-if="!disabled" @click.prevent="onEditItem(index)">
            <i class="far fa-trash mo-attachment-list__delete-icon" />
          </button>
        </b-col>
      </b-col>
    </b-row>
  </div>
</template>

<script>
export default {
  name: "MoAttachmentList",
  props: {
    items: {
      type: Array,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    imagePath(path) {
      return `${process.env.VUE_APP_S3_HOST}/${path}`;
    },
    onEditItem(index) {
      this.$emit("delete-item", index);
    }
  }
};
</script>
