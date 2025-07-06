<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <!-- Top Row: Stats + Upload/Preview -->
      <div class="top-grid">
        <!-- Stats -->
        <div class="stats-panel">
          <div class="stats-grid">
            <StatsWidget icon="pi pi-file" label="Total Sessions" :value="summary.totalSessions" />
            <StatsWidget icon="pi pi-map-marker" label="Unique Tracks" :value="summary.uniqueTracks" />
            <StatsWidget icon="pi pi-car" label="Unique Cars" :value="summary.uniqueCars" />
            <StatsWidget
              icon="pi pi-stopwatch"
              label="Fastest Lap"
              :value="summary.fastestLapFormatted"
              :subtitle="`${summary.fastestLapCar || 'Unknown'} @ ${summary.fastestLapTrack || 'Unknown'}`"
            />
          </div>
        </div>



        <!-- Upload & Preview -->
        <div class="upload-panel">
          <Card>
            <template #title>Upload Lap Files</template>
            <template #content>
              <div class="space-y-3">
                <DropZone @files-dropped="handleFiles" />
                <div v-if="parsedSessions.length" class="upload-preview-container">
                  <div class="upload-preview-scroll">
                    <SessionGrid :sessions="parsedSessions" v-model:selected="selectedSessions" />
                  </div>
                  <div class="upload-preview-actions">
                    <Button label="Track Selected" icon="pi pi-check" size="small"
                            :disabled="!selectedSessions.length" @click="trackSelected" />
                    <Button label="Track All" icon="pi pi-list" size="small" @click="trackAll" />
                  </div>
                </div>
              </div>
              <div class="set-watch-path">
                <h4>Configure Auto Upload Folder</h4>
                <div class="flex gap-2 mb-2">
                  <InputText v-model="watchFolderPath" placeholder="Enter folder path..." class="w-full" />
                  <Button label="Set Watch Folder" icon="pi pi-folder" @click="setWatchPath" />
                </div>
                <small v-if="watchMessage">{{ watchMessage }}</small>
              </div>

            </template>
          </Card>

        </div>
      </div>

      <!-- Best Laps Table -->
      <Card class="best-laps-table">
        <template #title>Best Laps by Car/Track</template>
        <template #content>
          <DataTable :value="bestLaps" class="w-full text-sm">
            <Column field="username" header="User" />
            <Column field="track" header="Track" />
            <Column field="car" header="Car" />
            <Column header="Best Lap">
              <template #body="slotProps">
                {{ formatLapTime(slotProps.data.best_lap_time) }}
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DropZone from '../components/DropZone.vue';
import SessionGrid from '../components/SessionGrid.vue';
import Button from 'primevue/button';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ini from 'ini';
import StatsWidget from '../components/dashboard/StatsWidget.vue';

const parsedSessions = ref([]);
const selectedSessions = ref([]);
const bestLaps = ref([]);

function handleFiles(files) {
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      const name = file.name.toLowerCase();
      try {
        let parsed = {};
        if (name.endsWith('.json')) {
          const data = JSON.parse(text);
          parsed = {
            username: data.players?.[0]?.name ?? 'unknown',
            track: data.track ?? 'unknown',
            car: data.players?.[0]?.car ?? 'unknown',
            laps: data.sessions?.[0]?.laps ?? [],
          };
        } else if (name.endsWith('.ini')) {
          const data = ini.parse(text);
          const username = data.RACE?.NAME ?? 'unknown'
          const car = data.RACE?.MODEL ?? data['CAR_0']?.MODEL ?? 'unknown';
          const track = data.RACE?.TRACK ?? 'unknown';
          const bestTime = data.extras?.[0]?.time ?? data['bestlap'] ?? null;

          parsed = {
            username,
            track,
            car,
            laps: bestTime ? [{ lap_time: bestTime }] : [],
          };
        } else {
          return;
        }
        const timestamp = extractTimestamp(file.name);
        parsedSessions.value.push({
          id: crypto.randomUUID(),
          filename: file.name,
          timestamp,
          ...parsed,
        });
      } catch (err) {
        console.warn(`Could not parse ${file.name}`, err);
      }
    };
    reader.readAsText(file);
  });
}

