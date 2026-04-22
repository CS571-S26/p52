import './App.css';
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TodoPage from './pages/TodoPage';
import NotesPage from './pages/NotesPage';
import NoteEditor from './pages/NoteEditor';
import SettingsPage from './pages/SettingsPage';
import { finalizeOutlookRedirect } from './services/outlookAuth';


function App() {
    useEffect(() => {
        const configRaw = window.localStorage.getItem('outlookConfig');
        if (!configRaw) {
            return;
        }

        let config;
        try {
            config = JSON.parse(configRaw);
        } catch {
            return;
        }

        if (!config?.clientId || !config?.tenantId) {
            return;
        }

        finalizeOutlookRedirect(config).catch(() => {
            // Ignore here; Settings/Widget surfaces actionable auth errors.
        });
    }, []);

    return (
        <div className="d-flex flex-column vh-100">
            <NavigationBar />

            <main className="flex-grow-1">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/todos" element={<TodoPage />} />
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/notes/:noteId" element={<NoteEditor />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<HomePage />} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;
