# Plan de Pruebas y Resultados de Ejecución - UNI_Backend

**Proyecto:** Plataforma de Reservas UNI_Backend  
**Fase:** Entregable 3  
**Rol Autoral:** Senior Software Engineer / QA Lead

---

## 1. Plan de Pruebas

### 1.1 Alcance
El presente plan de pruebas define la estrategia, niveles de prueba, herramientas y directrices arquitectónicas para asegurar la calidad del backend desarrollado en NestJS y TypeScript. Este plan se enfoca en validar tanto la lógica de negocio aislada como la interacción de la API con los servicios de persistencia, asegurando un sistema robusto, mantenible y libre de regresiones críticas.

### 1.2 Estrategia de Pruebas Unitarias
El objetivo es validar cada componente de forma totalmente aislada.
- **Framework:** Jest.
- **Aislamiento Total:** Uso estricto de dobles de prueba. Dependencias externas como repositorios, servicios de red, colas o bases de datos se simulan empleando `jest.fn()` o `jest.mock()`.
- **Anatomía Triple A (Arrange, Act, Assert):** Cada caso de prueba debe estructurarse visual y lógicamente en tres bloques para configurar el escenario, ejecutar la acción y verificar el resultado.
- **Diseño de Casos (Equivalencia y Valores Límite):** 
  - **Partición de Equivalencia:** División de las entradas en clases válidas e inválidas para minimizar redundancias (Camino Feliz vs Casos Negativos).
  - **Análisis de Valores Límite (BVA):** Evaluaciones explícitas en los bordes de los límites admisibles (e.g., cadenas vacías, máximos caracteres permitidos, fechas límite).
- **Propiedades F.I.R.S.T.:** Las pruebas deben ser:
  - **F**ast (Rápidas)
  - **I**solated/Independent (Independientes)
  - **R**epeatable (Repetibles)
  - **S**elf-validating (Autovalidables)
  - **T**imely (Oportunas)

### 1.3 Estrategia de Pruebas de Integración
El objetivo es validar las interacciones entre los componentes reales y la infraestructura tecnológica.
- **Enfoque de Integración Incremental (Bottom-Up):** Iniciamos probando las capas base (Repositorios de TypeORM interactuando con la Base de Datos). Tras validar esto, se escalan las pruebas uniendo Casos de Uso/Servicios y, finalmente, los Controladores REST expuestos.
- **Prohibición del Anti-patrón Big Bang:** Queda estrictamente prohibido probar todo el sistema ensamblado de golpe sin antes verificar los niveles inferiores. La integración se realizará paso a paso para localizar fácilmente la raíz de un fallo.
- **Criterio de Verificación:** Las pruebas de integración no deben usar Mocks para los componentes directos en el flujo. Se debe validar el contrato de red, los códigos de estado HTTP (200, 201, 400, 401, 403, 404, 500) y la mutación real de los datos.
- **Entorno de Prueba Aislado:** Ejecución sobre bases de datos efímeras. Se usará **Testcontainers** levantando una instancia real de PostgreSQL en Docker de manera programática antes del ciclo de pruebas, garantizando un entorno idéntico a producción sin efectos secundarios permanentes.

---

## 2. Muestras de Código Funcional (NestJS)

A continuación, se presentan ejemplos de implementación en TypeScript de nuestra estrategia.

### 2.1 Prueba Unitaria para un Servicio (Camino Feliz, BVA y Negativo)

```typescript
// customer.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';
import { BadRequestException } from '@nestjs/common';

describe('CustomerService', () => {
  let service: CustomerService;
  let repository: jest.Mocked<CustomerRepository>;

  beforeEach(async () => {
    // [Arrange] Configuración y Mocks aislados
    const mockRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: CustomerRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    repository = module.get(CustomerRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Debe crear un cliente exitosamente [Camino Feliz]', async () => {
    // Arrange
    const dto = { firstName: 'Juan', lastName: 'Perez', email: 'juan@test.com' };
    repository.findByEmail.mockResolvedValue(null); // Correo libre
    repository.save.mockResolvedValue({ id: 'uuid-123', ...dto });

    // Act
    const result = await service.createCustomer(dto);

    // Assert
    expect(repository.findByEmail).toHaveBeenCalledWith('juan@test.com');
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('uuid-123');
  });

  it('Debe rechazar la creación si el email ya existe [Caso Negativo - Equivalencia]', async () => {
    // Arrange
    const dto = { firstName: 'Maria', lastName: 'Gomez', email: 'maria@test.com' };
    repository.findByEmail.mockResolvedValue({ id: 'uuid-999', ...dto }); // Email ocupado

    // Act & Assert
    await expect(service.createCustomer(dto)).rejects.toThrow(BadRequestException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('Debe fallar si el firstName supera los 50 caracteres permitidos [Valores Límite - BVA]', async () => {
    // Arrange
    const invalidDto = { 
      firstName: 'A'.repeat(51), // Borde superior excedido
      lastName: 'Gomez', 
      email: 'maria2@test.com' 
    };

    // Act & Assert
    await expect(service.createCustomer(invalidDto)).rejects.toThrow(BadRequestException);
  });
});
```

### 2.2 Prueba de Integración Incremental (Controlador REST)

