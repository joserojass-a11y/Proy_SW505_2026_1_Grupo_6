# ✅ CHECKLIST DE VERIFICACIÓN INMEDIATA - FASE 3
## Para confirmar antes de la exposición

Ejecuta estos comandos UNO POR UNO. Si alguno falla, avísame.

---

## 1️⃣ VERIFICAR ESTRUCTURA DE ARCHIVOS

### ✓ Verificar que existen 36 archivos de booking

```bash
cd "c:\Users\pablo\Desktop\Proy_SW505_2026_1_Grupo_6\src\backend"

# Contar archivos de booking
Get-ChildItem -Recurse -Filter "*booking*" -File | Measure-Object

# Resultado esperado: Count: 36 (±1)
```

### ✓ Verificar carpetas clave existen

```bash
# Verificar domain/entities/
Test-Path "src/domain/entities/booking.entity.ts" -PathType Leaf
# Resultado esperado: True

# Verificar aplicacion/commands/
Test-Path "src/application/commands/create-booking.command-handler.ts" -PathType Leaf  
# Resultado esperado: True

# Verificar tests/
Test-Path "src/__tests__/booking-concurrency.test.ts" -PathType Leaf
# Resultado esperado: True

# Verificar controller/
Test-Path "src/infrastructure/http/controllers/booking.controller.ts" -PathType Leaf
# Resultado esperado: True
```

---

## 2️⃣ VERIFICAR COMPILACIÓN

```bash
cd "c:\Users\pablo\Desktop\Proy_SW505_2026_1_Grupo_6\src\backend"
npm run build

# Resultado esperado:
# ✓ Successfully compiled
# ✓ 0 errors
# ✓ 0 warnings
# ✓ dist/ folder created
```

---

## 3️⃣ VERIFICAR IMPORTES EN APP.MODULE

```bash
cd "c:\Users\pablo\Desktop\Proy_SW505_2026_1_Grupo_6\src\backend"

# Ver que BookingModule está importado
Get-Content src/app.module.ts | Select-String -Pattern "BookingModule"

# Resultado esperado: Debe mostrar líneas con BookingModule
```

---

## 4️⃣ VERIFICAR ARCHIVOS DE TEST

```bash
# Listar todos los archivos de test
Get-ChildItem -Recurse -Filter "*.test.ts" | Where-Object { $_.FullName -like "*booking*" }

# Resultado esperado:
# 1. booking.entity.test.ts
# 2. create-booking.command-handler.test.ts
# 3. cancel-booking.command-handler.test.ts
# 4. reschedule-booking.command-handler.test.ts
# 5. booking-concurrency.test.ts
```

---

## 5️⃣ VERIFICAR PESIMISTIC LOCKING IMPLEMENTADO

```bash
# Buscar setLock('pessimistic_write')
Get-Content src/infrastructure/persistence/typeorm/typeorm-booking.repository.ts | Select-String -Pattern "pessimistic_write"

# Resultado esperado: Debe encontrar la línea
```

---

## 6️⃣ VERIFICAR ENDPOINTS REST

```bash
# Buscar todos los endpoints
Get-Content src/infrastructure/http/controllers/booking.controller.ts | Select-String -Pattern "@Post|@Get|@Delete|@Put"

# Resultado esperado:
# @Post()      ← POST /bookings
# @Get(':id')  ← GET /bookings/:id
# @Get()       ← GET /bookings
# @Post        ← POST /bookings/:id/cancel
# @Post        ← POST /bookings/:id/reschedule
```

---

## 7️⃣ VERIFICAR MÁQUINA DE ESTADOS

```bash
# Verificar estados definidos
Get-Content src/domain/value-objects/booking-status.vo.ts | Select-String -Pattern "PENDING|CONFIRMED|CANCELLED|RESCHEDULED|COMPLETED|NO_SHOW"

# Resultado esperado: Debe encontrar todos los 6 estados
```

---

## 8️⃣ VERIFICAR EXCEPCIONES DE DOMINIO

```bash
# Contar archivos de excepciones de booking
Get-ChildItem -Path "src/domain/exceptions/" -Filter "*booking*" | Measure-Object

# Resultado esperado: Count: 9 (mínimo)
```

---

## 9️⃣ CONTAR LÍNEAS DE CÓDIGO

```bash
# Contar LOC en domain/
(Get-Content src/domain/entities/booking.entity.ts | Measure-Object -Line).Lines
# Resultado esperado: >150 líneas

# Contar LOC en command handler
(Get-Content src/application/commands/create-booking.command-handler.ts | Measure-Object -Line).Lines
# Resultado esperado: >80 líneas

# Contar LOC en repository
(Get-Content src/infrastructure/persistence/typeorm/typeorm-booking.repository.ts | Measure-Object -Line).Lines
# Resultado esperado: >200 líneas
```

---

## 🔟 EJECUTAR TESTS UNITARIOS

### Opción A: Si npm/node está disponible

```bash
npm run test:unit

# Resultado esperado:
# PASS  src/__tests__/booking.entity.test.ts
# PASS  src/__tests__/create-booking.command-handler.test.ts
# PASS  src/__tests__/cancel-booking.command-handler.test.ts
# PASS  src/__tests__/reschedule-booking.command-handler.test.ts
# PASS  src/__tests__/booking-concurrency.test.ts
#
# Test Suites: 5 passed
# Tests: 45+ passed
```

### Opción B: Si npm no funciona

Verificar que el archivo de test tiene los tests definidos:
```bash
Get-Content src/__tests__/booking-concurrency.test.ts | Select-String -Pattern "describe\|it\(" | Select-Object -First 20

# Resultado esperado: Debe mostrar descripciones y tests
```

