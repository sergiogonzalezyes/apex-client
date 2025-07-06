<template>
  <div class="layout-container min-h-screen flex flex-col">
    <AppTopbar />
    
    <main class="flex-grow p-4 bg-surface-ground">
      <RouterView />
    </main>

    <!-- <AppFooter /> -->
  </div>
</template>







<!-- <script setup>
import AppTopbar from "./components/AppTopbar.vue";
import AppFooter from "./components/AppFooter.vue";
import StatsWidget from "./components/dashboard/StatsWidget.vue";
import SalesTrendWidget from "./components/dashboard/SalesTrendWidget.vue";
import RecentActivityWidget from "./components/dashboard/RecentActivityWidget.vue";
import ProductOverviewWidget from "./components/dashboard/ProductOverviewWidget.vue";
</script>

<template>
    <div class="layout-container">
        <AppTopbar />
        <div class="layout-grid">
            <StatsWidget />
            <div class="layout-grid-row">
                <SalesTrendWidget />
                <RecentActivityWidget />
            </div>
            <ProductOverviewWidget />
        </div>
        <AppFooter />
    </div>
</template> -->

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Optional: remove default padding/margin that may sneak in */
:global(html),
:global(body) {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}
</style>


