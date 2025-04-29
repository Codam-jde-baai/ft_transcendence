# ft_transendence running doc

This document is to keep track of our plans for ft_transendence

Current aim for the modules as these seem to fit together well:
- Backend module with Fastify - 2 point
- Frontend module with tailwind CSS - 1 point
- User managment module - 2 points
- user and game stats dashboards - 1 point

#### these all bring us to 6 points, we can pick 1 more minor module to complete the project.
obvioulsy we can pick 1 major / 2 minor or more extra if you want to do something that you think is cool

a minor module that seems relatively simple to implement but would require us to know this from the start so we can immediately develop with language keys is the multiple languages minor module.

## Dockerfiles

More info will come but using pnpm 
Using pnpm over npm can lead to faster installations and reduced disk space usage due to its efficient package management and disk space optimization techniques.


## Backend:

development will be in `Fastify`

Fastify is a web framework for Node.js, designed for building fast and efficient server-side applications. It is known for its low overhead, high performance, and extensibility, making it a popular choice for developers who need to create scalable and maintainable backend services. Fastify provides a robust plugin architecture, allowing developers to easily add functionality and customize their applications.

Fastify plugins:
https://fastify.dev/ecosystem/

https://fastify.dev/docs/latest/Guides/Getting-Started/

https://betterstack.com/community/guides/scaling-nodejs/introduction-to-fastify/

https://www.youtube.com/watch?v=Lk-uVEVGxOA



For the database can chose an sql plugin from the fastify ecosystem


For testing routes i am using the REST vscode plugin which uses the file test.http. Here you can write any request and it will show you the http response.


By going to:
http://localhost:3000/docs 
you can view all of the possible GET requests






## Frontend:

Frontend will be developed with tailwind css and using typescript additionally only.

Status: Currently I have set up the frontend container to connect to localhost 5173 and it loads the index.html at the root. Might be better to remove public and serve all pages from /frontend/src/pages. Will have to look at what is standard practise for tailwind+vite+typescripts. 

source: https://tailwindcss.com/docs/installation/using-vite


# TypeScript API Documentation Overview

## User Options Schemas and Type Definitions

### UserOptions Schemas (in `users.ts`)
These schemas (such as `getUserOptions`, `postUserOptions`, etc.) serve multiple purposes:

- **Define the API contract** for each endpoint.
- **Enable automatic request/response validation** in Fastify.
- **Automatically generate Swagger/OpenAPI documentation**.

#### Example: `postUserOptions`
Defines:
- Required request headers
- Expected request body format
- Possible response status codes and their formats
- Data type validations
- Required vs optional fields

---

### Type Models (in `models/users.ts`)
TypeScript types and interfaces serve as:

- **Type definitions** for the application's data structures.
- **Runtime validation rules**.
- **Business logic constraints**.

Key types include:
- User models
- API request/response types
- Validation schemas

---

## Swagger Documentation Generation

When these schemas are used in Fastify routes, they automatically generate Swagger documentation that includes:

- **Required request headers** (from security schemas).
- **Expected request body format**.
- **Response status codes and their formats**.
- **Data type validations**.
- **Required vs optional fields**.

#### Example: `postUserOptions` in Swagger
- **POST endpoint requires** a Bearer token.
- **Request body must include:**
  - `username` (min 3 chars)
  - `password` (min 6 chars)
  - `alias`
- **Successful responses return:**
  - `201` status with user properties.
- **Error responses return:**
  - `400` status with an error message.

This approach ensures that:
- Requests are **validated automatically**.
- **Type safety** is maintained during development.
- **Accurate API documentation** is generated.
- Consistent response formats are enforced.

The benefit is that you only need to define these schemas once, and they provide **validation, typing, and documentation** all in one.

---

## Swagger UI Endpoint

### Human-readable Interface
If Swagger UI is enabled in your Fastify server, you can access it at:
- **`/documentation`** (default path) in your browser.

### Machine-readable OpenAPI JSON Specification
To get the raw OpenAPI/Swagger specification as JSON, make a **GET request** to:
- **`/documentation/json`** (default path).

This JSON file contains all API specifications in a structured format.

#### Enabling Swagger in Fastify
To enable Swagger in your Fastify server, ensure the Swagger plugin is configured properly. Typically, you set it up in your main server file.

---

## Utilizing Swagger from the Frontend

From your frontend, you can:
- Redirect users to **`/documentation`** for the UI.
- Fetch the API spec programmatically.

### Why Fetch the Spec?
Fetching the OpenAPI spec allows you to:
- **Generate TypeScript types** from the API spec.
- **Create API clients automatically**.
- **Build custom documentation viewers**.
- **Validate API responses** against the spec.

---

## Security Considerations

Make sure to secure these endpoints in production. Options include:
- **Disabling Swagger** in production.
- **Protecting documentation endpoints** with authentication.
- **Restricting access** to specific IP addresses.

By following these best practices, you can ensure your API documentation remains secure while still providing valuable development and testing tools.


--- frontend sending new user:
const formData = new FormData();
formData.append('username', username);
formData.append('password', password);
formData.append('alias', alias);
formData.append('profile_pic', fileInput.files[0]);

await fetch('/user/new', {
    method: 'POST',
    body: formData,
    headers: {
        'Authorization': `Bearer ${token}`
    }
});