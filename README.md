# Table of Contents
- [Clone the project](#clone-the-project)
- [How to start the project](#how-to-start-the-project)
- [How to commit according to Conventional Commits](#how-to-commit-according-to-conventional-commits)

# Clone the project

```bash
git clone https://github.com/maghavefun/and_another_one.git
```

# How to start the project

Before starting the project make shure there is .env file with environment variables in root folder of project. Example of content in .example.env

## Starting project with docker, docker compose

To install and use docker use this guide [LINK](https://docs.docker.com/engine/install/)

If you added new dependencies to the project start it with rebuilding container(use --build flag or build command with docker compose). In other cases this step can be skipped.

Build the project image

```bash
docker compose build --no-cache
```

Start the project in container using builded image

```bash
docker compose up --watch
```

Stop the project container in docker with removing specified volumes in docker-compose.yml

```bash
docker compose down -v
```

Restart the containers

```bash
docker compose restart
```

## Starting project locally without docker(I do not recommend this)

### Build the project

```bash
npm ci
```

### Start the project

Development:

```bash
npm run start
```

Watch mode:

```bash
npm run start:dev
```

Production mode

```bash
npm run start:prod
```

# How to commit according to Conventional Commits

This project follows Conventional Commits specification for commit messages. You can read specification here [LINK](https://www.conventionalcommits.org/en/v1.0.0/)

### TLDR

Commit message consists of three main parts:

1. Type: The type of the commit(e.g., feat, fix).
2. Scope(optional): The part of code base affected (e.g., auth, docs).
3. Description: A brief summary of the change.

```text
<type>(<scope>): <short description>

<body> (optional)
<footer> (optional)
```

For breaking changes add ! after type of commit or BREAKING CHANGE footer message

```text
feat!(api): changed parameter naming for user create endpoint

#or

feat(api): changed parameters name for user create endpoint.

- Changed name to firstname

BREAKING CHANGE: Changed name to firstname
```

Below are the commit types used and examples of each:

**feat** - New feautures or functionality.

Example:

```text
feat(auth): add user authentication module

- Integrated JWT-based authentication.
- Added login, register and logout endpoints.
```

**fix** - Bug fixes.

Example:

```text
fix: correct typo in config service

- Fixed a typo in the environment variable name for database connection.
```

**docs** - Documentation updates.

Example:

```text
docs: update API documentation for user endpoints

- Added details for the new authentication routes.
- Fixed formatting issued in the README.
```

**style** - Code style changes(non-functional, e.g., formatting, missing semicolons).

Example:

```text
style: format code with Prettier

- Reformatted all files using latest Prettier configuration.
```

**refactor** - Code changes that neither fix bugs nor add features.

Example:

```text
refactor: optimize database query for user search

- Replaced raw SQL with an ORM method for better readibility.
```

**test** - Adding or updating tests.

Example:

```text
test: add unit tests for user service

- Covered all functions in the user service module.
```

**chore** - Miscellaneous tasks(e.g., build process, tooling, dependencies).

Example:

```text
chore: update dependencies

- Updated husky and lint-staged to the latest versions.
- Removed unused dependencies from the package.json.
```
