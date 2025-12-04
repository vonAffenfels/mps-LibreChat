# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LibreChat is an open-source AI chat platform that integrates multiple LLM providers (OpenAI, Anthropic, Google, Azure, AWS Bedrock, etc.) into a unified ChatGPT-like interface. It's a full-stack TypeScript/JavaScript monorepo with React frontend and Node.js/Express backend.

## Monorepo Structure

This is a Yarn workspaces monorepo:

```
├── api/                    - Node.js/Express backend
├── client/                 - React/Vite frontend
├── packages/
│   ├── data-schemas/      - Mongoose schemas & type definitions
│   ├── api/               - MCP services & utilities
│   ├── client/            - Shared frontend UI library
│   └── data-provider/     - API client abstraction layer
├── config/                 - CLI scripts for user management, migrations
├── e2e/                    - Playwright end-to-end tests
└── librechat.yaml          - Main application configuration
```

## Essential Commands

### Development

```bash
# Backend development (from root)
npm run backend:dev

# Frontend development (from root)
npm run frontend:dev

# Build packages (required before frontend dev)
npm run build:packages

# Build frontend for production
npm run frontend
```

### Testing

```bash
# Run backend tests
npm run test:api

# Run frontend tests
npm run test:client

# Run e2e tests
npm run e2e

# Run e2e tests in headed mode
npm run e2e:headed
```

### Linting & Formatting

```bash
# Lint all files
npm run lint

# Lint and fix
npm run lint:fix

# Format all files
npm run format
```

### User Management (from root)

```bash
# Create a new user
npm run create-user

# List all users
npm run list-users

# Reset user password
npm run reset-password

# Delete user
npm run delete-user

# Ban/unban user
npm run ban-user

# Add token balance
npm run add-balance
```

### Database Migrations

```bash
# Agent permissions migration (dry run)
npm run migrate:agent-permissions:dry-run

# Prompt permissions migration
npm run migrate:prompt-permissions
```

## Architecture Overview

### Backend Architecture (api/)

**Entry Point**: `api/server/index.js`

**Key Directories**:
- `app/clients/` - LLM client implementations (OpenAI, Anthropic, Google, etc.)
  - `BaseClient.js` - Abstract base class all clients extend
  - Each client handles streaming, token counting, and provider-specific logic
- `server/routes/` - Express route handlers organized by resource
- `server/controllers/` - Business logic controllers
- `server/services/` - Service layer for complex operations
- `server/middleware/` - Authentication, validation, rate limiting
- `strategies/` - Passport authentication strategies (JWT, Local, LDAP, OpenID, SAML, OAuth)
- `models/` - Mongoose model exports
- `db/` - Database connection and setup

**Request Flow**:
```
Client → Route Handler → Middleware Chain → Controller → Service → Model → MongoDB
```

**Authentication Flow**:
1. Middleware extracts JWT from cookie or Authorization header
2. `requireJwtAuth` or strategy-specific middleware validates token
3. User object attached to `req.user`
4. Permission checks via RBAC system if needed
5. Route handler executes

**Important Patterns**:
- All routes use `/api/<resource>` prefix
- Authentication middleware applied per-route or route group
- Error handling via centralized error middleware
- Rate limiting per endpoint using express-rate-limit
- RBAC permissions checked via `PermissionService`

### Frontend Architecture (client/)

**Entry Point**: `client/src/main.jsx`

**Key Directories**:
- `routes/` - React Router route definitions
- `store/` - Recoil atoms for global state
- `hooks/` - Custom React hooks (auth, localization, API calls)
- `components/` - Organized by feature area
  - `Chat/` - Main chat interface
  - `Messages/` - Message rendering and interactions
  - `Conversations/` - Conversation sidebar
  - `Agents/`, `Assistants/`, `Prompts/` - Feature-specific components
  - `ui/` - Base UI components (Radix-based)
- `Providers/` - React context providers
- `data-provider/` - Symlinked to `packages/data-provider` for API calls
- `locales/` - i18n translation files

**State Management**:
- **Recoil** - UI state (settings, endpoints, agents, prompts, etc.)
- **React Query** - Server state with caching (via data-provider)
- **localStorage** - Persistent user preferences

**Important Patterns**:
- All API calls go through `packages/data-provider/src/data-service.ts`
- React Query hooks for server state management
- Recoil atoms for UI state in `store/` directory
- Authentication context in `hooks/AuthContext.tsx`
- Localization via `useLocalize()` hook

