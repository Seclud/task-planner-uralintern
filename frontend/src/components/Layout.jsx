import {AppShell, Button, Group} from '@mantine/core';
import {Link, Outlet} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext.jsx";
import styles from './Layout.module.css'

export default function Layout() {
    const {isAuthenticated, user, logout} = useAuth();

    return (
        <AppShell padding="md" header={{height: 74}}>
            <AppShell.Header>
                <div className={styles.header}>
                    <Link to="projects">
                        <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md">Мои Проекты</Button>
                    </Link>
                    <Link to="tasks">
                        <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md">Список задач</Button>
                    </Link>
                    {isAuthenticated && user && user.role === 0 && (
                        <Link to="admin/users">
                            <Button variant="subtle" color="rgba(82, 82, 82, 1)" size="md">Список пользователей</Button>
                        </Link>
                    )}
                    {
                        !isAuthenticated &&
                        <Group>
                            <Link to="login">
                                <Button variant="subtle" color="gray" size="md">Авторизоваться</Button>
                            </Link>
                            <Link to="registration">
                                <Button variant="filled" color="indigo" size="md">Зарегистрироваться</Button>
                            </Link>
                        </Group>
                    }
                    {
                        isAuthenticated &&
                        <Group>
                            <Link to="profile">
                                <Button>Профиль</Button>
                            </Link>
                            <Button variant="subtle" color="gray" size="md" onClick={() => {
                                logout()
                                window.location.reload()
                            }}>Выйти</Button>
                        </Group>
                    }
                </div>
            </AppShell.Header>
            <AppShell.Main>
                <Outlet/>
            </AppShell.Main>
        </AppShell>
    );
}
