<template>
  <b-row :id="sectionId" class="w-100">
    <b-col>
      <b-row>
        <b-col>
          <b-row class="align-items-center mb-2">
            <h5 v-if="title" class="m-0">{{ title }}</h5>
            <i
              :class="
                `fas ${
                  isCollapsed ? 'fa-expand-arrows' : 'fa-compress-arrows-alt'
                } mo-collapse-section__btn ml-3`
              "
              v-b-tooltip.hover
              :title="isCollapsed ? 'Expand section' : 'Collapse section'"
              @click="onToggleCollapse"
            />
          </b-row>
          <b-row
            ref="body"
            :style="bodyStyle"
            :class="
              isCollapsed
                ? 'mo-collapse-section__body__collapsed'
                : 'mo-collapse-section__body'
            "
          >
            <slot name="body"></slot>
          </b-row>
        </b-col>
      </b-row>
      <b-row class="mb-4 mt-4" v-if="showDivider">
        <b-col>
          <hr v-if="showDivider" />
        </b-col>
      </b-row>
    </b-col>
  </b-row>
</template>

<script>
export default {
  name: "MoCollapseSection",
  props: {
    title: {
      type: String
    },
    isLoading: {
      type: Boolean,
      required: true
    },
    collapsed: {
      type: Boolean,
      default: false
    },
    showDivider: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isCollapsed: this.collapsed,
      bodyHeight: null
    };
  },
  watch: {
    isCollapsed() {
      setTimeout(() => {
        this.refresh();
        this.$emit("change");
      }, 100);
    },
    collapsed(value) {
      this.isCollapsed = value;
    },
    isLoading(value) {
      if (!value) {
        // finish for content load, the set css height to body client height, so that animations will work
        setTimeout(() => {
          this.refresh();
        }, 100);
      }
    }
  },
  computed: {
    sectionId() {
      return this.title ? this.title.replaceAll(" ", "-").toLowerCase() : null;
    },
    bodyStyle() {
      return {
        height: this.bodyHeight ? `${this.bodyHeight}px` : null
      };
    }
  },
  methods: {
    onToggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    refresh(count = 2) {
      this.bodyHeight = null;
      this.$nextTick(() => {
        if (this.$refs.body) {
          this.bodyHeight = this.$refs.body.clientHeight;
        } else {
          if (count > 0) {
            setTimeout(() => this.refresh(count - 1), 100);
          }
        }
      });
    }
  }
};
</script>
<style lang="scss">
@import "../../assets/scss/variables";

.mo-collapse-section {
  &__btn {
    color: $primary;
    cursor: pointer;
  }
  &__body {
    transition: 0.3s linear all;
    &__collapsed {
      @extend .mo-collapse-section__body;
      transform: scaleY(0);
      height: 0 !important;
    }
  }
}
</style>
