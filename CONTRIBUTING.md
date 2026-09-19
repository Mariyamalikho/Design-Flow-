# Contributing to DesignFlow 🌟

First off, thank you for considering contributing to **DesignFlow**! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## 🧠 Git Workflow

We follow a strict, professional GitHub flow to maintain a clean history.

1. **Fork the repository** and clone it locally.
2. **Create a branch** for your feature or bugfix:
   - `feature/my-cool-feature`
   - `fix/issue-description`
   - `docs/update-readme`
3. **Commit your changes** using the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format:
   - `feat: add awesome new button`
   - `fix: resolve crash on moodboard load`
   - `style: update primary brand color`
4. **Push your branch** to your fork.
5. **Open a Pull Request** against our `main` branch.

---

## 🛠️ Development Setup

Getting the project running locally is extremely simple thanks to our local-first architecture.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

There are **no database credentials** or `.env` files to configure! The app runs entirely in your browser using IndexedDB.

---

## ✅ Code Quality Standards

Before submitting a PR, please ensure your code passes our quality checks:

1. **Linting:** We use `oxlint` (which is blazing fast). Run `npm run lint` and resolve any issues.
2. **Formatting:** Your code should follow our Prettier formatting rules.
3. **Atomic Commits:** Please ensure your commits are atomic (one logical change per commit). Do not submit a PR with a single "wip" commit covering 50 files.

### 🧪 Pre-commit Hooks
We use **Husky** to automatically run linters before every commit. If your commit is rejected by Husky, check the terminal output, fix the linting errors, and try committing again.

Happy building! 🚀
