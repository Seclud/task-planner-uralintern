import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, Container, Group, Text, Textarea } from '@mantine/core';
import { useAuth } from "../contexts/AuthContext.jsx";
import TaskChangeModal from "../modals/TaskChangeModal.jsx";
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { BACKEND_URL } from '../main.jsx';

export default function TaskDetailPage() {
    const { id } = useParams();
    const [task, setTask] = useState(null);
    const [assignedTo, setAssignedTo] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const auth = useAuth();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [statuses, setStatuses] = useState({});
    const [isUserAssigned, setIsUserAssigned] = useState(false);

    const fetchProjectStatuses = async (projectId) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        const statusMap = data.statuses.reduce((map, status) => {
            map[status.key] = status.name;
            return map;
        }, {});
        setStatuses(statusMap);
    };

    const fetchTask = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/tasks/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setTask(data);
        fetchUser(data.assigned_to, setAssignedTo);
        fetchUser(data.created_by, setCreatedBy);
        fetchProjectParticipants(data.project_id);
        fetchProjectStatuses(data.project_id);
    };

    const fetchUser = async (userId, setUser) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setUser(data.username);
    };

    const fetchProjectParticipants = async (projectId) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/projects/${projectId}/participants`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setParticipants(data);

        if (auth.user && auth.user.role === 3) {
            const isInProject = data.some(p => p.id === auth.user.id);
            setIsUserAssigned(true);
            if (!isInProject) {
                notifications.show({ message: 'Вы не являетесь участником проекта', color: 'red' });
                navigate('/projects');
            }
        }
    };

    const fetchComments = async () => {
        const response = await fetch(`${BACKEND_URL}/comments/tasks/${id}`);
        const data = await response.json();
        const commentsWithUsernames = await Promise.all(data.map(async (comment) => {
            const userResponse = await fetch(`${BACKEND_URL}/users/${comment.user_id}`);
            const userData = await userResponse.json();
            return { ...comment, username: userData.username };
        }));
        setComments(commentsWithUsernames);
    };

    const handleAddComment = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: newComment, task_id: id, user_id: auth.user.id })
        });
        if (response.ok) {
            setNewComment('');
            fetchComments();
        }
    };

    const deleteTask = async () => {
        await fetch(`${BACKEND_URL}/tasks/${id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        // Redirect to another page after deletion
        window.location.href = `/projects/${task.project_id}`;
    };

    useEffect(() => {
        if (auth.user) {
            fetchTask();
            fetchComments();
        }
    }, [id, isModalOpen, auth.user]);

    if (!auth.user) {
        return <div>Загрузка...</div>;
    }

    if (!task) {
        return <div>Загрузка...</div>;
    }

    return (
        <Container>
            <Card padding="lg" radius="md" withBorder style={{ marginBottom: '20px' }}>
                <Group position="apart" justify="space-between">
                    <div>
                        <Text weight={500} size="xl" style={{ paddingBottom: '10px' }}>{task.title}</Text>
                        <Text color="dimmed" style={{ paddingBottom: '10px' }}>{task.description} </Text>
                        <Badge size="lg" color="#5C74B7" variant="light" style={{ paddingBottom: '10px' }}>
                            Автор: {createdBy}
                        </Badge>
                        <Badge size="lg" color="#5C74B7" variant="light" style={{ paddingBottom: '10px' }}>
                            Исполнитель: {assignedTo}
                        </Badge>
                        <Badge size="lg" color="#5C74B7" variant="light" style={{ paddingBottom: '10px' }}>
                            Статус: {statuses[task.status] || task.status}
                        </Badge>
                        <Badge size="lg" color="#5C74B7" variant="light" style={{ paddingBottom: '10px' }}>
                            До: {task.due_date}
                        </Badge>
                    </div>
                    {isUserAssigned && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Button color="#5C74B7" onClick={() => setIsModalOpen(true)} style={{ marginBottom: 10 }}>Изменить</Button>
                            <Button color="#f87666" onClick={deleteTask}>Удалить</Button>
                        </div>
                    )}
                </Group>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text weight={500} size="xl">Комментарии</Text>
                {comments.map(comment => (
                    <Text key={comment.id} size="sm">
                        {comment.username}: {comment.content}
                    </Text>
                ))}
            </Card>
            <Card>
                <Group align="flex-end">
                    <Textarea
                        placeholder="Добавить комментарий"
                        value={newComment}
                        onChange={(event) => setNewComment(event.currentTarget.value)}
                        style={{ flexGrow: 1 }}
                    />
                    <Button color = "#5C74B7" onClick={handleAddComment} disabled={!newComment}>Добавить комментарий</Button>
                </Group>
            </Card>
            <TaskChangeModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                taskId={id}
                title={task.title}
                description={task.description}
                dueDate={task.due_date}
                status={task.status}
                assignedTo={task.assigned_to}
                projectId={task.project_id}
            />
        </Container>
    );
}
