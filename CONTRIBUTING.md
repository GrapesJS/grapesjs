# Contribute to GrapesJS

Thank you for your interest in contributing to GrapesJS! We welcome all types of contributions, including bug reports, feature suggestions, documentation improvements, and code contributions.

## Quick Start

### Prerequisites

- Node.js (version 20 LTS)
- pnpm (version 9.10.0 or later)

### Setup

1. Install Node.js 20 LTS:

   ```bash
   nvm install 20
   nvm use 20
   ```

2. Install pnpm globally:

   ```bash
   npm install -g pnpm@9.10.0
   ```

3. Clone the repository:

   ```bash
   git clone https://github.com/GrapesJS/grapesjs.git
   cd grapesjs
   ```

4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Start the development server:

   ```bash
   pnpm start
   ```

6. Open `http://localhost:8080/` in your browser to see the editor in action.

## Development Workflow

- **Linting**: `pnpm lint`
- **Formatting**: `pnpm format`
- **Checking format**: `pnpm format:check`
- **Building**: `pnpm build`
- **Testing**: `pnpm test`

### Code Style

We use ESLint for linting and Prettier for code formatting. While we don't have pre-commit hooks, we strongly recommend using these tools before submitting your changes:

- Run `pnpm lint` to check for linting errors.
- Run `pnpm format` to automatically format your code.
- Run `pnpm format:check` to check if your code is formatted correctly.

Code style is enforced at the CI level. We recommend using Prettier extensions in your editor for real-time formatting.

### Documentation

To generate and view the documentation:

1. Generate API documentation:

   ```bash
   pnpm run docs:api
   ```

2. Run the VuePress documentation server:

   ```bash
   pnpm run docs
   ```

3. Open `http://localhost:8080/` to view the documentation.

## Pull Requests

When submitting a pull request:

- Target your PR to the `dev` branch.
- Clearly describe the problem and solution.
- Include the relevant issue number if applicable.
- Add tests for new features or bug fixes.

If you're a first-time contributor, consider starting a discussion or opening an issue related to your changes before submitting a PR. This helps with collaboration and prevents duplicate work.

## Questions?

If you have any questions, please [open an issue](https://github.com/GrapesJS/grapesjs/issues) or start a [discussion](https://github.com/GrapesJS/grapesjs/discussions). Search existing issues and discussions first to avoid duplicates.

## Thank You

Your contributions to open source, no matter how small, make projects like GrapesJS possible. Thank you for taking the time to contribute.
