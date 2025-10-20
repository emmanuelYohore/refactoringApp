<template>
  <div class="home-container">
    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <h2>Services</h2>
          <div v-if="services.length === 0" class="text-center">
            Aucun service disponible
          </div>
          <div v-for="service in services" :key="service.id" class="service-item">
            <h3>#{{ service.id.replace('svc_', '') }} {{ service.name }} ({{ service.type }})</h3>
            <div class="creneaux-list">
              <span>Créneaux:</span>
              <span class="creneaux-details">{{ getFormattedSlots(service.id) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <h2>Réserver</h2>
          <div class="reservation-form">
            <div class="form-group">
              <label for="serviceId">Service ID:</label>
              <input 
                type="text" 
                id="serviceId" 
                v-model="reservationForm.serviceId" 
                class="form-control" 
                placeholder="1"
                @input="updateAvailableSlots"
              />
            </div>
            
            <div class="form-group">
              <label for="creneauTime">Creneau:</label>
              <select
                id="creneauTime"
                v-model="reservationForm.selectedSlotId"
                class="form-control"
                :disabled="!availableSlots.length"
              >
                <option value="" disabled selected>Sélectionnez un créneau</option>
                <option v-for="slot in availableSlots" :key="slot.id" :value="slot.id">
                  {{ formatDateTime(slot.datetime) }}
                </option>
              </select>
            </div>
            
            <div class="d-flex mt-2">
              <button @click="makeReservationByForm" class="btn btn-primary">Réserver</button>
              <button @click="updateAvailableSlots" class="btn btn-outline-secondary ms-2">
                Rafraîchir les créneaux
              </button>
            </div>
            
            <div v-if="reservationForm.serviceId && !availableSlots.length" class="alert alert-warning mt-3">
              Aucun créneau disponible pour ce service
            </div>
          </div>
          
          <div v-if="error" class="error-message mt-3">{{ error }}</div>
          <div v-if="success" class="success-message mt-3">{{ success }}</div>
          
          <div class="mt-4">
            <router-link to="/my-reservations" class="btn btn-outline-primary">
              Voir mes réservations
            </router-link>
            <div v-if="userStore.isAdmin" class="mt-2">
              <router-link to="/admin" class="btn btn-outline-secondary">
                Panneau d'administration
              </router-link>
              <button @click="resetLocalStorage" class="btn btn-outline-danger mt-2">
                Réinitialiser les données
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card">
          <h2>Mes réservations</h2>
          <div v-if="userReservations.length === 0" class="text-center">
            (aucune)
          </div>
          <div v-else>
            <ul class="reservation-list">
              <li v-for="reservation in userReservations" :key="reservation.id">
                {{ getServiceName(reservation.serviceId) }} - 
                {{ formatDateTime(getSlotDateTime(reservation.slotId)) }}
                <button 
                  @click="cancelReservation(reservation.id)" 
                  class="btn btn-sm btn-danger ms-2"
                  :disabled="isSlotPassed(reservation.slotId)"
                >
                  Annuler
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useServiceStore } from '../store/service';
import { useUserStore } from '../store/user';

const serviceStore = useServiceStore();
const userStore = useUserStore();

const services = computed(() => serviceStore.services);
const error = ref('');
const success = ref('');

const reservationForm = ref({
  serviceId: '',
  selectedSlotId: ''
});

const availableSlots = ref([]);

const userReservations = computed(() => {
  return serviceStore.getUserReservations;
});

const updateAvailableSlots = () => {
  availableSlots.value = [];
  error.value = '';
  
  if (!reservationForm.value.serviceId) {
    return;
  }
  
  const serviceId = reservationForm.value.serviceId.includes('svc_') 
    ? reservationForm.value.serviceId 
    : `svc_${reservationForm.value.serviceId}`;
  
  const service = serviceStore.services.find(s => s.id === serviceId);
  if (service) {
    const slots = getServiceSlots(service.id);
    availableSlots.value = slots;
  }
};

const getServiceSlots = (serviceId) => {
  const now = new Date();
  
  // Pour 2025 et après, ne pas filtrer par date (pour faciliter les démonstrations)
  if (now.getFullYear() >= 2025) {
    return serviceStore.slots.filter(slot => slot.serviceId === serviceId);
  } else {
    return serviceStore.slots.filter(slot => {
      const slotDate = new Date(slot.datetime);
      return slot.serviceId === serviceId && slotDate > now;
    });
  }
};

const getSlotAvailability = (slotId) => {
  return serviceStore.getSlotAvailability(slotId);
};

const formatDateTime = (datetime) => {
  return serviceStore.formatDateTime(datetime);
};

const formatDateTimeShort = (datetime) => {
  const date = new Date(datetime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatDateTimeForForm = (datetime) => {
  const date = new Date(datetime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const getFormattedSlots = (serviceId) => {
  const slots = getServiceSlots(serviceId);
  if (slots.length === 0) return 'Aucun créneau disponible';
  
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = new Date(slot.datetime);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(timeStr);
    return acc;
  }, {});
  
  return Object.entries(slotsByDate)
    .map(([date, times]) => {
      return `${date} ${times.join(', ')}`;
    })
    .join('\n');
};

const getServiceName = (serviceId) => {
  const service = serviceStore.services.find(s => s.id === serviceId);
  return service ? service.name : 'Service inconnu';
};

const getSlotDateTime = (slotId) => {
  const slot = serviceStore.slots.find(s => s.id === slotId);
  return slot ? slot.datetime : 'Date inconnue';
};

const isSlotPassed = (slotId) => {
  const slot = serviceStore.slots.find(s => s.id === slotId);
  if (!slot) return true;
  
  return new Date(slot.datetime) < new Date();
};

const makeReservationByForm = () => {
  error.value = '';
  success.value = '';
  
  if (!reservationForm.value.serviceId || !reservationForm.value.selectedSlotId) {
    error.value = 'Veuillez remplir tous les champs et sélectionner un créneau';
    return;
  }
  
  const serviceId = reservationForm.value.serviceId.includes('svc_') 
    ? reservationForm.value.serviceId 
    : `svc_${reservationForm.value.serviceId}`;
  
  const service = serviceStore.services.find(s => s.id === serviceId);
  if (!service) {
    error.value = `Service avec ID ${reservationForm.value.serviceId} introuvable`;
    return;
  }
  
  const slotId = reservationForm.value.selectedSlotId;
  const slot = serviceStore.slots.find(s => s.id === slotId);
  
  if (!slot) {
    error.value = `Créneau sélectionné non trouvé`;
    return;
  }
  
  try {
    serviceStore.makeReservation(slotId);
    success.value = 'Réservation effectuée avec succès';
    reservationForm.value.selectedSlotId = '';
    
    updateAvailableSlots();
    
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (e) {
    error.value = e.message;
    setTimeout(() => {
      error.value = '';
    }, 3000);
  }
};

const cancelReservation = (reservationId) => {
  try {
    serviceStore.cancelReservation(reservationId);
    success.value = 'Réservation annulée avec succès';
    error.value = '';
    
    setTimeout(() => {
      success.value = '';
    }, 3000);
  } catch (e) {
    error.value = e.message;
    setTimeout(() => {
      error.value = '';
    }, 3000);
  }
};

const resetLocalStorage = () => {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données? Cette action est irréversible.')) {
    localStorage.removeItem('appData');
    success.value = 'Données réinitialisées. La page va se recharger.';
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }
};
</script>

<style scoped>
.service-item {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.service-item h3 {
  margin-top: 0;
  font-size: 1.1rem;
}

.creneaux-list {
  font-size: 0.9rem;
  color: #555;
  margin-left: 0;
}

.creneaux-details {
  white-space: pre-line;
  display: block;
  margin-top: 4px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.reservation-list {
  list-style-type: none;
  padding: 0;
}

.reservation-list li {
  padding: 8px;
  margin-bottom: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.success-message {
  color: #28a745;
  padding: 8px;
  background-color: #d4edda;
  border-radius: 4px;
}

.error-message {
  color: #dc3545;
  padding: 8px;
  background-color: #f8d7da;
  border-radius: 4px;
}

.home-container {
  margin-top: 20px;
}

.card {
  height: 100%;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .card {
    margin-bottom: 20px;
  }
}
</style>