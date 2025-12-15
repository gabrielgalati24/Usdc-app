# Docker Compose - Crypto App Development

## Servicios Incluidos

### Servicios Principales
- **PostgreSQL** (puerto 5432) - Base de datos
- **Redis** (puerto 6379) - Cola de trabajos
- **Ollama** (puerto 11434) - LLM local

### Herramientas Opcionales (profile: tools)
- **pgAdmin** (puerto 5050) - Administrador de PostgreSQL
- **Redis Commander** (puerto 8081) - Administrador de Redis

## Uso

### Iniciar servicios principales
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Iniciar con herramientas de administración
```bash
docker-compose -f docker-compose.dev.yml --profile tools up -d
```

### Ver logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Detener servicios
```bash
docker-compose -f docker-compose.dev.yml down
```

### Detener y eliminar volúmenes (⚠️ borra datos)
```bash
docker-compose -f docker-compose.dev.yml down -v
```

## Configurar Ollama

Después de iniciar Ollama, descarga el modelo:

```bash
# Opción 1: Desde el host
docker exec -it crypto-ollama ollama pull llama3

# Opción 2: Desde dentro del contenedor
docker exec -it crypto-ollama bash
ollama pull llama3
ollama list
```

## Acceso a Herramientas

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **App** | http://localhost:3000 | - |
| **pgAdmin** | http://localhost:5050 | admin@crypto.local / admin |
| **Redis Commander** | http://localhost:8081 | - |
| **Ollama** | http://localhost:11434 | - |

### Conectar pgAdmin a PostgreSQL

1. Abrir http://localhost:5050
2. Login: `admin@crypto.local` / `admin`
3. Add New Server:
   - **General > Name**: Crypto DB
   - **Connection > Host**: `postgres`
   - **Connection > Port**: `5432`
   - **Connection > Database**: `crypto_db`
   - **Connection > Username**: `postgres`
   - **Connection > Password**: `test`

## Health Checks

Verificar que los servicios estén saludables:

```bash
docker-compose -f docker-compose.dev.yml ps
```

Todos deben mostrar `healthy` en la columna Status.

## Volúmenes Persistentes

Los datos se guardan en volúmenes Docker:
- `postgres_data` - Datos de PostgreSQL
- `redis_data` - Datos de Redis
- `ollama_data` - Modelos de Ollama
- `pgadmin_data` - Configuración de pgAdmin

## Troubleshooting

### PostgreSQL no inicia
```bash
docker-compose -f docker-compose.dev.yml logs postgres
```

### Redis no conecta
```bash
docker exec -it crypto-redis redis-cli ping
# Debe responder: PONG
```

### Ollama no responde
```bash
docker exec -it crypto-ollama ollama list
```

## Mejores Prácticas Implementadas

✅ **Health checks** - Monitoreo automático de servicios  
✅ **Restart policies** - Reinicio automático en caso de fallo  
✅ **Volúmenes nombrados** - Persistencia de datos  
✅ **Network aislada** - Comunicación segura entre servicios  
✅ **Alpine images** - Imágenes ligeras  
✅ **Profiles** - Herramientas opcionales separadas  
✅ **Resource limits** - Preparado para límites de recursos  
✅ **Environment variables** - Configuración centralizada
