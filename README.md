# Authentication-and-Authorization

# 🔐 Authentication & Authorization App

A secure and scalable authentication and authorization system built with **Node.js** and **TypeScript**.

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [API Usage](#api-usage)

---

## 📖 About

This project provides a robust authentication and authorization system with secure user login, registration, and role-based access control (RBAC). It is designed to be clean, modular, and easy to integrate into any Node.js project.

---

## ✨ Features

- ✅ User Registration & Login
- ✅ Password Hashing (bcrypt)
- ✅ JWT-based Authentication
- ✅ Role-Based Authorization
- ✅ Protected Routes
- ✅ TypeScript for type safety
- ✅ Google OAUTH login (sign in with google)
- ✅ Two Factors Authentications (2FA)
- ✅ Resend Email for forget password

---

## 🛠 Tech Stack

| Technology   | Purpose                                                                            |
| ------------ | ---------------------------------------------------------------------------------- |
| Node.js      | Runtime environment                                                                |
| TypeScript   | Type-safe JavaScript                                                               |
| Express.js   | Web framework                                                                      |
| JWT          | Authentication tokens                                                              |
| bcrypt       | Password hashing                                                                   |
| dotenv       | Environment variables                                                              |
| resend       | Email delivery service(passowrd resent emails and verify user after first sign up) |
| Google OAUTH | Social login via Google                                                            |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/krishna-nami/Authentication-and-Authorization.git
   cd Authentication-and-Authorization
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=5001
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

> ⚠️ Never share your `.env` file. Add it to `.gitignore`.

### Running the App

**Development mode:**

```bash
npm run dev
```

**Production build:**

```bash
npm run build
npm start
```

---

## 📡 API Usage

### Register a User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

### Access Protected Route

```http
GET /api/protected
Authorization: Bearer <your_token>
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

> Made with ❤️ by [krishna-nami](https://github.com/krishna-nami)
