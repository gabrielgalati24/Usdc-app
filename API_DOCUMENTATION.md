# 📚 API Documentation - Frontend Integration Guide

> Documentación completa de todos los endpoints para integración de frontend

**Base URL:** `http://localhost:3000`

---

## 🔐 Autenticación

Todos los endpoints (excepto los públicos) requieren el header:
```
Authorization: Bearer <ACCESS_TOKEN>
```

---

## 1️⃣ Auth - Autenticación

### 📝 Registrar Usuario

**Endpoint:** `POST /auth/register`  
**Auth:** ❌ No requiere (público)

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
```

**Response:** `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "af1224c7-5cb3-4689-8be1-f33738071324",
    "email": "usuario@ejemplo.com",
    "usdcBalance": "0.000000",
    "walletAddress": "0xB2Aef29Fe558604E7C286764113e1aF455D340D9"
  }
}
```

**Errores:**
- `409 Conflict` - Email ya registrado

**Notas:**
- ✅ Genera automáticamente una wallet única de Polygon
- ✅ La `walletAddress` es donde puedes recibir USDC

---

### 🔑 Iniciar Sesión

**Endpoint:** `POST /auth/login`  
**Auth:** ❌ No requiere (público)

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "af1224c7-5cb3-4689-8be1-f33738071324",
    "email": "usuario@ejemplo.com",
    "usdcBalance": "100.500000",
    "walletAddress": "0xB2Aef29Fe558604E7C286764113e1aF455D340D9"
  }
}
```

**Errores:**
- `401 Unauthorized` - Credenciales inválidas

