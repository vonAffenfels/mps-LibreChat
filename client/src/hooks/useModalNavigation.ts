import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Hook to handle modal closing with automatic navigation
 * When a modal triggered by a specific URL path is closed, it navigates back or to home
 *
 * @param triggerPath - The URL path that triggers this modal (e.g., '/legal/imprint')
 * @returns A function to handle modal close with navigation
 */
export const useModalNavigation = (triggerPath: string) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleModalClose = (isOpen: boolean, setState: (value: boolean) => void) => {
    setState(isOpen);

    if (!isOpen && location.pathname === triggerPath) {
      // Check if there's history to go back to
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  return handleModalClose;
};