### Shared Packages

#### `packages/data-schemas/`
- Mongoose schemas and TypeScript types
- Exports `createModels()` and `createMethods()`
- Single source of truth for data structure
- Used by both backend and frontend

#### `packages/api/`
- MCP (Model Context Protocol) integration
- Shared API utilities
- Cache management
- Session handling

#### `packages/data-provider/`
- API client functions (`data-service.ts`)
- React Query integration
- Type-safe request/response handling
- Shared between frontend and packages

#### `packages/client/`
- Reusable React components
- Theme providers
- Shared UI utilities

### Database Models

**Location**: `packages/data-schemas/src/schema/`

**Core Models**:
- `user.ts` - User profiles and authentication
- `convo.ts` - Conversations
- `message.ts` - Chat messages with metadata
- `agent.ts` - Agent definitions
- `assistant.ts` - Assistant configurations
- `prompt.ts` - Prompt templates
- `preset.ts` - Model presets
- `file.ts` - File references and metadata
- `role.ts` - RBAC roles
- `balance.ts`, `transaction.ts` - Token accounting

**Model Exports**: `api/models/index.js`
```javascript
const { User, Conversation, Message, Agent } = require('~/models');
```

### Configuration System

**Main Config**: `librechat.yaml`
- Endpoint configurations (which LLM providers are enabled)
- Model specifications and parameters
- Interface customization (welcome messages, enabled features)
- Cache settings
- File storage strategies

**Environment Variables**: `.env`
- Server configuration (PORT, HOST, MONGO_URI)
- Authentication settings (JWT_SECRET, OAuth credentials)
- LLM API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.)
- Feature flags (ENABLE_*, DISABLE_*)
- Debug settings

**Config Loading**: `api/server/services/Config/`
- Loads and validates `librechat.yaml`
- Supports remote config via URL
- Schema validation on startup

### API Routes Reference

All routes mounted at `/api/`:

- `/auth` - Login, register, logout, refresh token
- `/messages` - Message CRUD and search
- `/convos` - Conversation management
- `/users` - User profile operations
- `/files` - File upload/download
- `/config` - App configuration
- `/assistants` - AI assistant management
- `/agents` - Agent CRUD and execution
- `/prompts` - Prompt template management
- `/presets` - Model preset management
- `/balance` - Token balance operations
- `/mcp` - Model Context Protocol endpoints
- `/oauth` - OAuth provider callbacks
- `/roles` - Role management
- `/permissions` - Access control
- `/models` - Available model listing
- `/plugins` - Plugin management
- `/actions` - System actions
- `/share` - Conversation sharing
- `/tags` - Conversation tagging

### Authentication Strategies

Located in `api/strategies/`:

- **JWT** (`jwtStrategy.js`) - Token-based auth
- **Local** (`localStrategy.js`) - Username/password
- **LDAP** (`ldapStrategy.js`) - Enterprise directory
- **OpenID** (`openidStrategy.js`) - OpenID Connect
- **SAML** (`samlStrategy.js`) - SAML 2.0
- **Social** - GitHub, Google, Discord, Facebook, Apple

**Middleware**:
- `requireJwtAuth.js` - Require authenticated user
- `optionalJwtAuth.js` - Optional authentication
- `checkBan.js` - Validate user not banned

### LLM Client Architecture

**Location**: `api/app/clients/`

**Pattern**: All clients extend `BaseClient.js` which provides:
- Streaming response handling
- Token counting and limits
- Error handling and retries
- Conversation context management
- Tool/function calling interface

**Implementations**:
- `OpenAIClient.js` - OpenAI and compatible APIs
- `AnthropicClient.js` - Anthropic Claude
- `GoogleClient.js` - Google Gemini/PaLM
- `OllamaClient.js` - Ollama local models
- Plus Azure, Bedrock, and other providers

**Key Methods**:
- `sendMessage()` - Send message and handle response
- `buildMessages()` - Format conversation history
- `getTokenCount()` - Calculate token usage
- `handleError()` - Error handling and retry logic

## Development Workflow

### Making Changes to Models/Schemas

1. Update schema in `packages/data-schemas/src/schema/`
2. Rebuild data-schemas: `npm run build:data-schemas`
3. Update model in `api/models/` if needed
4. Create migration script in `config/` if data migration required
5. Test with backend and frontend

