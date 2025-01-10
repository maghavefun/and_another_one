# Table of Contents
- [Clone the project](#clone-the-project)
- [How to start the project](#how-to-start-the-project)
- [How to commit according to Conventional Commits](#how-to-commit-according-to-conventional-commits)
- [Migrations and Seeds](#migrations-and-seeds)
- [Swagger API docs](#swagger-api-docs)
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

Before building or after using `docker compose down -v`, clean up dangling images by running. This removes all `<none>` images(dangling images).

```bash
docker image prune -f
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

# Migrations and Seeds

## Migrations

So you need to implement new feature or change db schema and for this you should change a db schema by adding new table or altering current table.

First you need to create migration script file by using:
```bash
np run migration:make your_migration_script_name
```

Command above will create something like this in migrations folder. Knex automatically adds a timestamp to migration files when you create them with this command. **Do not modify this prefix**:
```bash
migrations/20250109123457_your_migration_script_name.js
```
### Here is some advices for migration namings:

### Describe the purpose of the migration

The name of the migration file should clearly describe what the migration does. Use action verbs to specify the operation being performed. Common actions include:
- `add_`: Adding a new table, column, or index.
- `update_`: Updating an existing column or schema.
- `remove_`: Dropping a column, table or index.
- `rename_`: Renaming a table or column.

Examples:
- `20250109153045_add_users_table.js`
- `20250109153120_update_orders_table_add_status.js`
- `20250109153200_remove_old_logs_table.js`

### Include the table name

Include the table name involved in the migration. This provides context about which part of the database the migration affects.

### Use `snake_case` for readibility

Knex uses `snake_case` for migration filenames, which is consistent with typical database naming conventions.

Good:
```text
20250109153545_add_index_to_email_in_users.js
```

Bad:
```text
20250109153545-addIndexToEmailInUsers.js
```

### Be specific

Avoid vague or generic names. Clearly state the purpose of the migration to make it easy for **others(and future you!)** to understand what it does.

Good:
```text
20250109153650_add_is_active_column_to_users.js
```

Bad:
```text
20250109153650_update_users_table.js
```

### Document complex migraions

If a migration involves multiple changes or impacts multiple tables, make the name as concise as possible but consider adding comments inside the migration file to explain its purpose

## Seeds

Commands `seed:make` and `seed:run` is used to fullfill tables with initial data. It's useful when developing, testing and production initialization.

`seed:make` can be used to create new file with data, that will be append to table

```bash
npm run seed:make name_of_seed
```

`seed:run` executes seed files, and appends data to table

```bash
npm run seed:run
```

# Swagger API docs

Api documentation for dev env is available when project is running on [LINK](http://localhost:4000/api-docs#/)

In prod or test use `/api-docs` path with URL
