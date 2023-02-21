<template>
  <b-modal
    :id="modalId"
    content-class="mo-input-modal"
    body-class="mo-input-modal-body m-0"
    hide-footer
    hide-header
    centered
  >
    <h3 class="text-center font-weight-light mb-3">
      Request technical data
    </h3>
    <form @submit.prevent="onSubmit">
      <b-row>
        <b-col>
          <b-form-group label="Request by:" label-for="requestUser">
            <b-form-input
              id="requestUser"
              v-model="requestUser"
              placeholder="Request by"
              type="requestUser"
              class="mo-input"
              autocomplete="requestUser"
              disabled
            ></b-form-input>
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group label="Send to:" label-for="email">
            <b-form-input
              id="email"
              v-model="email"
              placeholder="Send to"
              type="email"
              class="mo-input"
              autocomplete="email"
              required
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group label="Subject" label-for="title">
            <b-form-input
              autocomplete="subject"
              id="title"
              v-model="emailSubject"
              placeholder="Subject"
              type="text"
              class="mo-input"
              required
            ></b-form-input>
          </b-form-group>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-group label="Additional text" label-for="comment">
            <b-form-textarea
              autocomplete="body"
              id="comment"
              v-model="emailBody"
              placeholder="Additional text"
              type="text"
              class="mo-input"
              rows="9"
              required
            ></b-form-textarea>
          </b-form-group>
        </b-col>
      </b-row>

      <mo-button title="Submit" type="submit" />
    </form>
  </b-modal>
</template>

<script>
import { requestProducerData } from "@/api/admin/company/unit/unit";

export default {
  name: "MoRequestDataModal",
  props: {
    modalId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isSubmitting: false,
      email: "",
      emailSubject: "Provide technical data for unit :",
      emailBody: "",
      requestUser: ""
    };
  },
  computed: {
    companyName() {
      return this.isAdminDashboard ? "" : this.$store.getters.getCompanyName;
    },
    emailBodyText() {
      return `Dear

On behalf of ${this.companyName} I would kindly ask you to provide technical data for the furniture you are producing.
Purchase order:
Project name:
Location:`;
    },
    userFullName() {
      let user = this.$store.getters.getUser;
      return user.first_name + " " + user.last_name;
    }
  },
  mounted() {
    this.emailBody = this.emailBodyText;
    this.requestUser = this.userFullName;
  },
  methods: {
    onSubmit() {
      this.handleCreate(
        requestProducerData({
          subject: this.emailSubject,
          content: this.parseEmailBody(),
          company_id: this.$store.getters.companyId,
          email: this.email
        }),
        "Data request"
      ).then(() => {
        this.emailBody = this.emailBodyText;
        this.requestUser = this.userFullName;
        this.email = "";
        this.emailSubject = "Provide technical data for unit :";
        this.$emit("done");
      });
    },
    parseEmailBody() {
      let text = this.emailBody;
      let firstLine = text.substr(0, text.indexOf("\n"));
      return text
        .replace(firstLine, `<h3>${firstLine}</h3>`)
        .split("\n")
        .join("<br>");
    }
  }
};
</script>
