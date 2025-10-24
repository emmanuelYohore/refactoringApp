<template>
  <div class="admin-container">
    <h2>Admin (pas sécurisé)</h2>
    
    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <h3>Ajouter un service</h3>
          <div class="form-group">
            <label for="serviceName">Nom du service:</label>
            <input type="text" id="serviceName" v-model="newService.name" class="form-control" />
          </div>
          
          <div class="form-group">
            <label for="serviceType">Type:</label>
            <select id="serviceType" v-model="newService.type" class="form-control">
              <option value="room">Room</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="serviceDescription">Description:</label>
            <textarea id="serviceDescription" v-model="newService.description" class="form-control"></textarea>
          </div>
          
          <div class="form-group">
            <label for="serviceDuration">Durée (minutes):</label>
            <input type="number" id="serviceDuration" v-model="newService.duration" class="form-control" />
          </div>
          
          <button @click="addService" class="btn btn-primary">Ajouter service</button>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card">
          <h3>Ajouter un créneau</h3>
          <div class="form-group">
            <label for="slotService">Service:</label>
            <select id="slotService" v-model="newSlot.serviceId" class="form-control">
              <option v-for="service in services" :key="service.id" :value="service.id">
                {{ service.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="slotDatetime">Date et heure:</label>
            <input type="datetime-local" id="slotDatetime" v-model="newSlot.datetime" class="form-control" />
          </div>
          
          <div class="form-group">
            <label for="slotCapacity">Capacité:</label>
            <input type="number" id="slotCapacity" v-model="newSlot.capacity" class="form-control" min="1" />
          </div>
          
          <button @click="addSlot" class="btn btn-primary">Ajouter créneau</button>
        </div>
      </div>
    </div>
    
    <div class="card mt-4">
      <h3>Gestion des créneaux</h3>
      <div v-if="services.length === 0" class="alert alert-info">
        Aucun service disponible
      </div>
      <div v-else>
        <div v-for="service in services" :key="service.id" class="service-item">
          <h4>{{ service.name }}</h4>
          <div v-if="getServiceSlots(service.id).length === 0" class="text-muted">
            Aucun créneau pour ce service
          </div>
          <div v-else class="slot-list">
            <div v-for="slot in getServiceSlots(service.id)" :key="slot.id" class="slot-item">
              <span>{{ formatDateTime(slot.datetime) }}</span>
              <span class="slot-capacity">Capacité: {{ slot.capacity }}</span>
              <button @click="removeSlot(slot.id)" class="btn btn-danger btn-sm">Supprimer</button>
            </div>
          </div>
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

const services = computed(() => serviceStore.services);

const newService = ref({
  name: '',
  type: 'room',
  description: '',
  duration: 60
});

const newSlot = ref({
  serviceId: '',
  datetime: '',
  capacity: 1
});

const getServiceSlots = (serviceId) => {
  return serviceStore.slots.filter(slot => slot.serviceId === serviceId);
};

const formatDateTime = (datetime) => {
  return serviceStore.formatDateTime(datetime);
};

const addService = () => {
  if (!newService.value.name) {
    error.value = 'Le nom du service est obligatoire';
    setTimeout(() => { error.value = ''; }, 3000);
    return;
  }
  
  try {
    serviceStore.addService(
      newService.value.name,
      newService.value.type,
      newService.value.description,
      newService.value.duration
    );
    
    success.value = 'Service ajouté avec succès';
    newService.value = {
      name: '',
      type: 'room',
      description: '',
      duration: 60
    };
    
    setTimeout(() => { success.value = ''; }, 3000);
  } catch (e) {
    error.value = e.message;
    setTimeout(() => { error.value = ''; }, 3000);
  }
};

const addSlot = () => {
  if (!newSlot.value.serviceId) {
    error.value = 'Veuillez sélectionner un service';
    setTimeout(() => { error.value = ''; }, 3000);
    return;
  }
  
  if (!newSlot.value.datetime) {
    error.value = 'Veuillez sélectionner une date et une heure';
    setTimeout(() => { error.value = ''; }, 3000);
    return;
  }
  
  try {
    const dateObj = new Date(newSlot.value.datetime);
    const isoDateTime = dateObj.toISOString();
    
    if (isNaN(dateObj.getTime())) {
      throw new Error("La date n'est pas valide");
    }
    
    const slotId = serviceStore.addSlot(
      newSlot.value.serviceId,
      isoDateTime,
      newSlot.value.capacity
    );
    
    success.value = `Créneau ajouté avec succès`;
    newSlot.value.datetime = '';
    
    setTimeout(() => { success.value = ''; }, 3000);
  } catch (e) {
    error.value = `Erreur: ${e.message}`;
    setTimeout(() => { error.value = ''; }, 3000);
  }
};

const removeSlot = (slotId) => {
  try {
    serviceStore.removeSlot(slotId);
    success.value = 'Créneau supprimé avec succès';
    setTimeout(() => { success.value = ''; }, 3000);
  } catch (e) {
    error.value = e.message;
    setTimeout(() => { error.value = ''; }, 3000);
  }
};
</script>

<style scoped>
.admin-container {
  padding: 20px;
}

.card {
  margin-bottom: 20px;
  padding: 15px;
}

.service-item {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 5px;
}

.slot-list {
  margin-top: 10px;
}

.slot-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 5px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.slot-capacity {
  margin-left: auto;
  margin-right: 10px;
  font-size: 0.9em;
  color: #555;
}

.success-message {
  color: #28a745;
  padding: 8px;
  background-color: #d4edda;
  border-radius: 4px;
}
</style>