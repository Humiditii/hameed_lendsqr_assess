# Backend Assessment - Lendsqr Senior Backend Role

This is the backend project for a senior backend role assessment at Lendsqr. The project is built using **NestJS**, **Knex**, **TypeScript**, and **Node.js** to demonstrate the ability to design a scalable backend system, handle database operations, and follow best practices in software development.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **Knex.js**: A SQL query builder for Node.js that helps with managing database queries.
- **TypeScript**: A statically typed superset of JavaScript that enables enhanced code reliability and maintainability.
- **Node.js**: A runtime environment for executing JavaScript code server-side.

## Features

- Wallet management (deposit, withdrawal, and transaction retrieval)
- Transaction logging with the ability to view transaction history
- CRUD operations using **Knex.js** and relational database support
- Unit and integration tests using Jest
- Mocking of database connections for testing purposes

## Project Setup

### Prerequisites

Before getting started, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.x.x or higher)
- [TypeScript](https://www.typescriptlang.org/) (v4.x.x or higher)
- [Knex.js](https://knexjs.org/) (v0.x.x or higher)
- A MySQL database (or PostgreSQL, depending on your setup)

### Installing Dependencies

1. Clone the repository:

    ```bash
    git clone https://github.com/Humiditii/hameed_lendsqr_assess.git
    cd hameed_lendsqr_assess
    ```

2. Install the necessary dependencies:

    ```bash
    npm install
    ```

### Environment Configuration

- Create a `.env` file in the root directory to set up environment variables.
- Example:

    ```plaintext
    JWT_SECRET="kjhgfrtyujknbvftyujhbvfty"
    DATABASE_URL=""
    ```

### Running the Application

1. **Running the application locally**:

    After installing dependencies and setting up your `.env` file, you can run the application with the following command:

    ```bash
    npm run start
    ```

    The app will be hosted on the default base URL `http://localhost:3000`.

2. **Running tests**:

    To run unit and integration tests, use the following command:

    ```bash
    npm run test
    ```

## Endpoints

The following are the available API endpoints:

### User Routes

- **POST /users/create**: Create a new user.
- **POST /users/signin**: Sign in an existing user.
- **GET /users/migrate**: Perform a migration for tables (optional, based on the application setup).

### Wallet Routes

- **POST /wallets/fund**: Fund a user's wallet.
- **POST /wallets/withdraw**: Withdraw funds from a user's wallet.
- **POST /wallets/transactions**: Get the list of transactions for a specific user's wallet.
- **GET /wallets/balance**: Get the current balance of a user's wallet.
  
For detailed documentation on the endpoints, you can view the postman documentation

## Database Schema

The application uses a MySQL database to store wallet data and transactions. The Entity-Relationship (E-R) diagram for the database schema can be found [here](https://mooyi-prod-storage.fra1.digitaloceanspaces.com/Screenshot%202024-11-26%20at%2018.08.48.png).

## Postman Collection

You can import the Postman collection to easily test the API:

[Postman Collection Link](https://documenter.getpostman.com/view/10490824/2sAYBVhrkH)

## Base URL

- **Base URL (local)**: `http://localhost:3000`
 **Base URL (remote)**: `https://abdulhameed-lendsqr-be-test.onrender.com`
  
Replace `localhost` with your server's domain or IP address if you're deploying this app remotely.

## Testing

The project is tested using **Jest**. All tests can be run using the following command:

```bash
npm run test
