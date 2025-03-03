# Contributing to Auth System

Thank you for considering contributing to this project! This document outlines the process for contributing to the Auth System project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please be kind and courteous to other contributors.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS, etc.)

### Suggesting Features

We welcome feature suggestions! Please create an issue with:

- A clear, descriptive title
- A detailed description of the proposed feature
- Any relevant mockups or examples
- Why this feature would be beneficial to the project

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Submit a pull request

## Development Setup

Follow these steps to set up the project for development:

1. Clone your fork of the repository
2. Install dependencies:
   ```bash
   npm install
   cd frontend
   npm install
   cd ..
   ```
3. Set up environment variables as described in the README
4. Start the development servers:
   ```bash
   # Backend
   npm run dev
   
   # Frontend (in a separate terminal)
   cd frontend
   npm run dev
   ```

## Coding Standards

### Backend (Node.js/TypeScript)

- Follow the existing code style
- Use TypeScript for type safety
- Write meaningful comments for complex logic
- Follow RESTful API design principles
- Implement proper error handling

### Frontend (Vue.js/TypeScript)

- Follow Vue.js best practices
- Use the Composition API for new components
- Maintain consistent styling with Tailwind CSS
- Ensure responsive design
- Support both light and dark themes

## Testing

- Write tests for new features
- Ensure existing tests pass before submitting a PR
- Test across different browsers and devices when making UI changes

## Documentation

- Update documentation when adding or changing features
- Document API endpoints with clear descriptions
- Include JSDoc comments for functions and methods

## Working with Cloudflare R2

When working with the media upload system:

1. Ensure you have a Cloudflare R2 bucket set up
2. Configure the proper environment variables
3. Test both direct uploads and the proxy fallback mechanism
4. Be mindful of CORS configurations when making changes

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the documentation with details of changes to interfaces
3. The PR should work in all supported browsers and devices
4. A maintainer will review and merge your PR

## Commit Messages

Follow these guidelines for commit messages:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

Example:
```
Add file upload progress tracking

- Implement progress bar for file uploads
- Add cancel button for in-progress uploads
- Update documentation

Fixes #123
```

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. 