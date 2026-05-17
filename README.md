# custom-fe-fwk

[![Publish to GitHub Packages](https://github.com/zillingen/custom-fe-fwk/actions/workflows/publish.yml/badge.svg)](https://github.com/zillingen/custom-fe-fwk/actions/workflows/publish.yml)
[![License](https://img.shields.io/npm/l/custom-fe-fwk.svg)](https://github.com/zillingen/custom-fe-fwk/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-2D79C7.svg?style=flat&logo=TypeScript&logoColor=white)](https://www.typescriptlang.org/)

A minimal frontend framework built from scratch to teach web developers how frontend frameworks work under the hood.

## 🎯 What is this?

`custom-fe-fwk` is an educational frontend framework that demonstrates the core concepts behind modern frontend frameworks like React, Vue, and Svelte. It's designed to be:

- **Educational**: Every piece of functionality is implemented from scratch with clear, readable code
- **Minimal**: Only includes essential features needed to understand framework fundamentals
- **Practical**: Can be used to build real applications while learning framework internals

## 🚀 Quick Start

### Authentication

The package is published to GitHub Packages. Create an `.npmrc` file in your project:

```
@zillingen:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then set your GitHub personal access token (with `read:packages` scope):

```bash
export NODE_AUTH_TOKEN=github_pat_YOUR_TOKEN_HERE
```

### Installation

```bash
npm install @zillingen/custom-fe-fwk-runtime
```

### Basic Usage

```javascript
import { createApp, h } from '@zillingen/custom-fe-fwk-runtime';

// Define your application state
const state = {
  count: 0
};

// Define your view function
const view = (state, emit) => {
  return h('div', {}, [
    h('h1', {}, `Count: ${state.count}`),
    h('button', { 
      onclick: () => emit('increment') 
    }, 'Increment')
  ]);
};

// Define your reducers (state management)
const reducers = {
  increment: (state) => ({
    ...state,
    count: state.count + 1
  })
};

// Create and mount your app
const app = createApp({
  state,
  view,
  reducers
});

app.mount(document.getElementById('app'));
```

## 📚 Core Concepts

### Virtual DOM
The framework uses a minimal Virtual DOM implementation to efficiently update the real DOM. The `h()` function creates virtual nodes that represent the UI structure.

```javascript
// Create virtual nodes
const vnode = h('div', { className: 'container' }, [
  h('h1', {}, 'Hello World'),
  h('p', {}, 'This is a paragraph')
]);
```

### State Management
State is managed through reducers that respond to events. This follows a unidirectional data flow pattern similar to Redux.

```javascript
const reducers = {
  // Action name: reducer function
  updateName: (state, payload) => ({
    ...state,
    name: payload
  }),
  
  toggleTheme: (state) => ({
    ...state,
    darkMode: !state.darkMode
  })
};
```

### Event System
Events are dispatched using the `emit()` function and handled by reducers.

```javascript
const view = (state, emit) => {
  return h('button', {
    onclick: () => emit('updateName', 'New Name')
  }, 'Update Name');
};
```

## 🏗️ Architecture

The framework consists of three main packages:

| Package | npm name |
|---|---|
| Runtime | `@zillingen/custom-fe-fwk-runtime` |
| Compiler | `@zillingen/custom-fe-fwk-compiler` |
| Loader | `@zillingen/custom-fe-fwk-loader` |

For most educational purposes, you'll only need the main `@zillingen/custom-fe-fwk-runtime` package.

## 📖 Learning Resources

### Framework Internals
- **Virtual DOM**: See how virtual nodes are created, compared, and applied to the DOM
- **State Management**: Understand unidirectional data flow and reducer patterns
- **Event System**: Learn how events are dispatched and handled
- **Component Lifecycle**: Explore mounting, updating, and unmounting

### Code Walkthrough
The source code is organized to be educational:

```
packages/runtime/src/
├── app.ts          # Main application creation and lifecycle
├── h.ts            # Virtual DOM node creation
├── mount-dom.ts    # DOM mounting and updates
├── destroy-dom.ts  # Cleanup and unmounting
├── dispatcher.ts   # Event system
└── utils/          # Helper utilities
```

Each file contains comments explaining the concepts being demonstrated.

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/zillingen/custom-fe-fwk.git
cd custom-fe-fwk

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Start development server for examples
npm run serve:examples
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:run

# Run tests for specific package
npm --workspace packages/runtime run test
```

### Linting

```bash
# Lint all packages
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🤝 Contributing

This project is primarily educational, but contributions are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This framework was created as a learning tool to help developers understand how frontend frameworks work. It's inspired by the excellent work of the React, Vue, and Svelte teams.

---

**Built for learning. Built from scratch. Built for you.**
