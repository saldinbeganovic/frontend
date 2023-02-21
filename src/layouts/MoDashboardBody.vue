<template>
  <b-col
    :class="[
      'd-flex flex-column justify-content-between h-100 mo-dashboard-body',
      isEditScreen ? 'mo-dashboard-body__aligned' : '',
      alignedClass
    ]"
  >
    <div
      v-if="loading"
      class="h-100 d-flex align-items-center justify-content-center mo-dashboard-body__loading-wrapper"
    >
      <b-spinner
        class="mo-text__primary"
        style="width: 4rem; height: 4rem;"
        label="Loading ..."
      />
    </div>
    <b-row
      ref="footer"
      v-if="isFooterTop"
      class="mo-dashboard-body__footer d-flex justify-content-between pb-4 pt-1"
    >
      <b-col
        class="d-flex flex-row justify-content-start align-items-center p-0"
      >
        <slot name="footer-left"></slot>
      </b-col>
      <b-col class="d-flex flex-row justify-content-end align-items-center p-0">
        <slot name="footer-right"></slot>
      </b-col>
    </b-row>
    <b-row :class="`mo-dashboard-body__content ${bodyClass}`">
      <slot name="body"></slot>
    </b-row>
    <b-row
      ref="footer"
      v-if="!isFooterTop"
      class="mo-dashboard-body__footer d-flex justify-content-between py-2"
    >
      <b-col
        class="d-flex flex-row justify-content-start align-items-center px-0"
      >
        <slot name="footer-left"></slot>
      </b-col>
      <b-col
        class="d-flex flex-row justify-content-end align-items-center px-0"
      >
        <slot name="footer-right"></slot>
      </b-col>
    </b-row>
  </b-col>
</template>

<script>
import { isEditScreen } from "@/utils/breadcrumb";

export default {
  name: "MoDashboardBody",
  props: {
    bodyClass: {
      type: String,
      default: ""
    },
    loading: {
      type: Boolean,
      default: false
    },
    isFooterTop: {
      type: Boolean,
      default: true
    },
    alignedClass: {
      type: String
    }
  },
  mounted() {
    this.$refs.footer.scrollTo(this.$refs.footer.clientWidth, 0);
  },
  computed: {
    isEditScreen() {
      return isEditScreen(this.$route);
    }
  }
};
</script>
