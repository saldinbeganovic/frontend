<template>
  <div>
    <mo-prompt-modal
      modal-id="delete-user-modal"
      message="Are you sure you want to delete this user ?"
      @right="onDelete"
    />
    <mo-prompt-modal
      modal-id="block-user-modal"
      message="Are you sure you want to block this user ?"
      @right="onBlock"
    />
    <mo-prompt-modal
      modal-id="unblock-user-modal"
      message="Are you sure you want to unblock this user ?"
      @right="onUnblock"
    />
    <validation-observer
      class="h-100 flex-grow-1 mo-edit-user"
      v-slot="{
        handleSubmit
      }"
    >
      <form
        class="d-flex flex-column justify-content-between h-100 w-100"
        @submit.prevent="handleSubmit(onSubmit)"
        v-on:keydown.enter.prevent
      >
        <mo-dashboard-body :loading="isLoading">
          <template #body>
            <b-col>
              <b-row>
                <b-col>
                  <b-form-group
                    class="w-100"
                    label="First name"
                    label-for="first-name"
                  >
                    <b-form-input
                      id="first-name"
                      v-model="firstName"
                      class="mo-input__light-sm"
                      placeholder="First name"
                      type="text"
                      :disabled="disabled"
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group
                    class="w-100"
                    label="Last name"
                    label-for="last-name"
                  >
                    <b-form-input
                      id="last-name"
                      v-model="lastName"
                      class="mo-input__light-sm"
                      placeholder="Last name"
                      type="text"
                      :disabled="disabled"
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group class="w-100" label="Type" label-for="type">
                    <b-form-select
                      id="type"
                      v-model="userType"
                      :options="userTypes"
                      text-field="name"
                      value-field="id"
                      class="mo-input__light-sm"
                      :disabled="disabled"
                      required
                    ></b-form-select>
                  </b-form-group>
                </b-col>
              </b-row>
              <b-row>
                <b-col>
                  <b-form-group class="w-100" label="Email" label-for="email">
                    <b-form-input
                      id="email"
                      v-model="email"
                      class="mo-input__light-sm"
                      placeholder="Email"
                      type="email"
                      :disabled="disabled"
                      required
                    ></b-form-input>
                  </b-form-group>
                </b-col>
                <b-col>
                  <b-form-group
                    class="w-100"
                    label="Phone number"
                    label-for="phone"
                  >
                    <vue-phone-number-input
                      @update="formattedPhone = $event.formatInternational"
                      :default-country-code="defaultFirstCountryCode"
                      class="mo-input__light-sm-phone"
                      error-color="#FF3C30"
                      valid-color="#00E995"
                      color="#00A1FF"
                      :no-flags="true"
                      v-model="phone"
                      :disabled="disabled"
                    />
                  </b-form-group>
                </b-col>
              </b-row>
            </b-col>
          </template>
          <template v-if="!isNew && !disabled" #footer-left>
            <mo-button
              v-if="isBlocked && $store.getters.hasAdminRole"
              title="Unblock"
              @click="$bvModal.show('unblock-user-modal')"
            />
            <mo-button
              v-else-if="$store.getters.hasAdminRole"
              title="Block"
              @click="$bvModal.show('block-user-modal')"
            />
            <mo-button
              v-if="$store.getters.hasAdminRole"
              class="ml-2"
              title="Delete"
              variant="danger"
              @click="$bvModal.show('delete-user-modal')"
            />
          </template>
          <template #footer-right v-if="!disabled">
            <mo-button
              v-if="isNew && $store.getters.hasAdminRole"
              type="submit"
              title="Create"
              :loading="isSubmitting"
            />
            <mo-button
              v-else-if="$store.getters.hasAdminRole"
              type="submit"
              title="Update"
              :loading="isSubmitting"
            />
          </template>
        </mo-dashboard-body>
      </form>
    </validation-observer>
  </div>
</template>

<script>
import {
  blockUser,
  createUser,
  deleteUser,
  getUser,
  getUsersMetadata,
  unblockUser,
  updateUser
} from "@/api/admin/company/user";

export default {
  name: "User",
  props: {
    userId: {
      type: [String, Number],
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isLoading: false,
      isSubmitting: false,
      email: "",
      userType: null,
      firstName: "",
      lastName: "",
      formattedPhone: "",
      phone: "",
      isBlocked: null,
      selectAll: false,
      selectSafe: false,
      userTypes: []
    };
  },
  computed: {
    isNew() {
      return this.userId === "new";
    },
    userData() {
      return {
        email: this.email,
        first_name: this.firstName,
        type_id: this.userType,
        last_name: this.lastName,
        company_id: this.companyId,
        phone: this.formattedPhone
      };
    }
  },
  watch: {},
  mounted() {
    this.handleFetch(
      Promise.all([
        !this.isNew ? getUser(this.userId) : null,
        getUsersMetadata(this.$store.getters.companyId)
      ])
    ).then(([user, { types }]) => {
      if (!this.isNew) {
        this.email = user.email;
        this.firstName = user.first_name;
        this.lastName = user.last_name;
        this.isBlocked = !!user.is_blocked;
        this.phone = user.phone;
        this.userType = user.type_id;
        //TODO check if need to set user role
      }
      this.userTypes = types;
    });
  },
  methods: {
    formatName(id, name) {
      // display "Connect" instead of "Create"
      // if the current column is for Player (id=20) or Modem (id=18)
      if (id === 20 || id === 18) {
        return "Connect";
      } else {
        return name;
      }
    },
    onSubmit() {
      if (this.isNew) {
        this.handleCreate(createUser(this.userData), "User").then(() => {
          this.$emit("created");
        });
      } else {
        this.handleUpdate(updateUser(this.userId, this.userData), "User").then(
          () => {
            this.$emit("updated");
          }
        );
      }
    },
    onBlock() {
      this.handleBlock(blockUser(this.userId), "User").then(() => {
        this.$router.back();
      });
    },
    onUnblock() {
      this.handleBlock(unblockUser(this.userId), "User").then(() => {
        this.$router.back();
      });
    },
    onDelete() {
      this.handleDelete(deleteUser(this.userId), "User").then(() => {
        this.$router.back();
      });
    }
  }
};
</script>
<style lang="scss">
.mo-edit-user {
  label,
  legend,
  input,
  select {
    font-size: 10px;
  }
  // align checkbox labels text vertically
  .custom-control-label {
    display: flex;
    align-items: center;
  }
}

.table-responsive::-webkit-scrollbar {
  -webkit-appearance: none;
}

.table-responsive::-webkit-scrollbar:horizontal {
  height: 12px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  border: 2px solid #ffffff;
}

.table-responsive::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: #ffffff;
}
</style>
