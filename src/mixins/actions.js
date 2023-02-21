import { formatError } from "@/utils/utils";

export default {
  methods: {
    handleFetch(call) {
      const action = "fetch";
      this.isLoading = true;
      return new Promise((resolve, reject) => {
        call
          .then(resolve)
          .catch(e => {
            if (e.response && e.response.status === 404) {
              return this.$bvToast.toast(
                "This entity doesn't exist anymore. It was most likely deleted from the system.",
                {
                  title: `Entity not found!`,
                  variant: "danger"
                }
              );
            }
            // display fetch errors in toaster by default
            this.$bvToast.toast(formatError(e), {
              title: `${formatAction(action)} error!`,
              variant: "danger"
            });
            reject(e);
          })
          .finally(() => {
            this.isLoading = false;
          });
      });
    },
    handleDelete(call, entity, immediate) {
      return this.handleSingle(call, entity, "delete", false, immediate);
    },
    handleSave(call, entity) {
      this.isSubmitting = true;
      return this.handleSingle(call, entity, "save").finally(() => {
        this.isSubmitting = false;
      });
    },
    handleCreate(call, entity) {
      this.isSubmitting = true;
      return this.handleSingle(call, entity, "create", false).finally(() => {
        this.isSubmitting = false;
      });
    },
    handleUpdate(call, entity) {
      this.isSubmitting = true;
      return this.handleSingle(call, entity, "update").finally(() => {
        this.isSubmitting = false;
      });
    },
    handleArchive(call, entity) {
      return this.handleSingle(call, entity, "archive");
    },
    handleUnarchive(call, entity) {
      return this.handleSingle(call, entity, "unarchive");
    },
    handleBlock(call, entity) {
      return this.handleSingle(call, entity, "block");
    },
    handleUnblock(call, entity) {
      return this.handleSingle(call, entity, "unblock");
    },
    handleMultipleDelete(calls, entity) {
      return this.handleMultiple(calls, entity, "delete");
    },
    handleMultipleArchive(calls, entity) {
      return this.handleMultiple(calls, entity, "archive");
    },
    handleMultipleUnarchive(calls, entity) {
      return this.handleMultiple(calls, entity, "unarchive");
    },
    handleMultipleBlock(calls, entity) {
      return this.handleMultiple(calls, entity, "block");
    },
    handleMultipleUnblock(calls, entity) {
      return this.handleMultiple(calls, entity, "unblock");
    },
    handleSingle(call, entity, action, refetch = true, immediate) {
      return this.handleApiCall(
        call,
        entity,
        msg(entity, action),
        action,
        immediate
      ).then(data => {
        if (refetch) {
          this.executeFetch();
        }
        return data;
      });
    },
    handleMultiple(calls, entity, action) {
      return this.handleApiCall(
        Promise.all(calls),
        entity,
        msg(entity, action, calls.length),
        action
      ).then(data => {
        this.executeFetch();
        return data;
      });
    },
    executeFetch() {
      // if the component implements fetchData, execute it
      if (typeof this.fetchData === "function") {
        this.fetchData();
      }
    },
    handleApiCall(call, entity, message, action, immediate) {
      return new Promise((resolve, reject) => {
        call
          .then(data => {
            if (immediate) {
              this.$bvToast.toast(message, {
                title: `${formatAction(action)} successful!`
              });
              // immediate=true must be set when using modal edit screens
              // resolve after a few seconds, so that alert shows up
              setTimeout(() => {
                resolve(data);
              }, 400);
            } else {
              // execute after a few milliseconds, so that alert shows up
              // even when redirect is triggered
              setTimeout(() => {
                this.$bvToast.toast(message, {
                  title: `${formatAction(action)} successful!`
                });
              }, 200);
              resolve(data);
            }
          })
          .catch(e => {
            this.$bvToast.toast(formatError(e), {
              title: `${formatAction(action)} error!`,
              variant: "danger"
            });
            reject(e);
          });
      });
    }
  }
};

function msg(entity, action, count) {
  const fixGrammar = a => (a.endsWith("e") ? `${a}d` : `${a}ed`);
  if (count) {
    return `Successfully ${action} ${count} ${entity || "entities"}`;
  } else {
    return `${entity || "Entity"} was successfully ${fixGrammar(action)}!`;
  }
}

function formatAction(value) {
  return `${value[0].toUpperCase()}${value
    .substring(1, value.length)
    .toLowerCase()}`;
}
