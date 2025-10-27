# Contributing Guidelines

Thank you for your interest in contributing to the project! This document will help you get started. There are many ways to contribute:

- Participate in discussions
- Report issues or suggest improvements
- Contribute with code to fix bugs or add features

## Reporting issues

If you find a bug or have a suggestion for improvement, please open an issue. Before doing so, make sure to search for existing ones to avoid duplicates.

When opening a new issue, provide as much information as possible:

- Action version being used
- Workflow configuration
- Expected vs actual behavior
- Error messages or logs
- Steps to reproduce

[Short, self-contained, correct examples](https://sscce.org/) are always appreciated. If you can provide a workflow snippet that reproduces the issue, it will be very helpful.

## Contributing with code

All code contributions must be made through Pull Requests.

When contributing, please:

- **Follow TypeScript best practices**: Ensure your code is clean and readable.
- **Include tests**: Write the necessary tests to verify your code works. Ensure all tests pass before submitting a PR.
- **Avoid breaking changes**: If necessary, mention them clearly in the PR description.
- **Update documentation**: Update or add documentation for new or changed features.
- **Use clear commit messages**: We encourage following the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Development setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

### Running tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Code coverage

When adding new code, make sure to write tests that cover it. The goal is to maintain high code coverage.
