<template>
  <mo-dashboard-body>
    <template #body>
      <mo-upload-file
        api-endpoint="/api/service-requests/upload"
        @success="onFileUploaded"
      />
    </template>
    <template #footer-right>
      <mo-button title="Upload" @click="onSubmit" />
    </template>
  </mo-dashboard-body>
</template>

<script>
export default {
  name: "UploadPhotos",
  methods: {
    onSubmit() {},
    onFileUploaded() {}
  }
};
</script>
