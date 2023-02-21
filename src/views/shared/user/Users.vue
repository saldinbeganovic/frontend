<template>
  <mo-dashboard-body body-class="mo-users-body">
    <template #body>
      <mo-screen-wrapper-modal
        dialog-class="mo-edit-user-modal"
        ref="editUserModal"
        #body="{props}"
      >
        <edit-user
          :user-id="props.userId"
          @updated="fetchData()"
          @created="onUserCreate"
        />
      </mo-screen-wrapper-modal>

      <mo-prompt-modal
        modal-id="delete-users-modal"
        :message="`Are you sure you want to delete ${selected.length} users ?`"
        @right="onDelete"
      />
      <mo-prompt-modal
        modal-id="block-users-modal"
        :message="`Are you sure you want to block ${selected.length} users ?`"
        @right="onBlock"
      />

      <mo-submit-email-modal
        modal-id="submit-email-modal"
        @submit="onSubmitUserInvitationEmail"
      />
      <b-col>
        <b-row class="mo-table">
          <h5>Admins</h5>
          <mo-table
            table-class="mo-users-table w-100 h-100 mo-table__multiple"
            empty-text="No admin users to show"
            :search-query="searchQuery"
            :items="adminUsers"
            :fields="fields"
            :loading="isLoading"
            :fixed="true"
            @select="selected = $event"
            @edit="onEdit"
          />
        </b-row>
        <b-row class="mo-table">
          <h5>Users</h5>
          <mo-table
            table-class="mo-users-table mo-table__multiple"
            empty-text="No other users to show"
            :search-query="searchQuery"
            :items="otherUsers"
            :fields="fields"
            :loading="isLoading"
            :fixed="true"
            @select="selected = $event"
            @edit="onEdit"
          />
        </b-row>
      </b-col>
    </template>
    <template #footer-left>
      <mo-button
        v-if="$store.getters.hasAdminRole"
        @click="onEdit('new')"
        title="Add new user"
        width="250px"
        class="mr-2"
      />
      <template v-if="selected.length > 0">
        <mo-button
          v-if="$store.getters.hasAdminRole"
          class="mr-2"
          title="Block"
          @click="$bvModal.show('block-users-modal')"
        />
        <mo-button
          v-if="$store.getters.hasAdminRole"
          title="Delete"
          @click="$bvModal.show('delete-users-modal')"
          variant="danger"
        />
      </template>
    </template>
    <template #footer-right>
      <mo-button
        v-if="$store.getters.hasAdminRole"
        @click="onInviteUser"
        title="Invite user"
        iconName="fa-user"
        class="ml-2"
      />
    </template>
  </mo-dashboard-body>
</template>

<script>
import { blockUser, deleteUser, inviteUser } from "@/api/admin/company/user";
import { getCompanyUsers } from "@/api/admin/company/company";
import { formatTableField } from "@/utils/utils";
import MoSubmitEmailModal from "@/components/pure/modals/MoSubmitEmailModal";
import EditUser from "@/views/shared/user/Edit.vue";

export default {
  name: "Users",
  components: { MoSubmitEmailModal, EditUser },
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isLoading: true,
      selected: [],
      items: [],
      fields: [
        { key: "select", label: "" },
        {
          key: "first_name",
          label: "First name",
          formatter: formatTableField
        },
        {
          key: "last_name",
          label: "Last name",
          formatter: formatTableField
        },
        { key: "email", label: "Email" },
        { key: "options", label: "" }
      ]
    };
  },
  computed: {
    adminUsers() {
      return this.items.filter(e => e.type && e.type.name === "admin");
    },
    otherUsers() {
      return this.items.filter(
        e => !e.type || (e.type.name !== "owner" && e.type.name !== "admin")
      );
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    onEdit(userId) {
      this.$refs.editUserModal.show({
        userId: userId
      });
    },
    onUserCreate() {
      this.$refs.editUserModal.hide();
      this.fetchData();
    },
    onBlock() {
      this.$bvModal.hide("block-users-modal");
      this.handleMultipleBlock(this.selected.map(id => blockUser(id)));
    },
    onDelete() {
      this.$bvModal.hide("delete-users-modal");
      this.handleMultipleDelete(
        this.selected.map(id => deleteUser(id)),
        "Users"
      );
    },
    fetchData() {
      this.handleFetch(getCompanyUsers(this.companyId)).then(data => {
        this.items = data;
      });
    },
    onInviteUser() {
      this.$bvModal.show("submit-email-modal");
    },
    onSubmitUserInvitationEmail(email) {
      inviteUser(this.companyId, { email: email })
        .then(() => {
          this.$bvToast.toast(`Invite to ${email} was successfully sent!`);
          this.$bvModal.hide("submit-email-modal");
        })
        .catch(e => {
          this.$bvToast.toast(e.response.data.message, { variant: "danger" });
        });
    }
  }
};
</script>
<style lang="scss">
.mo-edit-user-modal {
  max-width: 60vw;
}
.mo-users-body {
  overflow: unset !important;
}

.mo-users-table {
  width: auto;
  max-height: unset !important;
  height: unset !important;

  .first_name,
  .last_name {
    width: 25%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .email {
    width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .select {
    width: 4%;
    text-align: center;
  }
  .options {
    width: 7%;
    overflow: hidden;
    text-overflow: unset;
  }
}
</style>