function extractTimestamp(filename) {
  const match = filename.match(/^(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
  if (!match) return 'Unknown Time';
  const [, yy, dd, hh, mm, ss] = match;
  return `20${yy}-${dd}-${hh} ${mm}:${ss}`;
}

function formatLapTime(ms) {
  if (ms === null || ms === undefined) return "--:--.---";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}


function trackSelected() {
  sendLapsToServer(selectedSessions.value);
}

function trackAll() {
  sendLapsToServer(parsedSessions.value);
}

async function sendLapsToServer(sessionData) {
  try {
    // const res = await fetch('http://localhost:3000/api/laps', {
    const res = await fetch('https://tracker.gvtsy.com/api/laps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions: sessionData }),
    });
    const json = await res.json();
    if (json.success) fetchBestLaps();
  } catch (err) {
    console.error('Upload failed', err);
  }
}

async function fetchBestLaps() {
  try {
    // const res = await fetch('http://localhost:3000/api/best-laps');
    const res = await fetch('https://tracker.gvtsy.com/api/best-laps');
    const data = await res.json();
    bestLaps.value = data;
  } catch (err) {
    console.error('Failed to fetch best laps:', err);
  }
}





onMounted(() => {
  fetchBestLaps();
  fetchSummaryStats();
});

const summary = ref({
  totalSessions: 0,
  uniqueTracks: 0,
  uniqueCars: 0,
  fastestLap: null,
  fastestLapFormatted: '--:--.---',
  fastestLapCar: null,
  fastestLapTrack: null,
});

async function fetchSummaryStats() {
  try {
    // const res = await fetch('http://localhost:3000/api/lap-summary');
    const res = await fetch('https://tracker.gvtsy.com/api/summary');
    const data = await res.json();
    summary.value.totalSessions = data.totalSessions;
    summary.value.uniqueTracks = data.uniqueTracks;
    summary.value.uniqueCars = data.uniqueCars;
    summary.value.fastestLap = data.fastestLap;
    summary.value.fastestLapFormatted = formatLapTime(data.fastestLap);
    summary.value.fastestLapCar = data.fastestLapCar;
    summary.value.fastestLapTrack = data.fastestLapTrack;
  } catch (err) {
    console.error('Failed to fetch summary stats:', err);
  }
}

import InputText from 'primevue/inputtext'; // add this at top

const watchFolderPath = ref('');
const watchMessage = ref('');

async function setWatchPath() {
  if (!watchFolderPath.value) {
    watchMessage.value = 'Please enter a folder path.';
    return;
  }

  try {
    // const res = await fetch('http://localhost:3000/api/set-watch-path', {
    const res = await fetch('https://tracker.gvtsy.com/api/best-laps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderPath: watchFolderPath.value })
    });
    const data = await res.json();
    watchMessage.value = data.message;

  } catch (err) {
    watchMessage.value = err?.response?.data?.error || 'Failed to set folder path.';
  }
}




</script>



<style scoped> 
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 2rem;
  overflow: hidden; /* prevent double scrollbars */
}

.dashboard-content > *:not(:last-child) {
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 1.5rem;
}


.top-grid {
  display: flex;
  flex-direction: row;
}


.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns */
  gap: 1rem;
}



.stats-panel,
.upload-panel {
  display: flex;
  flex-direction: column;
}


.upload-panel {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: var(--card-shadow);
  width: 50%;
}


.stats-panel {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: var(--card-shadow);
  width: 50%;
}

.upload-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-buttons {
  display: flex;
  justify-content: space-between;
}

.upload-preview-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-preview-scroll {
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  background: var(--surface-card);
  box-shadow: var(--card-shadow);
  padding: 0.5rem;
}


.upload-preview-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}


.upload-preview {
  max-height: min(300px, 30vh);
 /* Or however tall you want it */
  overflow-y: auto;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 0.75rem;
  background: var(--surface-card);
  box-shadow: var(--card-shadow);
}

/* Let this take all leftover space, but scroll only inside itself */
.best-laps-table {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* Optional: tighter PrimeVue card padding */
.p-card-content {
  padding: 1rem !important;
}

.set-watch-path {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--surface-border);
}


</style>