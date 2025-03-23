# News Portal API

A RESTful API for a news portal with role-based authentication and article management.

## Project Structure

```
news-portal-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── articleController.js
│   │   ├── adminController.js
│   │   ├── editorController.js
│   └── middleware/
│       ├── auth.js
│       ├── roleCheck.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── articleRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── editorRoutes.js
│   ├── utils/
│   │   └── jwt.js
│   └── app.js
├── .env
└── package.json
```

## Setup

1. **Clone the repository**:

```bash
git clone <repository-url>
cd news-portal-api
```

2. **Install dependencies**:

```bash
npm install
```

3. **Create a `.env` file**:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/news_portal"
JWT_SECRET="your-secret-key"
PORT=3000
```

4. **Run Prisma migrations**:

```bash
npx prisma migrate dev
```

5. **Start the server**:

```bash
npm run dev
```

## API Endpoints

### Authentication

#### Register User

- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```
- **Response (201)**:
  ```json
  {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "profilePicture": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token"
  }
  ```

#### Login

- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "user": {
      "id": "cuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "profilePicture": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token"
  }
  ```

### Users

#### Update User Role (Admin only)

- **Method**: `PATCH`
- **Endpoint**: `/api/users/users/:id/role`
- **Headers**:
  ```
  Authorization: Bearer jwt_token
  ```
- **Request Body**:
  ```json
  {
    "role": "EDITOR"
  }
  ```
- **Response (200)**:
  ```json
  {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "EDITOR",
    "profilePicture": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Update Profile

- **Method**: `PATCH`
- **Endpoint**: `/api/users/profile`
- **Headers**:
  ```
  Authorization: Bearer jwt_token
  ```
- **Request Body**:
  ```json
  {
    "name": "John Smith",
    "profilePicture": "https://example.com/image.jpg"
  }
  ```
- **Response (200)**:
  ```json
  {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Smith",
    "role": "USER",
    "profilePicture": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

### Articles

#### Create Article (Editor/Admin only)

- **Method**: `POST`
- **Endpoint**: `/api/articles`
- **Headers**:
  ```
  Authorization: Bearer jwt_token
  Content-Type: multipart/form-data
  ```
- **Body**:
  - `title`: string
  - `content`: string
  - `summary`: string
  - `categoryId`: string
  - `tags`: string[]
  - `image`: file (optional)

#### Get My Feed

- **Method**: `GET`
- **Endpoint**: `/api/articles/feed/my`
- **Description**: Returns articles based on user's followed categories.

#### Get Trending Articles

- **Method**: `GET`
- **Endpoint**: `/api/articles/trending`
- **Description**: Returns trending articles based on views and likes.

#### Get Articles by Category

- **Method**: `GET`
- **Endpoint**: `/api/articles/category/:categoryId`
- **Query Parameters**:
  - `page`: number
  - `limit`: number

#### View Article

- **Method**: `GET`
- **Endpoint**: `/api/articles/:id`
- **Description**: Gets article details and increments view count.

#### Like Article

- **Method**: `POST`
- **Endpoint**: `/api/articles/:id/like`
- **Description**: Like an article.

#### Unlike Article

- **Method**: `DELETE`
- **Endpoint**: `/api/articles/:id/like`
- **Description**: Remove like from an article.

---

For more detailed API documentation, refer to the full documentation in the repository.

## Development

```bash
# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Contributing

1. Fork the repository.
2. Create your feature branch.
3. Commit your changes.
4. Push to the branch.
5. Create a new Pull Request.
