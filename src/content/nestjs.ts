import type { Category } from "./types";

export const nestjs: Category = {
  slug: "nestjs",
  title: "NestJS",
  description:
    "NestJS framework: modules, providers/DI, controllers, decorators, pipes, guards, interceptors, exception filters, microservices, and testing.",
  icon: "🪺",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-nest",
      title: "What is NestJS?",
      difficulty: "easy",
      question: "What is NestJS and what problems does it solve?",
      answer: `**NestJS** is a TypeScript-first Node.js framework for building scalable server-side applications. Heavily inspired by Angular's architecture: modules, dependency injection, decorators.

**Why use it:**
- **Opinionated structure** — modules / controllers / providers / DTOs out of the box.
- **First-class TypeScript** — strongly typed everywhere.
- **Dependency injection** — built-in IoC container.
- **Platform-agnostic HTTP** — runs on Express (default) or Fastify.
- **First-class support for** GraphQL, microservices (Redis, NATS, Kafka, MQTT), WebSockets, Bull queues, scheduling.
- **Decorator-driven** — \`@Controller\`, \`@Get\`, \`@Post\`, \`@Inject\`, etc.

**Underlying tech:** Express or Fastify HTTP layer + Nest's IoC + lifecycle hooks.

**Trade-offs:**
- Boilerplate compared to bare Express.
- Steeper learning curve.
- Decorator-heavy code can feel "magical."

**When it shines:** medium-to-large apps with multiple modules, teams needing structure, code that benefits from DI for testing.`,
      tags: ["fundamentals"],
    },
    {
      id: "modules",
      title: "Modules",
      difficulty: "easy",
      question: "What is a NestJS module?",
      answer: `A **module** is a class annotated with \`@Module()\` that groups related controllers, providers, and imports.

\`\`\`ts
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],   // make available to importing modules
})
export class UsersModule {}
\`\`\`

**\`@Module\` properties:**
- **\`imports\`** — other modules whose exports we want.
- **\`controllers\`** — request handlers belonging to this module.
- **\`providers\`** — services / injectables used inside this module.
- **\`exports\`** — providers shared with importers.

**Module types:**
- **Feature modules** — encapsulate a domain (UsersModule, OrdersModule).
- **Shared modules** — reusable services/utilities exported widely.
- **Global modules** (\`@Global()\`) — registered once, available everywhere without import.
- **Dynamic modules** — \`forRoot()\` / \`forFeature()\` patterns to pass config.

**Root module (AppModule):** entry point; \`bootstrap()\` creates a Nest app from it.`,
      tags: ["fundamentals"],
    },
    {
      id: "controllers",
      title: "Controllers",
      difficulty: "easy",
      question: "What is a controller in NestJS?",
      answer: `A **controller** handles incoming HTTP requests and returns responses. Annotated with \`@Controller(prefix)\`.

\`\`\`ts
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll() { return this.users.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.users.findOne(id); }

  @Post()
  create(@Body() dto: CreateUserDto) { return this.users.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.users.remove(id); }
}
\`\`\`

**Route decorators:** \`@Get\`, \`@Post\`, \`@Put\`, \`@Patch\`, \`@Delete\`, \`@All\`.
**Param decorators:** \`@Param\`, \`@Query\`, \`@Body\`, \`@Headers\`, \`@Req\`, \`@Res\`.

**Best practices:**
- Keep controllers thin — delegate to services.
- Don't put business logic in controllers; only routing + DTO mapping.
- Use DTOs (with class-validator) for input validation.

**Response handling:** by default Nest serializes the return value to JSON. \`@Res()\` injects raw response (Express/Fastify) — use only when needed (custom streaming, etc.).`,
      tags: ["fundamentals"],
    },
    {
      id: "providers-di",
      title: "Providers and dependency injection",
      difficulty: "easy",
      question: "What are providers and how does DI work in Nest?",
      answer: `A **provider** is anything that can be injected — usually a class annotated with \`@Injectable()\`.

\`\`\`ts
@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  findAll() { return this.repo.find(); }
}
\`\`\`

**Nest's DI container:**
- Reads constructor types via reflect-metadata.
- Resolves dependencies recursively.
- By default, providers are **singletons** scoped to the module.

**Provider scopes:**
- **\`DEFAULT\`** (singleton) — one instance for the whole app.
- **\`REQUEST\`** — new instance per incoming request (useful for per-request state).
- **\`TRANSIENT\`** — new instance per consumer.

**Custom providers:**
\`\`\`ts
{
  provide: 'CONFIG',
  useValue: { apiKey: '...' },
}
{
  provide: 'CONNECTION',
  useFactory: async (config) => createDB(config),
  inject: [ConfigService],
}
\`\`\`

**\`@Inject(token)\`** — manually inject by token (string or symbol) when constructor type isn't a class.

**Why DI:**
- Easy testing — swap real services for mocks.
- Decoupled code — depend on abstractions, not concrete classes.
- Lifecycle management handled by the container.`,
      tags: ["fundamentals", "di"],
    },
    {
      id: "decorators",
      title: "Decorators in Nest",
      difficulty: "easy",
      question: "What decorators do you commonly use?",
      answer: `Nest is decorator-heavy. The common ones:

**Class:**
- \`@Module()\` — module definition.
- \`@Controller(prefix?)\` — controller with optional path prefix.
- \`@Injectable()\` — class can be injected.
- \`@Global()\` — module is global.

**HTTP routes:**
- \`@Get\`, \`@Post\`, \`@Put\`, \`@Patch\`, \`@Delete\`, \`@All\`, \`@Options\`, \`@Head\`.

**Parameters:**
- \`@Param('id')\` — path parameter.
- \`@Query('q')\` — query parameter.
- \`@Body()\` — request body.
- \`@Headers('authorization')\` — header.
- \`@Req()\`, \`@Res()\` — raw request/response objects.

**Behavior:**
- \`@HttpCode(204)\` — set response status code.
- \`@Header('Cache-Control', 'no-store')\` — response header.
- \`@Redirect('/login', 302)\` — redirect.
- \`@UseGuards(...)\` — apply guards.
- \`@UsePipes(...)\` — apply pipes.
- \`@UseFilters(...)\` — apply exception filters.
- \`@UseInterceptors(...)\` — apply interceptors.

**DI:**
- \`@Inject(token)\` — inject by token.

**Custom decorators:** define your own with \`createParamDecorator\` for repeated patterns (e.g. \`@CurrentUser()\`).`,
      tags: ["fundamentals"],
    },
    {
      id: "dtos-validation",
      title: "DTOs and validation",
      difficulty: "easy",
      question: "How do you validate request bodies in Nest?",
      answer: `**DTOs (Data Transfer Objects)** are classes that describe the shape of input/output. Combined with \`class-validator\` and \`class-transformer\`, they give automatic validation.

\`\`\`ts
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(2) name!: string;
  @IsOptional() @IsString() bio?: string;
}
\`\`\`

**Enable globally:**
\`\`\`ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,            // strip unknown props
  forbidNonWhitelisted: true, // 400 on unknown props
  transform: true,            // apply class-transformer (string → number for params)
}));
\`\`\`

**Auto-validates** when used with \`@Body() dto: CreateUserDto\`. Failures return 400 with details.

**Common decorators:**
- \`@IsString\`, \`@IsNumber\`, \`@IsBoolean\`, \`@IsEmail\`, \`@IsUUID\`.
- \`@Min\`, \`@Max\`, \`@MinLength\`, \`@MaxLength\`.
- \`@IsArray\`, \`@ArrayMinSize\`, \`@ValidateNested\`.
- \`@IsOptional\`, \`@IsDefined\`.
- \`@Matches(/regex/)\`, \`@IsIn([...])\`.

**Custom validators:** create with \`@ValidatorConstraint\` for business rules.

**Nested objects:** \`@ValidateNested\` + \`@Type(() => Address)\` for class-transformer.

**Modern alternative:** **Zod** + \`nestjs-zod\` for schema-first validation in TypeScript-native fashion (no decorators).`,
      tags: ["validation"],
    },
    {
      id: "lifecycle-bootstrap",
      title: "App bootstrap and lifecycle",
      difficulty: "easy",
      question: "How is a Nest app bootstrapped, and what lifecycle hooks exist?",
      answer: `**Bootstrap:**
\`\`\`ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
\`\`\`

**Lifecycle hooks** — implement these interfaces on your providers/modules:

| Hook                       | When it fires                              |
|----------------------------|--------------------------------------------|
| \`OnModuleInit\`            | Module's dependencies resolved             |
| \`OnApplicationBootstrap\`  | All modules initialized; HTTP not yet listening |
| \`OnModuleDestroy\`         | Module shutdown begins                     |
| \`BeforeApplicationShutdown\` | Right before shutdown signal handling     |
| \`OnApplicationShutdown\`   | App shutting down (signal received)        |

\`\`\`ts
@Injectable()
export class CacheService implements OnModuleInit, OnApplicationShutdown {
  async onModuleInit() { await this.connect(); }
  async onApplicationShutdown(signal?: string) { await this.disconnect(); }
}
\`\`\`

**Enable shutdown hooks:**
\`\`\`ts
app.enableShutdownHooks();   // listens for SIGTERM/SIGINT
\`\`\`

**Use cases:**
- Connect to DB / cache on init.
- Drain queues / close connections on shutdown.
- Migrations or seed data in non-prod.

**Hot reload:** \`nest start --watch\` — recompiles + restarts on changes.`,
      tags: ["fundamentals"],
    },

    // ───── MEDIUM ─────
    {
      id: "pipes",
      title: "Pipes",
      difficulty: "medium",
      question: "What are pipes and how are they used?",
      answer: `A **pipe** transforms or validates data on its way to the handler.

**Built-in pipes:**
- \`ValidationPipe\` — class-validator integration.
- \`ParseIntPipe\`, \`ParseFloatPipe\`, \`ParseBoolPipe\`, \`ParseUUIDPipe\`, \`ParseArrayPipe\`, \`ParseEnumPipe\`.
- \`DefaultValuePipe(value)\`.

\`\`\`ts
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) { ... }

@Get()
findAll(@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) { ... }
\`\`\`

**Custom pipe:**
\`\`\`ts
@Injectable()
export class TrimPipe implements PipeTransform<string, string> {
  transform(value: string) { return value?.trim(); }
}
\`\`\`

**Scope of application:**
- **Parameter level** — \`@Body(MyPipe)\`.
- **Method level** — \`@UsePipes(MyPipe)\` on the handler.
- **Controller level** — class-level \`@UsePipes\`.
- **Global** — \`app.useGlobalPipes(...)\`.

**ValidationPipe options:**
- \`transform: true\` — string IDs from URL → numbers.
- \`whitelist: true\` — strip unknown DTO properties.
- \`forbidNonWhitelisted: true\` — reject unknown properties with 400.
- \`disableErrorMessages: true\` — for production.

Pipes run **before** the handler executes. Errors in pipes throw \`BadRequestException\` by default.`,
      tags: ["request"],
    },
    {
      id: "guards",
      title: "Guards (auth)",
      difficulty: "medium",
      question: "What are guards and how do you use them for auth?",
      answer: `A **guard** decides whether the request can proceed. Returns \`true\` (allow) / \`false\` (deny → 403) / throws (custom error).

\`\`\`ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedException();
    try {
      req.user = await this.jwt.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
\`\`\`

**Apply:**
- \`@UseGuards(AuthGuard)\` on handler / controller.
- \`app.useGlobalGuards(...)\` for global.

**Role-based** with metadata reflector:
\`\`\`ts
@Roles('admin')
@UseGuards(AuthGuard, RolesGuard)
@Get('admin-only')
adminPanel() { ... }
\`\`\`

**\`@nestjs/passport\`** — wraps Passport.js strategies (JWT, OAuth, local). Use \`@UseGuards(AuthGuard('jwt'))\` from passport.

**Best practice:**
- Authentication guard — verifies who you are.
- Authorization guard — checks permissions/roles.
- Keep guards focused; combine with \`@SetMetadata\` + reflector for declarative roles/permissions.`,
      tags: ["security"],
    },
    {
      id: "interceptors",
      title: "Interceptors",
      difficulty: "medium",
      question: "What are interceptors and what can they do?",
      answer: `**Interceptors** wrap method calls — they can transform input, modify the response, log, cache, or short-circuit.

\`\`\`ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => console.log(\`+\${Date.now() - start}ms\`))
    );
  }
}
\`\`\`

**Common uses:**
- **Logging / metrics** — wrap every request.
- **Caching** — return cached result without calling the handler.
- **Response transformation** — wrap data in \`{ data, meta }\`.
- **Timeouts** — \`timeout(5000)\` rxjs operator.
- **Serialization** — strip sensitive fields based on roles.

**Built-in:**
- \`CacheInterceptor\` — when \`@nestjs/cache-manager\` is configured.
- \`ClassSerializerInterceptor\` — applies class-transformer's \`@Exclude\` to responses.

**Apply:**
- \`@UseInterceptors(MyInterceptor)\` on handler/controller.
- \`app.useGlobalInterceptors(...)\` for global.

**Order of execution:**
\`Middleware → Guard → Interceptor (before) → Pipe → Handler → Interceptor (after) → Filter (on error)\`

**RxJS knowledge** is helpful — \`next.handle()\` returns an Observable; you can use map/tap/catchError.`,
      tags: ["request"],
    },
    {
      id: "exception-filters",
      title: "Exception filters",
      difficulty: "medium",
      question: "How do exception filters work?",
      answer: `**Exception filters** catch unhandled exceptions and shape the error response.

**Default behavior:**
- \`HttpException\` and subclasses → status code + JSON body.
- Other errors → 500 Internal Server Error.

**Custom filter:**
\`\`\`ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();
    const status = exception.getStatus();
    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: exception.message,
    });
  }
}
\`\`\`

**Apply:**
- \`@UseFilters(HttpExceptionFilter)\` on handler/controller.
- \`app.useGlobalFilters(...)\` for global.

**\`@Catch()\`** — without args, catches all exceptions; with class args, catches specific ones.

**Built-in HttpExceptions:**
- \`BadRequestException\` (400)
- \`UnauthorizedException\` (401)
- \`ForbiddenException\` (403)
- \`NotFoundException\` (404)
- \`ConflictException\` (409)
- \`InternalServerErrorException\` (500)

**Best practice:**
- One global filter for consistent error shape.
- Add request ID, timestamp, error code.
- Log unexpected errors with stack traces; sanitize for the response.`,
      tags: ["request"],
    },
    {
      id: "middleware",
      title: "Middleware",
      difficulty: "medium",
      question: "What's the difference between middleware, guards, interceptors, and filters?",
      answer: `Each runs at a different stage of the request:

\`\`\`
HTTP request
  ↓
Middleware (Express-style)
  ↓
Guards (auth/authorization)
  ↓
Interceptors (before)
  ↓
Pipes (validation/transformation)
  ↓
Route handler
  ↓
Interceptors (after)
  ↓
Exception filters (on error)
  ↓
Response
\`\`\`

**Middleware** — function with signature \`(req, res, next)\`. Express/Fastify-compatible. Can short-circuit by not calling \`next()\`.
\`\`\`ts
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(\`\${req.method} \${req.url}\`);
    next();
  }
}
\`\`\`
Apply in module's \`configure()\`:
\`\`\`ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
\`\`\`

**Guards** — auth: "is this request allowed?".
**Interceptors** — wrap the handler; transform/log/cache.
**Pipes** — transform/validate input data.
**Exception filters** — handle thrown exceptions.

**Key differences:**
- **Middleware** runs before any Nest infrastructure; doesn't have access to \`ExecutionContext\`.
- **Guards/Interceptors/Pipes/Filters** are Nest abstractions with access to context, types, DI.

**Pick:**
- CORS, body parsing, request ID → middleware.
- Auth → guard.
- Logging duration / response wrapping → interceptor.
- Validation / parsing → pipe.
- Error formatting → filter.`,
      tags: ["request"],
    },
    {
      id: "config-env",
      title: "Configuration",
      difficulty: "medium",
      question: "How do you handle configuration in Nest?",
      answer: `Use **\`@nestjs/config\`** for typed env loading.

\`\`\`ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: Joi.object({       // or zod-equivalent
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().uri().required(),
      }),
    }),
  ],
})
export class AppModule {}
\`\`\`

**Use:**
\`\`\`ts
constructor(private config: ConfigService) {}

const port = this.config.get<number>('PORT');
const dbUrl = this.config.getOrThrow<string>('DATABASE_URL');
\`\`\`

**Schema validation** runs at boot — fail fast on misconfig.

**Per-environment files:** \`.env.development\`, \`.env.test\`, \`.env.production\`.

**Production secrets:** never commit \`.env\` with real secrets. Use:
- AWS Secrets Manager / SSM Parameter Store.
- HashiCorp Vault.
- Doppler / Infisical.
- Kubernetes Secrets (sealed-secrets).

**Reading secrets:** load at boot via a custom \`useFactory\` provider that fetches from the secret store before app starts.

**Strongly-typed config object:**
\`\`\`ts
export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  poolSize: parseInt(process.env.DB_POOL ?? '10', 10),
}));
\`\`\`
Then \`config.get<DatabaseConfig>('database')\`.`,
      tags: ["config"],
    },
    {
      id: "testing",
      title: "Testing in Nest",
      difficulty: "medium",
      question: "How do you test Nest controllers and services?",
      answer: `**Unit tests** — test a service in isolation with mocked deps.

\`\`\`ts
describe('UsersService', () => {
  let service: UsersService;
  let repo: { find: jest.Mock };

  beforeEach(async () => {
    repo = { find: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('returns all users', async () => {
    repo.find.mockResolvedValue([{ id: 1 }]);
    expect(await service.findAll()).toEqual([{ id: 1 }]);
  });
});
\`\`\`

**Controller tests** — mock the service:
\`\`\`ts
const module = await Test.createTestingModule({
  controllers: [UsersController],
  providers: [{ provide: UsersService, useValue: { findAll: jest.fn().mockResolvedValue([...]) } }],
}).compile();
\`\`\`

**E2E tests** — boot the actual app:
\`\`\`ts
const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
const app = moduleRef.createNestApplication();
await app.init();
return request(app.getHttpServer()).get('/users').expect(200).expect([{ id: 1 }]);
\`\`\`

**Tools:**
- **Jest** — default; built-in with Nest CLI.
- **supertest** — HTTP assertions for E2E.
- **testcontainers** — spin up real DBs/queues for integration tests.

**Best practices:**
- Unit-test services with mocked repositories.
- E2E-test full request flows with real DB (testcontainers).
- Don't over-mock — test what users see.`,
      tags: ["testing"],
    },
    {
      id: "swagger",
      title: "OpenAPI / Swagger",
      difficulty: "medium",
      question: "How do you generate API docs in Nest?",
      answer: `**\`@nestjs/swagger\`** auto-generates OpenAPI specs from decorators.

\`\`\`ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('My API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
\`\`\`

**Decorate DTOs:**
\`\`\`ts
export class CreateUserDto {
  @ApiProperty({ example: 'ada@x.com' })
  email!: string;

  @ApiProperty({ minLength: 2 })
  name!: string;

  @ApiPropertyOptional()
  bio?: string;
}
\`\`\`

**Decorate controllers:**
\`\`\`ts
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: User })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post()
  create(@Body() dto: CreateUserDto) { ... }
}
\`\`\`

**Browse:** \`http://localhost:3000/docs\` — interactive Swagger UI.

**Export spec:** \`SwaggerModule.createDocument(app, config)\` returns the JSON. Save to a file for SDK generation, contract testing.

**SDK generation:** \`openapi-generator\` creates clients in dozens of languages from the spec. Pair with CI to keep clients in sync with API.

**Bonus:** \`@nestjs/swagger\`'s CLI plugin generates schemas automatically without writing \`@ApiProperty\` for every field.`,
      tags: ["docs", "tooling"],
    },

    // ───── HARD ─────
    {
      id: "microservices",
      title: "Microservices",
      difficulty: "hard",
      question: "How does Nest support microservices?",
      answer: `Nest provides a **transport abstraction** for communication between services. Same controllers/services pattern, different transport.

**Transports:**
- **TCP** (default) — Nest's own protocol.
- **Redis** (pub/sub).
- **NATS, MQTT, RabbitMQ, Kafka, gRPC**.
- **Custom** — implement the Server interface.

**Server (the listener):**
\`\`\`ts
const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  transport: Transport.NATS,
  options: { servers: ['nats://nats:4222'] },
});
await app.listen();
\`\`\`

**Message handlers:**
\`\`\`ts
@MessagePattern('user.created')
handleUserCreated(@Payload() data: any) { ... }

@EventPattern('order.placed')
handleOrderPlaced(@Payload() data: any) { ... }   // no response
\`\`\`

**Client:**
\`\`\`ts
@Injectable()
export class OrdersService {
  constructor(@Inject('USERS_SERVICE') private client: ClientProxy) {}

  async getUser(id: string) {
    return await firstValueFrom(this.client.send('user.get', { id }));
  }
}
\`\`\`

**Patterns:**
- **Request-response** (\`send\` + \`@MessagePattern\`) — synchronous.
- **Event-based** (\`emit\` + \`@EventPattern\`) — fire-and-forget.

**gRPC:**
- First-class support with \`.proto\` files.
- Strongly typed via generated TS clients.
- Use for high-performance internal APIs.

**Caveats:**
- Distributed transactions don't exist in microservices — use sagas.
- Add observability (correlation IDs, tracing).
- Plan for partial failures from the start.`,
      tags: ["distributed"],
    },
    {
      id: "graphql",
      title: "GraphQL with Nest",
      difficulty: "hard",
      question: "How do you build a GraphQL API in Nest?",
      answer: `Nest supports GraphQL via **\`@nestjs/graphql\`** with two approaches: schema-first or code-first.

**Code-first (recommended for TS):**
\`\`\`ts
@ObjectType()
export class User {
  @Field(() => ID) id!: string;
  @Field() email!: string;
  @Field() name!: string;
}

@InputType()
export class CreateUserInput {
  @Field() email!: string;
  @Field() name!: string;
}

@Resolver(() => User)
export class UsersResolver {
  constructor(private users: UsersService) {}

  @Query(() => [User])
  users() { return this.users.findAll(); }

  @Query(() => User)
  user(@Args('id') id: string) { return this.users.findOne(id); }

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput) { return this.users.create(input); }
}
\`\`\`

**Module config:**
\`\`\`ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: 'schema.gql',     // generate from decorators
  playground: true,
})
\`\`\`

**Subscriptions** (real-time):
\`\`\`ts
@Subscription(() => User)
userCreated() { return pubSub.asyncIterator('userCreated'); }
\`\`\`

**Drivers:** Apollo (default), Mercurius (Fastify-based, fast).

**N+1 problem:** use \`@nestjs/dataloader\` or **DataLoader** to batch field resolvers.

**Auth:** \`@UseGuards\` works the same. Add \`getRequest()\` override for context.

**vs REST:**
- GraphQL: single endpoint, client picks fields, fewer round-trips.
- REST: simpler caching, easier to debug, mature tooling.
- Pick based on team familiarity and frontend needs.`,
      tags: ["graphql"],
    },
    {
      id: "queues-bull",
      title: "Background jobs with BullMQ",
      difficulty: "hard",
      question: "How do you run background jobs in Nest?",
      answer: `**\`@nestjs/bullmq\`** integrates **BullMQ** (Redis-backed queue) with Nest.

**Setup:**
\`\`\`ts
@Module({
  imports: [
    BullModule.forRoot({ connection: { host: 'redis', port: 6379 } }),
    BullModule.registerQueue({ name: 'emails' }),
  ],
})
export class AppModule {}
\`\`\`

**Producer:**
\`\`\`ts
@Injectable()
export class EmailService {
  constructor(@InjectQueue('emails') private queue: Queue) {}
  send(to: string, body: string) {
    return this.queue.add('send-email', { to, body }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
  }
}
\`\`\`

**Consumer:**
\`\`\`ts
@Processor('emails')
export class EmailProcessor extends WorkerHost {
  async process(job: Job<{ to: string; body: string }>) {
    await sendEmail(job.data.to, job.data.body);
  }
}
\`\`\`

**Features:**
- **Delayed jobs** — \`{ delay: 60_000 }\`.
- **Recurring jobs** (cron) — \`repeat: { pattern: '0 * * * *' }\`.
- **Priorities**.
- **Rate limiting** per worker.
- **Retries** with exponential backoff.
- **Dead letter** — failed jobs after max attempts.

**Monitoring:**
- **Bull-board** — built-in UI for queues.
- **BullMQ Pro** — paid features (groups, batching).

**Alternatives:**
- **\`@nestjs/schedule\`** — simple cron jobs in-process (no queue).
- **AWS SQS via @ssut/nestjs-sqs** — managed queue without Redis.
- **Kafka via @nestjs/microservices** — high-throughput event streams.`,
      tags: ["jobs"],
    },
    {
      id: "websockets",
      title: "WebSockets / Gateways",
      difficulty: "hard",
      question: "How do you handle WebSockets in Nest?",
      answer: `**Gateway** = WebSocket-aware controller. Annotated with \`@WebSocketGateway()\`.

\`\`\`ts
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  handleConnection(client: Socket) { console.log('connected', client.id); }
  handleDisconnect(client: Socket) { console.log('disconnected', client.id); }

  @SubscribeMessage('message')
  onMessage(@MessageBody() body: string, @ConnectedSocket() client: Socket) {
    this.server.emit('message', body);    // broadcast to all
    return { ok: true };                   // ack
  }
}
\`\`\`

**Defaults to Socket.IO**; supports plain ws by setting adapter.

**Auth in WebSocket handshake:**
\`\`\`ts
@UseGuards(WsJwtGuard)
@SubscribeMessage('private')
onPrivate(...) { ... }
\`\`\`

**Rooms / namespaces** (Socket.IO):
\`\`\`ts
client.join('room-1');
this.server.to('room-1').emit('event', payload);
\`\`\`

**Scaling beyond one server:**
- **Redis adapter** for Socket.IO — broadcast across instances.
- Sticky sessions or proper handshake mechanism on the load balancer.

**Alternatives:**
- **Server-Sent Events (SSE)** — \`@Sse()\` decorator. One-way streaming.
- **GraphQL Subscriptions** — real-time over WebSocket.

**Use cases:**
- Chat / collaboration.
- Live dashboards.
- Game state.
- Trading / sports updates.

**Gotcha:** WebSocket connections cost resources. Consider polling + cache for low-frequency updates.`,
      tags: ["realtime"],
    },
    {
      id: "orm-typeorm-prisma",
      title: "TypeORM vs Prisma",
      difficulty: "hard",
      question: "Should you use TypeORM, Prisma, or something else with Nest?",
      answer: `**TypeORM** — historically Nest's default ORM.
- Decorator-driven entities.
- Active development but rocky history.
- Repository pattern.
- TypeScript types are weaker than Prisma's.

**Prisma** — modern, popular alternative.
- Schema-first (\`schema.prisma\`).
- **Excellent type safety** — generated client matches schema exactly.
- Migrations are great.
- Less Nest-native; integrate with a custom \`PrismaService\`.

**Drizzle ORM** — newer, lightweight.
- TypeScript-first; SQL-like API.
- Smaller bundle than Prisma.
- Less mature.

**MikroORM** — TypeORM-like with better TS.

**Mongoose** — for MongoDB; \`@nestjs/mongoose\` provides decorators.

**Pick Prisma when:**
- Strong TS type safety matters.
- New project, team prefers schema-first.
- Migrations need first-class tooling.

**Pick TypeORM when:**
- Existing codebase already uses it.
- Need very flexible custom queries.
- Decorator-driven entities feel natural.

**Integrating Prisma:**
\`\`\`ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() { await this.\$connect(); }
}
\`\`\`
Inject into services; use Prisma's typed queries.

**Repository vs query-builder:**
- Repository: domain-driven; abstract DB.
- Query builder: closer to SQL; simpler for complex queries.
- Many teams pick query builder + a service layer for business logic.`,
      tags: ["database"],
    },
    {
      id: "perf-best-practices",
      title: "Performance and best practices",
      difficulty: "hard",
      question: "What are common Nest performance pitfalls?",
      answer: `**1. Default to Fastify, not Express.**
- 30-50% faster on most benchmarks.
- \`NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())\`.

**2. Avoid synchronous work in handlers.**
- Don't block the event loop with CPU-bound code; offload to worker_threads or queues.

**3. Disable global ValidationPipe transform on hot paths if not needed.**
- It uses class-transformer, which has overhead.

**4. Cache aggressively.**
- \`@nestjs/cache-manager\` + Redis — wrap GET endpoints.
- Use proper cache invalidation, not just TTLs.

**5. Connection pools.**
- DB pool sized to expected concurrency, not 100x of it.
- Use **PgBouncer** for Postgres at scale.

**6. Streaming / pagination for large responses.**
- Don't load 100k rows; stream or paginate.

**7. Avoid N+1 in ORM relations.**
- Eager load with proper joins or use DataLoader for GraphQL.

**8. Health checks + readiness/liveness probes.**
- \`@nestjs/terminus\` exposes \`/health\` checks for DB, queue, custom.

**9. Compile-time optimizations.**
- Run \`tsc\` with \`incremental: true\`.
- For production, consider **swc** instead of tsc — much faster builds.

**10. Avoid unnecessary REQUEST-scoped providers.**
- They allocate per request — costly at high RPS.
- Use only when truly needed (per-request user, tracing, etc.).

**Profiling:**
- \`--inspect\` + Chrome DevTools.
- 0x for flamegraphs.
- pprof / clinic.js.

**Monitoring:**
- OpenTelemetry SDK.
- Prom-client + Grafana.
- Datadog / New Relic / Sentry.`,
      tags: ["performance"],
    },
  ],
};