**Uso del token:**
```javascript
// Guardar el accessToken
localStorage.setItem('token', response.accessToken);

// Usar en requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

---

### 👤 Obtener Perfil

**Endpoint:** `GET /auth/profile`  
**Auth:** ✅ Requiere token

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:** `200 OK`
```json
{
  "id": "af1224c7-5cb3-4689-8be1-f33738071324",
  "email": "usuario@ejemplo.com",
  "usdcBalance": "100.500000",
  "walletAddress": "0xB2Aef29Fe558604E7C286764113e1aF455D340D9",
  "createdAt": "2025-12-14T21:39:08.691Z"
}
```

**Errores:**
- `401 Unauthorized` - Token inválido o expirado

---

## 2️⃣ Wallet - Gestión de Balance

### 💰 Ver Balance

**Endpoint:** `GET /wallet/balance`  
**Auth:** ✅ Requiere token

**Response:** `200 OK`
```json
{
  "userId": "af1224c7-5cb3-4689-8be1-f33738071324",
  "usdcBalance": "100.500000",
  "walletAddress": "0xB2Aef29Fe558604E7C286764113e1aF455D340D9"
}
```

---

### 💵 Depositar (Simular)

**Endpoint:** `POST /wallet/deposit`  
**Auth:** ✅ Requiere token

**Request Body:**
```json
{
  "amount": 100.50
}
```

**Response:** `201 Created`
```json
{
  "message": "Depósito exitoso",
  "previousBalance": "50.000000",
  "newBalance": "150.500000",
  "amount": "100.500000"
}
```

**Errores:**
- `400 Bad Request` - Monto inválido (< 0.01)

**Notas:**
- Este endpoint simula un depósito manual
- Para **depósitos crypto reales**, envía USDC a tu `walletAddress` y se acredita automáticamente en ~30-60 segundos

---

### 🔄 Transferir a Usuario

**Endpoint:** `POST /wallet/transfer`  
**Auth:** ✅ Requiere token

**Request Body:**
```json
{
  "toUserId": "c7ec2183-d9d4-4821-9c5a-4b067a95eeb3",
  "amount": 50.75,
  "notes": "Pago por servicios"
}
```

**Response:** `201 Created`
```json
{
  "message": "Transferencia exitosa",
  "from": "usuario@ejemplo.com",
  "to": "destino@ejemplo.com",
  "amount": "50.750000",
  "yourNewBalance": "99.750000",
  "transactionId": "tx-uuid-123"
}
```

**Errores:**
- `400 Bad Request` - Saldo insuficiente
- `404 Not Found` - Usuario destino no existe
- `400 Bad Request` - No puedes transferirte a ti mismo

**Notas:**
- ✅ Transferencia instantánea (off-chain)
- ✅ Sin fees de gas
- ✅ Atómica (o falla completamente o se ejecuta)

---

### 💎 Retirar USDC (On-chain)

**Endpoint:** `POST /wallet/withdraw`  
**Auth:** ✅ Requiere token

**Request Body:**
```json
{
  "toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f12345",
  "amount": 25.00
}
```

**Response:** `201 Created`
```json
{
  "message": "Retiro procesado",
  "amount": "25.000000",
  "toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f12345",
  "txHash": "0xabc123def456...",
  "yourNewBalance": "74.750000",
  "note": "Puede tardar 1-2 minutos en confirmarse en blockchain"
}
```

**Errores:**
- `400 Bad Request` - Saldo insuficiente
- `400 Bad Request` - Dirección Ethereum inválida
- `400 Bad Request` - Monto mínimo: 0.01 USDC

**Notas:**
- ⚠️ Transferencia **on-chain** (requiere gas MATIC)
- ⏱️ Tarda 1-2 minutos en confirmarse
- 🔗 Usa Polygon network

---

### 📜 Historial de Transacciones

**Endpoint:** `GET /wallet/transactions?limit=10`  
**Auth:** ✅ Requiere token

**Query Params:**
- `limit` (opcional): Número máximo de transacciones (default: todas)

**Response:** `200 OK`
```json
[
  {
    "id": "tx-uuid-1",
    "type": "deposit",
    "amount": "100.000000",
    "status": "completed",
    "txHash": "0xabc123...",
    "externalAddress": "0x123...",
    "notes": "Depósito automático desde blockchain (bloque 12345)",
    "createdAt": "2025-12-14T18:30:00.000Z"
  },
  {
    "id": "tx-uuid-2",
    "type": "transfer",
    "amount": "50.000000",
    "status": "completed",
    "fromUserId": "uuid-1",
    "toUserId": "uuid-2",
    "notes": "Pago por servicios",
    "createdAt": "2025-12-14T18:25:00.000Z"
  },
  {
    "id": "tx-uuid-3",
    "type": "withdrawal",
    "amount": "25.000000",
    "status": "completed",
    "txHash": "0xdef456...",
    "externalAddress": "0x742d35...",
    "createdAt": "2025-12-14T18:20:00.000Z"
  }
]
```

**Tipos de transacciones:**
- `deposit` - Depósito (manual o crypto)
- `transfer` - Transferencia entre usuarios
- `withdrawal` - Retiro on-chain

**Estados:**
- `pending` - En proceso
- `completed` - Completada
- `failed` - Fallida

---

## 3️⃣ Agents - Análisis con IA

### 🤖 Crear Análisis (Asíncrono)

**Endpoint:** `POST /agents/analyze`  
**Auth:** ✅ Requiere token

**Request Body:**
```json
{
  "type": "financial_analysis",
  "data": {
    "portfolio": ["BTC", "ETH", "USDC"],
    "amounts": [0.5, 2, 1000]
  }
}
```

**Response:** `201 Created`
```json
{
  "taskId": "b1658792-d473-494a-a8b2-1f3b9e85accc",
  "status": "queued",
  "message": "Tarea encolada para procesamiento en background"
}
```

**Tipos de análisis disponibles:**
- `financial_analysis` - Análisis financiero general
- `market_data` - Datos de mercado
- `risk_assessment` - Evaluación de riesgos
- `portfolio_review` - Revisión de portafolio

**Notas:**
- ✅ Se procesa en background (no bloquea)
- ✅ Usa el `taskId` para consultar el resultado

---

### ⚡ Crear Análisis (Síncrono)

**Endpoint:** `POST /agents/analyze/sync`  
**Auth:** ✅ Requiere token

**Request Body:**
```json
{
  "type": "market_data",
  "data": {
    "symbols": ["BTC", "ETH"]
  }
}
```

**Response:** `201 Created`
```json
{
  "taskId": "task-uuid",
  "status": "completed",
  "result": {
    "analysis": "Análisis generado por IA...",
    "recommendations": ["..."]
  }
}
```

**Notas:**
- ⚠️ Espera a que complete (puede tardar 10-30 segundos)
- ⚠️ Bloquea la request hasta que termine

---

### 📊 Consultar Estado de Tarea

**Endpoint:** `GET /agents/tasks/:taskId`  
**Auth:** ✅ Requiere token

**Response:** `200 OK`
```json
{
  "id": "b1658792-d473-494a-a8b2-1f3b9e85accc",
  "status": "completed",
  "taskType": "financial_analysis",
  "result": {
    "analysis": "Tu portafolio muestra...",
    "recommendations": [
      "Considera diversificar...",
      "El ratio BTC/ETH es..."
    ]
  },
  "createdAt": "2025-12-14T18:30:00.000Z",
  "updatedAt": "2025-12-14T18:30:25.000Z"
}
```

**Estados posibles:**
- `pending` - En cola
- `running` - Procesando
- `completed` - Completada
- `failed` - Error

---

### 📝 Listar Mis Tareas

**Endpoint:** `GET /agents/tasks?limit=10`  
**Auth:** ✅ Requiere token

**Query Params:**
- `limit` (opcional): Número máximo de tareas

**Response:** `200 OK`
```json
[
  {
    "id": "task-1",
    "type": "financial_analysis",
    "status": "completed",
    "createdAt": "2025-12-14T18:30:00.000Z",
    "updatedAt": "2025-12-14T18:30:25.000Z"
  },
  {
    "id": "task-2",
    "type": "market_data",
    "status": "running",
    "createdAt": "2025-12-14T18:35:00.000Z",
    "updatedAt": "2025-12-14T18:35:05.000Z"
  }
]
```

---

## 4️⃣ Crypto - Operaciones Blockchain

### 🏦 Ver Dirección del Servidor

**Endpoint:** `GET /crypto/usdc/address`  
**Auth:** ❌ No requiere (público)

**Response:** `200 OK`
```json
{
  "from": "0x79ab3b5acf457176e816adc88c56a5b4835a3c31"
}
```

**Notas:**
- Esta es la wallet del servidor (no confundir con tu wallet personal)

---

### 💰 Balance USDC de una Dirección

**Endpoint:** `GET /crypto/usdc/balance/:address`  
**Auth:** ✅ Requiere token

**Response:** `200 OK`
```json
{
  "address": "0xB2Aef29Fe558604E7C286764113e1aF455D340D9",
  "balance": "125.500000",
  "symbol": "USDC",
  "decimals": 6
}
```

**Notas:**
- Lee directamente de Polygon blockchain
- No de la base de datos

---

### ⛽ Balance MATIC de una Dirección

**Endpoint:** `GET /crypto/matic/balance/:address`  
**Auth:** ✅ Requiere token

**Response:** `200 OK`
```json
{
  "address": "0xB2Aef29Fe558604E7C286764113e1aF455D340D9",
  "balance": "0.156789",
  "symbol": "MATIC"
}
```

---

### 📜 Historial On-chain USDC

**Endpoint:** `GET /crypto/usdc/history/:address?blocks=1000&direction=incoming`  
**Auth:** ✅ Requiere token

**Query Params:**
- `blocks` (opcional): Cuántos bloques atrás revisar (default: 1000)
- `fromBlock` (opcional): Desde qué bloque
- `direction` (opcional): `incoming` | `outgoing` | `all`
- `minConfirmations` (opcional): Mínimo de confirmaciones (default: 3)

**Response:** `200 OK`
```json
[
  {
    "hash": "0xabc123def456...",
    "from": "0x123...",
    "to": "0xB2Aef29Fe558604E7C286764113e1aF455D340D9",
    "amount": "100.000000",
    "blockNumber": 52745678,
    "timestamp": "2025-12-14T18:30:00.000Z",
    "confirmations": 15
  }
]
```

**Notas:**
- Lee directamente de blockchain (no de DB)
- Útil para verificar transacciones on-chain

---

### 💸 Enviar USDC On-chain

**Endpoint:** `POST /crypto/usdc/send`  
**Auth:** ✅ Requiere token

**Request Body:**
```json
{
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f12345",
  "amount": 50.00
}
```

**Response:** `201 Created`
```json
{
  "txHash": "0xabc123def456...",
  "from": "0x79ab3b5acf457176e816adc88c56a5b4835a3c31",
  "to": "0x742d35Cc6634C0532925a3b844Bc9e7595f12345",
  "amount": "50.000000",
  "status": "pending",
  "explorerUrl": "https://polygonscan.com/tx/0xabc123..."
}
```

**Notas:**
- ⚠️ Usa la wallet del SERVIDOR, no la del usuario
- ⚠️ Requiere MATIC para gas fees
- ⏱️ Tarda 1-2 minutos en confirmarse

---

## 5️⃣ Health - Estado del Sistema

### ✅ Health Check General

**Endpoint:** `GET /health`  
**Auth:** ❌ No requiere (público)

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2025-12-14T18:35:00.000Z",
  "uptime": 3600.5
}
```

