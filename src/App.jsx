import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import TodoPage from './pages/TodoPage';
import NotesPage from './pages/NotesPage';
import NoteEditor from './pages/NoteEditor';
import SettingsPage from './pages/SettingsPage';
import useLocalStorage from './hooks/useLocalStorage';


function App() {
    const getInitialTheme = () => {
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    };

    const [theme, setTheme] = useLocalStorage('theme', getInitialTheme());

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <div className="d-flex flex-column vh-100">
            <NavigationBar />

            <main className="flex-grow-1 d-flex flex-column min-vh-0">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/todos" element={<TodoPage />} />
                    <Route path="/notes" element={<NotesPage />} />
                    <Route path="/notes/:noteId" element={<NoteEditor />} />
                    <Route
                        path="/settings"
                        element={<SettingsPage theme={theme} onThemeToggle={toggleTheme} />}
                    />
                    <Route path="*" element={<HomePage />} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;
