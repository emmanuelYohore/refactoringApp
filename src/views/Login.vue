<template>
  <div class="login-container">
    <div class="card">
      <h2>Connexion</h2>
      <div class="form-group">
        <label for="email">Votre email (login bricolé):</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          class="form-control" 
          placeholder="Email"
          @keyup.enter="login"
        />
      </div>
      <button @click="login" class="btn btn-primary">Se connecter</button>
      
      <div class="mt-3 text-info">
        <small>Note: Utilisez admin@gmail.com pour accéder aux fonctions d'administration</small>
      </div>
      
      <div v-if="error" class="error-message mt-3">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';

const email = ref('');
const error = ref('');
const router = useRouter();
const userStore = useUserStore();

const login = () => {
  if (!email.value) {
    error.value = 'Veuillez entrer une adresse email';
    return;
  }
  
  if (!email.value.includes('@')) {
    error.value = 'Veuillez entrer une adresse email valide';
    return;
  }
  
  userStore.login(email.value);
  router.push('/');
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.card {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}
</style>