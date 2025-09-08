# Release Checklist

**Pre-flight checks for Vatevo releases**

## Pre-Release Checklist

### 1. Code Quality
- [ ] All tests passing (unit, integration, e2e)
- [ ] Code coverage ≥ 80%
- [ ] No critical security vulnerabilities
- [ ] Code review completed
- [ ] Linting and formatting checks passed

### 2. Documentation
- [ ] README.md updated
- [ ] API documentation updated
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Migration guide (if applicable)

### 3. Testing
- [ ] Smoke tests passing
- [ ] Performance tests meeting SLOs
- [ ] Security tests completed
- [ ] Load tests completed
- [ ] Browser compatibility tested

### 4. Deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates valid
- [ ] DNS records configured
- [ ] Monitoring configured

### 5. Demo Preparation
- [ ] Demo data seeded
- [ ] Screenshots generated
- [ ] Demo script prepared
- [ ] Demo environment tested
- [ ] Demo flows verified

## Release Process

### 1. Version Bump
```bash
# Update version in package.json
npm version patch  # or minor, major

# Update version in other files
# - apps/api/pyproject.toml
# - apps/dashboard/package.json
# - apps/marketing/package.json
# - apps/docs/package.json
```

### 2. Create Release Branch
```bash
# Create release branch
git checkout -b release/v0.1.0

# Push release branch
git push origin release/v0.1.0
```

### 3. Run Pre-Release Tests
```bash
# Run all tests
npm run test:all

# Run smoke tests
./ops/api/smoke.sh

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security
```

### 4. Create Pull Request
- [ ] Create PR from release branch to main
- [ ] Add release notes to PR description
- [ ] Request review from team
- [ ] Address any review comments

### 5. Merge and Tag
```bash
# Merge PR to main
git checkout main
git merge release/v0.1.0

# Create and push tag
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

### 6. Deploy to Production
```bash
# Deploy API
fly deploy --app vatevo-api

# Deploy frontend
vercel --prod

# Deploy documentation
vercel --prod --cwd apps/docs
```

### 7. Post-Deployment Verification
```bash
# Run production smoke tests
./ops/api/smoke.sh -u https://api.vatevo.com

# Check all services
curl https://api.vatevo.com/healthz
curl https://vatevo.com
curl https://dashboard.vatevo.com
curl https://docs.vatevo.com
```

## Release Notes Template

### Version X.Y.Z - Release Date

#### 🎉 New Features
- Feature 1
- Feature 2
- Feature 3

#### 🐛 Bug Fixes
- Fix 1
- Fix 2
- Fix 3

#### 🔧 Improvements
- Improvement 1
- Improvement 2
- Improvement 3

#### 📚 Documentation
- Documentation update 1
- Documentation update 2
- Documentation update 3

#### 🔒 Security
- Security improvement 1
- Security improvement 2
- Security improvement 3

#### 🚀 Performance
- Performance improvement 1
- Performance improvement 2
- Performance improvement 3

#### 💔 Breaking Changes
- Breaking change 1
- Breaking change 2
- Breaking change 3

#### 📦 Dependencies
- Updated dependency 1
- Updated dependency 2
- Updated dependency 3

## Rollback Plan

### 1. API Rollback
```bash
# Rollback API to previous version
fly rollback --app vatevo-api

# Verify rollback
curl https://api.vatevo.com/healthz
```

### 2. Frontend Rollback
```bash
# Rollback frontend to previous version
vercel rollback

# Verify rollback
curl https://vatevo.com
```

### 3. Database Rollback
```bash
# Rollback database migrations
fly ssh console --app vatevo-api
alembic downgrade -1

# Verify rollback
psql $DATABASE_URL -c "SELECT version_num FROM alembic_version;"
```

## Emergency Procedures

### 1. Critical Issues
- [ ] Identify the issue
- [ ] Assess impact
- [ ] Implement hotfix
- [ ] Deploy hotfix
- [ ] Monitor resolution
- [ ] Document incident

### 2. Service Outage
- [ ] Check service status
- [ ] Identify root cause
- [ ] Implement fix
- [ ] Deploy fix
- [ ] Verify recovery
- [ ] Post-mortem

### 3. Security Incident
- [ ] Assess security impact
- [ ] Implement security fix
- [ ] Deploy security fix
- [ ] Monitor for further issues
- [ ] Security post-mortem

## Communication Plan

### 1. Internal Communication
- [ ] Notify team of release
- [ ] Update internal documentation
- [ ] Update status page
- [ ] Notify stakeholders

### 2. External Communication
- [ ] Update customer documentation
- [ ] Send release announcement
- [ ] Update social media
- [ ] Notify partners

### 3. Monitoring
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Monitor user feedback
- [ ] Monitor support tickets

## Success Criteria

### 1. Technical Success
- [ ] All services running
- [ ] Performance within SLOs
- [ ] Error rates < 1%
- [ ] No critical issues

### 2. Business Success
- [ ] Demo completed successfully
- [ ] Customer feedback positive
- [ ] No support escalations
- [ ] Revenue targets met

### 3. Operational Success
- [ ] Deployment completed
- [ ] Monitoring active
- [ ] Documentation updated
- [ ] Team trained

## Post-Release Activities

### 1. Immediate (0-24 hours)
- [ ] Monitor service health
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Respond to issues

### 2. Short Term (1-7 days)
- [ ] Collect user feedback
- [ ] Analyze metrics
- [ ] Identify improvements
- [ ] Plan next release

### 3. Long Term (1-4 weeks)
- [ ] Conduct post-mortem
- [ ] Update processes
- [ ] Plan future releases
- [ ] Share learnings

## Release Metrics

### 1. Deployment Metrics
- [ ] Deployment time
- [ ] Rollback time
- [ ] Downtime duration
- [ ] Error count

### 2. Performance Metrics
- [ ] Response time
- [ ] Throughput
- [ ] Error rate
- [ ] Availability

### 3. Business Metrics
- [ ] User adoption
- [ ] Customer satisfaction
- [ ] Support tickets
- [ ] Revenue impact

---

**Checklist Version**: 1.0  
**Last Updated**: 2025-09-09  
**Next Review**: 2026-09-09  
**Owner**: DevOps Team  
**Status**: Active
