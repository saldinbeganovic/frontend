<template>
  <b-modal
    :id="modalId"
    hide-footer
    hide-header
    size="lg"
    centered
    content-class="mo-input-modal"
    body-class="mo-input-modal-body"
  >
    <h3 class="text-center font-weight-light mb-5">
      {{ message }}
    </h3>
    <form @submit.prevent="onSubmit">
      <b-form-group class="w-100" :label="label" label-for="picker-item">
        <b-form-select
          id="picker-item"
          v-model="targetEntityId"
          class="mo-input__light-sm"
          :options="entityItems"
          required
        ></b-form-select>
      </b-form-group>
      <b-button class="mo-btn mt-4 w-100" type="submit">Okay</b-button>
    </form>
  </b-modal>
</template>

<script>
export default {
  name: "MoPickerModal",
  props: {
    label: {
      type: String
    },
    message: {
      type: String,
      required: true
    },
    modalId: {
      type: String,
      required: true
    },
    entityItems: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  data() {
    return {
      isLoading: true,
      targetEntityId: null
    };
  },
  methods: {
    onSubmit() {
      this.$emit("submit", this.targetEntityId);
      this.$emit(
        "submit-item",
        this.entityItems.filter(e => e.value === this.targetEntityId)[0]
      );
    }
  }
};
</script>
