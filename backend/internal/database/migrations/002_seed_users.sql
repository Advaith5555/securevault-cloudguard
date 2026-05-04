INSERT INTO users (name, email, password_hash, role)
VALUES
    (
        'Admin User',
        'admin@securevault.local',
        '$2a$10$qIaPlBnQYzV/EEpPoJ5Kv.5YavaELveM0EDG1JPDimCBainsBGv.K',
        'admin'
    ),
    (
        'Developer User',
        'developer@securevault.local',
        '$2a$10$purt0AyMfWZZTLctg8cNeOUs8fb5Br1pWjepHbCAwqdSheDvfEeY6',
        'developer'
    ),
    (
        'Viewer User',
        'viewer@securevault.local',
        '$2a$10$dVo1CUX83S/XEyRMGihLbOz/V6.RoAzLYqjJ6TcRNpeSMDrSOTpIW',
        'viewer'
    )
ON CONFLICT (email) DO NOTHING;