---

### 🗄️ Health Check Database

**Endpoint:** `GET /health/db`  
**Auth:** ❌ No requiere (público)

**Response:** `200 OK`
```json
{
  "status": "ok",
  "database": "connected"
}
```

**En caso de error:**
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "connection refused"
}
```

---

## 📱 Ejemplos de Integración Frontend

### React / Next.js

```typescript
// api/client.ts
const API_BASE_URL = 'http://localhost:3000';

export const apiClient = {
  // Auth
  async register(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async getProfile(token: string) {
    const res = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Wallet
  async getBalance(token: string) {
    const res = await fetch(`${API_BASE_URL}/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async transfer(token: string, toUserId: string, amount: number, notes?: string) {
    const res = await fetch(`${API_BASE_URL}/wallet/transfer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ toUserId, amount, notes })
    });
    return res.json();
  },

  async getTransactions(token: string, limit?: number) {
    const url = limit 
      ? `${API_BASE_URL}/wallet/transactions?limit=${limit}`
      : `${API_BASE_URL}/wallet/transactions`;
    
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};
```

### Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uso
const { data } = await api.get('/wallet/balance');
const { data: txs } = await api.get('/wallet/transactions');
await api.post('/wallet/transfer', {
  toUserId: 'uuid',
  amount: 50
});
```

