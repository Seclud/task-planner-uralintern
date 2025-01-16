import { AppShell, Button, Group, Burger, Drawer, Text } from '@mantine/core';
import { useState } from 'react';
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useMediaQuery } from '@mantine/hooks';
import { em } from '@mantine/core';
import classes from './Layout.module.css';

export default function Layout() {
    const { isAuthenticated, user, logout } = useAuth();
    const [opened, setOpened] = useState(false);
    const isMobile = useMediaQuery(`(max-width: ${em(768)})`);

    return (
        <AppShell
            padding="md"
            header={{ height: 74 }}
        >
            <AppShell.Header>
                    <Burger opened={opened} onClick={() => setOpened((o) => !o)} hiddenFrom="sm" size="sm" />
                    {!isMobile && (
                        <div className={classes.navLinks}>
                            <Link to="all-projects">
                                <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md">Все Проекты</Button>
                            </Link>
                            <Link to="projects">
                                <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md">Мои Проекты</Button>
                            </Link>
                            <Link to="tasks">
                                <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md">Мои задачи</Button>
                            </Link>
                            {isAuthenticated && user && user.role === 0 && (
                                <>
                                    <Link to="admin/users">
                                        <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md">Список пользователей</Button>
                                    </Link>
                                    <Link to="admin/requests">
                                        <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md">Заявки на участие</Button>
                                    </Link>
                                </>
                            )}
                            {
                                !isAuthenticated &&
                                <Group>
                                    <Link to="login">
                                        <Button variant="subtle" color="gray" size="md">Авторизоваться</Button>
                                    </Link>
                                    <Link to="registration">
                                        <Button color="#5C74B7" variant="filled" size="md">Зарегистрироваться</Button>
                                    </Link>
                                </Group>
                            }
                            {
                                isAuthenticated &&
                                <Group>
                                    <Link to="profile">
                                        <Button color="#5C74B7">Профиль</Button>
                                    </Link>
                                    <Button variant="subtle" color="gray" size="md" onClick={() => {
                                        logout();
                                        window.location.reload();
                                    }}>Выйти</Button>
                                </Group>
                            }
                        </div>
                    )}
            </AppShell.Header>
            <AppShell.Main >
                <Outlet />
            </AppShell.Main>
            <Drawer
                opened={opened}
                onClose={() => setOpened(false)}
                title="Навигация"
                padding="md"
                size="sm"
            >
                <Link to="all-projects" onClick={() => setOpened(false)}>
                    <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md" fullWidth>Все Проекты</Button>
                </Link>
                <Link to="projects" onClick={() => setOpened(false)}>
                    <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md" fullWidth>Мои Проекты</Button>
                </Link>
                <Link to="tasks" onClick={() => setOpened(false)}>
                    <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md" fullWidth>Список задач</Button>
                </Link>
                {isAuthenticated && user && user.role === 0 && (
                    <>
                        <Link to="admin/users" onClick={() => setOpened(false)}>
                            <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md" fullWidth>Список пользователей</Button>
                        </Link>
                        <Link to="admin/requests" onClick={() => setOpened(false)}>
                            <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md" fullWidth>Заявки на участие</Button>
                        </Link>
                    </>
                )}
                {
                    !isAuthenticated &&
                    <Group direction="column" grow>
                        <Link to="login" onClick={() => setOpened(false)}>
                            <Button variant="subtle" color="gray" size="md" fullWidth>Авторизоваться</Button>
                        </Link>
                        <Link to="registration" onClick={() => setOpened(false)}>
                            <Button color="#5C74B7" variant="filled" size="md" fullWidth>Зарегистрироваться</Button>
                        </Link>
                    </Group>
                }
                {
                    isAuthenticated &&
                    <Group direction="column" grow>
                        <Link to="profile" onClick={() => setOpened(false)}>
                            <Button  color="#5C74B7" fullWidth>Профиль</Button>
                        </Link>
                        <Button variant="subtle" color="gray" size="md" fullWidth onClick={() => {
                            logout();
                            window.location.reload();
                        }}>Выйти</Button>
                    </Group>
                }
            </Drawer>
        </AppShell>
    );
}
