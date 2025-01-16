import { Button, Space, Text, TextInput, Title, Modal, Stack, MultiSelect } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {BACKEND_URL} from "../main.jsx";

export default function ProjectChangeModal(props) {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch(`${BACKEND_URL}/users/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        })
            .then(response => response.json())
            .then(data => setUsers(data))
            .catch(error => console.error('Error fetching users:', error));

        setName(props.name || '');
        setDescription(props.description || '');
        setStartDate(props.startDate ? new Date(props.startDate) : null);
        setEndDate(props.endDate ? new Date(props.endDate) : null);
        setParticipants(props.participants.map(p => p.id) || []);
    }, [props.name, props.description, props.startDate, props.endDate, props.participants]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const project = {
            name,
            description,
            start_date: startDate ? startDate.toISOString().split('T')[0] : null,
            end_date: endDate ? endDate.toISOString().split('T')[0] : null,
            participants
        };

        try {
            const response = await fetch(`${BACKEND_URL}/projects/${props.projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(project)
            });

            if (!response.ok) {
                throw new Error('Failed to change project');
            }

            navigate(`/projects/${props.projectId}`);
            props.setIsOpen(false);
        } catch (error) {
            console.error('Failed to change project:', error);
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
                <Title order={2} ta="center" mt="md">Редактировать проект</Title>
                <TextInput
                    label="Название"
                    placeholder="Введите новое название"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                />
                <TextInput
                    label="Описание"
                    placeholder="Введите новое описание"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                />
                <DatePickerInput
                    label="Дата начала"
                    placeholder="Выберите новую дату начала"
                    onChange={setStartDate}
                    value={startDate}
                />
                <DatePickerInput
                    label="Дата окончания"
                    placeholder="Выберите новую дату окончания"
                    onChange={setEndDate}
                    value={endDate}
                />
                <MultiSelect
                    label="Участники"
                    placeholder="Выберите участников"
                    data={users.map(user => ({ value: user.id, label: user.username }))}
                    onChange={setParticipants}
                    value={participants}
                />

                {errorMessage &&
                    <>
                        <Space h='md' />
                        <Text c='red'>{errorMessage}</Text>
                    </>
                }

                <Button color="#5C74B7" onClick={handleSubmit} disabled={!name || !description || !startDate || !endDate || participants.length === 0}>
                    Изменить
                </Button>
            </Stack>
        </Modal>
    );
}
