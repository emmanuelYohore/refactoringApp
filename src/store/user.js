import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  const email = ref(localStorage.getItem('userEmail') || '');
  const role = ref(localStorage.getItem('userRole') || '');
  const users = ref([]);
  
  const isAdmin = computed(() => role.value === 'admin');
  const isLoggedIn = computed(() => !!email.value);

  function loadUsers() {
    if (users.value.length === 0) {
      fetch('/data/data.json')
        .then(response => response.json())
        .then(data => {
          users.value = data.users || [];
        })
        .catch(error => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
        });
    }
  }

  function getUserRole(userEmail) {
    const user = users.value.find(u => u.email === userEmail);
    return user ? user.role : 'user';
  }

  function login(userEmail) {
    const userRole = getUserRole(userEmail);
    
    email.value = userEmail;
    role.value = userRole;
    
    localStorage.setItem('userEmail', userEmail);
    localStorage.setItem('userRole', userRole);
  }

  function logout() {
    email.value = '';
    role.value = '';
    
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
  }

  loadUsers();

  return {
    email,
    role,
    users,
    isAdmin,
    isLoggedIn,
    login,
    logout,
    loadUsers
  };
});