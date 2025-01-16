
import {Button, Space, Text, TextInput, Title, Modal, Stack} from "@mantine/core";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import { BACKEND_URL } from '../main.jsx';


export default function UserChangeModal(props) {
    const navigate = useNavigate();
    const [username, setusername] = useState('');
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [id, setId] = useState('')
    const [phone, setPhone] = useState('')

    useEffect(() => {
        setusername(props.username || '');
        setEmail(props.email || '');
        setId(props.userId || '')
        setPhone(props.phone || '')
    }, [props.username, props.email, props.userId, props.phone]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('authToken');
        const user = {username, email, phone};

        try {
            const response = await fetch(`${BACKEND_URL}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(user)
            });

            if (!response.ok) {
                throw new Error('Failed to change user');
            }

            navigate('/profile');
            props.setIsOpen(false);
        } catch (error) {
            console.error('Failed to change user:', error);
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
                <Title order={2} ta="center" mt="md">Редактировать пользователя</Title>
                <TextInput
                    label="Имя"
                    placeholder="Введите новое имя"
                    onChange={(e) => setusername(e.target.value)}
                    value={username}
                />
                <TextInput
                    label="Почта"
                    placeholder="Введите новую почту"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                />
                <TextInput
                    label="Телефон"
                    placeholder="Введите новый телефон"
                    onChange={(e) => setPhone(e.target.value)}
                    value={phone}
                />


                {errorMessage &&
                    <>
                        <Space h='md'/>
                        <Text c='red'>{errorMessage}</Text>
                    </>
                }

                <Button color="#5C74B7" onClick={handleSubmit} disabled={!username || !email || !phone}>
                    Изменить
                </Button>
            </Stack>
        </Modal>
    );
}