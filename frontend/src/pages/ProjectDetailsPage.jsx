import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, Group, SimpleGrid, Space, Text, Divider, ScrollArea, Paper } from '@mantine/core';
import TaskCreateModal from '../modals/TaskCreateModal.jsx';
import ProjectChangeModal from '../modals/ProjectChangeModal.jsx';
import AddColumnModal from '../modals/AddColumnModal.jsx';
import { useAuth } from "../contexts/AuthContext.jsx";
import { BACKEND_URL } from '../main.jsx';

function TaskList({ title, tasks, onTaskDragStart, onTaskDragOver, onTaskDrop, removeColumn, isEditMode, moveColumnLeft, moveColumnRight, index, totalColumns, showOldTasks, completedStatus, hiddenOldTasksCount }) {
    const filteredTasks = tasks.filter(task => {
        const statusChangeDate = new Date(task.updated_at);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return showOldTasks || statusChangeDate >= threeDaysAgo || task.status !== completedStatus;
    });

    return (
        <div
            onDragOver={(e) => onTaskDragOver(e)}
            onDrop={(e) => onTaskDrop(e, title)}
            style={{ minWidth: 300, flexGrow: 1 }}
        >
            <h1>{title}</h1>
            {title === completedStatus && !showOldTasks && (
                <Text size="sm" color="dimmed">Скрыто задач: {hiddenOldTasksCount}</Text>
            )}
            {isEditMode && (
                <Group position="center" style={{ marginBottom: 10 }}>
                    <Button color="blue" size="xs" onClick={() => moveColumnLeft(index)} disabled={index === 0}>
                        ←
                    </Button>
                    <Button color="blue" size="xs" onClick={() => moveColumnRight(index)} disabled={index === totalColumns - 1}>
                        →
                    </Button>
                    <Button color="red" size="xs" onClick={() => removeColumn(title)}>
                        Удалить
                    </Button>
                </Group>
            )}
            {filteredTasks.map((task, index) => (
                <Link to={`/tasks/${task.id}`} key={index} style={{ textDecoration: 'none' }}>
                    <Paper
                        draggable
                        onDragStart={(e) => onTaskDragStart(e, task)}
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        withBorder
                        style={{ wordWrap: 'break-word', maxWidth: 300, cursor: 'pointer' }}
                    >
                        <Text weight={500} style={{ wordWrap: 'break-word', padding: '5px' }}>{task.title}</Text>
                        <Badge color={new Date(task.due_date) < new Date() ? "red" : "green"} variant="light" style={{ padding: '5px' }}>
                            До: {task.due_date}
                        </Badge>
                        <Text size="sm" color="blue" style={{ wordWrap: 'break-word', padding: '5px' }}>Автор: {task.created_by.username}</Text>
                        <Text size="sm" color="blue" style={{ wordWrap: 'break-word', padding: '5px' }}>Назначен: {task.assigned_to.username}</Text>
                    </Paper>
                </Link>
            ))}
        </div>
    );
}

