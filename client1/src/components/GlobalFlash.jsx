import React from 'react';
import FlashMessage from './FlashMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function GlobalFlash() {
  const { flashMessage } = useAuth();
  return (
    <FlashMessage
      message={flashMessage?.message}
      type={flashMessage?.type}
    />
  );
}


