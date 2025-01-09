import { useAuth } from "../contexts/AuthContext.jsx";
import { Button, Paper, Space, Text, Title, Container } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import UserChangeModal from "../modals/UserChangeModal.jsx"
import { useState } from "react";
// import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpenUpdate, setIsOpenUpdate] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUserUpdate = (user) => {
        setSelectedUser(user);
        setIsOpenUpdate(true);
    };

    return (
        <div>
            <Container size="60rem">
                <Paper radius={0} p={30}>
                    <Title order={2} ta="center" mt="md" mb={50}>
                        Профиль пользователя
                    </Title>
                    {user ? (
                        <>
                            <Text size="md">Имя пользователя: {user.username}</Text>
                            <Text size="md">Email: {user.email}</Text>
                            <Text size="md">Телефон: {user.phone}</Text>
                            <Space h="md" />

                            <Button color="yellow" radius="md"  onClick={() => {
                                handleUserUpdate(user)
                            }}>
                                Изменить
                            </Button>

                            <Button radius="md" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </>
                    ) : (
                        <Text size="md">Загрузка...</Text>
                    )}
                </Paper>
                {selectedUser && (
                    <UserChangeModal isOpen={isOpenUpdate} setIsOpen={setIsOpenUpdate} username={selectedUser.username}
                        email={selectedUser.email} phone={selectedUser.phone} userId={selectedUser.id} />
                )}
            </Container>
        </div>
    );
}
