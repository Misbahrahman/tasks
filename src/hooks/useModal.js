import { useState, useCallback } from 'react';

const useModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showModal = useCallback(({ type = 'info', title = '', message = '' }) => {
    setModalState({ isOpen: true, type, title, message });
  }, []);

  const hideModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return { modalState, showModal, hideModal };
};

export default useModal;
