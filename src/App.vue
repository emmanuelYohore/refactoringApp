<template>
  <div class="app-container">
    <header>
      <h1>Application de gestion de services</h1>
      <div v-if="userStore.isLoggedIn" class="user-info">
        Rôle: {{ userStore.isAdmin ? 'admin' : 'anon' }} | {{ userStore.email }}
        <button @click="logout" class="btn btn-sm btn-outline-secondary ms-2">Déconnexion</button>
      </div>
    </header>
    
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useUserStore } from './store/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const logout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #f8f9fa;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dee2e6;
}

header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
}

main {
  flex: 1;
  padding: 20px;
}
</style>