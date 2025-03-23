# News Portal API

A RESTful API for a news portal with role-based authentication and article management.

## Project Structure

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
│   │   ├── errorHandler.js
│   │   ├── editorController.js
│   │   └── errorHandler.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── roleCheck.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── articleRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── editorRoutes.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── jwt.js
│   └── app.js
├── .env
└── package.json

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/news_portal"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

#### Register User
- Method: POST
- Endpoint: /api/auth/register
- Request Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```
- Response (201):
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
- Method: POST
- Endpoint: /api/auth/login
- Request Body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Response (200):
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
- Method: PATCH
- Endpoint: /api/users/users/:id/role
- Headers: 
  ```
  Authorization: Bearer jwt_token
  ```
- Request Body:
  ```json
  {
    "role": "EDITOR"
  }
  ```
- Response (200):
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
- Method: PATCH
- Endpoint: /api/users/profile
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Request Body:
  ```json
  {
    "name": "John Smith",
    "profilePicture": "https://example.com/image.jpg"
  }
  ```
- Response (200):
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
- Method: POST
- Endpoint: /api/articles
- Headers:
  ```
  Authorization: Bearer jwt_token
  Content-Type: multipart/form-data
  ```
- Body:
  - title: string
  - content: string
  - summary: string
  - categoryId: string
  - tags: string[]
  - image: file (optional)

#### Get My Feed
- Method: GET
- Endpoint: /api/articles/feed/my
- Description: Returns articles based on user's followed categories

#### Get Trending Articles
- Method: GET
- Endpoint: /api/articles/trending
- Description: Returns trending articles based on views and likes

#### Get Articles by Category
- Method: GET
- Endpoint: /api/articles/category/:categoryId
- Query Parameters:
  - page: number
  - limit: number

#### View Article
- Method: GET
- Endpoint: /api/articles/:id
- Description: Gets article details and increments view count

#### Like Article
- Method: POST
- Endpoint: /api/articles/:id/like
- Description: Like an article

#### Unlike Article
- Method: DELETE
- Endpoint: /api/articles/:id/like
- Description: Remove like from an article

### Admin Endpoints

#### Get Dashboard Statistics
- Method: GET
- Endpoint: /api/admin/dashboard
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Response (200):
  ```json
  {
    "totalUsers": 100,
    "totalArticles": 50,
    "usersByRole": [
      { "role": "USER", "_count": 80 },
      { "role": "EDITOR", "_count": 15 },
      { "role": "ADMIN", "_count": 5 }
    ],
    "recentArticles": [
      {
        "id": "cuid",
        "title": "Latest Article",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "author": {
          "name": "John Doe"
        }
      }
    ]
  }
  ```

#### Get All Users
- Method: GET
- Endpoint: /api/admin/users
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Response (200):
  ```json
  [
    {
      "id": "cuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "profilePicture": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "articles": 5,
        "savedArticles": 10
      }
    }
  ]
  ```

#### Get User Details
- Method: GET
- Endpoint: /api/admin/users/:id
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Response (200):
  ```json
  {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "profilePicture": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "articles": [
      {
        "id": "cuid",
        "title": "Article Title",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "savedArticles": [
      {
        "article": {
          "id": "cuid",
          "title": "Saved Article"
        },
        "savedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
  ```

#### Update User
- Method: PUT
- Endpoint: /api/admin/users/:id
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Request Body:
  ```json
  {
    "name": "Updated Name",
    "email": "newemail@example.com",
    "role": "EDITOR"
  }
  ```
- Response (200):
  ```json
  {
    "id": "cuid",
    "email": "newemail@example.com",
    "name": "Updated Name",
    "role": "EDITOR",
    "profilePicture": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

#### Delete User
- Method: DELETE
- Endpoint: /api/admin/users/:id
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Response: 204 No Content

### Category Endpoints

#### Get All Categories
- Method: GET
- Endpoint: /api/categories
- Description: Retrieve all categories with article counts
- Response (200):
  ```json
  [
    {
      "id": "cuid",
      "name": "Technology",
      "description": "Tech articles",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "articles": 15
      }
    }
  ]
  ```

#### Create Category (Admin only)
- Method: POST
- Endpoint: /api/categories
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Request Body:
  ```json
  {
    "name": "Technology",
    "description": "Tech articles"
  }
  ```
- Response (201): Created category object

#### Update Category (Admin only)
- Method: PUT
- Endpoint: /api/categories/:id
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Request Body:
  ```json
  {
    "name": "Updated Name",
    "description": "Updated description"
  }
  ```
- Response (200): Updated category object

#### Delete Category (Admin only)
- Method: DELETE
- Endpoint: /api/categories/:id
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Response: 204 No Content

### Editor Endpoints

#### Get Editor Statistics
- Method: GET
- Endpoint: /api/editor/stats
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Response (200):
  ```json
  {
    "articleStats": [
      { "status": "PUBLISHED", "_count": 10 },
      { "status": "DRAFT", "_count": 5 },
      { "status": "ARCHIVED", "_count": 2 }
    ],
    "totalViews": 1500,
    "totalLikes": 250
  }
  ```

#### Get Editor's Articles
- Method: GET
- Endpoint: /api/editor/articles
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Query Parameters:
  - status: DRAFT | PUBLISHED | ARCHIVED
  - page: number
  - limit: number
  - search: string
- Response (200):
  ```json
  {
    "articles": [{
      "id": "cuid",
      "title": "Article Title",
      "status": "PUBLISHED",
      "views": 150,
      "category": {
        "name": "Technology"
      },
      "_count": {
        "likes": 25,
        "savedBy": 10
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }],
    "pagination": {
      "total": 50,
      "pages": 5,
      "currentPage": 1
    }
  }
  ```

#### Get Editor's Top Articles
- Method: GET
- Endpoint: /api/editor/articles/top
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Description: Returns top 5 articles based on views and likes

#### Get Article Details
- Method: GET
- Endpoint: /api/editor/articles/:id
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Description: Returns detailed information about a specific article including likes and saves

#### Update Article Status
- Method: PATCH
- Endpoint: /api/editor/articles/:id/status
- Headers:
  ```
  Authorization: Bearer jwt_token
  ```
- Request Body:
  ```json
  {
    "status": "PUBLISHED"
  }
  ```
- Description: Update the status of an article

## Error Responses

All endpoints may return the following error responses:

### Authentication Error (401)
```json
{
  "error": "Please authenticate"
}
```

### Authorization Error (403)
```json
{
  "error": "Access denied"
}
```

### Bad Request (400)
```json
{
  "error": "Error message describing the issue"
}
```

### Server Error (500)
```json
{
  "error": "Internal Server Error"
}
```

## User Roles and Permissions

### USER
- Can read articles
- Can save articles
- Can update their own profile

### EDITOR
- All USER permissions
- Can create articles
- Can edit their own articles

### ADMIN
- All EDITOR permissions
- Can update user roles
- Can manage all articles

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header for protected routes:
```
Authorization: Bearer your_jwt_token
```

## Notes for Frontend Developers

1. Store the JWT token securely (e.g., in HttpOnly cookies or localStorage)
2. Include the token in all requests to protected endpoints
3. Handle 401 responses by redirecting to the login page
4. Implement role-based UI elements based on the user's role
5. Profile pictures are stored as URLs - implement image upload separately
6. All timestamps are in ISO 8601 format

## Development

```bash
# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
