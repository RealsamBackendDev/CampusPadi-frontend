import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campuspadi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('campuspadi_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');

export const updateProfile = (data) => api.patch('/students/profile', data);
export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/students/profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getMyStats = () => api.get('/students/stats');
export const getMyReviews = () => api.get('/students/reviews');
export const getStudentById = (id) => api.get(`/students/${id}`);

export const registerArtisan = (data) => api.post('/artisans', data);
export const searchArtisans = (params) => api.get('/artisans', { params });
export const getArtisanById = (id) => api.get(`/artisans/${id}`);
export const uploadVerificationDoc = (id, file) => {
  const formData = new FormData();
  formData.append('document', file);
  return api.post(`/artisans/${id}/verify-doc`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const createServiceRequest = (data) => api.post('/services', data);
export const getMyRequests = (params) => api.get('/services/my-requests', { params });
export const getArtisanRequests = (params) => api.get('/services/artisan/requests', { params });
export const getRequestById = (id) => api.get(`/services/${id}`);
export const acceptRequest = (id) => api.patch(`/services/${id}/accept`);
export const startWork = (id) => api.patch(`/services/${id}/start`);
export const completeRequest = (id, price) => api.patch(`/services/${id}/complete`, { price });
export const cancelRequest = (id) => api.patch(`/services/${id}/cancel`);

export const createReview = (data) => api.post('/reviews', data);
export const getArtisanReviews = (artisanId, params) => 
  api.get(`/reviews/artisan/${artisanId}`, { params });

export const getDashboardStats = () => api.get('/admin/dashboard');
export const getAllStudents = (params) => api.get('/admin/students', { params });
export const getAllArtisans = (params) => api.get('/admin/artisans', { params });
export const verifyArtisan = (id) => api.patch(`/admin/artisans/${id}/verify`);
export const rejectArtisan = (id, reason) => api.patch(`/admin/artisans/${id}/reject`, { reason });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const uploadMaterial = (formData) => api.post('/materials', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const searchMaterials = (params) => api.get('/materials', { params });
export const getMaterialById = (id) => api.get(`/materials/${id}`);
export const downloadMaterial = (id) => api.get(`/materials/${id}/download`);
export const getMyMaterials = () => api.get('/materials/my-materials');
export const approveMaterial = (id) => api.patch(`/materials/${id}/approve`);
export const getPendingMaterials = () => api.get('/materials/pending');
export const deleteMaterial = (id) => api.delete(`/materials/${id}`);

export const registerVendor = (data) => api.post('/vendors', data);
export const getVendors = (params) => api.get('/vendors', { params });
export const getVendorById = (id) => api.get(`/vendors/${id}`);
export const verifyVendor = (id) => api.patch(`/vendors/${id}/verify`);
export const toggleVendorOpen = (id, isOpen) => api.patch(`/vendors/${id}/toggle-open`, { isOpen });

export const createMenuItem = (formData) => api.post('/menu', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const getMenuItems = (params) => api.get('/menu', { params });
export const updateMenuItem = (id, data) => api.patch(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

export const createFoodOrder = (data) => api.post('/food-orders', data);
export const getMyFoodOrders = (params) => api.get('/food-orders/my-orders', { params });
export const getVendorOrders = (vendorId, params) => api.get(`/food-orders/vendor/${vendorId}`, { params });
export const updateFoodOrderStatus = (id, status) => api.patch(`/food-orders/${id}/status`, { status });
export const getStudentSpecials = () => api.get('/food-orders/specials');
export const createAccommodation = (formData) => api.post('/accommodations', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const searchAccommodations = (params) => api.get('/accommodations', { params });
export const getAccommodationById = (id) => api.get(`/accommodations/${id}`);
export const getMyListings = (params) => api.get('/accommodations/my-listings', { params });
export const updateAvailability = (id, isAvailable) => api.patch(`/accommodations/${id}/availability`, { isAvailable });
export const deleteAccommodation = (id) => api.delete(`/accommodations/${id}`);
export const createInquiry = (data) => api.post('/accommodations/inquiry', data);
export const getMyInquiries = () => api.get('/accommodations/my-inquiries');
export const getListingInquiries = (id) => api.get(`/accommodations/${id}/inquiries`);
export const verifyAccommodation = (id) => api.patch(`/accommodations/${id}/verify`);
export const getPendingAccommodations = () => api.get('/accommodations/pending');
export const createProject = (data) => api.post('/projects', data);
export const searchProjects = (params) => api.get('/projects', { params });
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const applyToProject = (data) => api.post('/projects/apply', data);
export const respondToApplication = (applicationId, status) => api.patch(`/projects/applications/${applicationId}/respond`, { status });
export const getMyProjects = () => api.get('/projects/my-projects');
export const getMyApplications = () => api.get('/projects/my-applications');
export const closeProject = (id) => api.patch(`/projects/${id}/close`);
export const completeProject = (id) => api.patch(`/projects/${id}/complete`);
export const registerAsTutor = (data) => api.post('/tutors/register', data);
export const searchTutors = (params) => api.get('/tutors', { params });
export const getTutorById = (id) => api.get(`/tutors/${id}`);
export const bookSession = (data) => api.post('/tutors/book', data);
export const getMySessions = (params) => api.get('/tutors/sessions/my', { params });
export const getTutorSessions = (params) => api.get('/tutors/sessions/tutor', { params });
export const confirmSession = (id) => api.patch(`/tutors/sessions/${id}/confirm`);
export const completeSession = (id) => api.patch(`/tutors/sessions/${id}/complete`);
export const cancelSession = (id) => api.patch(`/tutors/sessions/${id}/cancel`);
export const verifyTutor = (id) => api.patch(`/tutors/${id}/verify`);
export const getPendingTutors = () => api.get('/tutors/pending');

export const createSquad = (data) => api.post('/resit-squads', data);
export const searchSquads = (params) => api.get('/resit-squads', { params });
export const getSquadById = (id) => api.get(`/resit-squads/${id}`);
export const joinSquad = (id) => api.post(`/resit-squads/${id}/join`);
export const getMySquads = () => api.get('/resit-squads/my-squads');
export const leaveSquad = (id) => api.delete(`/resit-squads/${id}/leave`);
export const createPool = (data) => api.post('/ride-pools', data);
export const searchPools = (params) => api.get('/ride-pools', { params });
export const getPoolById = (id) => api.get(`/ride-pools/${id}`);
export const joinPool = (id) => api.post(`/ride-pools/${id}/join`);
export const getMyPools = () => api.get('/ride-pools/my-pools');
export const leavePool = (id) => api.delete(`/ride-pools/${id}/leave`);
export const cancelPool = (id) => api.patch(`/ride-pools/${id}/cancel`);

export const createWalk = (data) => api.post('/safe-walks', data);
export const searchWalks = (params) => api.get('/safe-walks', { params });
export const getWalkById = (id) => api.get(`/safe-walks/${id}`);
export const joinWalk = (id) => api.post(`/safe-walks/${id}/join`);
export const checkIn = (id) => api.patch(`/safe-walks/${id}/check-in`);
export const getMyWalks = () => api.get('/safe-walks/my-walks');
export const leaveWalk = (id) => api.delete(`/safe-walks/${id}/leave`);
export const cancelWalk = (id) => api.patch(`/safe-walks/${id}/cancel`);
export const completeWalk = (id) => api.patch(`/safe-walks/${id}/complete`);
export const getPendingPrintShops = () => api.get('/print-shops/admin/pending');
export const verifyPrintShop = (id) => api.patch(`/print-shops/${id}/verify`);
export const getPendingVendors = () => api.get('/vendors/admin/pending');
export const initializePayment = (data) => api.post('/payments/initialize', data);
export const verifyPayment = (reference) => api.get(`/payments/verify/${reference}`);
export const getMessages = (requestId) => api.get(`/messages/request/${requestId}`);
export const sendMessage = (requestId, formData) =>
  api.post(`/messages/request/${requestId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  export const approvePrice = (id) => api.patch(`/services/${id}/approve-price`);
export const disputePrice = (id) => api.patch(`/services/${id}/dispute-price`);
export const reportLostFoundItem = (formData) =>
  api.post('/lost-found', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getLostFoundItems = (params) => api.get('/lost-found', { params });
export const getMyLostFoundItems = () => api.get('/lost-found/my-items');
export const updateLostFoundStatus = (id, status) =>
  api.patch(`/lost-found/${id}/status`, { status });
export const deleteLostFoundItem = (id) => api.delete(`/lost-found/${id}`);
export const createListing = (formData) =>
  api.post('/marketplace', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getListings = (params) => api.get('/marketplace', { params });
export const getMyMarketplaceListings = () => api.get('/marketplace/my-listings');
export const updateListingStatus = (id, status) =>
  api.patch(`/marketplace/${id}/status`, { status });
export const deleteListing = (id) => api.delete(`/marketplace/${id}`);
export const getListingMessages = (listingId) => api.get(`/messages/listing/${listingId}`);
export const sendListingMessage = (listingId, formData) =>
  api.post(`/messages/listing/${listingId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  export const uploadStudyDocument = (formData) =>
  api.post('/study/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getStudyDocuments = () => api.get('/study/documents');
export const searchStudy = (q) => api.get('/study/search', { params: { q } });
export const deleteStudyDocument = (id) => api.delete(`/study/documents/${id}`);

export default api;