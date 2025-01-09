import { useEffect, useState } from 'react';
import { Button, Group, Paper, PasswordInput, Select, Space, Text, TextInput, Title } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import { notifications } from '@mantine/notifications';
import styles from "./LoginPage.module.css";
import '@mantine/notifications/styles.css';

function RegistrationPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            setErrorMessage('Почта или пароль не могут быть пустыми');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Пароли не совпадают');
            return;
        }


        try {
            const response = await fetch(`http://localhost:8000/users/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, phone, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                const errorMessage = data.detail || 'Registration failed';
                throw new Error(errorMessage);
            }
            setErrorMessage('');

            notifications.show({
                title: 'Аккаунт зарегистрирован',
                color: 'green',
                autoClose: 15000,
                onClose: () => navigate('/login')
            });
        } catch (error) {
            console.error('Registration error:', error);
            setErrorMessage(error.message)
        }
    };

    return (
        <div className={styles.wrapper}>
            <Paper className={styles.form} radius={0} p={30}>
                <Title order={2} className={styles.title} ta="center" mt="md" mb={50}>
                    👋 Добро пожаловать!
                </Title>

                <TextInput
                    label="Имя"
                    placeholder="Имя пользователя"
                    size="md"
                    value={username}
                    onChange={(event) => setUsername(event.currentTarget.value)}
                />

                <TextInput
                    label="Почта"
                    placeholder="hello@gmail.com"
                    size="md"
                    value={email}
                    onChange={(event) => setEmail(event.currentTarget.value)}
                />

                <TextInput
                    label="Телефон"
                    placeholder="+79000000000"
                    size="md"
                    value={phone}
                    onChange={(event) => setPhone(event.currentTarget.value)}
                />

                <PasswordInput
                    label="Пароль"
                    placeholder="******"
                    mt="md"
                    size="md"
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                />
                <PasswordInput
                    label="Подтвердите пароль"
                    placeholder="******"
                    mt="md"
                    size="md"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                />

                {
                    errorMessage &&
                    <>
                        <Space h="md" />
                        <Text ta="center" c="red">{errorMessage}</Text>
                    </>
                }
                <Button fullWidth mt="xl" size="md" onClick={(event) => handleSubmit(event)}>
                    Зарегистрироваться
                </Button>

                <Space h="md" />
                <Group justify="space-between">
                    <Text ta="space-between">
                        Уже есть аккаунт?
                    </Text>
                    <Link to="/login">
                        <Button variant="transparent" size="md">Войти</Button>
                    </Link>
                </Group>
            </Paper>
        </div>
    )

}

export default RegistrationPage;