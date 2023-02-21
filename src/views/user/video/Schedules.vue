<template>
  <mo-dashboard-body body-class="justify-content-center mo-schedules-body">
    <template #body>
      <mo-screen-wrapper-modal
        dialog-class="mo-edit-user-modal"
        ref="editUserModal"
        #body="{props}"
      >
        <edit-user
          :user-id="props.userId"
          :disabled="true"
          @updated="fetchData()"
          @created="onUserCreate"
        />
      </mo-screen-wrapper-modal>
      <mo-prompt-modal
        modal-id="delete-schedule-modal"
        :message="deleteMessage"
        @right="onDeleteConfirm"
        @left="onDeleteCancel"
      />
      <mo-video-preview-modal
        modal-id="schedule-video-preview-modal"
        :video-path="previewPath"
        :show-info="true"
        :video-info="videoInfo"
      />
      <b-col>
        <b-row class="mo-table">
          <h5>Pending</h5>
          <mo-table
            class="mo-table mo-schedules-table w-100 h-100 mo-table__multiple"
            thead-class="mo-logs-table__head"
            empty-text="No schedules to show"
            :items="sortedSchelduePending"
            :search-query="searchQuery"
            :fields="fields"
            :loading="isLoading"
            :fixed="true"
            sticky-header
            show-empty
            striped
            hover
          >
            <template #cell(player.unit.point_of_sale.name)="{item}">
              <router-link :to="editPosUrl(item)">
                {{ item.player.unit.point_of_sale.name }}
              </router-link>
            </template>
            <template #cell(player.unit.title)="{item}">
              <router-link :to="editUnitUrl(item)">
                {{ item.player.unit.title }}
              </router-link>
            </template>
            <template #cell(player.display.name)="{item}">
              <router-link :to="editDisplayUrl(item)">{{
                item.player.display.name
              }}</router-link>
            </template>
            <template #cell(player)="{item}">
              <router-link
                :is="ifUserIsAdmin ? 'router-link' : 'span'"
                :to="`/admin/device/player/${item.player.id}`"
              >
                <span v-if="item.player && item.player.unit">
                  Player #{{ item.player.id }}</span
                >
                <span v-else>-</span>
                <span v-if="!item.player.state" class="ml-2"
                  ><i
                    v-b-tooltip.hover
                    title="This player is not online."
                    style="color: orange"
                    class="fas fa-exclamation-triangle "
                  ></i
                ></span>
              </router-link>
            </template>
            <template #cell(video.path)="{item}">
              <img
                v-if="item.video.path"
                style="cursor: pointer"
                @click="onOpenVideoModal(item.video)"
                :src="toS3Url(item.video.thumbnail)"
              /><span v-else>-</span>
            </template>
            <template #cell(action)="{item}">
              <b-button
                v-if="$store.getters.hasAdminRole"
                class="mo-btn__simple"
                @click="onDelete(item.id)"
              >
                <i class="fa fa-trash mo-text__danger" aria-hidden="true"></i>
              </b-button>
            </template>
            <template #cell(user)="{item}">
              <a href="" v-if="item.user" @click.prevent="userUrl(item)">
                {{ item.user.first_name }} {{ item.user.last_name }}
              </a>
            </template>
          </mo-table>
        </b-row>
        <b-row class="mo-table">
          <h5>Completed</h5>
          <mo-table
            class="mo-table mo-schedules-table w-100 h-100 mo-table__multiple"
            thead-class="mo-logs-table__head"
            empty-text="No schedules to show"
            :items="sortedScheldueCompleted"
            :search-query="searchQuery"
            :fields="fields"
            :loading="isLoading"
            :fixed="true"
            sticky-header
            show-empty
            striped
            hover
          >
            <template #cell(player.unit.point_of_sale.name)="{item}">
              <router-link :to="editPosUrl(item)">
                {{ item.player.unit.point_of_sale.name }}
              </router-link>
            </template>
            <template #cell(player.unit.title)="{item}">
              <router-link :to="editUnitUrl(item)">
                {{ item.player.unit.title }}
              </router-link>
            </template>
            <template #cell(player.display.name)="{item}">
              <router-link :to="editDisplayUrl(item)">{{
                item.player.display.name
              }}</router-link>
            </template>
            <template #cell(player)="{item}">
              <router-link
                :is="ifUserIsAdmin ? 'router-link' : 'span'"
                :to="`/admin/device/player/${item.player.id}`"
              >
                <span v-if="item.player && item.player.unit">
                  Player #{{ item.player.id }}</span
                >
                <span v-else>-</span>
                <span v-if="!item.player.state" class="ml-2"
                  ><i
                    v-b-tooltip.hover
                    title="This player is not online."
                    style="color: orange"
                    class="fas fa-exclamation-triangle "
                  ></i
                ></span>
              </router-link>
            </template>
            <template #cell(video.path)="{item}">
              <img
                v-if="item.video.path"
                style="cursor: pointer"
                @click="onOpenVideoModal(item.video)"
                :src="toS3Url(item.video.thumbnail)"
              /><span v-else>-</span>
            </template>
            <template #cell(action)="{item}">
              <b-button class="mo-btn__simple" @click="onDelete(item.id)"
                ><i class="fa fa-trash mo-text__danger" aria-hidden="true"></i>
              </b-button>
            </template>
            <template #cell(user)="{item}">
              <a href="" v-if="item.user" @click.prevent="userUrl(item)">
                {{ item.user.first_name }} {{ item.user.last_name }}
              </a>
            </template>
          </mo-table>
        </b-row>
        <b-row class="mo-table">
          <h5>Not changed</h5>
          <mo-table
            class="mo-table mo-schedules-table w-100 h-100 mo-table__multiple"
            thead-class="mo-logs-table__head"
            empty-text="No schedules to show"
            :items="sortedScheldueNotChanged"
            :search-query="searchQuery"
            :fields="fields"
            :loading="isLoading"
            :fixed="true"
            sticky-header
            show-empty
            striped
            hover
          >
            <template #cell(player.unit.point_of_sale.name)="{item}">
              <router-link :to="editPosUrl(item)">
                {{ item.player.unit.point_of_sale.name }}
              </router-link>
            </template>
            <template #cell(player.unit.title)="{item}">
              <router-link :to="editUnitUrl(item)">
                {{ item.player.unit.title }}
              </router-link>
            </template>
            <template #cell(player.display.name)="{item}">
              <router-link :to="editDisplayUrl(item)">{{
                item.player.display.name
              }}</router-link>
            </template>
            <template #cell(player)="{item}">
              <router-link
                :is="ifUserIsAdmin ? 'router-link' : 'span'"
                :to="`/admin/device/player/${item.player.id}`"
              >
                <span v-if="item.player && item.player.unit">
                  Player #{{ item.player.id }}</span
                >
                <span v-else>-</span>
                <span v-if="!item.player.state" class="ml-2"
                  ><i
                    v-b-tooltip.hover
                    title="This player is not online."
                    style="color: orange"
                    class="fas fa-exclamation-triangle "
                  ></i
                ></span>
              </router-link>
            </template>
            <template #cell(video.path)="{item}">
              <img
                v-if="item.video.path"
                style="cursor: pointer"
                @click="onOpenVideoModal(item.video)"
                :src="toS3Url(item.video.thumbnail)"
              /><span v-else>-</span>
            </template>
            <template #cell(action)="{item}">
              <b-button class="mo-btn__simple" @click="onDelete(item.id)"
                ><i class="fa fa-trash mo-text__danger" aria-hidden="true"></i>
              </b-button>
            </template>
            <template #cell(user)="{item}">
              <a href="" v-if="item.user" @click.prevent="userUrl(item)">
                {{ item.user.first_name }} {{ item.user.last_name }}
              </a>
            </template>
          </mo-table>
        </b-row>
      </b-col>
    </template>
  </mo-dashboard-body>
