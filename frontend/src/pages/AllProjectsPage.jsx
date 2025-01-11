import { useNavigate } from 'react-router-dom';
import '@mantine/core/styles.css';
import { Badge, Button, Group, Text, Container, Paper } from '@mantine/core';
import { useEffect, useState } from "react";

function AllProjectsPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);

    const getApiData = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
            "http://127.0.0.1:8000/projects/all", { // Updated endpoint
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

    return (
        <Container>
            <Paper shadow="xs" padding="md" radius="md" style={{ backgroundColor: '#f8f9fa', width: '100%' }}>
                {projects.map((project, index) => (
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
                ))}
            </Paper>
        </Container>
    );
}

export default AllProjectsPage;
