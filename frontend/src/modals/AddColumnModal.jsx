import { Modal, Button, TextInput } from '@mantine/core';
import { useState } from 'react';
import PropTypes from 'prop-types';

function AddColumnModal({ isOpen, setIsOpen, addColumn }) {
    const [status, setStatus] = useState('');

    const handleAddColumn = () => {
        addColumn(status);
        setIsOpen(false);
        setStatus('');
    };

    return (
        <Modal opened={isOpen} onClose={() => setIsOpen(false)} title="Добавить статус">
            <TextInput
                label="Введите название статуса"
                value={status}
                onChange={(e) => setStatus(e.currentTarget.value)}
                required
            />
            <Button color="#5C74B7" onClick={handleAddColumn} style={{ marginTop: 10 }}>
                Добавить статус
            </Button>
        </Modal>
    );
}

AddColumnModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    addColumn: PropTypes.func.isRequired,
};

export default AddColumnModal;
