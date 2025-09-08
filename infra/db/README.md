# Vatevo Database Migration Plan

**Target**: Migrate from SQLite to PostgreSQL  
**Status**: ⚠️ **In Progress**  
**Priority**: **CRITICAL** - Required for production

## Migration Strategy

### Phase 1: Alembic Setup
1. **Install Alembic**: Add to Poetry dependencies
2. **Initialize**: Create alembic configuration
3. **Generate Migration**: Create initial migration from current models
4. **Verify**: Ensure models ↔ migrations are in sync

### Phase 2: Environment Configuration
1. **Environment Variables**: Add `POSTGRES_URL` to all environments
2. **Connection Pooling**: Configure `DB_POOL_SIZE` and `DB_SSL_MODE`
3. **Fallback**: Keep SQLite for local development
4. **Health Checks**: Add database connectivity monitoring

### Phase 3: Production Migration
1. **Database Provisioning**: Set up PostgreSQL instance
2. **Data Migration**: Migrate existing data (if any)
3. **Connection Testing**: Verify all environments
4. **Monitoring**: Set up database health checks

## Database Configuration

### Environment Variables
```bash
# Required for all environments
POSTGRES_URL=postgresql://user:password@host:port/database
DB_POOL_SIZE=10
DB_SSL_MODE=require

# Optional (for connection tuning)
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

### Connection String Format
```
postgresql://username:password@hostname:port/database_name?sslmode=require
```

## Migration Commands

### Initialize Alembic (Already Done)
```bash
cd apps/api
# Alembic is already included in pyproject.toml
alembic init alembic
```

### Generate Initial Migration
```bash
# Generate migration from current models
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### Verify Migration
```bash
# Check current revision
alembic current

# Check migration history
alembic history

# Verify database schema
alembic show head
```

## Production Migration

### Using the Preparation Script
```bash
# Set the database URL
export POSTGRES_URL="postgresql://user:password@host:port/database"

# Run the preparation script
./ops/db/prepare_postgres.sh

# Or with custom timeout
./ops/db/prepare_postgres.sh -t 60
```

### Manual Migration Steps
```bash
# 1. Test database connection
python ops/db/check_connection.py --url "$POSTGRES_URL"

# 2. Run Alembic upgrade
cd apps/api
export DATABASE_URL="$POSTGRES_URL"
alembic upgrade head

# 3. Verify migration status
alembic current
alembic heads
```

## Health Checks

### Database Health Endpoint
- **Path**: `/health/db`
- **Method**: GET
- **Response**: `{"status": "ok", "database": "connected"}`
- **Timeout**: 5 seconds
- **Dependencies**: PostgreSQL connection

### Connection Test Script
- **File**: `ops/db/check_connection.py`
- **Purpose**: Test database connectivity without exposing secrets
- **Usage**: `python ops/db/check_connection.py`

## Production Considerations

### Connection Pooling
- **Min Connections**: 5
- **Max Connections**: 20
- **Timeout**: 30 seconds
- **Recycle**: 1 hour

### SSL/TLS
- **Mode**: `require` (production)
- **Mode**: `prefer` (staging)
- **Mode**: `disable` (local development)

### Monitoring
- **Connection Count**: Monitor active connections
- **Query Performance**: Track slow queries
- **Error Rate**: Monitor connection failures
- **Health Checks**: Regular connectivity tests

## Rollback Plan

### If Migration Fails
1. **Stop Application**: Prevent new connections
2. **Revert Code**: Switch back to SQLite configuration
3. **Restart Services**: Resume with SQLite
4. **Investigate**: Debug migration issues
5. **Retry**: Fix issues and retry migration

### Data Backup
- **Before Migration**: Export all data to SQL
- **During Migration**: Keep SQLite file as backup
- **After Migration**: Verify data integrity
- **Rollback**: Restore from SQLite if needed

## Success Criteria

### Technical
- [ ] Alembic initialized and configured
- [ ] Initial migration generated and applied
- [ ] All models properly migrated
- [ ] Health checks working
- [ ] Connection pooling configured

### Functional
- [ ] All API endpoints working
- [ ] Database queries performing well
- [ ] No data loss during migration
- [ ] Health monitoring active
- [ ] Rollback procedure tested

## Next Steps

1. **Add Alembic**: Update `pyproject.toml`
2. **Initialize**: Run `alembic init`
3. **Generate Migration**: Create initial migration
4. **Update Config**: Add PostgreSQL support
5. **Test Locally**: Verify migration works
6. **Deploy**: Apply to staging/production

---

**Estimated Time**: 4-6 hours  
**Risk Level**: Medium (data migration required)  
**Dependencies**: PostgreSQL instance, environment variables