</template>

<script>
import { formatDate } from "@/utils/utils";
import { getVideoSchedules } from "@/api/admin/company/company";
import { isAdmin } from "@/utils/auth";
import { deleteSchedule } from "@/api/user/video/video";
import MoVideoPreviewModal from "@/components/pure/modals/MoVideoPreviewModal";
import EditUser from "@/views/shared/user/Edit.vue";

export default {
  name: "Schedules",
  components: {
    MoVideoPreviewModal,
    EditUser
  },
  props: {
    searchQuery: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      previewPath: null,
      videoInfo: null,
      isLoading: false,
      scheduleId: null,
      currentPage: 1,
      itemsPending: [],
      itemsComplete: [],
      itemsUnsuccessful: [],
      totalRows: null,
      perPage: 50,
      fields: [
        {
          sortable: true,
          key: "player",
          label: "Player"
        },
        {
          key: "video.path",
          label: "",
          sortable: false
        },
        {
          sortable: true,
          filterable: true,
          key: "player.unit.point_of_sale.name",

          label: "Point of Sale"
        },
        {
          sortable: true,
          filterable: true,
          key: "player.unit.title",
          label: "Unit"
        },
        {
          sortable: true,
          filterable: true,
          key: "player.display.name",
          formatter: value => value || "-",
          label: "Display"
        },
        {
          sortable: true,
          key: "scheduled_at",
          label: "Date and Time",
          formatter: value => formatDate(value, true, false, true)
        },
        {
          key: "user",
          label: "Created by",
          sortable: true
        },
        {
          sortable: false,
          key: "action",
          label: ""
        }
      ]
    };
  },
  mounted() {
    this.fetchData();
  },
  computed: {
    sortedScheldueCompleted() {
      return this.itemsComplete.slice(0).sort((a,b)=>{
        if (a.created_at < b.created_at)
        return 1;
        else if (a.created_at > b.created_at)
        return -1;
       else 
         return 0;
      })

            },
            sortedSchelduePending() {
      return this.itemsPending.slice(0).sort((a,b)=>{
        if (a.created_at < b.created_at)
        return 1;
        else if (a.created_at > b.created_at)
        return -1;
       else 
         return 0;
      })

            },
            sortedScheldueNotChanged() {
      return this.itemsUnsuccessful.slice(0).sort((a,b)=>{
        if (a.created_at < b.created_at)
        return 1;
        else if (a.created_at > b.created_at)
        return -1;
       else 
         return 0;
      })

            },
    ifUserIsAdmin() {
      return isAdmin();
    },
    deleteMessage() {
      return "Are sure you want to delete this composed video schedule ? You can't undo this action.";
    }
  },
  methods: {
    onDelete(id) {
      this.scheduleId = id;
      this.$bvModal.show("delete-schedule-modal");
    },
    onDeleteCancel() {
      this.scheduleId = null;
      this.$bvModal.hide("delete-schedule-modal");
    },
    onDeleteConfirm() {
      this.handleDelete(deleteSchedule(this.scheduleId), "Schedule").then(
        () => {
          this.fetchData();
        }
      );
    },
    editPosUrl(item) {
      return `/user/pos/${item.player.unit.point_of_sale.id}`;
    },
    userUrl(item) {
      this.$refs.editUserModal.show({
        userId: item.user.id
      });
    },
    editUnitUrl(item) {
      const unit = item.player.unit;
      return `/user/pos/${unit.point_of_sale.id}?unitId=${unit.id}`;
    },
    editDisplayUrl(item) {
      const unit = item.player.unit;
      return `/user/pos/${unit.point_of_sale.id}?unitId=${unit.id}#displays`;
    },
    fetchData() {
      this.handleFetch(
        getVideoSchedules(this.$store.getters.companyId, {
          is_processed: 0
        })
      ).then(data => {
        this.itemsPending = data;
      });
      this.handleFetch(
        getVideoSchedules(this.$store.getters.companyId, {
          is_processed: 1
        })
      ).then(data => {
        this.itemsComplete = data;
      });
      this.handleFetch(
        getVideoSchedules(this.$store.getters.companyId, {
          is_unsuccessful: 1
        })
      ).then(data => {
        this.itemsUnsuccessful = data;
      });
    },
    onOpenVideoModal(video) {
      this.previewPath = video.path;
      this.videoInfo = video;
      this.$bvModal.show("schedule-video-preview-modal");
    }
  }
};
</script>
<style lang="scss">
.mo-schedules-body {
  overflow: unset;
}
.mo-schedules-table {
  margin: auto;
  td,
  th {
    text-align: center;
  }
  .player-unit-point_of_sale-name {
    width: 300px;
  }
  .player-unit-title,
  .player-display-name {
    width: 250px;
  }
  .video-path,
  .is_processed {
    width: 70px;
    max-width: 70px;
  }
  .user,
  .scheduled_at {
    width: 250px;
    max-width: 250px;
  }

  .player {
    width: 170px;
    max-width: 170px;
  }
  .video-path {
    width: 60px;
    max-width: 60px;
  }
  .action {
    width: 70px;
  }
}
</style>
