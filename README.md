<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Polygon-8247E5?style=for-the-badge&logo=polygon&logoColor=white" alt="Polygon"/>
</p>

<h1 align="center">🚀 USDC App</h1>

<p align="center">
  <strong>Sistema completo de gestión de criptomonedas con agentes inteligentes</strong>
</p>

<p align="center">
  Transferencias USDC on-chain · Wallet interno · Análisis financiero con IA · Arquitectura escalable
</p>

---

## ✨ Características Principales

| Módulo | Descripción |
|--------|-------------|
| 🔐 **Autenticación** | Sistema JWT seguro con registro e inicio de sesión |
| 💰 **Wallet** | Gestión completa: balance, depósitos, transferencias y retiros |
| 🏦 **Wallets Únicas** | Dirección Polygon automática para cada usuario |
| 🤖 **Agentes IA** | Chat inteligente con análisis financiero usando LangChain |
| 💎 **Crypto** | Transferencias USDC reales en red Polygon |
| 🔄 **Auto-Depósitos** | Sistema automático de monitoreo y acreditación on-chain |
| 📊 **Background Jobs** | Procesamiento asíncrono con Bull + Redis |
| 🔒 **Encriptación** | Private keys protegidas con AES-256-GCM |
| 📚 **Documentación** | Swagger UI completamente integrado |

---

## 📋 Requisitos

- **Node.js** >= 18
- **pnpm** (recomendado) o npm
- **Docker** y **Docker Compose**
- Wallet con MATIC para gas fees (solo para operaciones on-chain)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd uscrc
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Levantar servicios con Docker

```bash
# Iniciar PostgreSQL, Redis y Ollama
docker-compose -f docker-compose.dev.yml up -d

# Verificar que estén corriendo
docker-compose -f docker-compose.dev.yml ps
```

<details>
<summary>📦 Servicios incluidos</summary>

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| PostgreSQL | 5432 | Base de datos principal |
| Redis | 6379 | Cola de trabajos en background |
| Ollama | 11434 | Servidor LLM local |

</details>

### 4. Descargar modelo de IA

El sistema usa Ollama para el asistente inteligente. Recomendamos `deepseek-r1:7b` por su balance entre rendimiento y velocidad:

```bash
# Modelo recomendado (el que usarás según tu .env)
docker exec -it crypto-ollama ollama pull deepseek-r1:7b

# Verificar modelos instalados
docker exec -it crypto-ollama ollama list
```

> ⚠️ **Importante:** El modelo que descargues debe coincidir con `OLLAMA_MODEL` en tu archivo `.env`. Por defecto, el sistema está configurado para usar `deepseek-r1:7b`.

<details>
<summary>Otros modelos disponibles</summary>

```bash
# Modelos alternativos si tienes menos recursos
docker exec -it crypto-ollama ollama pull phi

# O si quieres usar otro modelo
docker exec -it crypto-ollama ollama pull llama3
```

Recuerda actualizar `OLLAMA_MODEL` en `.env` si cambias de modelo.
</details>

### 5. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus valores
code .env  # o usa tu editor preferido
```

<details>
<summary>📝 Variables importantes</summary>

```bash
# Database
DATABASE_URL=postgresql://postgres:test@localhost:5432/crypto_db

# JWT (CAMBIAR en producción!)
JWT_SECRET=tu-super-clave-secreta-aqui
JWT_EXPIRES_IN=7d

# Encryption (mínimo 32 caracteres)
ENCRYPTION_KEY=super-secret-encryption-key-change-in-production-min-32-chars

# Redis
REDIS_URL=redis://localhost:6379

# Ollama - Modelo de IA
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:7b  # ← El modelo que descargaste

# Polygon (opcional para operaciones on-chain)
ETH_RPC_URL=https://polygon-mainnet.infura.io/v3/<TU_API_KEY>
ETH_PRIVATE_KEY=0x...
USDC_EVM_ADDRESS=0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
```

**⚠️ Notas de seguridad:**
- `ENCRYPTION_KEY` debe tener al menos 32 caracteres
- Las private keys se encriptan con AES-256-GCM antes de guardarse
- Nunca subas el archivo `.env` al repositorio

</details>

### 6. Iniciar la aplicación

```bash
pnpm run start:dev
```

¡Listo! 🎉 Los servicios estarán disponibles en:
- **API Backend**: http://localhost:3000
- **Documentación Swagger**: http://localhost:3000/api/docs
- **Frontend**: http://localhost:5173 (correr `cd frontend && pnpm dev`)

---

## 📚 Documentación de la API

Puedes explorar todos los endpoints disponibles en la interfaz interactiva de Swagger:

```
http://localhost:3000/api/docs
```

### Endpoints principales

<details>
<summary>🔐 Autenticación</summary>

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/v1/auth/register` | Crear nueva cuenta |
| POST | `/v1/auth/login` | Iniciar sesión |
| GET | `/v1/auth/profile` | Obtener perfil del usuario |

</details>

