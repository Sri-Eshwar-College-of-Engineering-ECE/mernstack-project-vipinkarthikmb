import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { PlatformProvider } from './context/PlatformContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<PlatformProvider>
			<App />
		</PlatformProvider>
	</React.StrictMode>
);
