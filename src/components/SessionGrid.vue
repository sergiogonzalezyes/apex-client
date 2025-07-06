<template>
  <div>
    <DataTable
      :value="sessions"
      v-model:selection="internalSelection"
      selectionMode="multiple"
      dataKey="id"
      responsiveLayout="scroll"
      class="p-datatable-sm"
    >
      <Column selectionMode="multiple" headerStyle="width: 3rem" />
      <Column field="timestamp" header="Date/Time" :sortable="true" />
      <Column field="track" header="Track" :sortable="true" />
      <Column field="car" header="Car" :sortable="true" />
      <Column header="Laps">
        <template #body="slotProps">
          <span
            :class="slotProps.data.laps.length === 0
              ? 'text-red-500 font-semibold'
              : 'text-green-700 font-medium'"
          >
            {{ slotProps.data.laps.length }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const props = defineProps({
  sessions: Array,
  selected: Array,
});

const emit = defineEmits(['update:selected']);

// Internal state
const internalSelection = ref(props.selected || []);

watch(internalSelection, (val) => {
  emit('update:selected', val);
});
</script>