<details>
<summary>💰 Wallet</summary>

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/v1/wallet/balance` | Consultar balance actual |
| POST | `/v1/wallet/deposit` | Depositar USDC a tu wallet |
| POST | `/v1/wallet/transfer` | Transferir a otro usuario |
| POST | `/v1/wallet/withdraw` | Retirar USDC on-chain |
| GET | `/v1/wallet/transactions` | Ver historial de transacciones |

</details>

<details>
<summary>🤖 Agentes IA</summary>

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/v1/agents/chat` | Chat con el asistente (respuesta completa) |
| GET | `/v1/agents/chat/stream` | Chat en streaming (SSE) |
| POST | `/v1/agents/analyze` | Análisis asíncrono |
| GET | `/v1/agents/tasks/:id` | Estado de una tarea |
| GET | `/v1/agents/tasks` | Listar todas las tareas |

</details>

<details>
<summary>💎 Crypto</summary>

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/v1/crypto/usdc/address` | Ver dirección del servidor |
| GET | `/v1/crypto/usdc/balance/:addr` | Consultar balance USDC de una dirección |
| GET | `/v1/crypto/matic/balance/:addr` | Consultar balance MATIC |
| POST | `/v1/crypto/usdc/send` | Enviar USDC on-chain |

</details>

---

## 🧪 Prueba Rápida

```bash
# 1. Registrar un usuario
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# 2. Login (guarda el token que recibes)
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# 3. Depositar fondos (reemplaza TOKEN con el que recibiste)
curl -X POST http://localhost:3000/v1/wallet/deposit \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'

# 4. Consultar balance
curl http://localhost:3000/v1/wallet/balance \
  -H "Authorization: Bearer TOKEN"
```

---

## 💼 Sistema de Wallets Únicas

Cada usuario obtiene automáticamente su propia dirección Polygon al registrarse.

### ¿Cómo funciona?

```
1. Te registras en la app
   → Recibes una dirección Polygon única (ej: 0xABC123...)

2. Consultas tu dirección en /auth/profile
   {
     "walletAddress": "0xABC123...",
     "usdcBalance": "0.000000"
   }

3. Envías USDC a esa dirección desde:
   - MetaMask
   - Tu exchange favorito
   - Cualquier otra wallet

4. Esperas hasta 5 minutos
   → El sistema detecta el depósito automáticamente
   → Tu balance se actualiza sin hacer nada!
```

### Seguridad implementada:

- 🔒 **Encriptación AES-256-GCM** con salt e IV aleatorios
- 🔑 **Key derivation** usando scrypt
- 🛡️ **Authentication tags** para verificar integridad
- ⚠️ La `ENCRYPTION_KEY` nunca se expone en logs ni respuestas

---

## 🏗️ Arquitectura del Sistema

![Arquitectura](./arquitectura.png)

El sistema usa una arquitectura modular y escalable:

- **API Layer**: Endpoints REST organizados por dominio (Auth, Wallet, Agents, Crypto)
- **Service Layer**: Lógica de negocio separada del transporte HTTP
- **Agent Workers**: Sistema master-slave para procesamiento paralelo de tareas IA
- **Data Layer**: PostgreSQL para persistencia, Redis para jobs, Ollama para LLM

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
pnpm run start:dev   # Inicia con hot-reload

# Producción
pnpm run build       # Compila TypeScript
pnpm run start       # Inicia la app compilada

# Testing
pnpm run test        # Ejecuta los tests
```

---

## 🐳 Docker Compose

```bash
# Iniciar todos los servicios
docker-compose -f docker-compose.dev.yml up -d

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f

# Detener servicios
docker-compose -f docker-compose.dev.yml down

# Con herramientas de admin (pgAdmin, Redis Commander)
docker-compose -f docker-compose.dev.yml --profile tools up -d

# Limpiar todo (⚠️ elimina datos)
docker-compose -f docker-compose.dev.yml down -v
```

---

## 🔧 Herramientas de Administración

Para facilitar el desarrollo, puedes levantar herramientas visuales:

```bash
docker-compose -f docker-compose.dev.yml --profile tools up -d
```

| Herramienta | URL | Credenciales |
|-------------|-----|--------------|
| **pgAdmin** | http://localhost:5050 | admin@crypto.local / admin |
| **Redis Commander** | http://localhost:8081 | - |

---

## 📁 Estructura del Proyecto

```
src/
├── auth/              # Autenticación y autorización JWT
├── wallet/            # Gestión de balance y transacciones
├── agents/            # Sistema de agentes con LangChain
├── crypto/            # Operaciones blockchain (Polygon)
├── database/          # Entidades y migraciones TypeORM
├── health/            # Health checks y monitoreo
└── common/            # Filtros, guards e interceptores globales

frontend/
├── src/
│   ├── pages/         # Páginas de la aplicación
│   ├── components/    # Componentes reutilizables
│   ├── stores/        # Estado global con Zustand
│   └── lib/           # Utilidades y API client
```

---




