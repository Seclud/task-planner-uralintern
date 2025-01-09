import { useEffect, useState } from 'react';
import { Table, Button, Group, Text, Select, TextInput, Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

const roleNames = {
    0: 'Admin',
    1: 'Leader',
    2: 'Curator',
    3: 'Intern'
};

function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchEmail, setSearchEmail] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const navigate = useNavigate();

    const fetchUsers = async () => {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://127.0.0.1:8000/users/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        setUsers(data);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUserClick = (userId) => {
        navigate(`/users/${userId}`);
    };

    const handleEditClick = (userId, currentRole) => {
        setEditingUserId(userId);
        setSelectedRole(currentRole.toString());
    };

    const handleSaveClick = async (userId) => {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://127.0.0.1:8000/users/${userId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const userData = await response.json();
        const updatedUser = {
            ...userData,
            role: parseInt(selectedRole)
        };
        await fetch(`http://127.0.0.1:8000/users/${userId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedUser)
        });
        setEditingUserId(null);
        fetchUsers();
    };

    const handleSort = () => {
        const sortedUsers = [...users].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.role - b.role;
            } else {
                return b.role - a.role;
            }
        });
        setUsers(sortedUsers);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const filteredUsers = users.filter(user => user.email.includes(searchEmail));

    return (
        <div>
            <Container size="100rem">
                <Group position="apart" style={{ marginBottom: 20 }}>
                    <Text weight={500} size="xl">Все пользователи</Text>
                    {/* <Button onClick={() => navigate('/admin')}>Back to Admin Dashboard</Button> */}
                </Group>

                <TextInput
                    placeholder="Поиск по почте"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.currentTarget.value)}
                    style={{ marginBottom: 20 }}
                />
                <Table variant="default" layout="fixed" withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th w={80}>Имя</Table.Th>
                            <Table.Th w={120}>Почта</Table.Th>
                            <Table.Th w={40} onClick={handleSort} style={{ cursor: 'pointer' }}>
                                Роль {sortOrder === 'asc' ? '↑' : '↓'}
                            </Table.Th>
                            <Table.Th w={30}>Действия</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredUsers.map(user => (
                            <Table.Tr key={user.id}>
                                <Table.Td>{user.username}</Table.Td>
                                <Table.Td>{user.email}</Table.Td>
                                <Table.Td>
                                    {editingUserId === user.id ? (
                                        <Select
                                            value={selectedRole}
                                            onChange={setSelectedRole}
                                            data={[
                                                { value: '0', label: 'Admin' },
                                                { value: '1', label: 'Leader' },
                                                { value: '2', label: 'Curator' },
                                                { value: '3', label: 'Intern' }
                                            ]}
                                        />
                                    ) : (
                                        roleNames[user.role]
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    {editingUserId === user.id ? (
                                        <Button size="xs" onClick={() => handleSaveClick(user.id)}>Сохранить</Button>
                                    ) : (
                                        <Button size="xs" onClick={() => handleEditClick(user.id, user.role)}>Изменить</Button>
                                    )}
                                    {/* <Button size="xs" onClick={() => handleUserClick(user.id)}>View</Button> */}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Container>
        </div>
    );
}

export default AdminUsersPage;
