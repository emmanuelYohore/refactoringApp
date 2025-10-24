import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useUserStore } from './user';

export const useServiceStore = defineStore('service', () => {
  const services = ref([]);
  const slots = ref([]);
  const reservations = ref([]);

  function addService(name, type, description, duration) {
    const maxId = services.value.length > 0
    ? Math.max(...services.value.map(s => parseInt(s.id.replace('svc_', '')) || 0))
    : 0;
    const id = `svc_${maxId + 1}`;
    services.value.push({
      id,
      name,
      type,
      description,
      duration: parseInt(duration) || 60
    });
    saveToLocalStorage();
  }

  function addSlot(serviceId, datetime, capacity = 1) {
    const id = `slt_${Date.now().toString()}`;
    
    let formattedDateTime;
    try {
      const dateObj = new Date(datetime);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Date invalide");
      }
      
      formattedDateTime = dateObj.toISOString();
    } catch (e) {
      throw new Error("Format de date invalide. Utilisez un format valide (YYYY-MM-DDTHH:MM)");
    }
    
    slots.value.push({
      id,
      serviceId,
      datetime: formattedDateTime,
      capacity: parseInt(capacity) || 1
    });
    
    saveToLocalStorage();
    return id; 
  }

  function removeSlot(slotId) {
    slots.value = slots.value.filter(slot => slot.id !== slotId);
    saveToLocalStorage();
  }

  function makeReservation(slotId) {
    const userStore = useUserStore();
    const userEmail = userStore.email;
    
    const existingReservation = reservations.value.find(
      res => res.slotId === slotId && res.userEmail === userEmail
    );
    
    if (existingReservation) {
      throw new Error('Vous avez déjà une réservation pour ce créneau');
    }
    
    const slot = slots.value.find(s => s.id === slotId);
    
    if (!slot) {
      throw new Error('Ce créneau n\'existe pas');
    }
    
    const reservationsForSlot = reservations.value.filter(res => res.slotId === slotId);
    
    if (reservationsForSlot.length >= slot.capacity) {
      throw new Error('Ce créneau est complet');
    }
    
    const slotDate = new Date(slot.datetime);
    const now = new Date();
    
    if (slotDate < now) {
      throw new Error('Impossible de réserver un créneau passé');
    }
    
    const id = `res_${Date.now().toString()}`;
    const newReservation = {
      id,
      slotId,
      serviceId: slot.serviceId,
      userEmail,
      createdAt: new Date().toISOString()
    };
    
    reservations.value.push(newReservation);
    
    saveToLocalStorage();
    return id;
  }

  function cancelReservation(reservationId) {
    const userStore = useUserStore();
    const reservation = reservations.value.find(res => res.id === reservationId);
    
    if (!reservation) {
      throw new Error('Cette réservation n\'existe pas');
    }
    
    if (reservation.userEmail !== userStore.email && !userStore.isAdmin) {
      throw new Error('Vous ne pouvez pas annuler cette réservation');
    }
    
    const slot = slots.value.find(s => s.id === reservation.slotId);
    if (slot) {
      const slotDate = new Date(slot.datetime);
      const now = new Date();
      if (slotDate < now && !userStore.isAdmin) {
        throw new Error('Impossible d\'annuler une réservation passée');
      }
    }
    
    reservations.value = reservations.value.filter(res => res.id !== reservationId);
    saveToLocalStorage();
  }

  const getUserReservations = computed(() => {
    const userStore = useUserStore();
    return reservations.value.filter(res => res.userEmail === userStore.email);
  });

  const getServiceSlots = computed(() => (serviceId) => {
    return slots.value.filter(slot => slot.serviceId === serviceId);
  });

  const getSlotAvailability = computed(() => (slotId) => {
    const slot = slots.value.find(s => s.id === slotId);
    if (!slot) return { available: 0, total: 0 };
    
    const reservationsForSlot = reservations.value.filter(res => res.slotId === slotId);
    return {
      available: slot.capacity - reservationsForSlot.length,
      total: slot.capacity
    };
  });

  function formatDateTime(datetime) {
    const date = new Date(datetime);
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function loadFromLocalStorage() {
    const storedData = localStorage.getItem('appData');
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        services.value = data.services || [];
        slots.value = data.slots || [];
        reservations.value = data.reservations || [];
      } catch (error) {
        console.error('Erreur lors du parsing des données:', error);
      }
    } else {
      fetch('/data/data.json')
        .then(response => response.json())
        .then(data => {
          services.value = data.services;
          slots.value = data.slots;
          reservations.value = data.reservations;
          saveToLocalStorage();
        })
        .catch(error => {
          console.error('Erreur lors du chargement des données:', error);
        });
    }
  }

  function saveToLocalStorage() {
    const data = {
      services: services.value,
      slots: slots.value,
      reservations: reservations.value
    };
    localStorage.setItem('appData', JSON.stringify(data));
  }

  loadFromLocalStorage();

  return {
    services,
    slots,
    reservations,
    addService,
    addSlot,
    removeSlot,
    makeReservation,
    cancelReservation,
    getUserReservations,
    getServiceSlots,
    getSlotAvailability,
    formatDateTime
  };
});