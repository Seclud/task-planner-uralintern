import React, { useState, useEffect } from 'react';
import { Button, Space, Text, TextInput, Title, Modal, Stack, MultiSelect } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ProjectCreateModal(props) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [start_date, setStartDate] = useState('');
    const [end_date, setEndDate] = useState('');
    const auth = useAuth();
    const [participants, setParticipants] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/users/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        })
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));
    }, []);

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const project = {
            name,
            description,
            start_date: formatDate(start_date),
            end_date: formatDate(end_date),
            created_by: auth.user.id,
            participants: participants
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/projects/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(project)
            });

            if (!response.ok) {
                throw new Error('Failed to create project');
            }

            navigate('/projects');
            props.setIsOpen(false);
            setDescription('');
            setName('');
        } catch (error) {
            console.error('Error creating project:', error);
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
                <Title order={2} ta="center" mt="md">Создать проект</Title>
                <TextInput
                    label="Название"
                    placeholder="Введите название сервиса"
                    onChange={(e) => setName(e.target.value)}
                />
                <TextInput
                    label="Описание"
                    placeholder="Введите описание сервиса"
                    onChange={(e) => setDescription(e.target.value)}
                />
                <DatePickerInput
                    label="Начальная дата"
                    placeholder="dd.mm.year"
                    value={start_date}
                    onChange={setStartDate}
                />
                <DatePickerInput
                    label="Конечная дата"
                    placeholder="dd.mm.year"
                    value={end_date}
                    onChange={setEndDate}
                />
                <MultiSelect
                    label="Участники"
                    placeholder="Выберите участников"
                    data={users.map(user => ({ value: user.id, label: user.username }))}
                    value={participants}
                    onChange={setParticipants}
                />

                {errorMessage &&
                    <>
                        <Space h='md' />
                        <Text c='red'>{errorMessage}</Text>
                    </>
                }

                <Button onClick={handleSubmit} disabled={!name || !description}>
                    Создать
                </Button>
            </Stack>
        </Modal>
    );
}