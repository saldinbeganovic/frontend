# MoScreenWrapperModal

Bootstrap modals are mounted whenever the parent component mounts.
However, it's sometimes useful to mount a modal only when it's actually shown to the user:
- trigger data fetching only when necessary (on mounted)
- simpler refactoring from router rendered screens to modals

## Example

```vue
<mo-screen-wrapper-modal
  ref="editMaintenanceModal"
  #body="{props}"
>
    <mo-edit-maintenance-modal
      :initial-pos-id="props.maintenancePosId"
      :initial-unit-id="props.maintenanceUnitId"
    />
</mo-screen-wrapper-modal>

<script>
export default {
  methods: {
    showMaintenanceModal(posId, unitId) {
      // mo-edit-maintenance-modal is mounted only after calling .show
      this.$refs.editMaintenanceModal.show({
        maintenancePosId: posId,
        maintenanceUnitId: unitId
      });
    }
  }
}
</script>
```