function ProjectDetailsPage() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [tasks, setTask] = useState([]);
    const [draggedTask, setDraggedTask] = useState(null);
    const [isTaskCreateModalOpen, setIsTaskCreateModalOpen] = useState(false);
    const [isProjectChangeModalOpen, setIsProjectChangeModalOpen] = useState(false);
    const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [showOldTasks, setShowOldTasks] = useState(false);
    const [hiddenOldTasksCount, setHiddenOldTasksCount] = useState(0);
    const auth = useAuth();

    const completedStatus = statuses[statuses.length - 1];

    const fetchUser = async (userId) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    };

    const fetchProject = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
            `${BACKEND_URL}/projects/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
        ).then((response) => response.json());
        setProject(response);
        setStatuses(response.statuses || []);
    };

    const fetchTasks = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/projects/${id}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        const tasksWithUsernames = await Promise.all(data.map(async (task) => {
            const assignedTo = await fetchUser(task.assigned_to);
            const createdBy = await fetchUser(task.created_by);
            return { ...task, assigned_to: assignedTo, created_by: createdBy };
        }));
        setTask(tasksWithUsernames);
    };

    const fetchParticipants = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/projects/${id}/participants`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setParticipants(data);
    };

    const refreshProjectDetails = () => {
        fetchProject();
        fetchTasks();
        fetchParticipants();
    };

    useEffect(() => {
        fetchProject();
        fetchTasks();
        fetchParticipants();
    }, [id]);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const updatedTasks = tasks.map((task) => {
    //             if (new Date(task.due_date) < new Date() && task.status !== 'completed') {
    //                 task.status = 'Просроченные';
    //             }
    //             return task;
    //         });
    //         setTask(updatedTasks);
    //     }, 60000); // Check every minute

    //     return () => clearInterval(interval);
    // }, [tasks]);

    useEffect(() => {
        const countHiddenOldTasks = () => {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            const count = tasks.filter(task => new Date(task.updated_at) < threeDaysAgo && task.status === completedStatus).length;
            setHiddenOldTasksCount(count);
        };

        countHiddenOldTasks();
    }, [tasks, completedStatus]);

    if (!project) {
        return <div>Loading...</div>;
    }

    const onTaskDragStart = (e, task) => {
        setDraggedTask(task);
    };

    const onTaskDragOver = (e) => {
        e.preventDefault();
    };

    const onTaskDrop = async (e, targetTitle) => {
        const targetCol = statuses.find(status => status === targetTitle);
        if (targetCol) {
            const updatedTasks = tasks.map((task) => {
                if (task.id === draggedTask.id) {
                    task.status = targetCol;
                }
                return task;
            });
            setTask(updatedTasks);

            const updatedTask = {
                ...draggedTask,
                status: targetCol,
                assigned_to: draggedTask.assigned_to.id,
                created_by: draggedTask.created_by.id
            };

            await fetch(`${BACKEND_URL}/tasks/${draggedTask.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            });
        }
    };

    const deleteProject = async () => {
        await fetch(`${BACKEND_URL}/projects/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        window.location.href = '/projects';
    };

    const addColumn = async (statusKey) => {
        const updatedStatuses = [...statuses, statusKey];
        setStatuses(updatedStatuses);
        await fetch(`${BACKEND_URL}/projects/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                ...project,
                statuses: updatedStatuses,
                participants: participants.map(p => p.id)
            }),
        });
    };

    const removeColumn = async (statusKey) => {
        const updatedStatuses = statuses.filter((status) => status !== statusKey);
        setStatuses(updatedStatuses);
        await fetch(`${BACKEND_URL}/projects/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                ...project,
                statuses: updatedStatuses,
                participants: participants.map(p => p.id)
            }),
        });
    };

    const removeColumnByTitle = (title) => {
        const column = statuses.find(status => status === title);
        if (column) {
            removeColumn(column);
        }
    };

    const moveColumnLeft = (index) => {
        if (index === 0) return;
        const reorderedStatuses = Array.from(statuses);
        const [removed] = reorderedStatuses.splice(index, 1);
        reorderedStatuses.splice(index - 1, 0, removed);
        setStatuses(reorderedStatuses);
    };

    const moveColumnRight = (index) => {
        if (index === statuses.length - 1) return;
        const reorderedStatuses = Array.from(statuses);
        const [removed] = reorderedStatuses.splice(index, 1);
        reorderedStatuses.splice(index + 1, 0, removed);
        setStatuses(reorderedStatuses);
    };

    const saveColumnOrder = async () => {
        await fetch(`${BACKEND_URL}/projects/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
                ...project,
                statuses: statuses,
                participants: participants.map(p => p.id)
            }),
        });
        setIsEditMode(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <Group position="apart" justify="space-between">
                <div>
                    <Text weight={500}>{project.name}</Text>
                    <Space h="9px" />
                    <Text size="sm" color="dimmed" >{project.description}</Text>
                    <Group position="apart" style={{ marginTop: 15 }}>
                        <Badge color="blue" variant="light">
                            Начался: {project.start_date}
                        </Badge>
                        <Badge color="pink" variant="light">
                            Закончится: {project.end_date}
                        </Badge>
                    </Group>
                    <Text size="sm" color="dimmed">Участники: {participants.map(p => p.username).join(', ')}</Text>
                </div>
                {auth.user.role !== 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Group spacing="xs">
                            <Button color="green" onClick={() => setIsTaskCreateModalOpen(true)}>Добавить задачу</Button>
                            <Button color="yellow" onClick={() => setIsProjectChangeModalOpen(true)}>Изменить проект</Button>
                            <Button color="red" onClick={deleteProject}>Удалить проект</Button>
                        </Group>
                        <Space h="md" />
                        <Group spacing="xs">
                            <Button onClick={() => setIsAddColumnModalOpen(true)}>Добавить статус задач</Button>
                            <Button
                                onClick={() => {
                                    if (isEditMode) {
                                        saveColumnOrder();
                                    } else {
                                        setIsEditMode(true);
                                    }
                                }}
                            >
                                {isEditMode ? 'Сохранить' : 'Изменить статусы задач'}
                            </Button>
                            {/* {!showOldTasks && (
                                <Badge color="gray" variant="light">
                                    Скрытых задач{hiddenOldTasksCount}
                                </Badge>
                            )} */}
                            <Button onClick={() => setShowOldTasks(!showOldTasks)}>
                                {showOldTasks ? 'Скрыть старые завершенные задачи' : 'Показать старые завершенные задачи'}
                            </Button>
                            
                        </Group>
                    </div>
                )}
            </Group>
            <Space h="md" />
            <Divider my="md" color="black" />
            <ScrollArea.Autosize maxHeight="calc(100vh - 200px)" style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', flexGrow: 1 }}>
                    {statuses.length > 0 && statuses.map((status, index) => (
                        <TaskList
                            key={status}
                            title={status}
                            tasks={tasks.filter((task) => task.status === status)}
                            onTaskDragStart={onTaskDragStart}
                            onTaskDragOver={onTaskDragOver}
                            onTaskDrop={onTaskDrop}
                            removeColumn={removeColumnByTitle}
                            isEditMode={isEditMode}
                            moveColumnLeft={moveColumnLeft}
                            moveColumnRight={moveColumnRight}
                            index={index}
                            totalColumns={statuses.length}
                            showOldTasks={showOldTasks}
                            completedStatus={completedStatus}
                            hiddenOldTasksCount={hiddenOldTasksCount}
                        />
                    ))}
                </div>
            </ScrollArea.Autosize>
            <TaskCreateModal 
                isOpen={isTaskCreateModalOpen} 
                setIsOpen={(isOpen) => {
                    setIsTaskCreateModalOpen(isOpen);
                    if (!isOpen) refreshProjectDetails();
                }} 
                projectId={id} 
                defaultStatus={statuses[0]} 
            />
            <ProjectChangeModal
                isOpen={isProjectChangeModalOpen}
                setIsOpen={(isOpen) => {
                    setIsProjectChangeModalOpen(isOpen);
                    if (!isOpen) refreshProjectDetails();
                }}
                projectId={id}
                name={project.name}
                description={project.description}
                startDate={project.start_date}
                endDate={project.end_date}
                participants={participants}
            />
            <AddColumnModal
                isOpen={isAddColumnModalOpen}
                setIsOpen={(isOpen) => {
                    setIsAddColumnModalOpen(isOpen);
                    if (!isOpen) refreshProjectDetails();
                }}
                addColumn={addColumn}
            />
        </div>
    );
}

export default ProjectDetailsPage;
