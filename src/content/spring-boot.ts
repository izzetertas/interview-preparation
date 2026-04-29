import type { Category } from "./types";

export const springBoot: Category = {
  slug: "spring-boot",
  title: "Spring Boot",
  description:
    "Spring Boot essentials: auto-configuration, dependency injection, REST APIs, security, testing, and actuator",
  icon: "🍃",
  questions: [
    // ───── EASY ─────
    {
      id: "what-is-spring-boot",
      title: "What is Spring Boot?",
      difficulty: "easy",
      question: "What is Spring Boot and how does it differ from the Spring Framework?",
      answer: `**Spring Boot** is an opinionated, convention-over-configuration layer built on top of the **Spring Framework**. Its goal is to let you build production-ready Spring applications with minimal boilerplate.

**Key differences from plain Spring:**

| Aspect | Spring Framework | Spring Boot |
|--------|-----------------|-------------|
| Configuration | XML / Java config, manual | Auto-configuration based on classpath |
| App startup | Need to wire DispatcherServlet, etc. | Embedded Tomcat/Jetty — just run a 'main()' |
| Dependency management | Manage versions yourself | Starter POMs with curated, compatible versions |
| Production readiness | Manual setup | Actuator: health, metrics, info endpoints built-in |
| Opinionation | Flexible, verbose | Sensible defaults; easy to override |

**Minimal Spring Boot application:**

'@SpringBootApplication' // meta-annotation enabling auto-config, component scan, config
'public class App {'
'    public static void main(String[] args) {'
'        SpringApplication.run(App.class, args);'
'    }'
'}'

Spring Boot does **not replace** Spring — it is Spring, just pre-configured. All Spring modules (Data, Security, MVC, etc.) still underpin Boot.`,
      tags: ["fundamentals"],
    },
    {
      id: "ioc-di-container",
      title: "IoC Container & Dependency Injection",
      difficulty: "easy",
      question: "What is the Spring IoC container and how does dependency injection work?",
      answer: `**Inversion of Control (IoC)** means the framework, not your code, controls object creation and wiring. The Spring **IoC container** (implemented as 'ApplicationContext') manages the full lifecycle of objects called **beans**.

**Dependency Injection (DI)** is the primary IoC mechanism — dependencies are pushed into a class rather than the class pulling them in via 'new'.

**Three injection styles:**

1. **Constructor injection (preferred):**

'@Service'
'public class OrderService {'
'    private final PaymentService paymentService;'
'    // Spring injects the required bean automatically'
'    public OrderService(PaymentService paymentService) {'
'        this.paymentService = paymentService;'
'    }'
'}'

2. **Field injection (convenient but harder to test):**

'@Autowired'
'private PaymentService paymentService;'

3. **Setter injection (optional dependencies):**

'@Autowired(required = false)'
'public void setPaymentService(PaymentService svc) { ... }'

**Why constructor injection is recommended:**
- Makes dependencies explicit and required.
- Allows 'final' fields — guarantees immutability.
- Easier to unit-test without a Spring context (just call 'new').
- Detects circular dependencies at startup, not runtime.`,
      tags: ["ioc", "di", "fundamentals"],
    },
    {
      id: "component-annotations",
      title: "@Component, @Service, @Repository, @Controller",
      difficulty: "easy",
      question: "What is the difference between @Component, @Service, @Repository, and @Controller?",
      answer: `All four are **stereotype annotations** — they mark a class as a Spring-managed bean and are detected by component scanning. They differ in **semantic meaning** and **additional behavior**.

| Annotation | Layer | Extra behavior |
|------------|-------|----------------|
| '@Component' | Generic | None — base annotation |
| '@Service' | Business logic | None (semantic only) |
| '@Repository' | Data access | Exception translation (SQL → Spring DataAccessException) |
| '@Controller' | Web / MVC | Marks class as MVC controller; works with view resolution |
| '@RestController' | Web / REST | '@Controller' + '@ResponseBody' — returns JSON/XML directly |

**Example:**

'@Repository'
'public class UserRepository {'
'    // Spring translates JPA/SQL exceptions to DataAccessException hierarchy'
'}'

'@Service'
'public class UserService {'
'    private final UserRepository repo;'
'    public UserService(UserRepository repo) { this.repo = repo; }'
'}'

'@RestController'
'@RequestMapping("/users")'
'public class UserController {'
'    private final UserService service;'
'    public UserController(UserService service) { this.service = service; }'

'    @GetMapping("/{id}")'
'    public User getUser(@PathVariable Long id) {'
'        return service.findById(id);'
'    }'
'}'

The distinctions are mostly documentation and tooling hints — but '@Repository' exception translation is a real runtime difference.`,
      tags: ["annotations", "component-scan"],
    },
    {
      id: "spring-boot-application-annotation",
      title: "@SpringBootApplication",
      difficulty: "easy",
      question: "What does @SpringBootApplication do and what three annotations does it combine?",
      answer: `'@SpringBootApplication' is a **convenience meta-annotation** that bundles three annotations:

1. **'@SpringBootConfiguration'** — designates the class as a configuration class (a specialization of '@Configuration'), allowing bean definitions via '@Bean' methods.

2. **'@EnableAutoConfiguration'** — tells Spring Boot to read 'META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports' (Boot 3) and conditionally apply configurations based on what is on the classpath (e.g., if 'spring-boot-starter-data-jpa' is present, JPA auto-configuration activates).

3. **'@ComponentScan'** — scans the package of the annotated class and all sub-packages for '@Component', '@Service', '@Repository', '@Controller', etc.

**Usage:**

'@SpringBootApplication'
'public class MyApp {'
'    public static void main(String[] args) {'
'        ApplicationContext ctx = SpringApplication.run(MyApp.class, args);'
'    }'
'}'

**Customizing the scan or excluding auto-configs:**

'@SpringBootApplication('
'    scanBasePackages = "com.acme.myapp",'
'    exclude = { DataSourceAutoConfiguration.class }'
')'
'public class MyApp { ... }'

Place the main class at the **root package** of your application so component scanning reaches all sub-packages automatically.`,
      tags: ["annotations", "auto-configuration"],
    },
    {
      id: "application-properties-yaml",
      title: "application.properties vs application.yml",
      difficulty: "easy",
      question: "How do you configure a Spring Boot application and what is the difference between application.properties and application.yml?",
      answer: `Spring Boot reads configuration from 'src/main/resources/application.properties' (or 'application.yml') automatically. Both formats are equivalent — pick whichever your team prefers.

**application.properties:**

'server.port=8080'
'spring.datasource.url=jdbc:postgresql://localhost:5432/mydb'
'spring.datasource.username=dbuser'
'spring.datasource.password=secret'
'spring.jpa.hibernate.ddl-auto=validate'
'logging.level.com.acme=DEBUG'

**application.yml (YAML — hierarchical, less repetition):**

'server:'
'  port: 8080'
'spring:'
'  datasource:'
'    url: jdbc:postgresql://localhost:5432/mydb'
'    username: dbuser'
'    password: secret'
'  jpa:'
'    hibernate:'
'      ddl-auto: validate'
'logging:'
'  level:'
'    com.acme: DEBUG'

**Key points:**
- YAML is structurally cleaner for deeply nested keys.
- Properties files are simpler for flat key/value configs.
- Both support profile-specific overrides (e.g., 'application-prod.yml').
- Environment variables and system properties **override** file values (Spring's property source precedence).
- Sensitive values should be injected via environment variables or secrets managers — never committed to source control.`,
      tags: ["configuration"],
    },
    {
      id: "spring-profiles",
      title: "Spring Profiles",
      difficulty: "easy",
      question: "What are Spring Profiles and how do you use them?",
      answer: `**Profiles** let you segregate parts of your configuration and beans so they only activate in specific environments (dev, test, prod).

**Activating a profile:**
- Via environment variable: 'SPRING_PROFILES_ACTIVE=prod'
- In 'application.properties': 'spring.profiles.active=prod'
- Programmatically: 'SpringApplication.setAdditionalProfiles("prod")'

**Profile-specific property files:**
Spring Boot automatically loads 'application-{profile}.yml', which merges with (and overrides) the base 'application.yml'.

'application-dev.yml':
'spring:'
'  datasource:'
'    url: jdbc:h2:mem:testdb'

'application-prod.yml':
'spring:'
'  datasource:'
'    url: jdbc:postgresql://prod-db:5432/mydb'

**Conditional beans:**

'@Configuration'
'public class DataSourceConfig {'

'    @Bean'
'    @Profile("dev")'
'    public DataSource h2DataSource() { ... }'

'    @Bean'
'    @Profile("prod")'
'    public DataSource postgresDataSource() { ... }'
'}'

**'@Profile' on components:**

'@Service'
'@Profile("!prod")  // active in every profile except prod'
'public class MockEmailService implements EmailService { ... }'

Multiple profiles can be active simultaneously: 'SPRING_PROFILES_ACTIVE=prod,metrics'.`,
      tags: ["profiles", "configuration"],
    },
    {
      id: "actuator-basics",
      title: "Spring Boot Actuator",
      difficulty: "easy",
      question: "What is Spring Boot Actuator and what endpoints does it expose?",
      answer: `**Spring Boot Actuator** adds production-ready operational endpoints to your application with zero extra code. Add the dependency 'spring-boot-starter-actuator' and they activate automatically.

**Key endpoints (exposed over HTTP or JMX):**

| Endpoint | Description |
|----------|-------------|
| '/actuator/health' | Liveness/readiness status; aggregates component health |
| '/actuator/info' | Application metadata (version, description) |
| '/actuator/metrics' | Micrometer metrics (JVM, HTTP, custom) |
| '/actuator/env' | Active properties and their sources |
| '/actuator/beans' | All beans in the application context |
| '/actuator/mappings' | All '@RequestMapping' routes |
| '/actuator/loggers' | View and change log levels at runtime |
| '/actuator/threaddump' | Current thread stack traces |
| '/actuator/httptrace' | Last N HTTP request/response traces |

**Minimal configuration:**

'management:'
'  endpoints:'
'    web:'
'      exposure:'
'        include: health,info,metrics'
'  endpoint:'
'    health:'
'      show-details: when-authorized'

**Health groups (Boot 2.3+):**

'management.endpoint.health.group.readiness.include=db,redis'

Used by Kubernetes liveness/readiness probes at '/actuator/health/liveness' and '/actuator/health/readiness'.

**Secure actuator endpoints** behind Spring Security or restrict them to an internal management port ('management.server.port=9090').`,
      tags: ["actuator", "monitoring"],
    },

    // ───── MEDIUM ─────
    {
      id: "auto-configuration-mechanism",
      title: "Auto-Configuration Mechanism",
      difficulty: "medium",
      question: "How does Spring Boot auto-configuration work internally?",
      answer: `Auto-configuration is the core of Spring Boot's magic. It works through a chain of mechanisms:

**1. Trigger:** '@EnableAutoConfiguration' (part of '@SpringBootApplication') imports 'AutoConfigurationImportSelector'.

**2. Discovery:** The selector reads 'META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports' (Boot 3) or 'META-INF/spring.factories' (Boot 2) from every JAR on the classpath to collect candidate auto-configuration classes.

**3. Conditional evaluation:** Each auto-config class is annotated with '@Conditional*' annotations that gate its application:

| Annotation | Condition |
|------------|-----------|
| '@ConditionalOnClass' | A class is present on the classpath |
| '@ConditionalOnMissingBean' | No bean of that type exists yet |
| '@ConditionalOnProperty' | A property has a specific value |
| '@ConditionalOnWebApplication' | Running as a web application |

**Example — simplified DataSource auto-config:**

'@AutoConfiguration'
'@ConditionalOnClass(DataSource.class)              // only if driver is on classpath'
'@ConditionalOnMissingBean(DataSource.class)        // only if user has NOT defined one'
'@EnableConfigurationProperties(DataSourceProperties.class)'
'public class DataSourceAutoConfiguration {'
'    @Bean'
'    public DataSource dataSource(DataSourceProperties props) {'
'        return props.initializeDataSourceBuilder().build();'
'    }'
'}'

**Overriding auto-config:** Define your own '@Bean' of the same type — '@ConditionalOnMissingBean' ensures the auto-configured bean is skipped.

**Debug auto-config:** Run with '--debug' flag or set 'logging.level.org.springframework.boot.autoconfigure=DEBUG' to get a **Conditions Evaluation Report** listing every auto-configuration and whether it matched.`,
      tags: ["auto-configuration", "internals"],
    },
    {
      id: "bean-lifecycle",
      title: "Bean Lifecycle",
      difficulty: "medium",
      question: "What is the Spring bean lifecycle and how can you hook into it?",
      answer: `Spring manages the full lifecycle of beans. The sequence for a singleton bean:

**Instantiation → Dependency Injection → Post-processing → Ready → Pre-destroy → Destroyed**

**Detailed steps:**
1. Instantiate the class (constructor called).
2. Inject dependencies ('@Autowired' fields/setters).
3. 'BeanNameAware', 'BeanFactoryAware', 'ApplicationContextAware' callbacks (if implemented).
4. 'BeanPostProcessor.postProcessBeforeInitialization()' — all registered post-processors.
5. '@PostConstruct' method (JSR-250 — preferred).
6. 'InitializingBean.afterPropertiesSet()'.
7. Custom 'initMethod' from '@Bean(initMethod = "init")'.
8. 'BeanPostProcessor.postProcessAfterInitialization()'.
9. **Bean is ready for use.**
10. '@PreDestroy' method (on container shutdown).
11. 'DisposableBean.destroy()'.
12. Custom 'destroyMethod'.

**Recommended hooks (annotation-based):**

'@Component'
'public class CacheLoader {'
'    private final CacheService cache;'

'    public CacheLoader(CacheService cache) { this.cache = cache; }'

'    @PostConstruct'
'    public void warmUp() {'
'        // Called after injection — safe to use dependencies'
'        cache.loadInitialData();'
'    }'

'    @PreDestroy'
'    public void flushCache() {'
'        // Called before bean is destroyed'
'        cache.flush();'
'    }'
'}'

**Scope matters:** '@PreDestroy' is only called for singleton beans (and prototype beans registered with a 'DestructionAwareBeanPostProcessor'). Prototype beans are not tracked after creation.`,
      tags: ["bean-lifecycle", "internals"],
    },
    {
      id: "spring-mvc-request-handling",
      title: "Spring MVC Request Handling",
      difficulty: "medium",
      question: "How does Spring MVC handle an incoming HTTP request from start to finish?",
      answer: `Spring MVC uses the **Front Controller** pattern. Every request flows through 'DispatcherServlet'.

**Request lifecycle:**

1. **Client sends HTTP request** → hits the embedded Tomcat servlet container.
2. **DispatcherServlet** receives the request (it is the single entry-point servlet).
3. **HandlerMapping** — DispatcherServlet consults registered handler mappings (e.g., 'RequestMappingHandlerMapping') to find the controller method that matches the URL, HTTP method, headers, and params.
4. **HandlerAdapter** — wraps the handler; 'RequestMappingHandlerAdapter' invokes the controller method, resolving arguments via 'HandlerMethodArgumentResolver' (path variables, request body via Jackson, query params, etc.).
5. **Controller method executes** — returns a value (object, 'ResponseEntity', 'ModelAndView', etc.).
6. **Return value handling** — 'HandlerMethodReturnValueHandler' processes the return. '@ResponseBody' (or '@RestController') triggers 'HttpMessageConverter' (e.g., 'MappingJackson2HttpMessageConverter') to serialize the object to JSON.
7. **HandlerExceptionResolver** — if any step throws, exception resolvers (including '@ControllerAdvice' classes) handle it.
8. **Response** is written to the servlet output stream and returned to the client.

**Key participants:**

| Component | Role |
|-----------|------|
| 'DispatcherServlet' | Front controller — orchestrates everything |
| 'HandlerMapping' | URL → handler resolution |
| 'HandlerAdapter' | Invokes the handler |
| 'HttpMessageConverter' | Java object ↔ JSON/XML |
| 'HandlerExceptionResolver' | Error handling |`,
      tags: ["spring-mvc", "request-handling"],
    },
    {
      id: "restcontroller-vs-controller",
      title: "@RestController vs @Controller",
      difficulty: "medium",
      question: "What is the difference between @RestController and @Controller, and when do you use each?",
      answer: `'@RestController' is a **composed annotation** — shorthand for '@Controller' + '@ResponseBody' on every method.

**@Controller** (traditional MVC — returns view names):

'@Controller'
'public class PageController {'
'    @GetMapping("/home")'
'    public String home(Model model) {'
'        model.addAttribute("user", "Alice");'
'        return "home";  // resolves to templates/home.html (Thymeleaf, etc.)'
'    }'
'}'

**@RestController** (REST API — returns data serialized to JSON/XML):

'@RestController'
'@RequestMapping("/api/users")'
'public class UserApiController {'

'    @GetMapping("/{id}")'
'    public User getUser(@PathVariable Long id) {'
'        return userService.findById(id);  // Jackson serializes to JSON'
'    }'

'    @PostMapping'
'    @ResponseStatus(HttpStatus.CREATED)'
'    public User createUser(@RequestBody @Valid CreateUserRequest req) {'
'        return userService.create(req);'
'    }'
'}'

**Returning both views and data from one controller:**

'@Controller'
'public class HybridController {'
'    @GetMapping("/page")'
'    public String page() { return "page"; }  // view'

'    @GetMapping("/api/data")'
'    @ResponseBody'
'    public Data data() { return new Data(); }  // JSON'
'}'

**Rule of thumb:** Use '@RestController' for all REST API endpoints. Use '@Controller' when rendering server-side HTML templates.`,
      tags: ["annotations", "spring-mvc", "rest"],
    },
    {
      id: "exception-handling-controller-advice",
      title: "Exception Handling with @ControllerAdvice",
      difficulty: "medium",
      question: "How do you implement global exception handling in Spring Boot with @ControllerAdvice?",
      answer: `'@ControllerAdvice' (or '@RestControllerAdvice' = '@ControllerAdvice' + '@ResponseBody') defines **cross-cutting exception handlers** that apply to all controllers.

**Global exception handler:**

'@RestControllerAdvice'
'public class GlobalExceptionHandler {'

'    @ExceptionHandler(ResourceNotFoundException.class)'
'    @ResponseStatus(HttpStatus.NOT_FOUND)'
'    public ErrorResponse handleNotFound(ResourceNotFoundException ex) {'
'        return new ErrorResponse("NOT_FOUND", ex.getMessage());'
'    }'

'    @ExceptionHandler(MethodArgumentNotValidException.class)'
'    @ResponseStatus(HttpStatus.BAD_REQUEST)'
'    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {'
'        List<String> errors = ex.getBindingResult().getFieldErrors()'
'            .stream()'
'            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())'
'            .toList();'
'        return new ErrorResponse("VALIDATION_FAILED", errors.toString());'
'    }'

'    @ExceptionHandler(Exception.class)'
'    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)'
'    public ErrorResponse handleAll(Exception ex) {'
'        log.error("Unhandled exception", ex);'
'        return new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred");'
'    }'
'}'

**Custom error response DTO:**

'public record ErrorResponse(String code, String message) {}'

**Scoping '@ControllerAdvice'** to specific packages or controller types:

'@RestControllerAdvice(basePackages = "com.acme.api")'
'@RestControllerAdvice(assignableTypes = {UserController.class})'

**'ProblemDetail' (RFC 9457 — Spring 6 / Boot 3):**

'@ExceptionHandler(ResourceNotFoundException.class)'
'public ProblemDetail handleNotFound(ResourceNotFoundException ex) {'
'    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());'
'    pd.setTitle("Resource Not Found");'
'    return pd;'
'}'`,
      tags: ["exception-handling", "spring-mvc"],
    },
    {
      id: "bean-scopes",
      title: "Bean Scopes",
      difficulty: "medium",
      question: "What are the different bean scopes in Spring and when do you use each?",
      answer: `Bean scope controls **how many instances** Spring creates and **how long they live**.

| Scope | Instances | Lifetime | Use case |
|-------|-----------|----------|----------|
| **singleton** (default) | One per ApplicationContext | App lifetime | Stateless services, repositories |
| **prototype** | New per injection/getBean() | Caller manages | Stateful objects, mutable command objects |
| **request** | One per HTTP request | HTTP request | Web-layer data (user context per request) |
| **session** | One per HTTP session | HTTP session | User shopping cart, preferences |
| **application** | One per ServletContext | App lifetime | Similar to singleton but web-specific |

**Declaring scopes:**

'@Component'
'@Scope("prototype")'
'public class ReportGenerator { ... }'

'@Component'
'@RequestScope   // shorthand for @Scope("request")'
'public class RequestContext { ... }'

**Singleton injecting a prototype — the scope problem:**

When a singleton holds a reference to a prototype bean, it gets the **same** prototype instance every time (injected once at startup). Fix with:
- **Method injection** ('@Lookup')
- **ObjectProvider / ApplicationContext.getBean()**
- **Scoped proxy:** '@Scope(value = "prototype", proxyMode = ScopedProxyMode.TARGET_CLASS)'

'@Component'
'@Scope(value = "prototype", proxyMode = ScopedProxyMode.TARGET_CLASS)'
'public class ReportGenerator { ... }'

'@Service'
'public class ReportService {'
'    // Spring injects a proxy; each call delegates to a new ReportGenerator'
'    private final ReportGenerator generator;'
'}'`,
      tags: ["bean-scopes", "internals"],
    },
    {
      id: "spring-data-jpa",
      title: "Spring Data JPA",
      difficulty: "medium",
      question: "How does Spring Data JPA simplify database access and what are derived query methods?",
      answer: `**Spring Data JPA** eliminates boilerplate DAO code. Extend 'JpaRepository<Entity, ID>' and get CRUD + pagination + sorting for free.

**Entity and Repository:**

'@Entity'
'@Table(name = "products")'
'public class Product {'
'    @Id'
'    @GeneratedValue(strategy = GenerationType.IDENTITY)'
'    private Long id;'
'    private String name;'
'    private BigDecimal price;'
'    private String category;'
'    // getters/setters or use Lombok @Data'
'}'

'public interface ProductRepository extends JpaRepository<Product, Long> {'

'    // Derived queries — Spring generates JPQL from method names'
'    List<Product> findByCategory(String category);'
'    List<Product> findByCategoryAndPriceLessThan(String category, BigDecimal max);'
'    Optional<Product> findByNameIgnoreCase(String name);'
'    long countByCategory(String category);'

'    // JPQL query'
'    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :min AND :max")'
'    List<Product> findInPriceRange(@Param("min") BigDecimal min, @Param("max") BigDecimal max);'

'    // Native SQL'
'    @Query(value = "SELECT * FROM products WHERE category = ?1 LIMIT ?2", nativeQuery = true)'
'    List<Product> findTopByCategory(String category, int limit);'
'}'

**Pagination:**

'Page<Product> page = repo.findByCategory("Electronics",'
'    PageRequest.of(0, 20, Sort.by("price").descending()));'

'page.getContent();      // List of products on this page'
'page.getTotalElements(); // total count'

**Transactions:** Spring Data methods run in transactions by default. Annotate service methods with '@Transactional' for multi-step operations.`,
      tags: ["jpa", "data-access", "spring-data"],
    },
    {
      id: "spring-security-basics",
      title: "Spring Security Basics",
      difficulty: "medium",
      question: "How does Spring Security work and how do you configure basic authentication and authorization?",
      answer: `**Spring Security** provides authentication and authorization via a **filter chain**. Every HTTP request passes through a series of security filters before reaching your controllers.

**Core concepts:**
- **Authentication** — verifying who you are (login).
- **Authorization** — verifying what you can do (access control).
- **SecurityFilterChain** — the ordered chain of security filters.
- **SecurityContext** — thread-local holder for the authenticated principal.

**Modern security config (Spring Boot 3 / Spring Security 6 — no 'WebSecurityConfigurerAdapter'):**

'@Configuration'
'@EnableWebSecurity'
'public class SecurityConfig {'

'    @Bean'
'    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {'
'        http'
'            .csrf(csrf -> csrf.disable())   // disable for stateless REST APIs'
'            .authorizeHttpRequests(auth -> auth'
'                .requestMatchers("/api/public/**").permitAll()'
'                .requestMatchers("/api/admin/**").hasRole("ADMIN")'
'                .anyRequest().authenticated()'
'            )'
'            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))'
'            .httpBasic(Customizer.withDefaults());'
'        return http.build();'
'    }'

'    @Bean'
'    public UserDetailsService users() {'
'        UserDetails user = User.withUsername("alice")'
'            .password(passwordEncoder().encode("pass"))'
'            .roles("USER")'
'            .build();'
'        return new InMemoryUserDetailsManager(user);'
'    }'

'    @Bean'
'    public PasswordEncoder passwordEncoder() {'
'        return new BCryptPasswordEncoder();'
'    }'
'}'

**Method-level security (enable with '@EnableMethodSecurity'):**

'@PreAuthorize("hasRole(''ADMIN'') or #userId == authentication.principal.id")'
'public User getUser(Long userId) { ... }'`,
      tags: ["security", "authentication", "authorization"],
    },
    {
      id: "configuration-properties",
      title: "@ConfigurationProperties",
      difficulty: "medium",
      question: "How do you bind configuration to a type-safe object with @ConfigurationProperties?",
      answer: `'@ConfigurationProperties' maps a prefix of the application properties to a Java class, giving you **type-safe, validated configuration** instead of scattered '@Value' annotations.

**Configuration class:**

'@ConfigurationProperties(prefix = "app.mail")'
'@Validated'
'public class MailProperties {'
'    @NotBlank'
'    private String host;'
'    private int port = 587;'
'    private boolean starttlsEnabled = true;'
'    @NotBlank'
'    private String username;'
'    // getters and setters (or use @Data with Lombok)'
'}'

**Register it (Boot 3 — preferred):**

'@SpringBootApplication'
'@EnableConfigurationProperties(MailProperties.class)'
'public class App { ... }'

Or annotate the properties class itself with '@Component'.

**application.yml:**

'app:'
'  mail:'
'    host: smtp.example.com'
'    port: 587'
'    starttls-enabled: true'
'    username: noreply@example.com'

**Inject and use:**

'@Service'
'public class EmailService {'
'    private final MailProperties mail;'
'    public EmailService(MailProperties mail) { this.mail = mail; }'

'    public void send(String to, String body) {'
'        // use mail.getHost(), mail.getPort(), etc.'
'    }'
'}'

**Advantages over '@Value':**
- Grouped — all related props in one class.
- Validated at startup via Bean Validation.
- Relaxed binding: 'starttls-enabled', 'STARTTLS_ENABLED', and 'starttlsEnabled' all bind to the same field.
- IDE completion with the 'spring-boot-configuration-processor' annotation processor.`,
      tags: ["configuration", "type-safety"],
    },
    {
      id: "rest-template-web-client",
      title: "RestTemplate vs WebClient",
      difficulty: "medium",
      question: "What is the difference between RestTemplate and WebClient in Spring Boot, and when should you use each?",
      answer: `Both are Spring HTTP clients, but they differ fundamentally in execution model.

**RestTemplate (legacy — blocking):**

'RestTemplate' is a synchronous, blocking HTTP client. Each call occupies a thread until the response arrives.

'@Service'
'public class WeatherService {'
'    private final RestTemplate restTemplate;'
'    public WeatherService(RestTemplateBuilder builder) {'
'        this.restTemplate = builder.build();'
'    }'

'    public WeatherDto getWeather(String city) {'
'        return restTemplate.getForObject('
'            "https://api.weather.example.com/current?city={city}",'
'            WeatherDto.class, city);'
'    }'
'}'

**WebClient (modern — non-blocking, reactive):**

'WebClient' is Spring WebFlux's reactive HTTP client. It returns 'Mono' (0-1 item) or 'Flux' (0-N items) and does not block threads.

'@Service'
'public class WeatherService {'
'    private final WebClient webClient;'
'    public WeatherService(WebClient.Builder builder) {'
'        this.webClient = builder.baseUrl("https://api.weather.example.com").build();'
'    }'

'    // Reactive: use in WebFlux controllers or .block() in MVC (with caution)'
'    public Mono<WeatherDto> getWeather(String city) {'
'        return webClient.get()'
'            .uri("/current?city={city}", city)'
'            .retrieve()'
'            .bodyToMono(WeatherDto.class);'
'    }'

'    // Blocking call for use in traditional MVC / @Service'
'    public WeatherDto getWeatherBlocking(String city) {'
'        return getWeather(city).block();'
'    }'
'}'

**Comparison:**

| Aspect | RestTemplate | WebClient |
|--------|-------------|-----------|
| Model | Blocking, synchronous | Non-blocking, reactive |
| Status | Maintenance mode (deprecated in Boot 3) | Actively developed |
| Spring Boot | Both starters | Requires 'spring-boot-starter-webflux' |
| Reactive support | No | Yes (Mono/Flux) |
| Virtual threads (Boot 3.2+) | Works fine | Preferred for reactive stacks |

**Recommendation:** For new Spring Boot 3 projects, use **WebClient** even in MVC apps — it handles timeouts, retries, and streaming better. With virtual threads, calling '.block()' is safe in MVC context. 'RestTemplate' remains available but is in maintenance mode.`,
      tags: ["http-client", "rest-template", "web-client"],
    },

    // ───── HARD ─────
    {
      id: "jwt-spring-security",
      title: "JWT Integration with Spring Security",
      difficulty: "hard",
      question: "How do you implement stateless JWT authentication in Spring Boot?",
      answer: `Integrating JWT into Spring Security requires a **custom filter** that extracts and validates the token on each request, then populates the 'SecurityContext'.

**1. JWT utility (using jjwt library):**

'@Component'
'public class JwtUtil {'
'    @Value("\${app.jwt.secret}")'
'    private String secret;'
'    private static final long EXPIRY_MS = 86_400_000; // 24 h'

'    public String generate(String username) {'
'        return Jwts.builder()'
'            .subject(username)'
'            .issuedAt(new Date())'
'            .expiration(new Date(System.currentTimeMillis() + EXPIRY_MS))'
'            .signWith(Keys.hmacShaKeyFor(secret.getBytes()))'
'            .compact();'
'    }'

'    public String extractUsername(String token) {'
'        return Jwts.parser().verifyWith(Keys.hmacShaKeyFor(secret.getBytes()))'
'            .build().parseSignedClaims(token).getPayload().getSubject();'
'    }'

'    public boolean isValid(String token) {'
'        try { extractUsername(token); return true; } catch (Exception e) { return false; }'
'    }'
'}'

**2. JWT filter:**

'@Component'
'public class JwtAuthFilter extends OncePerRequestFilter {'
'    private final JwtUtil jwt;'
'    private final UserDetailsService uds;'

'    @Override'
'    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,'
'            FilterChain chain) throws ServletException, IOException {'
'        String header = req.getHeader("Authorization");'
'        if (header != null && header.startsWith("Bearer ")) {'
'            String token = header.substring(7);'
'            if (jwt.isValid(token)) {'
'                String username = jwt.extractUsername(token);'
'                UserDetails ud = uds.loadUserByUsername(username);'
'                UsernamePasswordAuthenticationToken auth ='
'                    new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());'
'                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));'
'                SecurityContextHolder.getContext().setAuthentication(auth);'
'            }'
'        }'
'        chain.doFilter(req, res);'
'    }'
'}'

**3. Security config — insert filter before UsernamePasswordAuthenticationFilter:**

'http'
'    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)'
'    .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))'
'    .authorizeHttpRequests(auth -> auth'
'        .requestMatchers("/auth/**").permitAll()'
'        .anyRequest().authenticated());'`,
      tags: ["jwt", "security", "authentication"],
    },
    {
      id: "testing-springboottest",
      title: "Testing with @SpringBootTest",
      difficulty: "hard",
      question: "What are @SpringBootTest, @WebMvcTest, and @DataJpaTest and when do you use each?",
      answer: `Spring Boot provides **slice test annotations** that load only the relevant parts of the application context, making tests faster and more focused.

**'@SpringBootTest' — full integration test:**

Loads the complete application context. Use when you need to test interaction across multiple layers.

'@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)'
'class OrderIntegrationTest {'
'    @Autowired'
'    private TestRestTemplate restTemplate;'

'    @Test'
'    void createOrder_returnsCreated() {'
'        ResponseEntity<Order> res = restTemplate.postForEntity('
'            "/orders", new CreateOrderRequest("item1", 2), Order.class);'
'        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);'
'    }'
'}'

**'@WebMvcTest' — controller layer only:**

Loads only MVC infrastructure (controllers, filters, advice). Does NOT load the service/repository layer — mock them.

'@WebMvcTest(UserController.class)'
'class UserControllerTest {'
'    @Autowired MockMvc mockMvc;'
'    @MockBean UserService userService;'

'    @Test'
'    void getUser_returnsUserJson() throws Exception {'
'        given(userService.findById(1L)).willReturn(new User(1L, "Alice"));'
'        mockMvc.perform(get("/api/users/1"))'
'            .andExpect(status().isOk())'
'            .andExpect(jsonPath("$.name").value("Alice"));'
'    }'
'}'

**'@DataJpaTest' — JPA layer only:**

Loads JPA infrastructure + an in-memory H2 DB (by default). Rolls back each test. Does NOT load web or service layers.

'@DataJpaTest'
'class ProductRepositoryTest {'
'    @Autowired ProductRepository repo;'

'    @Test'
'    void findByCategory_returnsMatchingProducts() {'
'        repo.save(new Product("Widget", "Electronics", new BigDecimal("9.99")));'
'        List<Product> found = repo.findByCategory("Electronics");'
'        assertThat(found).hasSize(1);'
'        assertThat(found.get(0).getName()).isEqualTo("Widget");'
'    }'
'}'

**Comparison:**

| Annotation | Context loaded | Speed | Use for |
|------------|---------------|-------|---------|
| '@SpringBootTest' | Full | Slow | End-to-end, integration |
| '@WebMvcTest' | MVC only | Fast | Controller logic, request mapping |
| '@DataJpaTest' | JPA + DB | Fast | Repository queries |`,
      tags: ["testing", "spring-boot-test", "web-mvc-test", "data-jpa-test"],
    },
    {
      id: "spring-boot-3-virtual-threads",
      title: "Spring Boot 3 — Virtual Threads",
      difficulty: "hard",
      question: "How do virtual threads (Project Loom) integrate with Spring Boot 3 and what are the benefits?",
      answer: `**Project Loom** introduced virtual threads in Java 21 (GA). Spring Boot 3.2+ supports them out of the box with a single configuration property.

**Enable virtual threads:**

'spring.threads.virtual.enabled=true'

That's it. Spring Boot automatically configures Tomcat and the Spring MVC task executor to use virtual threads.

**What changes:**
- Tomcat switches from its NIO thread pool to a virtual-thread-per-request model.
- '@Async' methods run on virtual threads.
- Spring MVC '@Controllers' run on virtual threads.
- Spring WebFlux (reactive) is NOT affected — it already has non-blocking I/O; virtual threads are not needed there.

**Why virtual threads matter:**

Traditional platform threads are **OS threads** — expensive (~1 MB stack, kernel context switches). A busy server maxes out at ~200–500 concurrent platform threads.

Virtual threads are **JVM-managed**, extremely cheap (~few KB). You can have millions of them. When a virtual thread blocks on I/O (JDBC query, HTTP call), the JVM parks it and reuses the underlying carrier thread.

**Result:** Tomcat with virtual threads matches reactive throughput for I/O-bound workloads **without** reactive programming complexity.

**Considerations:**
- **Pinning:** Synchronized blocks and 'Object.wait()' pin the virtual thread to its carrier thread, negating the benefit. Replace with 'java.util.concurrent.locks.ReentrantLock'. Spring Framework 6.1+ re-entrant locks are already Loom-friendly.
- **Thread locals:** Virtual threads support thread locals but creating millions of them with large thread-local state wastes memory. Use scoped values (JEP 446) for new code.
- **Observability:** Profilers and APM tools may need updates to handle millions of virtual threads.

**Benchmark takeaway:** Spring Boot 3.2 + virtual threads achieves near-reactive throughput on traditional blocking code (JDBC, RestTemplate), with far simpler programming model.`,
      tags: ["virtual-threads", "spring-boot-3", "performance", "project-loom"],
    },
    {
      id: "spring-boot-3-native-image",
      title: "Spring Boot 3 — Native Image (GraalVM)",
      difficulty: "hard",
      question: "What is GraalVM Native Image support in Spring Boot 3 and what are the trade-offs?",
      answer: `Spring Boot 3 (with Spring Framework 6) added **first-class GraalVM Native Image** support, enabling compilation of Spring Boot apps to **standalone native executables**.

**How it works:**
GraalVM's 'native-image' compiler performs **ahead-of-time (AOT) compilation**:
1. **Reachability analysis** — traces all code paths from entry points at build time.
2. **Generates a self-contained executable** — includes the JVM runtime subset, classes, and resources needed.
3. Spring Boot's AOT engine runs at build time to pre-compute 'ApplicationContext' configuration, generating source code and resource hints that replace runtime reflection.

**Build a native image (Maven):**

'./mvnw -Pnative native:compile'

Or with Buildpacks (Docker, no GraalVM needed locally):

'./mvnw spring-boot:build-image -Pnative'

**Trade-offs:**

| Aspect | JVM (standard) | Native Image |
|--------|---------------|--------------|
| Startup time | ~2–10 s | ~50–200 ms |
| Memory (RSS) | ~300–500 MB | ~50–150 MB |
| Build time | Fast (seconds) | Slow (minutes) |
| Peak throughput | High (JIT-optimized) | Lower (no JIT at runtime) |
| Dynamic features | Full (reflection, proxies) | Limited — must be declared |
| Debugging | Standard Java tools | More complex |

**Reflection and dynamic features:**
Code that uses reflection, JDK proxies, or dynamic class loading must be declared in hint files ('reflect-config.json') or Spring's '@RegisterReflectionForBinding'. Spring Boot 3 auto-generates most hints, but third-party libraries may need extras.

**Ideal use cases:** Serverless functions (AWS Lambda), CLIs, microservices where cold-start latency and memory footprint matter more than peak throughput.`,
      tags: ["native-image", "graalvm", "spring-boot-3", "aot"],
    },
    {
      id: "spring-transaction-management",
      title: "Transaction Management",
      difficulty: "hard",
      question: "How does @Transactional work in Spring and what are the propagation and isolation levels?",
      answer: `Spring's '@Transactional' uses **AOP proxies** to wrap method calls in a transaction. The proxy intercepts the call, begins (or joins) a transaction, and commits or rolls back based on the outcome.

**Basic usage:**

'@Service'
'@Transactional  // all public methods transactional by default'
'public class TransferService {'

'    @Transactional(rollbackFor = Exception.class)'
'    public void transfer(Long fromId, Long toId, BigDecimal amount) {'
'        Account from = repo.findByIdForUpdate(fromId);'
'        Account to = repo.findByIdForUpdate(toId);'
'        from.debit(amount);'
'        to.credit(amount);'
'        repo.save(from);'
'        repo.save(to);'
'        // commits on success; rolls back on RuntimeException (or any Exception with rollbackFor)'
'    }'
'}'

**Propagation levels (most important):**

| Propagation | Behavior |
|-------------|----------|
| 'REQUIRED' (default) | Join existing TX; create new if none |
| 'REQUIRES_NEW' | Always create new TX; suspend existing |
| 'NESTED' | Create savepoint in existing TX; rollback to savepoint on failure |
| 'SUPPORTS' | Join if exists; no TX if none |
| 'NOT_SUPPORTED' | Suspend TX; run without transaction |
| 'NEVER' | Throw if TX exists |
| 'MANDATORY' | Throw if NO TX exists |

**Isolation levels:**

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|-------|------------|--------------------|-|
| 'READ_UNCOMMITTED' | Possible | Possible | Possible |
| 'READ_COMMITTED' (PG default) | No | Possible | Possible |
| 'REPEATABLE_READ' (MySQL InnoDB default) | No | No | Possible |
| 'SERIALIZABLE' | No | No | No |

**Common pitfalls:**
- **Self-invocation:** Calling a '@Transactional' method from within the same class bypasses the proxy — use 'AopContext.currentProxy()' or split into two beans.
- **Checked exceptions:** By default, Spring only rolls back on 'RuntimeException'. Add 'rollbackFor = Exception.class' for checked exceptions.
- **'@Transactional' on private methods:** AOP proxy cannot intercept them — no transaction is applied.`,
      tags: ["transactions", "jpa", "database"],
    },
    {
      id: "spring-cache-abstraction",
      title: "Spring Cache Abstraction",
      difficulty: "hard",
      question: "How does Spring's caching abstraction work and how do you integrate Redis as a cache backend?",
      answer: `Spring's **cache abstraction** provides annotation-driven caching without coupling your code to a specific cache provider (Ehcache, Caffeine, Redis, etc.).

**Enable caching:**

'@SpringBootApplication'
'@EnableCaching'
'public class App { ... }'

**Core annotations:**

| Annotation | Behavior |
|------------|----------|
| '@Cacheable' | Return cached value if present; execute method and cache result if not |
| '@CachePut' | Always execute method; update cache with result |
| '@CacheEvict' | Remove entry (or all entries) from cache |
| '@Caching' | Group multiple cache annotations on one method |

'@Service'
'public class ProductService {'

'    @Cacheable(value = "products", key = "#id")'
'    public Product findById(Long id) {'
'        return repo.findById(id).orElseThrow();   // DB call skipped on cache hit'
'    }'

'    @CachePut(value = "products", key = "#product.id")'
'    public Product update(Product product) {'
'        return repo.save(product);   // always runs; refreshes cache'
'    }'

'    @CacheEvict(value = "products", key = "#id")'
'    public void delete(Long id) {'
'        repo.deleteById(id);'
'    }'

'    @CacheEvict(value = "products", allEntries = true)'
'    public void clearAll() {}'
'}'

**Redis as cache backend (add 'spring-boot-starter-data-redis'):**

'application.yml':
'spring:'
'  data:'
'    redis:'
'      host: localhost'
'      port: 6379'
'  cache:'
'    type: redis'
'    redis:'
'      time-to-live: 600000   # 10 minutes in ms'
'      cache-null-values: false'

Spring Boot auto-configures 'RedisCacheManager'. Keys are serialized using the configured 'RedisSerializer' — configure 'RedisCacheConfiguration' with 'GenericJackson2JsonRedisSerializer' for human-readable JSON values.

**Condition on caching:**

'@Cacheable(value = "products", key = "#id", condition = "#id > 0", unless = "#result == null")'`,
      tags: ["caching", "redis", "performance"],
    },
    {
      id: "spring-events-async",
      title: "Spring Application Events & @Async",
      difficulty: "hard",
      question: "How do Spring application events and @Async work, and what are their pitfalls?",
      answer: `**Spring Application Events** implement an in-process publish/subscribe pattern using 'ApplicationEventPublisher'. Useful for decoupling components (e.g., publish an event when an order is placed; email, inventory, and audit services listen independently).

**Define and publish an event:**

'// Event (record or class extending ApplicationEvent)'
'public record OrderPlacedEvent(Long orderId, String customerEmail) {}'

'@Service'
'public class OrderService {'
'    private final ApplicationEventPublisher publisher;'
'    public OrderService(ApplicationEventPublisher publisher) { this.publisher = publisher; }'

'    @Transactional'
'    public Order placeOrder(CreateOrderRequest req) {'
'        Order order = repo.save(new Order(req));'
'        publisher.publishEvent(new OrderPlacedEvent(order.getId(), req.email()));'
'        return order;'
'    }'
'}'

**Listen to events:**

'@Component'
'public class NotificationListener {'
'    @EventListener'
'    public void onOrderPlaced(OrderPlacedEvent event) {'
'        emailService.sendConfirmation(event.customerEmail(), event.orderId());'
'    }'
'}'

By default, '@EventListener' is **synchronous** — listener runs in the same thread as the publisher, within the same transaction.

**'@TransactionalEventListener'** — run listener AFTER transaction commits:

'@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)'
'public void onOrderPlaced(OrderPlacedEvent event) { ... }'

**'@Async' — run in background thread pool:**

'@EnableAsync  // on @Configuration class'

'@EventListener'
'@Async'
'public void onOrderPlaced(OrderPlacedEvent event) {'
'    // runs on a different thread — does not block the publisher'
'}'

**'@Async' pitfalls:**
- Self-invocation bypasses the proxy — call '@Async' methods from a different bean.
- Exceptions are silently swallowed by default — configure 'AsyncUncaughtExceptionHandler'.
- '@Async' + '@Transactional' on the same method: each annotation creates its own proxy; stack carefully.
- Default executor is 'SimpleAsyncTaskExecutor' (creates new thread per call) — configure a proper thread pool:

'@Bean'
'public Executor taskExecutor() {'
'    ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();'
'    exec.setCorePoolSize(4);'
'    exec.setMaxPoolSize(20);'
'    exec.setQueueCapacity(100);'
'    exec.setThreadNamePrefix("async-");'
'    exec.initialize();'
'    return exec;'
'}'`,
      tags: ["events", "async", "decoupling"],
    },
    {
      id: "spring-boot-observability",
      title: "Observability — Micrometer, Tracing & Logging",
      difficulty: "hard",
      question: "How do you implement observability (metrics, tracing, structured logging) in Spring Boot 3?",
      answer: `Spring Boot 3 ships with **Micrometer** (metrics) and **Micrometer Tracing** (distributed tracing) built in, providing a vendor-neutral observability facade.

**Metrics with Micrometer + Prometheus:**

Add 'spring-boot-starter-actuator' and 'micrometer-registry-prometheus'. Expose the endpoint:

'management.endpoints.web.exposure.include=health,metrics,prometheus'

Metrics are available at '/actuator/prometheus' in Prometheus text format. Scrape with Prometheus → visualize in Grafana.

**Custom metrics:**

'@Service'
'public class OrderService {'
'    private final Counter orderCounter;'
'    private final Timer orderTimer;'

'    public OrderService(MeterRegistry registry) {'
'        this.orderCounter = Counter.builder("orders.created")'
'            .description("Number of orders created")'
'            .tag("env", "prod")'
'            .register(registry);'
'        this.orderTimer = Timer.builder("orders.processing.time")'
'            .register(registry);'
'    }'

'    public Order placeOrder(CreateOrderRequest req) {'
'        return orderTimer.record(() -> {'
'            orderCounter.increment();'
'            return doPlaceOrder(req);'
'        });'
'    }'
'}'

**Distributed tracing (Micrometer Tracing + Zipkin/OTLP):**

Add 'micrometer-tracing-bridge-brave' and 'zipkin-reporter-brave'. Configure:

'management.tracing.sampling.probability=1.0   # 100% sampling (use 0.1 in prod)'
'management.zipkin.tracing.endpoint=http://zipkin:9411/api/v2/spans'

Spring Boot auto-instruments HTTP requests, adding 'traceId' and 'spanId' to MDC for correlation in logs.

**Structured logging (Spring Boot 3.4+):**

'logging.structured.format.console=ecs   # Elastic Common Schema JSON'

Output: '{"@timestamp":"...","log.level":"INFO","message":"...","trace.id":"abc","span.id":"def"}'

**The three pillars wired together:**
- Metrics → Prometheus → Grafana dashboards.
- Traces → Zipkin / Tempo → request flow visualization.
- Logs → structured JSON with 'traceId' → ELK/Loki → correlated with traces.

Spring Boot 3 auto-propagates trace context across HTTP (via 'Observation' API), Kafka, and scheduled tasks.`,
      tags: ["observability", "micrometer", "tracing", "logging", "spring-boot-3"],
    },
  ],
};
