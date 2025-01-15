import { useEffect, useState } from 'react';
import { Table, Container, Text, Popover, Button, MultiSelect, Group, TextInput } from '@mantine/core';
import { Link } from 'react-router-dom';
import { BACKEND_URL } from '../main.jsx';

export default function AllTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [searchStatuses, setSearchStatuses] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [searchAuthors, setSearchAuthors] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [searchTitle, setSearchTitle] = useState('');
    const [searchProjects, setSearchProjects] = useState([]);
    const [projects, setProjects] = useState([]);
    const [userRole, setUserRole] = useState(null);

    const fetchTasks = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/tasks/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        const tasksWithDetails = await Promise.all(data.map(async (task) => {
            const assignedTo = await fetchUser(task.assigned_to);
            const createdBy = await fetchUser(task.created_by);
            const projectName = await fetchProject(task.project_id);
            return { ...task, assigned_to: assignedTo, created_by: createdBy, project_name: projectName, project_id: task.project_id };
        }));
        setTasks(tasksWithDetails);
        const uniqueStatuses = [...new Set(data.map(task => task.status))];
        setStatuses(uniqueStatuses);
        const uniqueAuthors = [...new Set(tasksWithDetails.map(task => task.created_by))];
        setAuthors(uniqueAuthors);
        const uniqueProjects = [...new Set(tasksWithDetails.map(task => task.project_name))];
        setProjects(uniqueProjects);
    };

    const fetchUser = async (userId) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/users/${userId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data.username;
    };

    const fetchProject = async (projectId) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/projects/${projectId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data.name;
    };

    const fetchUserRole = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/users_login/me/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setUserRole(data.role);
    };

    const filteredTasks = tasks.filter(task =>
        (searchStatuses.length === 0 || searchStatuses.includes(task.status)) &&
        (searchAuthors.length === 0 || searchAuthors.includes(task.created_by)) &&
        (searchProjects.length === 0 || searchProjects.includes(task.project_name)) &&
        task.title.toLowerCase().includes(searchTitle.toLowerCase())
    );

    useEffect(() => {
        fetchTasks();
        fetchUserRole();
    }, []);

    return ( 
        <Container size="100rem">
            <Text weight={500} size="xl" mb="md">Мои задачи</Text>
            <TextInput
                placeholder="Поиск по названию"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.currentTarget.value)}
                style={{ marginBottom: 20 }}
            />
            {filteredTasks.length === 0 ? (
                <Text>У вас нет назначенных задач</Text>
            ) : (
                <Table withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Название</Table.Th>
                            <Table.Th>Описание</Table.Th>
                            <Table.Th>
                                <Group spacing={5}>
                                    <span>Статус</span>
                                    <Popover width={300} position="bottom" withArrow shadow="md">
                                        <Popover.Target>
                                            <Button variant="subtle" compact>▼</Button>
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <MultiSelect
                                                label="Выберите статусы"
                                                placeholder="Выберите значения"
                                                data={statuses.map(status => ({ value: status, label: status }))}
                                                value={searchStatuses}
                                                onChange={setSearchStatuses}
                                                comboboxProps={{ withinPortal: false }}
                                            />
                                        </Popover.Dropdown>
                                    </Popover>
                                </Group>
                            </Table.Th>
                            <Table.Th>До</Table.Th>
                            <Table.Th>
                                <Group spacing={5}>
                                    <span>Автор</span>
                                    <Popover width={300} position="bottom" withArrow shadow="md">
                                        <Popover.Target>
                                            <Button variant="subtle" compact>▼</Button>
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <MultiSelect
                                                label="Выберите авторов"
                                                placeholder="Выберите значения"
                                                data={authors.map(author => ({ value: author, label: author }))}
                                                value={searchAuthors}
                                                onChange={setSearchAuthors}
                                                comboboxProps={{ withinPortal: false }}
                                            />
                                        </Popover.Dropdown>
                                    </Popover>
                                </Group>
                            </Table.Th>
                            <Table.Th>
                                <Group spacing={5}>
                                    <span>Проект</span>
                                    <Popover width={300} position="bottom" withArrow shadow="md">
                                        <Popover.Target>
                                            <Button variant="subtle" compact>▼</Button>
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <MultiSelect
                                                label="Выберите проекты"
                                                placeholder="Выберите значения"
                                                data={projects.map(project => ({ value: project, label: project }))}
                                                value={searchProjects}
                                                onChange={setSearchProjects}
                                                comboboxProps={{ withinPortal: false }}
                                            />
                                        </Popover.Dropdown>
                                    </Popover>
                                </Group>
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredTasks.map((task) => (
                            <Table.Tr key={task.id}>
                                <Table.Td>
                                    <Link to={`/tasks/${task.id}`}>
                                        {task.title}
                                    </Link>
                                </Table.Td>
                                <Table.Td>{task.description}</Table.Td>
                                <Table.Td>{task.status}</Table.Td>
                                <Table.Td>{task.due_date}</Table.Td>
                                <Table.Td>{task.created_by}</Table.Td>
                                <Table.Td>
                                    <Link to={`/projects/${task.project_id}`}>
                                        {task.project_name}
                                    </Link>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}
        </Container>
    );
}
