import React, { useState, useEffect } from 'react';
import { Button, Space, Text, TextInput, Title, Modal, Stack, Select } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { useAuth } from "../contexts/AuthContext.jsx";
import {BACKEND_URL} from "../main.jsx";

export default function TaskCreateModal({ isOpen, setIsOpen, projectId, defaultStatus }) {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [end_date, setEndDate] = useState(null);
    const auth = useAuth();
    const [assigned, setAssigned] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch(`${BACKEND_URL}/projects/${projectId}/participants`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        })
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));
    }, [projectId]);

    const formatDate = (date) => {
        if (!date) return null;
        return date.toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const task = {
            title,
            description,
            status: defaultStatus,
            due_date: formatDate(end_date),
            created_by: auth.user.id,
            project_id: projectId,
            assigned_to: assigned
        };

        try {
            const response = await fetch(`${BACKEND_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(task)
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            navigate(`/projects/${projectId}`);
            setIsOpen(false);
            setDescription('');
            setTitle('');
        } catch (error) {
            console.error('Error creating task:', error);
            setErrorMessage(error.message);
        }
    };

    return (
        <Modal opened={isOpen} onClose={() => setIsOpen(false)}>
            <Stack
                align="stretch"
                justify="flex-start"
                gap="md"
            >
                <Title order={2} ta="center" mt="md">Создать задачу</Title>
                <TextInput
                    label="Название"
                    placeholder="Введите название задачи"
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextInput
                    label="Описание"
                    placeholder="Введите описание задачи"
                    onChange={(e) => setDescription(e.target.value)}
                />
                <DatePickerInput
                    label="Крайний срок"
                    placeholder="dd.mm.year"
                    value={end_date}
                    onChange={setEndDate}
                />
                <Select
                    label="Исполнитель"
                    placeholder="Выберите исполнителя"
                    data={users.map(user => ({ value: user.id, label: user.username }))}
                    value={assigned}
                    onChange={setAssigned}
                />

                {errorMessage &&
                    <>
                        <Space h='md' />
                        <Text c='red'>{errorMessage}</Text>
                    </>
                }

                <Button onClick={handleSubmit} disabled={!title || !description}>
                    Создать
                </Button>
            </Stack>
        </Modal>
    );
}