import './styles/tailwind.css';
import { initRouter } from './router';
import { loadTopBar } from './script/topBar.ts';

// Initialize the router when the page loads
document.addEventListener('DOMContentLoaded', () => {
	initRouter();
	loadTopBar();
});
