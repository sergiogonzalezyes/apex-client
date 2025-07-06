<template>
  <Card class="stats-card">
    <template #content>
      <div class="stat-content">
        <div class="stat-info">
          <span class="stat-label">{{ label }}</span>
          <span class="stat-value">{{ value }}</span>
          <div v-if="subtitle" class="stat-subtitle">{{ subtitle }}</div>
        </div>
        <div class="stat-icon">
          <i :class="['pi', icon]"></i>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  value: [String, Number],
  subtitle: String,
});
</script>

<style scoped>
.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary-color);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.stat-subtitle {
  font-size: 0.7rem;
  color: var(--text-color-secondary);
}

.stat-icon {
  font-size: 1.25rem;
  color: var(--primary-color);
}
</style>
