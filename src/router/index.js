import { createRouter, createWebHistory } from 'vue-router';
import LapDashboard from '../views/LapDashboard.vue';
import ResultsView from '../views/ResultsView.vue';

const routes = [
  {
    path: '/',
    name: 'LapDashboard',
    component: LapDashboard
  },
  {
    path: '/results',
    name: 'Results',
    component: ResultsView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
