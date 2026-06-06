-- 003_seed_demo_data.sql
-- Populates demo secrets, risk findings, and audit log history so the
-- dashboard immediately resembles a real internal DevSecOps platform.
--
-- Apply ONCE, after 001_init.sql and 002_seed_users.sql.
-- All secret_ref values are vault/cloud references only — no plaintext credentials.

DO $$
DECLARE
    admin_id   UUID;
    dev_id     UUID;
    viewer_id  UUID;

    s_openai   UUID;
    s_redis    UUID;
    s_slack    UUID;
    s_stripe   UUID;
    s_github   UUID;
    s_jwt      UUID;
    s_postgres UUID;
    s_k8s      UUID;
BEGIN
    SELECT id INTO admin_id  FROM users WHERE email = 'admin@securevault.local';
    SELECT id INTO dev_id    FROM users WHERE email = 'developer@securevault.local';
    SELECT id INTO viewer_id FROM users WHERE email = 'viewer@securevault.local';

    ---------------------------------------------------------------------------
    -- SECRETS
    ---------------------------------------------------------------------------

    -- [dev] openai-api-key — AI gateway key for development workloads
    INSERT INTO secrets (
        name, environment, owner, service, secret_ref,
        created_by, created_at, updated_at, last_accessed_at, expires_at
    ) VALUES (
        'openai-api-key', 'dev', 'ai-platform', 'ai-gateway',
        'vault://development/ai/openai-api-key',
        dev_id,
        NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days',
        NOW() - INTERVAL '2 days',
        NULL
    ) RETURNING id INTO s_openai;

    -- [dev] redis-token — cache token, intentionally expired to surface a scanner finding
    INSERT INTO secrets (
        name, environment, owner, service, secret_ref,
        created_by, created_at, updated_at, last_accessed_at, expires_at
    ) VALUES (
        'redis-token', 'dev', 'platform-team', 'redis-cache',
        'vault://development/cache/redis-token',
        dev_id,
        NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days',
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '7 days'
    ) RETURNING id INTO s_redis;

    -- [dev] slack-webhook-token — notification webhook for the dev environment
    INSERT INTO secrets (
        name, environment, owner, service, secret_ref,
        created_by, created_at, updated_at, last_accessed_at, expires_at
    ) VALUES (
        'slack-webhook-token', 'dev', 'platform-team', 'notifications',
        'vault://development/integrations/slack-webhook-token',
        dev_id,
        NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '5 days',
        NOW() + INTERVAL '75 days'
    ) RETURNING id INTO s_slack;

    -- [staging] stripe-api-key — payments integration key for staging
    INSERT INTO secrets (
        name, environment, owner, service, secret_ref,
        created_by, created_at, updated_at, last_accessed_at, expires_at
    ) VALUES (
        'stripe-api-key', 'staging', 'payments-team', 'payments-api',
        'aws-secretsmanager://payments/stripe-api-key',
        admin_id,
        NOW() - INTERVAL '50 days', NOW() - INTERVAL '50 days',
        NOW() - INTERVAL '3 days',
        NOW() + INTERVAL '40 days'
    ) RETURNING id INTO s_stripe;

    -- [staging] github-actions-token — CI/CD token for staging pipelines
    INSERT INTO secrets (
        name, environment, owner, service, secret_ref,
        created_by, created_at, updated_at, last_accessed_at, expires_at
    ) VALUES (
        'github-actions-token', 'staging', 'platform-team', 'github-actions',
        'vault://staging/ci/github-actions-token',
        admin_id,
        NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '25 days'
    ) RETURNING id INTO s_github;

    -- [prod] jwt-signing-key — authentication service signing key
    INSERT INTO secrets (
        name, environment, owner, service, secret_ref,
        created_by, created_at, updated_at, last_accessed_at, expires_at
    ) VALUES (
        'jwt-signing-key', 'prod', 'platform-team', 'auth-service',
        'vault://production/auth/jwt-signing-key',
        admin_id,
        NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days',
        NOW() - INTERVAL '4 hours',
        NOW() + INTERVAL '120 days'
    ) RETURNING id INTO s_jwt;

    -- [prod] postgres-password — primary database credential, no expiry set (drives a risk finding)
    INSERT INTO secrets (
        name, environment, owner, service, secret_ref,
        created_by, created_at, updated_at, last_accessed_at, expires_at
    ) VALUES (
        'postgres-password', 'prod', 'data-engineering', 'postgres-cluster',
        'vault://production/database/postgres-password',
        admin_id,
        NOW() - INTERVAL '55 days', NOW() - INTERVAL '20 days',
        NOW() - INTERVAL '6 hours',
        NULL
    ) RETURNING id INTO s_postgres;

    -- [prod] kubernetes-service-account — cluster service account for workload identity
    INSERT INTO secrets (
        name, environment, owner, service, secret_ref,
        created_by, created_at, updated_at, last_accessed_at, expires_at
    ) VALUES (
        'kubernetes-service-account', 'prod', 'platform-team', 'kubernetes',
        'vault://production/k8s/kubernetes-service-account',
        admin_id,
        NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days',
        NOW() - INTERVAL '12 hours',
        NOW() + INTERVAL '325 days'
    ) RETURNING id INTO s_k8s;

    ---------------------------------------------------------------------------
    -- RISK FINDINGS
    -- Uses the same risk_type constants as the scanner where applicable so
    -- findings remain accurate after a re-scan is triggered from the UI.
    ---------------------------------------------------------------------------

    -- redis-token: expired — matches scanner's exact description for expired_secret
    INSERT INTO risk_findings (secret_id, risk_type, risk_level, description, recommendation, created_at)
    VALUES (
        s_redis,
        'expired_secret', 'high',
        'Secret expiry date has already passed',
        'Rotate or remove the expired secret',
        NOW() - INTERVAL '7 days'
    );

    -- jwt-signing-key: key rotation policy not enforced
    INSERT INTO risk_findings (secret_id, risk_type, risk_level, description, recommendation, created_at)
    VALUES (
        s_jwt,
        'key_rotation', 'high',
        'JWT signing key has not been rotated in over 60 days, exceeding the recommended 30-day rotation policy',
        'Rotate the JWT signing key immediately and configure automated monthly rotation via Vault policies',
        NOW() - INTERVAL '5 days'
    );

    -- postgres-password: no expiration date on a production credential
    INSERT INTO risk_findings (secret_id, risk_type, risk_level, description, recommendation, created_at)
    VALUES (
        s_postgres,
        'no_expiry', 'medium',
        'Production database password has no expiration date, violating the credential lifecycle policy',
        'Set an expiration window of 90 days and enable automated rotation via Vault dynamic secrets for postgres-cluster',
        NOW() - INTERVAL '3 days'
    );

    -- github-actions-token: expiring within 25 days
    INSERT INTO risk_findings (secret_id, risk_type, risk_level, description, recommendation, created_at)
    VALUES (
        s_github,
        'expiry_risk', 'high',
        'GitHub Actions token expires in approximately 25 days — CI/CD pipelines will fail if not renewed',
        'Renew the token before expiry and configure an automated alert for tokens expiring within 30 days',
        NOW() - INTERVAL '2 days'
    );

    -- stripe-api-key: approaching expiry with 40 days remaining
    INSERT INTO risk_findings (secret_id, risk_type, risk_level, description, recommendation, created_at)
    VALUES (
        s_stripe,
        'expiry_risk', 'medium',
        'Stripe API key in staging is approaching its expiry date with 40 days remaining',
        'Rotate the staging Stripe key and validate it in the payments-api integration test suite before promoting to production',
        NOW() - INTERVAL '1 day'
    );

    -- openai-api-key: no usage rate limit configured
    INSERT INTO risk_findings (secret_id, risk_type, risk_level, description, recommendation, created_at)
    VALUES (
        s_openai,
        'access_scope', 'low',
        'OpenAI API key in development has no usage rate limit configured, risking unexpected cost overruns',
        'Configure spend limits in the OpenAI dashboard and add a cost-alert threshold at the ai-gateway layer',
        NOW() - INTERVAL '10 days'
    );

    ---------------------------------------------------------------------------
    -- AUDIT LOGS
    -- Action strings match exactly what the Go handlers emit:
    --   secret_created, secret_updated, secret_accessed, login, risk_scan_executed
    ---------------------------------------------------------------------------

    -- Secret creation events (chronological, one per secret)
    INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, status, ip_address, message, created_at)
    VALUES
        (admin_id,  'admin@securevault.local',     'secret_created', 'secret', s_jwt,      'success', '10.0.1.15',   'secret metadata created', NOW() - INTERVAL '60 days'),
        (admin_id,  'admin@securevault.local',     'secret_created', 'secret', s_postgres, 'success', '10.0.1.15',   'secret metadata created', NOW() - INTERVAL '55 days'),
        (admin_id,  'admin@securevault.local',     'secret_created', 'secret', s_stripe,   'success', '10.0.1.22',   'secret metadata created', NOW() - INTERVAL '50 days'),
        (dev_id,    'developer@securevault.local', 'secret_created', 'secret', s_openai,   'success', '10.0.2.8',    'secret metadata created', NOW() - INTERVAL '45 days'),
        (admin_id,  'admin@securevault.local',     'secret_created', 'secret', s_k8s,      'success', '10.0.1.15',   'secret metadata created', NOW() - INTERVAL '40 days'),
        (admin_id,  'admin@securevault.local',     'secret_created', 'secret', s_github,   'success', '10.0.1.22',   'secret metadata created', NOW() - INTERVAL '35 days'),
        (dev_id,    'developer@securevault.local', 'secret_created', 'secret', s_redis,    'success', '10.0.2.8',    'secret metadata created', NOW() - INTERVAL '30 days'),
        (dev_id,    'developer@securevault.local', 'secret_created', 'secret', s_slack,    'success', '10.0.2.11',   'secret metadata created', NOW() - INTERVAL '20 days');

    -- Login events (successful + one failed brute-force attempt from external IP)
    INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, status, ip_address, message, created_at)
    VALUES
        (admin_id,  'admin@securevault.local',     'login', 'auth', NULL, 'success', '10.0.1.15',   'user logged in successfully',  NOW() - INTERVAL '45 days'),
        (dev_id,    'developer@securevault.local', 'login', 'auth', NULL, 'success', '10.0.2.8',    'user logged in successfully',  NOW() - INTERVAL '30 days'),
        (admin_id,  'admin@securevault.local',     'login', 'auth', NULL, 'success', '10.0.1.22',   'user logged in successfully',  NOW() - INTERVAL '18 days'),
        (viewer_id, 'viewer@securevault.local',    'login', 'auth', NULL, 'success', '10.0.3.5',    'user logged in successfully',  NOW() - INTERVAL '12 days'),
        (NULL,      'unknown@external.io',         'login', 'auth', NULL, 'failed',  '203.0.113.42','invalid email or password',   NOW() - INTERVAL '10 days');

    -- Secret access events
    INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, status, ip_address, message, created_at)
    VALUES
        (admin_id,  'admin@securevault.local',     'secret_accessed', 'secret', s_jwt,      'success', '10.0.1.15',  'secret access simulated', NOW() - INTERVAL '35 days'),
        (dev_id,    'developer@securevault.local', 'secret_accessed', 'secret', s_openai,   'success', '10.0.2.8',   'secret access simulated', NOW() - INTERVAL '14 days'),
        (dev_id,    'developer@securevault.local', 'secret_accessed', 'secret', s_redis,    'success', '10.0.2.8',   'secret access simulated', NOW() - INTERVAL '9 days'),
        (admin_id,  'admin@securevault.local',     'secret_accessed', 'secret', s_postgres, 'success', '10.0.1.15',  'secret access simulated', NOW() - INTERVAL '7 days'),
        (viewer_id, 'viewer@securevault.local',    'secret_accessed', 'secret', s_jwt,      'denied',  '10.0.3.5',   'access denied: insufficient role for production secret', NOW() - INTERVAL '12 days'),
        (viewer_id, 'viewer@securevault.local',    'secret_accessed', 'secret', s_postgres, 'denied',  '10.0.3.5',   'access denied: insufficient role for production secret', NOW() - INTERVAL '11 days');

    -- Secret update events
    INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, status, ip_address, message, created_at)
    VALUES
        (admin_id, 'admin@securevault.local', 'secret_updated', 'secret', s_postgres, 'success', '10.0.1.15', 'secret metadata updated', NOW() - INTERVAL '20 days'),
        (admin_id, 'admin@securevault.local', 'secret_updated', 'secret', s_k8s,      'success', '10.0.1.15', 'secret metadata updated', NOW() - INTERVAL '10 days');

    -- Risk scan events
    INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, status, ip_address, message, created_at)
    VALUES
        (admin_id, 'admin@securevault.local', 'risk_scan_executed', 'risk', NULL, 'success', '10.0.1.15', 'risk scan completed', NOW() - INTERVAL '15 days'),
        (admin_id, 'admin@securevault.local', 'risk_scan_executed', 'risk', NULL, 'success', '10.0.1.22', 'risk scan completed', NOW() - INTERVAL '3 days');

END $$;
