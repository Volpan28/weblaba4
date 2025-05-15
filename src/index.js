import React from 'react';
import { createRoot } from 'react-dom/client'; // Імпортуємо createRoot
import App from './App';
import './styles.css';
import '../src/frb-check.js';

// Отримуємо кореневий елемент
const container = document.getElementById('root');
// Створюємо корінь для рендерингу
const root = createRoot(container);
// Рендеримо додаток
root.render(<App />);