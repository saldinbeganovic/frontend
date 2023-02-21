<template>
  <b-modal
    :id="modalId"
    content-class="mo-input-modal"
    body-class="mo-input-modal-body"
    hide-footer
    hide-header
    centered
  >
    <validation-observer class="h-100 w-100" v-slot="{ handleSubmit }">
      <form @submit.prevent="handleSubmit(onSubmit)">
        <b-row class="w-100">
          <b-form-group
            class="w-100"
            :label="selectLabel"
            :label-for="selectLabel"
          >
            <b-form-select
              :id="selectLabel"
              v-model="entityId"
              class="mo-input__light-sm"
              :options="entityOptions"
              required
            ></b-form-select>
          </b-form-group>
        </b-row>

        <b-row class="w-100">
          <b-form-group class="w-100" :label="dateLabel" :label-for="dateLabel">
            <validation-provider
              name="deadline"
              class="w-100"
              :rules="`deadline|after-print-date:${printingDate}`"
              v-slot="{ errors, valid }"
            >
              <b-form-input
                :id="dateLabel"
                v-model="deadlineDate"
                :state="valid"
                class="mo-input__light-sm"
                type="date"
                required
              ></b-form-input>
              <span v-if="!valid" class="text-danger">{{ errors[0] }}</span>
            </validation-provider>
          </b-form-group>
        </b-row>
        <b-row class="w-100">
          <b-button class="mo-btn__sm mt-4 w-100" type="submit">Okay </b-button>
        </b-row>
      </form>
    </validation-observer>
  </b-modal>
</template>

<script>
export default {
  name: "MoCampaignVisualOptions",
  props: {
    modalId: {
      type: String,
      required: true
    },
    entityOptions: {
      type: Array,
      required: true
    },
    selectLabel: {
      type: String,
      required: true
    },
    dateLabel: {
      type: String,
      required: true
    },
    printingDate: {
      default: null
    },
    initialEntityId: {
      required: true,
      default: null
    },
    initialDeadlineDate: {
      required: true,
      default: null
    }
  },
  computed: {
    selectPlaceholder() {
      return `Select ${this.selectLabel}`;
    }
  },
  watch: {
    initialDeadlineDate(value) {
      if (value) {
        this.deadlineDate = value;
      }
    },
    initialEntityId(value) {
      if (value) {
        this.entityId = value;
      }
    }
  },
  data() {
    return {
      entityId: this.initialEntityId,
      deadlineDate: this.deadlineDate
    };
  },
  methods: {
    onSubmit() {
      this.$emit("submit", this.entityId, this.deadlineDate);
    }
  }
};
</script>
