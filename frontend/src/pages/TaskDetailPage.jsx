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

    const statusMap = {
        'open': 'Новая задача',
        'inprogress': 'В процессе',
        'completed': 'Завершена',
        'review': 'Ревью',
        'overdue': 'Просрочена'
    };

    const fetchTask = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/tasks/${id}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setTask(data);
        fetchUser(data.assigned_to, setAssignedTo);
        fetchUser(data.created_by, setCreatedBy);
        fetchProjectParticipants(data.project_id);
    };

    const fetchUser = async (userId, setUser) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${BACKEND_URL}/users/${userId}/`, {
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

        if (auth.user.role === 3) {
            const isInProject = data.some(p => p.id === auth.user.id);
            if (!isInProject) {
                notifications.show({ message: 'Вы не являетесь участником проекта', color: 'red' });
                navigate('/projects');
            }
        }
    };

    const fetchComments = async () => {
        const response = await fetch(`${BACKEND_URL}/comments/tasks/${id}/`);
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
        const response = await fetch(`${BACKEND_URL}/comments/`, {
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
        fetchTask();
        fetchComments();
    }, [id, isModalOpen]);

    if (!task) {
        return <div>Loading...</div>;
    }

    return (
        <Container>
            <Card padding="lg" radius="md" withBorder style={{ marginBottom: '20px' }}>
                <Group position="apart" justify="space-between">
                    <div>
                        <Text weight={500} size="xl">{task.title}</Text>
                        <Text size="sm" color="dimmed">{task.description} </Text>
                        <Badge color="pink" variant="light">
                            Автор: {createdBy}
                        </Badge>
                        <Badge color="pink" variant="light">
                            Исполнитель: {assignedTo}
                        </Badge>
                        <Badge color="blue" variant="light">
                            Статус: {statusMap[task.status] || task.status}
                        </Badge>
                        <Badge color="green" variant="light">
                            До: {task.due_date}
                        </Badge>
                    </div>
                    {auth.user.role !== 3 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Button color="yellow" onClick={() => setIsModalOpen(true)} style={{ marginBottom: 10 }}>Изменить</Button>
                            <Button color="red" onClick={deleteTask}>Удалить</Button>
                        </div>
                    )}
                </Group>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text weight={500} size="xl">Комментарии</Text>
                {comments.map(comment => (
                    <Text key={comment.id} size="sm" color="dimmed">
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
                    <Button onClick={handleAddComment} disabled={!newComment}>Добавить комментарий</Button>
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
