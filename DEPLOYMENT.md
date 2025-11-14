# Production Deployment Guide

## Prerequisites
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+
- PM2 (for process management)

## Environment Setup

### 1. Database Configuration
```bash
# Connect to MySQL
mysql -h yamanote.proxy.rlwy.net -u root -p --port 36349 --protocol=TCP railway

# Run schema
mysql -h yamanote.proxy.rlwy.net -u root -p --port 36349 --protocol=TCP railway < database/schema.sql

# Run seed data
mysql -h yamanote.proxy.rlwy.net -u root -p --port 36349 --protocol=TCP railway < database/seed.sql
```

### 2. Backend Setup
```bash
cd backend
npm install --production
```

Create `.env` file:
```env
NODE_ENV=production
PORT=3001
DB_HOST=yamanote.proxy.rlwy.net
DB_PORT=36349
DB_USER=root
DB_PASSWORD=MteyGnigTYTKfEqOOTemnSzUOdPMBEpz
DB_NAME=railway
REDIS_URL=redis://default:yVSmSKMhIrpPADjuQVvdhkPkiVDbAORo@interchange.proxy.rlwy.net:56942
JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=CHANGE_THIS_TO_32_CHARACTER_KEY
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build
```

## Production Deployment

### Using PM2

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start backend:
```bash
cd backend
pm2 start server.js --name production-backend
```

3. Serve frontend (using serve):
```bash
npm install -g serve
cd frontend
pm2 start "serve -s dist -l 3000" --name production-frontend
```

4. Save PM2 configuration:
```bash
pm2 save
pm2 startup
```

### Using Docker

1. Build images:
```bash
docker-compose build
```

2. Start services:
```bash
docker-compose up -d
```

## Security Checklist

- [ ] Change JWT_SECRET to secure random string
- [ ] Change ENCRYPTION_KEY to 32-character random string
- [ ] Configure SMTP credentials
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure Redis persistence
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure CORS properly
- [ ] Review and update default passwords

## Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
pm2 status
```

### Health Checks
- Backend: http://localhost:3001/health
- Frontend: http://localhost:3000

## Backup Strategy

### Database Backup
```bash
mysqldump -h yamanote.proxy.rlwy.net -u root -p --port 36349 railway > backup_$(date +%Y%m%d).sql
```

### Automated Backups
Set up cron job:
```bash
0 2 * * * /path/to/backup-script.sh
```

## Troubleshooting

### Backend Issues
```bash
pm2 logs production-backend
pm2 restart production-backend
```

### Database Connection
```bash
mysql -h yamanote.proxy.rlwy.net -u root -p --port 36349 --protocol=TCP railway
```

### Redis Connection
```bash
redis-cli -u redis://default:yVSmSKMhIrpPADjuQVvdhkPkiVDbAORo@interchange.proxy.rlwy.net:56942
```

## Performance Optimization

1. Enable Redis caching
2. Configure database connection pooling
3. Enable gzip compression
4. Optimize database queries
5. Set up CDN for static assets
6. Enable HTTP/2
7. Configure load balancing

## Scaling

### Horizontal Scaling
- Use load balancer (nginx/HAProxy)
- Deploy multiple backend instances
- Configure session sharing via Redis
- Use database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database indexes
- Enable query caching
- Configure connection pooling