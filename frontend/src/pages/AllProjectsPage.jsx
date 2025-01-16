import { useNavigate } from 'react-router-dom';
import '@mantine/core/styles.css';
import { Badge, Button, Group, Text, Container, Paper } from '@mantine/core';
import { useEffect, useState } from "react";
import { BACKEND_URL } from '../main.jsx';
import './ProjectsPage.css'; // Import the same CSS file

function AllProjectsPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);

    const getApiData = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
            `${BACKEND_URL}/projects/all`, { // Updated endpoint
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        ).then((response) => response.json());

        setProjects(response);
    };

    useEffect(() => {
        getApiData();
    }, []);

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    };

    return (
        <Container>
            <Paper shadow="xs" padding="md" radius="md" style={{ backgroundColor: '#f8f9fa', width: '100%' }}>
                {projects.map((project, index) => (
                    <Button
                        color="#5C74B7"
                        key={index}
                        variant="outline"
                        fullWidth
                        radius="md"
                        className="project-button"
                        onClick={() => navigate(`/projects/${project.id}`)}
                    >
                        <Group position="apart" style={{ width: '100%' }}>
                            <div style={{ flex: 1 }}>
                                <Text fw={500} color="#5C74B7"  weight={500}>{project.name}</Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Badge color="#5C74B7"  variant ='light'>
                                    Даты: {formatDate(project.start_date)} - {formatDate(project.end_date)}
                                </Badge>
                            </div>
                        </Group>
                    </Button>
                ))}
            </Paper>
        </Container>
    );
}

export default AllProjectsPage;
