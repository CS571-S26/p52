import { HashRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.jsx';
import { finalizeOutlookRedirect } from './services/outlookAuth';

const bootstrapApp = async () => {
  try {
    const configRaw = window.localStorage.getItem('outlookConfig');
    const config = configRaw ? JSON.parse(configRaw) : null;

    if (config?.clientId && config?.tenantId) {
      await finalizeOutlookRedirect(config);
    }
  } catch {
    // Ignore bootstrap auth errors; the UI will surface issues on the widget/settings page.
  }

  createRoot(document.getElementById('root')).render(
    <HashRouter>
      <App />
    </HashRouter>
  );
};

bootstrapApp();