---

## ⚠️ Manejo de Errores

Todos los endpoints retornan errores en formato estándar:

```json
{
  "statusCode": 400,
  "message": "Saldo insuficiente",
  "error": "Bad Request",
  "timestamp": "2025-12-14T18:35:00.000Z",
  "path": "/wallet/transfer"
}
```

**Códigos comunes:**
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (no autenticado)
- `403` - Forbidden (sin permisos)
- `404` - Not Found (recurso no existe)
- `409` - Conflict (ej: email duplicado)
- `500` - Internal Server Error

---

## 🔒 Seguridad

### Tokens JWT

- ⏱️ **Expiración:** 7 días (configurable en `.env`)
- 🔐 **Almacenamiento:** Guardar en `localStorage` o `cookies httpOnly`
- 🔄 **Renovación:** Re-login cuando expire

### Headers Requeridos

```typescript
headers: {
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

### CORS

El servidor tiene CORS habilitado. Para producción, configura dominios permitidos.

---

## 🚀 URL de Swagger

Para explorar interactivamente todos los endpoints:

**Swagger UI:** http://localhost:3000/api/docs

- ✅ Prueba endpoints en tiempo real
- ✅ Ve esquemas de request/response
- ✅ Autoriza con tu JWT token

---

## 📞 Soporte

Para más información, revisa:
- `README.md` - Guía de instalación
- `WALLETS_SYSTEM.md` - Sistema de wallets únicas
- Swagger UI - Documentación interactiva
