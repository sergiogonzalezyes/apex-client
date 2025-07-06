<template>
  <div
    class="border-dashed border-2 p-10 text-center"
    @dragover.prevent
    @dragenter.prevent
    @drop.prevent="handleDrop"
  >
    <p class="mb-2">Drag and drop one or more files here</p>
    <input
      type="file"
      multiple
      @change="handleInput"
      hidden
      ref="fileInput"
      accept=".json,.ini"
    />
    <Button label="Choose File(s)" @click="fileInput.click()" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';

const emit = defineEmits(['files-dropped']);
const fileInput = ref(null);

function handleDrop(event) {
  const files = Array.from(event.dataTransfer.files);
  if (files.length) emit('files-dropped', files);
}

function handleInput(event) {
  const files = Array.from(event.target.files);
  if (files.length) emit('files-dropped', files);
}
</script>
