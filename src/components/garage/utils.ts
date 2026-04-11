export const calculateDaysLeft = (dateString: string) => {
  if (!dateString) return 0;
  const expiry = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(expiry.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};
