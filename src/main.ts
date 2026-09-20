import { initEditor } from './editor';
import { initResearch } from './research';
import { initApp } from './app';

// Capture authored HTML before interactive components change the document.
initEditor();
initResearch();
initApp();
