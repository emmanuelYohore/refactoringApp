import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';

import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import AdminPanel from '../views/AdminPanel.vue';
import MyReservations from '../views/MyReservations.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: AdminPanel,
    meta: { requiresAdmin: true }
  },
  {
    path: '/my-reservations',
    name: 'MyReservations',
    component: MyReservations,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login' });
    return;
  }
  
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ name: 'Home' });
    return;
  }
  
  if (to.name === 'Login' && userStore.isLoggedIn) {
    next({ name: 'Home' });
    return;
  }
  
  next();
});

export default router;