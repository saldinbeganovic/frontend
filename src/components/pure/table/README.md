# MoTable

This component extends [`<b-table>`](https://bootstrap-vue.org/docs/components/table) component and is used almost all
across the system to share common functionality (filtration, search, sorting,...) and ensure consistency.

You should always use this component, except in the case you need a completely custom functionality / ui that requires
usage of [`<b-simple-table>`](https://bootstrap-vue.org/docs/components/table#tables) (like MoCampaignVisuals.vue).

## Props

<details>
<summary>items</summary>
<ul>
    <li>type: Array</li>
    <li>required: Yes</li>
    <li>default: []</li>
</ul>
Table data (rows). Read more about <a href="https://bootstrap-vue.org/docs/components/table#items-record-data">bootstrap items definitions</a>.
</details>

<details>
<summary>fields</summary>
<ul>
    <li>type: Array</li>
    <li>required: Yes</li>
    <li>default: []</li>
</ul>
Table column definitions. Read more about <a href="https://bootstrap-vue.org/docs/components/table#fields-column-definitions">bootstrap column definition options</a>.

MoTable has a few custom options:
<ul>
    <li><code>sortable</code> - is column sortable (with up/down arrows in header)</li>
    <li><code>filterable</code> - is column filterable (with select input in header)</li>
    <li><code>collapsable</code> - is column collapsable (with "collapse" button in header)</li>
</ul>
</details>

<details>
<summary>show-select-all</summary>
<ul>
    <li>type: Boolean</li>
    <li>required: No</li>
    <li>default: true</li>
</ul>
Show checkbox that automatically selects all rows in "select" column header.
</details>

<details>
<summary>search-query</summary>
<ul>
    <li>type: String</li>
    <li>required: No</li>
    <li>default: ""</li>
</ul>
Textual search query that filters rows.
</details>

## Example

```vue
<mo-table
    empty-text="No rows to show"
    table-class="mo-custom-table-class"
    :show-select-all="true"
    :search-query="searchQuery"
    :items="items"
    :fields="fields"
    :loading="isLoading"
    @select="selected = $event"
    @edit="onEdit"
>
<template #cell(my_column_key)>
  Custom cell ui
</template>
</mo-table>

<script>
export default {
  data () {
    return {
      isLoading: true,
      // array of selected
      selected: [],
      items: [],
      fields: [
        { key: "select", label: "" },
        {
          key: "my_column_key", 
          label: "My Column",
          sortable: true,
          filterable: true,
          collapsable: true,
          formatter: value => value || "-"
        },
        { key: "options", label: "" }
      ]
    }
  }
}
</script>
```
