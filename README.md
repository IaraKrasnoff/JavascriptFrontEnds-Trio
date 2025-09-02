# Week 8: JavaScript Front-End Development

## Project Screenshots

### Vanilla JavaScript Implementation
![Vanilla JS Orders Management](src/vanillaJS/Screenshot%20VanillaJS.png)
![Vanilla JS Create New Order](src/vanillaJS/Screenshot%20VanillaJS%20Create%20New%20Order.png)

### Vue.js Implementation
![Vue.js Orders Management System](src/vuejs/VueJS%20Order%20management%20System.png)
![Vue.js Create New Order](src/vuejs/VueJS%20Create%20New%20Order.png)

### React Implementation
![React Screenshot 1](src/react/React%201Screenshot%202025-08-31%20190106.png)
![React Screenshot 2](src/react/React2Screenshot%202025-08-31%20190124.png)

## Assignment Overview

Build three identical Task Manager web applications using different JavaScript technologies to demonstrate the progression from fundamental web development to modern framework patterns. Each implementation will consume the same REST API backend from your previous assignment.

## Learning Objectives

- Understand REST API consumption across different JavaScript approaches
- Compare and contrast vanilla JavaScript with modern frameworks
- Implement identical functionality using three distinct development paradigms
- Practice modern web development patterns and best practices

## Project Structure

```
src/
├── vanillaJS/     - Pure JavaScript + Fetch API implementation
├── vuejs/         - Vue.js implementation with reactive data
└── react/         - React implementation with hooks
```

## Assignment Requirements

### Prerequisites

- **REST API Backend**: You must use your Task Manager REST API from the previous assignment
- **API Endpoints Required**:
  - `GET /tasks` - Retrieve all tasks
  - `POST /tasks` - Create a new task
  - `PUT /tasks/{id}` - Update an existing task
  - `DELETE /tasks/{id}` - Delete a task

### Core Functionality (All Three Implementations)

Each implementation must include:

#### 1. Task Management Features
- ✅ Create new tasks with title, description, and priority
- ✅ View all tasks in a responsive list format
- ✅ Mark tasks as complete/incomplete
- ✅ Edit existing task details
- ✅ Delete tasks with confirmation
- ✅ Filter tasks by status (All, Pending, Completed)

#### 2. User Interface Requirements
- ✅ Clean, professional design
- ✅ Responsive layout (mobile-friendly)
- ✅ Loading indicators during API operations
- ✅ Error handling with user-friendly messages
- ✅ Form validation for required fields
- ✅ Task statistics display (total, pending, completed counts)

#### 3. Technical Requirements
- ✅ Consume your existing REST API backend
- ✅ Implement proper error handling for network failures
- ✅ Use optimistic UI updates where appropriate
- ✅ Follow each framework's best practices and conventions
- ✅ Include comments explaining key concepts and patterns
- ✅ Implement performance optimizations (debouncing, efficient rendering)

## Implementation Guidelines

### 1. Vanilla JavaScript Implementation (`src/vanillaJS/`)

**Focus**: Fundamental web technologies and modern JavaScript

**Requirements**:
- Use ES6+ features (classes, arrow functions, async/await)
- Implement modular code organization
- Use Fetch API for HTTP requests
- Practice DOM manipulation and event handling
- Create reusable utility functions

**File Structure**:
```
src/vanillaJS/
├── index.html
├── styles.css
├── app.js          - Main application logic
├── api.js          - API interaction module
└── utils.js        - Utility functions
```

### 2. Vue.js Implementation (`src/vuejs/`)

**Focus**: Reactive data binding and declarative templates

**Requirements**:
- Use Vue.js 3 (CDN or npm)
- Implement reactive data properties
- Use Vue directives (v-model, v-for, v-if, @click)
- Create reusable components
- Utilize computed properties and watchers

**File Structure**:
```
src/vuejs/
├── index.html
├── styles.css
├── app.js          - Vue application
└── package.json    - Dependencies (if using npm)
```

### 3. React Implementation (`src/react/`)

**Focus**: Modern React patterns with hooks and component composition

**Requirements**:
- Use functional components with React Hooks
- Implement useState and useEffect properly
- Create a component hierarchy with props/callbacks
- Use React best practices (keys, controlled components)
- Apply performance optimizations (React.memo, useCallback)

**File Structure**:
```
src/react/
├── public/
│   └── index.html
├── src/
│   ├── App.js
│   ├── components/
│   │   ├── TaskItem.js
│   │   ├── TaskList.js
│   │   ├── AddTaskForm.js
│   │   └── FilterButtons.js
│   └── utils/
│       └── api.js
├── package.json
└── package-lock.json
```

## Getting Started

1. **Set up your REST API backend** from the previous assignment
2. **Start with Vanilla JavaScript** to understand core concepts
3. **Progress to Vue.js** to learn reactive programming
4. **Finish with React** to master component-based architecture

## Development Process

### Phase 1: Planning and Setup
1. Review your existing REST API endpoints
2. Design the user interface mockup
3. Plan the component structure for each implementation

### Phase 2: Vanilla JavaScript Implementation
1. Create the HTML structure and CSS styles
2. Implement API communication module
3. Build core application logic
4. Add error handling and user feedback
5. Test all CRUD operations

### Phase 3: Vue.js Implementation
1. Set up Vue.js project structure
2. Convert HTML to Vue templates
3. Implement reactive data management
4. Create Vue components
5. Add Vue-specific optimizations

### Phase 4: React Implementation
1. Set up React development environment
2. Create component hierarchy
3. Implement state management with hooks
4. Add React-specific optimizations
5. Ensure feature parity with other implementations

## Evaluation Criteria

### Functionality (40%)
- All CRUD operations work correctly
- Proper API integration
- Error handling and user feedback
- Filter and search capabilities

### Code Quality (30%)
- Clean, readable code with comments
- Proper code organization and structure
- Following framework-specific best practices
- Performance considerations

### User Experience (20%)
- Responsive design
- Intuitive user interface
- Loading states and error messages
- Professional appearance

### Technical Implementation (10%)
- Proper use of modern JavaScript features
- Framework-specific patterns and concepts
- API error handling
- Performance optimizations

## Submission Requirements

1. **Complete implementations** in all three directories
2. **README documentation** for each implementation with setup instructions
3. **Working demo** of all three applications
4. **Code comments** explaining key concepts and design decisions
5. **Reflection document** comparing the three approaches (optional but recommended)

## Resources

- [REST API Fundamentals](https://tao.zipcode.rocks/zipcode/webapps/rest-api-fundamentals/)
- [Vanilla JavaScript + Fetch](https://tao.zipcode.rocks/zipcode/webapps/vanilla-javascript-fetch/)
- [Vue.js Task Manager](https://tao.zipcode.rocks/zipcode/webapps/vuejs-task-manager/)
- [React Task Manager](https://tao.zipcode.rocks/zipcode/webapps/react-task-manager/)

## Tips for Success

- **Start Simple**: Get basic functionality working before adding advanced features
- **Test Frequently**: Verify each feature works before moving to the next
- **Compare Approaches**: Notice how each technology handles the same problems
- **Ask Questions**: Understand why each framework makes different design choices
- **Document Learning**: Keep notes on what you discover about each approach

Good luck with your implementation! This project will give you hands-on experience with the evolution of JavaScript front-end development.
