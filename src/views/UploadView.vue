<template>
  <div class="p-4">
    <h2 class="text-xl mb-4">Upload Lap Files</h2>
    <DropZone @files-dropped="handleFiles" />

    <div v-if="parsedSessions.length" class="mt-6">
      <h3 class="text-lg mb-2">Parsed Sessions:</h3>

      <SessionGrid
        :sessions="parsedSessions"
        v-model:selected="selectedSessions"
      />

      <div class="mt-4 flex gap-2 justify-end">
        <Button
          label="Track Selected"
          icon="pi pi-check"
          :disabled="selectedSessions.length === 0"
          @click="trackSelected"
        />
        <Button
          label="Track All"
          icon="pi pi-list"
          @click="trackAll"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import DropZone from '../components/DropZone.vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ini from 'ini';
import Button from 'primevue/button';
import SessionGrid from '../components/SessionGrid.vue';

const router = useRouter();
const parsedSessions = ref([]);
const selectedSessions = ref([]);

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
            track: data.track ?? 'unknown',
            car: data.players?.[0]?.car ?? 'unknown',
            laps: data.sessions?.[0]?.laps ?? [],
          };
        } else if (name.endsWith('.ini')) {
          const data = ini.parse(text);
          const car = data.RACE?.MODEL ?? data['CAR_0']?.MODEL ?? 'unknown';
          const track = data.RACE?.TRACK ?? 'unknown';
          const bestTime = data.extras?.[0]?.time ?? data['bestlap'] ?? null;

          parsed = {
            track,
            car,
            laps: bestTime ? [{ time: bestTime }] : [],
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

  const [_, yy, mm, dd, hh, min, ss] = match;
  return `20${yy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function prepareUploadPayload(sessions) {
  return sessions
    .map(session => {
      const validLaps = (session.laps || [])
        .filter(lap => lap.time && lap.time > 0)
        .map(lap => ({
          lap_time: lap.time,
          sectors: lap.sectors ?? [],
          valid: true,
        }));

      if (validLaps.length === 0) return null;

      return {
        track: session.track,
        car: session.car,
        laps: validLaps,
      };
    })
    .filter(Boolean);
}

async function trackSelected() {
  if (selectedSessions.value.length === 0) return;

  try {
    const res = await fetch('http://localhost:3000/api/laps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessions: selectedSessions.value }),
    });

    const result = await res.json();
    console.log('Track selected response:', result);
    router.push('/results');
  } catch (err) {
    console.error('Error sending selected sessions:', err);
    alert('Failed to send selected sessions to server.');
  }
}

async function trackAll() {
  try {
    const res = await fetch('http://localhost:3000/api/laps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessions: parsedSessions.value }),
    });

    const result = await res.json();
    console.log('Track all response:', result);
    router.push('/results');
  } catch (err) {
    console.error('Error sending all sessions:', err);
    alert('Failed to send all sessions to server.');
  }
}

</script>
