// import { Routes, Route } from 'react-router-dom';
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import ProjectsPage from './pages/ProjectsPage';
// import ProfilePage from './pages/ProfilePage';

import '@mantine/core/styles.css';

import {MantineProvider} from '@mantine/core';
import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';

function App() {
    return (
        <MantineProvider>
            <div>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    Hello
                </Card>

            </div>
        </MantineProvider>
    );
}

export default App;