### Adding New API Endpoints

1. Create route handler in `api/server/routes/`
2. Add controller in `api/server/controllers/` (optional, for complex logic)
3. Add service in `api/server/services/` (optional, for business logic)
4. Register route in `api/server/routes/index.js`
5. Add middleware as needed (auth, validation, rate limiting)
6. Add data-provider function in `packages/data-provider/src/data-service.ts`
7. Create React Query hook in frontend if needed

### Adding New Frontend Components

1. Create component in appropriate `client/src/components/` subdirectory
2. Add Recoil atoms in `client/src/store/` if new state needed
3. Use `useLocalize()` for translated strings
4. Import from `data-provider` for API calls
5. Follow existing UI component patterns (Radix UI, Tailwind CSS)

### Adding Authentication Strategy

1. Create strategy file in `api/strategies/`
2. Extend or configure Passport strategy
3. Register in `api/strategies/index.js`
4. Add environment variables to `.env.example`
5. Update authentication flow in `api/server/routes/auth.js`
6. Add UI components in `client/src/components/Auth/`

## Important Conventions

### Code Style
- ESLint and Prettier configured at root
- Run `npm run lint:fix` before committing
- Use `require('~/path')` for backend module aliases
- Frontend uses ES6 imports

### TypeScript Usage
- Frontend and packages use TypeScript
- Backend is JavaScript with JSDoc types in some places
- Shared types in `packages/data-schemas`

### Error Handling
- Backend errors go through centralized error middleware
- Use custom error classes where appropriate
- Frontend uses error boundaries and toast notifications

### Logging
- Backend uses Winston logger
- Configure via `DEBUG_LOGGING` and `CONSOLE_JSON` env vars
- Logs to `api/logs/` directory

### Testing
- Jest for unit tests (backend and frontend)
- Playwright for e2e tests
- Test files colocated with source code or in `__tests__` directories

## Common Patterns

### Adding a New LLM Provider

1. Create client in `api/app/clients/YourProviderClient.js` extending `BaseClient`
2. Implement required methods (sendMessage, buildMessages, getTokenCount)
3. Add provider configuration to `librechat.yaml` schema
4. Add environment variables for API keys
5. Register client in endpoint configuration system
6. Add UI options in `client/src/components/Endpoints/`

### Implementing Permission Checks

1. Define permission in RBAC system (`api/models/Role.js`)
2. Use `PermissionService` in route/controller
3. Add middleware in `api/server/middleware/accessResources/`
4. Update permission migration scripts if needed

### Adding Translations

1. Add keys to `client/src/locales/en-US.json`
2. Use translation service (locize) or manually add to other language files
3. Access via `useLocalize()` hook: `const { t } = useLocalize(); t('your.key')`

### File Upload Handling

1. Files handled via `multer` middleware in routes
2. Storage strategy configured in `librechat.yaml` (local, S3, Firebase)
3. File metadata stored in `File` model
4. Reference files by ID in messages/conversations
5. Access via `/api/files/` endpoints

### Two-Tier Modal Pattern (State-Based + Route-Based)

This pattern is used for legal documents (Privacy Policy, Usage Policy) where you need both a summary view and a full detailed view with different invocation mechanisms.

**Use Case**: Display a teaser/summary modal via onClick handlers (no URL change), then allow navigation to a full version via a permanent URL.

**Architecture**:
- **Teaser Modal**: State-based, opened via custom events, NO route, URL unchanged
- **Full Modal**: Route-based, opened via URL navigation, permanent link
- **Transition**: Button in teaser closes it and navigates to full version

**Implementation Steps**:

1. **Create Two Static Markdown Files**
   ```
   client/public/static/document-teaser.md    # Summary version
   client/public/static/document-full.md      # Complete version
   ```

2. **Add Route for Full Version Only**
   ```typescript
   // client/src/routes/index.tsx
   {
     path: 'legal/document-name',
     element: <ChatRoute />,
   }
   ```

