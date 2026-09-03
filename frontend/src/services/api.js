import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    return res.data;
  },
};

export const componentsApi = {
  getAll: async () => {
    const res = await api.get('/components');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/components/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/components', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/components/${id}`, data);
    return res.data;
  },
};

export const suppliersApi = {
  getAll: async () => {
    const res = await api.get('/suppliers');
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/suppliers/${id}`);
    return res.data;
  },
};

export const recommendationsApi = {
  calculate: async (component_id, service_target = 0.95, simulation_runs = 10000) => {
    const res = await api.post('/recommendations/calculate', {
      component_id,
      service_target,
      simulation_runs,
    });
    return res.data;
  },
  approve: async (component_id, user_id, reason) => {
    const res = await api.post(`/recommendations/${component_id}/approve`, { user_id, reason });
    return res.data;
  },
  modify: async (component_id, user_id, reason, modified_reorder_point, modified_order_quantity) => {
    const res = await api.post(`/recommendations/${component_id}/modify`, {
      user_id,
      reason,
      modified_reorder_point,
      modified_order_quantity,
    });
    return res.data;
  },
  reject: async (component_id, user_id, reason) => {
    const res = await api.post(`/recommendations/${component_id}/reject`, { user_id, reason });
    return res.data;
  },
};

export const simulationApi = {
  run: async (payload) => {
    const res = await api.post('/simulation/run', payload);
    return res.data;
  },
};

export const comparisonApi = {
  getLatest: async () => {
    const res = await api.get('/comparison/latest');
    return res.data;
  },
};

export const auditApi = {
  getLogs: async (component_id = null, plan_id = null) => {
    const params = {};
    if (component_id) params.component_id = component_id;
    if (plan_id) params.plan_id = plan_id;
    const res = await api.get('/audit', { params });
    return res.data;
  },
  getPlanHistory: async (plan_id) => {
    const res = await api.get(`/audit/${plan_id}`);
    return res.data;
  },
};

export const failureCasesApi = {
  testSupplierDelay: async (component_id = 'COMP-001', actual_lead_time = 15) => {
    const res = await api.post(`/failure-cases/supplier-delay?component_id=${component_id}&actual_lead_time=${actual_lead_time}`);
    return res.data;
  },
  testPartialDelivery: async (component_id = 'COMP-001', fill_rate = 0.6) => {
    const res = await api.post(`/failure-cases/partial-delivery?component_id=${component_id}&fill_rate=${fill_rate}`);
    return res.data;
  },
  testDemandSpike: async (component_id = 'COMP-001', spike_demand = 250) => {
    const res = await api.post(`/failure-cases/demand-spike?component_id=${component_id}&spike_demand=${spike_demand}`);
    return res.data;
  },
  testInvalidPackSize: async (invalid_pack_size = 0) => {
    const res = await api.post(`/failure-cases/invalid-pack-size?invalid_pack_size=${invalid_pack_size}`);
    return res.data;
  },
  testSupplierDisruption: async (supplier_id = 'SUP-001') => {
    const res = await api.post(`/failure-cases/supplier-disruption?supplier_id=${supplier_id}`);
    return res.data;
  },
};

export const trackingApi = {
  getLiveTracking: async (component_id) => {
    const res = await api.get(`/tracking/${component_id}`);
    return res.data;
  },
  getActiveShipments: async () => {
    const res = await api.get('/tracking/active');
    return res.data;
  },
};

export default api;
