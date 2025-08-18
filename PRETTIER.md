# 🎨 Prettier Configuration

This monorepo uses **Prettier** for consistent code formatting across **all workspaces** (client, server, shared).

## 📋 Available Scripts

### 🔧 Root Level (Entire Monorepo)
```bash
# Check if files need formatting across all workspaces
bun run format:check

# Format all files automatically across all workspaces  
bun run format

# Lint client code and fix ESLint issues
bun run lint:fix

# Lint client code only
bun run lint:client
```

### 📦 Client Workspace
```bash
cd client

# Lint client code
bun run lint

# Fix ESLint issues
bun run lint:fix
```

## ⚙️ Configuration

### `.prettierrc` (Root Level)
- **Single quotes** for strings
- **Semicolons** required
- **2 spaces** for indentation
- **100 character** line width
- **ES5 trailing commas**

### 🔌 Plugins
- **Import sorting** - Automatically sorts and organizes imports
- **Tailwind CSS** - Sorts Tailwind classes for consistency

### 📁 Coverage
Prettier formats files across **all workspaces**:
- ✅ **Client** - React, TypeScript, CSS
- ✅ **Server** - Hono.js, TypeScript
- ✅ **Shared** - Types, utilities
- ✅ **Supabase** - Functions, seed files
- ✅ **Documentation** - Markdown files

## 🚀 Development Workflow

### Before Committing
```bash
# Format everything and fix linting issues
bun run format && bun run lint:fix
```

### IDE Integration
Install the Prettier extension for your editor:
- **VS Code:** Prettier - Code formatter
- **WebStorm:** Built-in support
- **Vim:** prettier/vim-prettier

### Auto-format on Save (VS Code)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🔧 Import Order

Prettier automatically organizes imports in this order:
1. **React imports** (`react`, `react-dom`)
2. **External packages** (`@radix-ui/*`, `lucide-react`, etc.)
3. **Internal imports** (`./components`, `../utils`, etc.)

## 🚫 Ignored Files

See `.prettierignore` for files that won't be formatted:
- `node_modules/` directories
- `dist/` and `build/` outputs
- Generated TypeScript files (`*.d.ts`, `*.tsbuildinfo`)
- Configuration files
- Environment files

## 🤖 Automated Formatting

GitHub Actions automatically:
- ✅ **Check formatting** on every PR
- ✅ **Auto-format** code on main branch pushes
- ✅ **Commit changes** automatically when needed
- ✅ **Enforce consistency** across the team

## 📊 Monorepo Benefits

Having Prettier at the root level provides:
- 🎯 **Consistency** across all workspaces
- 🔧 **Single source of truth** for formatting rules
- 🚀 **Easier maintenance** of configuration
- 📦 **Reduced duplication** of dependencies

## 🎉 Result

No manual formatting required! Your entire codebase stays consistently formatted automatically. 🚀
