import { useNavigate } from 'react-router-dom';
import '@mantine/core/styles.css';
import { Badge, Button, Group, Text, Container, Paper } from '@mantine/core';
import { useEffect, useState } from "react";
import ProjectCreateModal from "../modals/ProjectCreateModal.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { BACKEND_URL } from '../main.jsx';

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

    return (
        <Container>
            <Paper shadow="xs" padding="md" radius="md" style={{ backgroundColor: '#f8f9fa', width: '100%' }}>
                {projects.length === 0 ? (
                    <Text style={{ marginLeft: '10px' }}>Вы не участвуете ни в одном проекте</Text>
                ) : (
                    projects.map((project, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            fullWidth
                            radius="md"
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '10px', backgroundColor: 'white' }}
                            onClick={() => navigate(`/projects/${project.id}`)}
                        >
                            <Group position="apart" style={{ width: '100%' }}>
                                <div style={{ flex: 1 }}>
                                    <Text weight={500}>{project.name}</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Badge color="blue" variant="light">
                                        Начался: {project.start_date}
                                    </Badge>
                                    <Badge color="pink" variant="light" style={{ marginLeft: 10 }}>
                                        Заканчивается: {project.end_date}
                                    </Badge>
                                </div>
                            </Group>
                        </Button>
                    ))
                )}
                {auth.user && auth.user.role !== 3 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button color="blue" mt="md" radius="md" onClick={() => setIsOpen(true)} style={{ marginBottom: '5px', marginRight: '5px' }}>
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