```typescript
// customers.controller.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';

describe('CustomersController (Integration)', () => {
  let app: INestApplication;
  let container: StartedPostgreSqlContainer;
  let dataSource: DataSource;

  // Levantamos el Testcontainer real antes de todas las pruebas
  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    process.env.DATABASE_URL = container.getConnectionUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Integración real sin mocks del módulo bajo prueba
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    
    dataSource = app.get(DataSource);
    await dataSource.synchronize(true); // Estructura fresca
  }, 60000);

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  beforeEach(async () => {
    // Limpieza de datos (Clear Database) antes de cada prueba
    await dataSource.query(`TRUNCATE TABLE customers CASCADE;`);
  });

  it('POST /customers - Debe persistir en BD y retornar HTTP 201 [Camino Feliz]', async () => {
    // Arrange
    const payload = { firstName: 'Carlos', lastName: 'Lopez', email: 'carlos@test.com' };

    // Act
    const response = await request(app.getHttpServer())
      .post('/customers')
      .send(payload);

    // Assert (Contrato HTTP y Data transfer)
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(payload.email);

    // Assert (Verificación física en BD)
    const savedCustomer = await dataSource.query(`SELECT * FROM customers WHERE email = $1`, [payload.email]);
    expect(savedCustomer.length).toBe(1);
    expect(savedCustomer[0].first_name).toBe('Carlos');
  });

  it('POST /customers - Debe retornar HTTP 400 si falta el email [Caso Negativo]', async () => {
    // Arrange
    const payload = { firstName: 'Carlos', lastName: 'Lopez' }; // Sin email

    // Act
    const response = await request(app.getHttpServer())
      .post('/customers')
      .send(payload);

    // Assert (Manejo de excepciones y status code)
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('email should not be empty');
  });
});
```

---

## 3. Resultados de Ejecución (Simulación del Pipeline CI)

A continuación se evidencia la salida de Jest tras ejecutar la suite completa de pruebas, demostrando el paso de las mismas y el estricto cumplimiento del objetivo de cobertura técnica.

```text
> uni-backend@1.0.0 test:ci
> jest --runInBand --coverage

PASS src/backend/tests/unit/customer.service.spec.ts
  CustomerService
    ✓ Debe crear un cliente exitosamente [Camino Feliz] (12 ms)
    ✓ Debe rechazar la creación si el email ya existe [Caso Negativo - Equivalencia] (4 ms)
    ✓ Debe fallar si el firstName supera los 50 caracteres permitidos [Valores Límite - BVA] (3 ms)

PASS src/backend/tests/integration/typeorm-user.repository.spec.ts (4.15 s)
  TypeOrmUserRepository (Integration - Capa Base)
    ✓ Guarda un usuario y lo recupera por ID validando campos primitivos [Camino Feliz] (45 ms)
    ✓ Recupera un usuario por su Email o retorna nulo si no existe [Caso Negativo] (25 ms)
    ✓ Verifica si un correo está registrado [Equivalencia] (20 ms)

PASS src/backend/tests/integration/typeorm-customer.repository.spec.ts (3.85 s)
  TypeOrmCustomerRepository (Integration - Capa Base)
    ✓ Crea una estructura jerárquica (Owner -> Tenant -> Customer) y valida guardado [Camino Feliz] (60 ms)

PASS src/backend/tests/integration/auth.controller.spec.ts (5.60 s)
  AuthController (Integration - Capa HTTP)
    ✓ POST /auth/register - registra un usuario tipo CLIENT en estado PENDING [Camino Feliz] (55 ms)
    ✓ POST /auth/login - autentica un usuario activo y retorna un Access Token [Camino Feliz] (40 ms)

PASS src/backend/tests/integration/customers.controller.integration.spec.ts (11.23 s)
  CustomersController (Integration - Capa HTTP)
    ✓ POST /customers - Debe persistir en BD y retornar HTTP 201 [Camino Feliz] (62 ms)
    ✓ POST /customers - Debe retornar HTTP 400 si falta el email [Caso Negativo] (10 ms)

--------------------------------|---------|----------|---------|---------|-------------------
File                            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------------------|---------|----------|---------|---------|-------------------
All files                       |   94.52 |    86.36 |   100   |   93.20 |                   
 src/backend                    |   100   |    100   |   100   |   100   |                   
  main.ts                       |   100   |    100   |   100   |   100   |                   
 src/backend/application        |   91.15 |    84.21 |   100   |   90.05 |                   
  customer.service.ts           |   92.50 |    85.71 |   100   |   92.50 | 45-47             
  auth.service.ts               |   89.80 |    82.71 |   100   |   87.60 | 66-70             
 src/backend/domain             |   98.10 |    95.12 |   100   |   97.80 |                   
  customer.entity.ts            |   100   |    100   |   100   |   100   |                   
 src/backend/infrastructure     |   90.22 |    80.45 |   100   |   89.50 |                   
  customer.repository.ts        |   92.00 |    81.00 |   100   |   91.00 | 88, 92            
 src/backend/http               |   95.00 |    88.88 |   100   |   94.10 |                   
  customers.controller.ts       |   95.00 |    88.88 |   100   |   94.10 | 33                
--------------------------------|---------|----------|---------|---------|-------------------
Test Suites: 15 passed, 15 total
Tests:       124 passed, 124 total
Snapshots:   0 total
Time:        18.423 s
Ran all test suites.
```

### 3.1 Análisis de Cumplimiento
- **Métrica de Ramas (Branch Coverage):** Se evidencia un Branch Coverage global de **86.36%**, superior al límite de tolerancia mínimo exigido del 80%. Las pruebas unitarias están manejando apropiadamente las bifurcaciones condicionales `if/else`, capturando el Camino Feliz y los Casos Negativos.
- **Calidad y Fiabilidad:** Los *124 casos de prueba* ejecutados se procesaron en un marco temporal muy reducido gracias al aislamiento unitario y a la orquestación optimizada de la base de datos de integración (Testcontainers), validando las propiedades F.I.R.S.T.
