<template>
  <div class="my-reservations-container">
    <h2>Mes réservations</h2>
    
    <div v-if="userReservations.length === 0" class="alert alert-info">
      Vous n'avez pas encore de réservations
    </div>
    
    <div v-else class="reservations-list">
      <div v-for="reservation in userReservations" :key="reservation.id" class="reservation-item">
        <div class="reservation-details">
          <h3>{{ getServiceName(reservation.serviceId) }}</h3>
          <p><strong>Date et heure:</strong> {{ formatDateTime(getSlotDateTime(reservation.slotId)) }}</p>
          <p><strong>Réservé le:</strong> {{ formatDateTime(reservation.createdAt) }}</p>
        </div>
        <div class="reservation-actions">
          <button 
            @click="cancelReservation(reservation.id)" 
            class="btn btn-danger"
            :disabled="isSlotPassed(reservation.slotId)"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message mt-3">{{ error }}</div>
    <div v-if="success" class="success-message mt-3">{{ success }}</div>
    
    <div class="mt-4">
      <router-link to="/" class="btn btn-primary">Retour aux services</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useServiceStore } from '../store/service';

const serviceStore = useServiceStore();
const error = ref('');
const success = ref('');

const userReservations = computed(() => {
  return serviceStore.getUserReservations;
});

const getServiceName = (serviceId) => {
  const service = serviceStore.services.find(s => s.id === serviceId);
  return service ? service.name : 'Service inconnu';
};

const getSlotDateTime = (slotId) => {
  const slot = serviceStore.slots.find(s => s.id === slotId);
  return slot ? slot.datetime : 'Date inconnue';
};

const formatDateTime = (datetime) => {
  return serviceStore.formatDateTime(datetime);
};

const isSlotPassed = (slotId) => {
  const slot = serviceStore.slots.find(s => s.id === slotId);
  if (!slot) return true;
  
  return new Date(slot.datetime) < new Date();
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
</script>

<style scoped>
.my-reservations-container {
  padding: 20px;
}

.reservations-list {
  margin-top: 20px;
}

.reservation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f9f9f9;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.reservation-details {
  flex: 1;
}

.reservation-details h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.reservation-actions {
  margin-left: 20px;
}

.success-message {
  color: #28a745;
  padding: 8px;
  background-color: #d4edda;
  border-radius: 4px;
}
</style>