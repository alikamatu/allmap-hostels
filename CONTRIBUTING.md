# Contributing Guidelines

Welcome! We appreciate your interest in contributing to AllMap Hostels. To maintain code quality and consistency, please follow these guidelines.

## 🌿 Branching Strategy

- **`main`**: Production-ready code.
- **`develop`**: Integration branch for new features.
- **Feature Branches**: `feat/feature-name` or `fix/bug-name`.

## 🛠 Set up Process

1. Fork/Clone the repository.
2. Run `npm install` at the root.
3. Create a `.env.local` in the respective app directory (copy from `.env.example` if available).

## 💻 Coding Standards

- **TypeScript**: Mandatory strict type checking. Avoid `any`.
- **Styling**: Use Tailwind CSS 4 utility classes. Prefer CSS variables for theme tokens.
- **Components**: Use Functional Components with Hooks. Follow the "Single Responsibility Principle".
- **Naming**: 
  - Components: PascalCase
  - Functions/Variables: camelCase
  - Files: kebab-case (except for Next.js folder conventions)

## 🧪 Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: ...` for new features
- `fix: ...` for bug fixes
- `docs: ...` for documentation changes
- `refactor: ...` for code refactors

## 🚀 Pull Request Process

1. Ensure your code passes linting: `npm run lint`.
2. Ensure types are valid: `npm run check-types`.
3. Provide a clear description of changes and screenshots for UI updates.
4. Get approval from at least one core maintainer.
