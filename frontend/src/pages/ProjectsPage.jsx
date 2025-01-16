import { useNavigate } from 'react-router-dom';
import '@mantine/core/styles.css';
import { Badge, Button, Group, Text, Container, Paper } from '@mantine/core';
import { useEffect, useState } from "react";
import ProjectCreateModal from "../modals/ProjectCreateModal.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { BACKEND_URL } from '../main.jsx';
import './ProjectsPage.css';

function ProjectsPage() {
    const defaultValue = [];
    const navigate = useNavigate();
    const [projects, setProjects] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const auth = useAuth();

    const getApiData = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
            `${BACKEND_URL}/projects/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        ).then((response) => response.json());

        setProjects(response);
    };

    const refreshProjects = () => {
        getApiData();
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
                {projects.length === 0 ? (
                    <Text className="no-projects-text">Вы не участвуете ни в одном проекте</Text>
                ) : (
                    projects.map((project, index) => (
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
                                    <Text fw={500} color="#5C74B7" >{project.name}</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Badge color="#5C74B7"  variant="light">
                                        Даты: {formatDate(project.start_date)} - {formatDate(project.end_date)}
                                    </Badge>
                                </div>
                            </Group>
                        </Button>
                    ))
                )}
                {auth.user && auth.user.role !== 3 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button color="#5C74B7" mt="md" radius="md" onClick={() => setIsOpen(true)} style={{ marginBottom: '5px', marginRight: '5px' }}>
                            Создать Проект
                        </Button>
                    </div>
                )}
                <ProjectCreateModal
                    isOpen={isOpen}
                    setIsOpen={(isOpen) => {
                        setIsOpen(isOpen);
                        if (!isOpen) refreshProjects();
                    }}
                />
            </Paper>
        </Container>
    );
}
export default ProjectsPage;