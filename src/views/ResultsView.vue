<template>
  <div class="p-4">
    <h2 class="text-xl mb-4">Parsed Lap Data</h2>

    <div v-if="lapData">
      <p><strong>Track:</strong> {{ lapData.track }}</p>
      <p><strong>Car:</strong> {{ lapData.car }}</p>

      <div v-if="lapData.laps.length > 0">
        <h3 class="mt-4 text-lg">Laps:</h3>
        <ul class="list-disc ml-6">
          <li v-for="(lap, index) in lapData.laps" :key="index">
            {{ formatTime(lap.time || lap.bestLap || lap) }}
          </li>
        </ul>
      </div>

      <div v-else>
        <p><em>No lap times recorded in this session.</em></p>
      </div>
    </div>

    <div v-else>
      <p>No data loaded.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const lapData = ref(null);

onMounted(() => {
  const raw = sessionStorage.getItem('lapData');
  if (raw) lapData.value = JSON.parse(raw);
});

function formatTime(ms) {
  if (!ms || ms <= 0) return 'N/A';

  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}
</script>
