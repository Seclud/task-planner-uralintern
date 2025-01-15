import { useEffect, useState } from 'react';
import { Table, Button, Group, Text, Container, TextInput, Popover, MultiSelect } from '@mantine/core';
import { BACKEND_URL } from '../main.jsx';
import { useAuth } from "../contexts/AuthContext.jsx";

function AdminRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState({});
    const [projects, setProjects] = useState({});
    const [searchUsername, setSearchUsername] = useState('');
    const [searchProjects, setSearchProjects] = useState([]);
    const auth = useAuth();

    const fetchRequests = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/requests/pending`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setRequests(data);
        fetchUsersAndProjects(data);
    };

    const fetchUser = async (userId) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    };

    const fetchProject = async (projectId) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    };

    const fetchUsersAndProjects = async (requests) => {
        const userIds = [...new Set(requests.map(request => request.user_id))];
        const projectIds = [...new Set(requests.map(request => request.project_id))];

        const usersData = await Promise.all(userIds.map(id => fetchUser(id)));
        const projectsData = await Promise.all(projectIds.map(id => fetchProject(id)));

        const usersMap = usersData.reduce((map, user) => {
            map[user.id] = user;
            return map;
        }, {});

        const projectsMap = projectsData.reduce((map, project) => {
            map[project.id] = project;
            return map;
        }, {});

        setUsers(usersMap);
        setProjects(projectsMap);
    };

    const handleApprove = async (requestId) => {
        const token = localStorage.getItem('authToken');
        await fetch(`${BACKEND_URL}/requests/${requestId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        fetchRequests();
    };

    const handleReject = async (requestId) => {
        const token = localStorage.getItem('authToken');
        await fetch(`${BACKEND_URL}/requests/${requestId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        fetchRequests();
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    if (auth.user.role !== 0) {
        return <div>Access denied</div>;
    }

    const filteredRequests = requests.filter(request =>
        (users[request.user_id]?.username.toLowerCase().includes(searchUsername.toLowerCase()) ||
        users[request.user_id]?.email.toLowerCase().includes(searchUsername.toLowerCase())) &&
        (searchProjects.length === 0 || searchProjects.includes(projects[request.project_id]?.name))
    );

    return (
        <Container size="100rem">
            <Text weight={500} size="xl" mb="md">Заявки на рассмотрении</Text>
            <TextInput
                placeholder="Поиск по имени или почте"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.currentTarget.value)}
                style={{ marginBottom: 20 }}
            />
            {/* <Popover width={300} position="bottom" withArrow shadow="md">
                <Popover.Target>
                    <Button variant="subtle" compact>Фильтр по проектам ▼</Button>
                </Popover.Target>
                <Popover.Dropdown>
                    <MultiSelect
                        label="Выберите проекты"
                        placeholder="Выберите значения"
                        data={Object.values(projects).map(project => ({ value: project.name, label: project.name }))}
                        value={searchProjects}
                        onChange={setSearchProjects}
                        comboboxProps={{ withinPortal: false }}
                    />
                </Popover.Dropdown>
            </Popover> */}
            {filteredRequests.length === 0 ? (
                <Text>Заявок нет</Text>
            ) : (
                <Table withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Пользователь</Table.Th>
                            <Table.Th>Почта</Table.Th>
                            <Table.Th><Group spacing={5}>
                                    <span>Проект</span>
                                    <Popover width={300} position="bottom" withArrow shadow="md">
                                        <Popover.Target>
                                            <Button variant="subtle" compact>▼</Button>
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <MultiSelect
                                                label="Выберите проекты"
                                                placeholder="Выберите значения"
                                                data={Object.values(projects).map(project => ({ value: project.name, label: project.name }))}
                                                value={searchProjects}
                                                onChange={setSearchProjects}
                                                comboboxProps={{ withinPortal: false }}
                                            />
                                        </Popover.Dropdown>
                                    </Popover>
                                </Group></Table.Th>
                            <Table.Th>Действия</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredRequests.map((request) => (
                            <Table.Tr key={request.id}>
                                <Table.Td>{users[request.user_id]?.username || 'Загрузка...'}</Table.Td>
                                <Table.Td>{users[request.user_id]?.email || 'Загрузка...'}</Table.Td>
                                <Table.Td>{projects[request.project_id]?.name || 'Загрузка...'}</Table.Td>
                                <Table.Td>
                                    <Group spacing="xs">
                                        <Button color="green" onClick={() => handleApprove(request.id)}>Принять</Button>
                                        <Button color="red" onClick={() => handleReject(request.id)}>Отклонить</Button>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}
        </Container>
    );
}

export default AdminRequestsPage;
