// Utility to clear all stored authentication data
export const clearAllStorageData = () => {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('unitee_user');
  localStorage.removeItem('dismissedEmergencyAlerts');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  console.log('✅ All storage data cleared');
};

// Auto-clear storage on page load to prevent conflicts
if (typeof window !== 'undefined') {
  clearAllStorageData();
}