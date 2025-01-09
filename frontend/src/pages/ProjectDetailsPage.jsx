import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, Group, SimpleGrid, Space, Text, Divider, ScrollArea } from '@mantine/core';
import PropTypes from 'prop-types';
import TaskCreateModal from '../modals/TaskCreateModal.jsx';
import ProjectChangeModal from '../modals/ProjectChangeModal.jsx';
import AddColumnModal from '../modals/AddColumnModal.jsx';

function TaskList({ title, tasks, onTaskDragStart, onTaskDragOver, onTaskDrop, removeColumn, isEditMode, moveColumnLeft, moveColumnRight, index, totalColumns, showOldTasks, completedStatus }) {
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
            {isEditMode && (
                <Group position="center" style={{ marginBottom: 10 }}>
                    <Button color="blue" size="xs" onClick={() => moveColumnLeft(index)} disabled={index === 0}>
                        ←
                    </Button>
                    <Button color="blue" size="xs" onClick={() => moveColumnRight(index)} disabled={index === totalColumns - 1}>
                        →
                    </Button>
                    <Button color="red" size="xs" onClick={() => removeColumn(title)}>
                        Remove
                    </Button>
                </Group>
            )}
            {filteredTasks.map((task, index) => (
                <Card
                    key={index}
                    draggable
                    onDragStart={(e) => onTaskDragStart(e, task)}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                >
                    <Link to={`/tasks/${task.id}`}>
                        <Text weight={500}>{task.title}</Text>
                    </Link>
                    <Text size="sm" color="dimmed">{task.description}</Text>
                    <Badge color="green" variant="light">
                        До: {task.due_date}
                    </Badge>
                    <Text size="sm" color="blue">Автор: {task.created_by.username}</Text>
                    <Text size="sm" color="blue">Назначен: {task.assigned_to.username}</Text>
                </Card>
            ))}
        </div>
    );
}

TaskList.propTypes = {
    title: PropTypes.string.isRequired,
    tasks: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        due_date: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
    })).isRequired,
    onTaskDragStart: PropTypes.func.isRequired,
    onTaskDragOver: PropTypes.func.isRequired,
    onTaskDrop: PropTypes.func.isRequired,
    removeColumn: PropTypes.func.isRequired,
    isEditMode: PropTypes.bool.isRequired,
    moveColumnLeft: PropTypes.func.isRequired,
    moveColumnRight: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    totalColumns: PropTypes.number.isRequired,
    completedStatus: PropTypes.string.isRequired,
};

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

    const fetchUser = async (userId) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://127.0.0.1:8000/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    };

    const fetchProject = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
            `http://127.0.0.1:8000/projects/${id}/`, {
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
        const response = await fetch(`http://127.0.0.1:8000/projects/${id}/tasks`, {
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
        const response = await fetch(`http://127.0.0.1:8000/projects/${id}/participants`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setParticipants(data);
    };

    useEffect(() => {
        fetchProject();
        fetchTasks();
        fetchParticipants();
    }, [id]);

    useEffect(() => {
        const interval = setInterval(() => {
            const updatedTasks = tasks.map((task) => {
                if (new Date(task.due_date) < new Date() && task.status !== 'completed') {
                    task.status = 'Просроченные';
                }
                return task;
            });
            setTask(updatedTasks);
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [tasks]);

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

            await fetch(`http://127.0.0.1:8000/tasks/${draggedTask.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            });
        }
    };

    const deleteProject = async () => {
        await fetch(`http://127.0.0.1:8000/projects/${id}/`, {
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
        await fetch(`http://127.0.0.1:8000/projects/${id}/`, {
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
        await fetch(`http://127.0.0.1:8000/projects/${id}/`, {
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
        await fetch(`http://127.0.0.1:8000/projects/${id}/`, {
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

    const completedStatus = statuses[statuses.length - 1];

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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Button color="green" onClick={() => setIsTaskCreateModalOpen(true)} style={{ marginBottom: 10 }}>Создать задачу</Button>
                    <Button color="yellow" onClick={() => setIsProjectChangeModalOpen(true)} style={{ marginBottom: 10 }}>Изменить</Button>
                    <Button color="red" onClick={deleteProject}>Удалить проект</Button>
                    <Button onClick={() => setIsAddColumnModalOpen(true)} style={{ marginBottom: 10 }}>
                        Добавить статус
                    </Button>
                    <Button
                        onClick={() => {
                            if (isEditMode) {
                                saveColumnOrder();
                            } else {
                                setIsEditMode(true);
                            }
                        }}
                        style={{ marginBottom: 10 }}
                    >
                        {isEditMode ? 'Сохранить' : 'Изменить статусы'}
                    </Button>
                    <Button onClick={() => setShowOldTasks(!showOldTasks)} style={{ marginBottom: 10 }}>
                        {showOldTasks ? 'Скрыть старые завершенные задачи' : 'Показать старые завершенные задачи'}
                    </Button>
                </div>
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
                        />
                    ))}
                </div>
            </ScrollArea.Autosize>
            <TaskCreateModal isOpen={isTaskCreateModalOpen} setIsOpen={setIsTaskCreateModalOpen} projectId={id} />
            <ProjectChangeModal
                isOpen={isProjectChangeModalOpen}
                setIsOpen={setIsProjectChangeModalOpen}
                projectId={id}
                name={project.name}
                description={project.description}
                startDate={project.start_date}
                endDate={project.end_date}
                participants={participants}
            />
            <AddColumnModal
                isOpen={isAddColumnModalOpen}
                setIsOpen={setIsAddColumnModalOpen}
                addColumn={addColumn}
            />
        </div>
    );
}

export default ProjectDetailsPage;
