# Project Rules

- Never execute `git push` or push code to GitHub without explicitly asking for and receiving user permission first.

## Architecture & File Structure Guidelines

Based on the AirlineBooking repository, follow these precise naming conventions and structures for all future code:

### Backend Structure (`server/src/`)
- **Controllers**: Name files as `[resource].controller.js` (e.g., `auth.controller.js`).
- **Services**: Name files as `[resource].service.js` (e.g., `auth.service.js`).
- **Routes**: Name files as `[resource].routes.js` (e.g., `auth.routes.js`).
- **Middlewares**: Use plural folder name `middlewares/` (not `middleware/`) and name files as `[name].middleware.js` (e.g., `auth.middleware.js`).
- **Models**: PascalCase (e.g., `User.js`, `Flight.js`). Ensure they extend the Sequelize `Model` class.
- **Index Exports**: Every directory (`controllers`, `services`, `routes`, `models`, `middlewares`, `config`) must have an `index.js` file that exports its contents.
- **Sockets**: Real-time logic belongs in a `sockets/` directory (e.g., `seatHandler.js`).
- **Database**: Use Sequelize migrations (`migrations/`) and seeders (`seeders/`) with a `.sequelizerc` file at the server root.

### API Response Standardization
- Implement and use `ApiError.js` (extends `Error` with statusCode and errors array) and `ApiResponse.js` in the `utils/` folder for all controller responses. Do not use raw `res.json()` with manual objects unless absolutely necessary.

### Frontend Structure (`client/src/`)
- **Folders**: `components`, `contexts`, `pages`, `routes`, `services`.
- **Layouts**: Put `Navbar.jsx`, `Footer.jsx`, `AdminRoute.jsx` under `components/layout/`.
- **Contexts**: Plural folder name `contexts/`.

## Code Style & Formatting
- **Classes vs Functions**: Use JavaScript `class` syntax for backend Models, Controllers, and Services. Use ES6 arrow functions for React components and callbacks.
- **Naming**: `camelCase` for variables and functions, `PascalCase` for classes and React components.
- **Comments**: Keep comments extremely minimal. Do not add detailed explanations to every file; only add 1-2 lines of comments for complex logic (to maintain the appearance of a student-built project).
- **Error Handling**: Use `try/catch` blocks (or an async handler wrapper) in controllers, passing errors to a centralized error middleware.