---

## 1️⃣1️⃣ LEER ARCHIVO CRÍTICO: TYPEORM REPOSITORY

```bash
# Abre el archivo en VS Code
code src/infrastructure/persistence/typeorm/typeorm-booking.repository.ts

# Busca:
# 1. Línea con "createWithLocking" - DEBE EXISTIR
# 2. Línea con "startTransaction('SERIALIZABLE')" - DEBE EXISTIR
# 3. Línea con "setLock('pessimistic_write')" - DEBE EXISTIR
# 4. Línea con "BookingAlreadyExistsException" - DEBE EXISTIR
```

---

## 1️⃣2️⃣ LEER ARCHIVO CRÍTICO: COMMAND HANDLER

```bash
# Abre en VS Code
code src/application/commands/create-booking.command-handler.ts

# Verifica que:
# 1. Crea BookingId, ServiceId, CustomerId, etc.
# 2. Valida fecha (startsAt < endsAt)
# 3. Llama availabilityService.checkAvailability()
# 4. Llama createWithLocking()
```

---

## 1️⃣3️⃣ LEER ARCHIVO CRÍTICO: BOOKING ENTITY

```bash
# Abre en VS Code
code src/domain/entities/booking.entity.ts

# Verifica que:
# 1. Tiene método static create()
# 2. Tiene método confirm(), cancel(), reschedule()
# 3. Tiene método hasConflictWith()
# 4. Valida transiciones de estado
```

---

## 1️⃣4️⃣ LEER ARCHIVO CRÍTICO: CONTROLLER

```bash
# Abre en VS Code
code src/infrastructure/http/controllers/booking.controller.ts

# Verifica que:
# 1. POST /bookings - con @UseGuards(JwtAuthGuard)
# 2. GET /bookings/:id - con @UseGuards
# 3. GET /bookings - con @UseGuards
# 4. POST /bookings/:id/cancel - con @UseGuards
# 5. POST /bookings/:id/reschedule - con @UseGuards
```

---

## 1️⃣5️⃣ VERIFICAR MÓDULO NESTJS

```bash
# Abre el archivo
code src/infrastructure/http/booking.module.ts

# Verifica que:
# 1. @Module({ ... }) está definido
# 2. imports: [] (vacío o con dependencias)
# 3. controllers: [BookingController]
# 4. providers: [5 handlers + repository]
```

---

## 1️⃣6️⃣ VERIFICAR APP.MODULE ACTUALIZADO

```bash
code src/app.module.ts

# Busca:
# 1. "import { BookingModule }" - DEBE EXISTIR
# 2. "BookingModule" en el imports: [] array - DEBE ESTAR
```

---

## 1️⃣7️⃣ VERIFICAR TYPEORM DATASOURCE

```bash
code src/infrastructure/shared/typeorm.datasource.ts

# Busca:
# 1. "TypeOrmBookingEntity" - DEBE EXISTIR
# 2. "TypeOrmBookingStatusHistoryEntity" - DEBE EXISTIR
# 3. "TypeOrmBookingCancellationEntity" - DEBE EXISTIR
# 4. "TypeOrmBookingRescheduleEntity" - DEBE EXISTIR
# 5. Todas en el array entities: [...]
```

---

## 1️⃣8️⃣ VERIFICAR INFRASTRUCTURE TOKENS

```bash
code src/infrastructure/shared/infrastructure.tokens.ts

# Busca:
# 1. "BOOKING_REPOSITORY" - DEBE EXISTIR
# 2. "AVAILABILITY_SERVICE" - DEBE EXISTIR
```

---

## 1️⃣9️⃣ VERIFICAR VALUE OBJECTS

```bash
# Contar value objects de booking
Get-ChildItem src/domain/value-objects/ -Filter "*booking*" -o -Filter "*service-id*" -o -Filter "*customer-id*" -o -Filter "*tenant-id*" -o -Filter "*branch-id*"

# Resultado esperado: Mínimo 6 archivos
```

---

## 2️⃣0️⃣ RESUMEN FINAL

Marca con ✅ o ❌:

```
✅ 36 archivos de booking existen
✅ npm run build compila sin errores
✅ BookingModule importado en app.module.ts
✅ 5 archivos de test existen
✅ setLock('pessimistic_write') está en repositorio
✅ 5 endpoints REST están implementados
✅ 6 estados de booking definidos
✅ 9+ excepciones de dominio existen
✅ booking.entity.ts tiene >150 LOC
✅ command-handler tiene lógica completa
✅ Test de concurrencia con 100 requests existe
✅ Máquina de estados implementada
✅ Decoradores @UseGuards en todos los endpoints
✅ TypeORM entities (4 tablas) creadas
✅ Todos los value objects creados
```

**SI TODOS ESTÁN ✅, LA FASE 3 ESTÁ COMPLETA Y LISTA PARA EXPOSICIÓN**

---

## 🚨 SI ALGO FALLA

### Error: "npm not found"
→ Instala Node.js de nodejs.org

### Error: "archivo no existe"
→ Verifica rutas con:
```bash
Get-Item "ruta/del/archivo"
```

### Error: "Compilación falla"
→ Abre el archivo y busca:
- Imports faltantes
- Typings incorrectos
- Usar comando: `npm install --save-dev typescript`

### Error: "Tests fallan"
→ Ejecuta individualmente:
```bash
npm run test:unit -- booking.entity.test.ts
```

---

**Cualquier fallo, reportalo inmediatamente**
**Todo debe estar verde antes de la exposición**