3. **Implement Modal States in Root.tsx**
   ```typescript
   // State for both modals
   const [showDocumentFull, setShowDocumentFull] = useState(false);
   const [showDocumentTeaser, setShowDocumentTeaser] = useState(false);

   // Content hooks
   const { content: fullContent, loadContent: loadFull } =
     useStaticContent('/static/document-full.md');
   const { content: teaserContent, loadContent: loadTeaser } =
     useStaticContent('/static/document-teaser.md');

   // Route-based full modal
   useEffect(() => {
     if (location.pathname === '/legal/document-name') {
       setShowDocumentFull(true);
       loadFull();
     }
   }, [location.pathname, loadFull]);

   // Custom event listener for teaser
   useEffect(() => {
     const handleOpenTeaserEvent = () => {
       setShowDocumentTeaser(true);
       loadTeaser();
     };
     window.addEventListener('openDocumentTeaser', handleOpenTeaserEvent);
     return () => {
       window.removeEventListener('openDocumentTeaser', handleOpenTeaserEvent);
     };
   }, []);

   // Navigation from teaser to full
   const handleReadFullVersion = () => {
     setShowDocumentTeaser(false);  // Close teaser
     navigate('/legal/document-name');  // Navigate to full
   };
   ```

4. **Render Both Modals**
   ```typescript
   {/* Full modal - route-based */}
   <StaticContentModal
     open={showDocumentFull}
     onOpenChange={(isOpen) => handleModalClose(isOpen, setShowDocumentFull)}
     title={localize('com_nav_document_name')}
     modalContent={fullContent}
   />

   {/* Teaser modal - state-based with custom button */}
   <StaticContentModal
     open={showDocumentTeaser}
     onOpenChange={setShowDocumentTeaser}
     title={localize('com_nav_document_name')}
     modalContent={teaserContent}
     customButtons={
       <button
         onClick={handleReadFullVersion}
         className="btn btn-primary"
         type="button"
       >
         {localize('com_nav_read_full_version')}
       </button>
     }
   />
   ```

5. **Add Links in Components Using Custom Events**
   ```typescript
   // Profile menu or settings component
   const handleDocumentClick = () => {
     window.dispatchEvent(new CustomEvent('openDocumentTeaser'));
   };

   <button onClick={handleDocumentClick}>
     {localize('com_nav_document_name')}
   </button>
   ```

6. **Extend StaticContentModal for Custom Buttons** (if not already done)
   ```typescript
   // client/src/components/ui/StaticContentModal.tsx
   const StaticContentModal = ({
     open,
     onOpenChange,
     title,
     modalContent,
     ariaLabel,
     customButtons,  // Add this prop
   }: {
     open: boolean;
     onOpenChange: (isOpen: boolean) => void;
     title: string;
     modalContent?: string | string[];
     ariaLabel?: string;
     customButtons?: React.ReactNode;  // Add this type
   }) => {
     // ...
     return (
       <DialogTemplate
         // ...
         buttons={customButtons || <></>}  // Render custom buttons
       />
     );
   };
   ```

**Key Characteristics**:
- Teaser modal: Pure state, no URL involvement, custom event system
- Full modal: Route-based, permanent URL, follows standard route pattern
- Navigation flow: onClick → custom event → teaser state → button click → close teaser + navigate → route change → full modal
- URL behavior: Teaser keeps URL unchanged, full uses specific route
- Direct URL access (`/legal/document-name`) opens ONLY full modal (no teaser)
- Cross-component communication via `window.dispatchEvent()` without prop drilling

**Benefits**:
- Permanent linkable URL for full version (SEO, bookmarks, direct access)
- Lightweight teaser for quick overview without URL pollution
- Clean separation of concerns (state vs route)
- No prop drilling for cross-component modal invocation
- Reusable pattern for other two-tier content (Terms, Impressum, etc.)

**Examples in Codebase**:
- Privacy Policy (TURBO-29): `client/src/routes/Root.tsx:32-135`
- Usage Policy (TURBO-32): Similar pattern implementation

## Critical Files

- `api/server/index.js` - Backend entry point
- `client/src/main.jsx` - Frontend entry point
- `librechat.yaml` - Application configuration
- `.env` - Environment variables
- `packages/data-provider/src/data-service.ts` - API client
- `packages/data-schemas/src/schema/` - Database schemas
- `api/models/index.js` - Model exports
- `client/src/store/index.ts` - Recoil state atoms

## Useful Resources

- Documentation: https://librechat.ai/docs
- Config Guide: https://www.librechat.ai/docs/configuration/librechat_yaml
- Environment Variables: https://www.librechat.ai/docs/configuration/dotenv
