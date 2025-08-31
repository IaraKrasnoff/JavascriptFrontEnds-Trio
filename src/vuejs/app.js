const API = 'http://localhost:8000';
const { createApp, ref, reactive, computed, onMounted } = Vue;

createApp({
  setup() {
    const masters = ref([]);
    const details = ref([]);
    const selectedMasterId = ref(null);
    const selectedMaster = computed(() =>
      masters.value.find((m) => m.id === selectedMasterId.value)
    );
    const newMasterName = ref('');
    const newDetailDesc = ref('');
    const editingMaster = ref(null);
    const editingDetail = ref(null);
    const loading = ref(false);
    const error = ref('');

    async function fetchMasters() {
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch(`${API}/masters`);
        masters.value = await res.json();
      } catch (e) {
        error.value = 'Failed to load masters';
      } finally {
        loading.value = false;
      }
    }

    async function fetchDetails(masterId) {
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch(`${API}/masters/${masterId}/details`);
        details.value = await res.json();
      } catch (e) {
        error.value = 'Failed to load details';
      } finally {
        loading.value = false;
      }
    }

    function selectMaster(id) {
      selectedMasterId.value = id;
      fetchDetails(id);
    }

    async function addMaster() {
      if (!newMasterName.value.trim()) return;
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch(`${API}/masters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newMasterName.value }),
        });
        if (!res.ok) throw new Error();
        await fetchMasters();
        newMasterName.value = '';
      } catch (e) {
        error.value = 'Failed to add master';
      } finally {
        loading.value = false;
      }
    }

    function editMaster(master) {
      editingMaster.value = { ...master };
    }
    function cancelEditMaster() {
      editingMaster.value = null;
    }
    async function updateMaster() {
      if (!editingMaster.value.name.trim()) return;
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch(`${API}/masters/${editingMaster.value.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editingMaster.value.name }),
        });
        if (!res.ok) throw new Error();
        await fetchMasters();
        editingMaster.value = null;
      } catch (e) {
        error.value = 'Failed to update master';
      } finally {
        loading.value = false;
      }
    }
    async function deleteMaster(id) {
      if (!confirm('Delete this master?')) return;
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch(`${API}/masters/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        if (selectedMasterId.value === id) selectedMasterId.value = null;
        await fetchMasters();
        details.value = [];
      } catch (e) {
        error.value = 'Failed to delete master';
      } finally {
        loading.value = false;
      }
    }

    async function addDetail() {
      if (!newDetailDesc.value.trim() || !selectedMasterId.value) return;
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch(`${API}/details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            master_id: selectedMasterId.value,
            description: newDetailDesc.value,
          }),
        });
        if (!res.ok) throw new Error();
        await fetchDetails(selectedMasterId.value);
        newDetailDesc.value = '';
      } catch (e) {
        error.value = 'Failed to add detail';
      } finally {
        loading.value = false;
      }
    }
    function editDetail(detail) {
      editingDetail.value = { ...detail };
    }
    function cancelEditDetail() {
      editingDetail.value = null;
    }
    async function updateDetail() {
      if (!editingDetail.value.description.trim()) return;
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch(`${API}/details/${editingDetail.value.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            master_id: selectedMasterId.value,
            description: editingDetail.value.description,
          }),
        });
        if (!res.ok) throw new Error();
        await fetchDetails(selectedMasterId.value);
        editingDetail.value = null;
      } catch (e) {
        error.value = 'Failed to update detail';
      } finally {
        loading.value = false;
      }
    }
    async function deleteDetail(id) {
      if (!confirm('Delete this detail?')) return;
      loading.value = true;
      error.value = '';
      try {
        const res = await fetch(`${API}/details/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        await fetchDetails(selectedMasterId.value);
      } catch (e) {
        error.value = 'Failed to delete detail';
      } finally {
        loading.value = false;
      }
    }

    onMounted(fetchMasters);

    return {
      masters,
      details,
      selectedMasterId,
      selectedMaster,
      newMasterName,
      newDetailDesc,
      editingMaster,
      editingDetail,
      loading,
      error,
      selectMaster,
      addMaster,
      editMaster,
      cancelEditMaster,
      updateMaster,
      deleteMaster,
      addDetail,
      editDetail,
      cancelEditDetail,
      updateDetail,
      deleteDetail,
    };
  },
}).mount('#app');
