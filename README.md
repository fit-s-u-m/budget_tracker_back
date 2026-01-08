# Budget Tracker Backend

A fast and lightweight backend for a personal budget tracker application built with **Bun**, **Hono**, and **Drizzle ORM**. This backend handles user transactions, categories, and financial data with a PostgreSQL database.

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
- [Environment Variables](#environment-variables)  
- [Database Setup](#database-setup)  
- [Running the App](#running-the-app)  

---

## Features

- Add, update, and delete transactions  
- Manage categories  
- Track income and expenses  
- Lightweight and fast with Bun  
- Schema-managed database with Drizzle ORM  

---

## Tech Stack

- **[Bun](https://bun.sh/)** – Fast JavaScript/TypeScript runtime  
- **[Hono](https://hono.dev/)** – Minimalist web framework  
- **[Drizzle ORM](https://orm.drizzle.team/)** – Type-safe database ORM  
- **PostgreSQL** – Relational database  

---

## Getting Started

### Prerequisites

- Bun (v1.0+)  
- PostgreSQL (v15+)  
- Node/npm optional (for local development tools)  

Clone the repository:

```bash
git clone https://github.com/your-username/budget-backend.git
cd budget-backend

install dependencies:

```bash
bun install
```

## Environment Variables

Create a .env file in the project root

```bash
DB_USER=ur_username
DB_PASSWORD=ur_password
DB_NAME=ur_db_name
DB_HOST=localhost
DB_PORT=ur_port
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
```

## Database setup

1. Run migrations to setup your schema

```bash
bun run db:migrate
```

## Running the App

```bash
bun run dev:api
```
