import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Paper, PasswordInput, Space, TextInput, Title, Text, Button, Group } from "@mantine/core";
import styles from "./LoginPage.module.css";
import { BACKEND_URL } from '../main.jsx';

export default function LoginPage() {
    const [username, setName] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const { login } = useAuth();

    const apiUrl = import.meta.env.VITE_API_URL;
    console.log("API URL:", apiUrl);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            const body = new URLSearchParams();
            body.append('username', username);
            body.append('password', password);

            const response = await fetch(`${BACKEND_URL}/login/access-token`, {
                method: 'POST',
                headers: headers,
                body: body,
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Login failed');

            const data = await response.json();

            login(data);
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className={styles.wrapper}>
            <Paper className={styles.form} radius={0} p={30}>
                <Title order={2} ta="center" mt="md" mb={50}>
                    Добро пожаловать
                </Title>

                <TextInput
                    label="Имя"
                    placeholder="Имя пользователя"
                    size="md"
                    value={username}
                    onChange={(event) => setName(event.currentTarget.value)}
                />
                <PasswordInput
                    label="Пароль"
                    placeholder="******"
                    mt="md"
                    size="md"
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                />

                {errorMessage && (
                    <>
                        <Space h="md"/>
                        <Text ta="center" c="red">{errorMessage}</Text>
                    </>
                )}

                <Button color="#5C74B7" fullWidth mt="xl" size="md" onClick={(event) => handleSubmit(event)}>
                    Войти
                </Button>

                <Space h="md"/>
                <Group justify="space-between">
                    <Text ta="space-between">
                        Нет аккаунта?
                    </Text>
                    <Link to="/registration">
                        <Button color="#5C74B7" variant="transparent" size="md">Зарегистрироваться</Button>
                    </Link>
                </Group>
            </Paper>
        </div>
    );
}