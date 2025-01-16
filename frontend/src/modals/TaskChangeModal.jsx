import { Button, Space, Text, TextInput, Title, Modal, Stack, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BACKEND_URL } from '../main.jsx';

export default function TaskChangeModal(props) {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState(null);
    const [status, setStatus] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [statuses, setStatuses] = useState([]);

    useEffect(() => {
        fetch(`${BACKEND_URL}/projects/${props.projectId}/participants`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        })
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));

        fetch(`${BACKEND_URL}/projects/${props.projectId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        })
            .then(response => response.json())
            .then(data => setStatuses(data.statuses || []))
            .catch(error => console.error('Error fetching project statuses:', error));

        setTitle(props.title || '');
        setDescription(props.description || '');
        setDueDate(props.dueDate ? new Date(props.dueDate) : null);
        setStatus(props.status || '');
        setAssignedTo(props.assignedTo || '');
    }, [props.title, props.description, props.dueDate, props.status, props.assignedTo, props.projectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const task = {
            title,
            description,
            due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
            status,
            assigned_to: assignedTo
        };

        try {
            const response = await fetch(`${BACKEND_URL}/tasks/${props.taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(task)
            });

            if (!response.ok) {
                throw new Error('Failed to change task');
            }

            navigate(`/tasks/${props.taskId}`);
            props.setIsOpen(false);
        } catch (error) {
            console.error('Failed to change task:', error);
            setErrorMessage(error.message);
        }
    };

    return (
        <Modal opened={props.isOpen} onClose={() => props.setIsOpen(false)}>
            <Stack
                align="stretch"
                justify="flex-start"
                gap="md"
            >
                <Title order={2} ta="center" mt="md">Редактировать задачу</Title>
                <TextInput
                    label="Название"
                    placeholder="Введите новое название"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                />
                <TextInput
                    label="Описание"
                    placeholder="Введите новое описание"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                />
                <DatePickerInput
                    label="Крайний срок"
                    placeholder="Выберите новую дату выполнения"
                    onChange={setDueDate}
                    value={dueDate}
                />
                <Select
                    label="Статус"
                    placeholder="Выберите новый статус"
                    data={statuses.map(status => ({ value: status, label: status }))}
                    onChange={setStatus}
                    value={status}
                />
                <Select
                    label="Исполнитель"
                    placeholder="Выберите нового исполнителя"
                    data={users.map(user => ({ value: user.id, label: user.username }))}
                    onChange={setAssignedTo}
                    value={assignedTo}
                />

                {errorMessage &&
                    <>
                        <Space h='md' />
                        <Text c='red'>{errorMessage}</Text>
                    </>
                }

                <Button color="#5C74B7" onClick={handleSubmit} disabled={!title || !description || !dueDate || !status || !assignedTo}>
                    Изменить
                </Button>
            </Stack>
        </Modal>
    );
}