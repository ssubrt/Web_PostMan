# REST Client Application

A modern, full-featured REST client application built with Next.js, similar to Postman, with persistent request history using MikroORM and SQLite.

## 🚀 Features

- **HTTP Methods Support**: GET, POST, PUT, DELETE, PATCH, HEAD
- **Request Builder**:
  - Custom headers configuration
  - Request body editor for POST/PUT/PATCH
  - URL parameter support
  - Tags for organizing requests
- **Response Viewer**:
  - Multiple format options (Pretty JSON, Raw, Preview)
  - Status code and response time display
  - Copy response to clipboard
- **Request History**:
  - Persistent storage using MikroORM + SQLite
  - Pagination support (5, 10, 25, 50 items per page)
  - Click to reload previous requests
  - Delete historical requests
  - Response caching for improved performance
- **Real-time Updates**: No page reloads required
- **Dark/Light Mode Support**: Built-in theme support

## 🛠️ Technologies Used

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Database ORM**: [MikroORM 6.6.2](https://mikro-orm.io/) with SQLite
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript 5

## 📋 Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

## 🔧 Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd next-js-api-with-mikro-orm
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage

### Making a Request

1. **Select HTTP Method**: Choose from GET, POST, PUT, DELETE, PATCH, or HEAD
2. **Enter URL**: Type the API endpoint URL
3. **Add Headers** (Optional):
   - Enter header key and value
   - Click "Add" to include the header
4. **Add Request Body** (For POST/PUT/PATCH):
   - Enter JSON or text in the body field
5. **Add Tags** (Optional): Add comma-separated tags for organization
6. **Click Send**: Execute the request

### Viewing Responses

- Response appears below the request builder
- **Status Code**: Displayed with color coding (green for 2xx, red for 4xx/5xx)
- **Response Time**: Shows request duration in milliseconds
- **Format Options**:
  - **Pretty JSON**: Formatted with indentation
  - **Raw**: Unformatted text
  - **Preview**: Standard view
- **Copy Button**: Copy response to clipboard

### Request History

- All requests are automatically saved to the database
- **Click any request** to reload it in the builder
- **Delete button** appears on hover
- **Pagination controls**:
  - Choose items per page (5, 10, 25, 50)
  - Navigate between pages
- **Caching**: Recent history is cached for 1 minute

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   └── requests/
│   │       ├── send/          # POST - Send new request
│   │       ├── history/       # GET - Fetch request history
│   │       ├── get/           # GET - Get single request details
│   │       └── delete/        # DELETE - Delete a request
│   ├── components/
│   │   ├── request-builder.tsx    # Main request form
│   │   └── request-history.tsx    # History sidebar
│   ├── lib/
│   │   ├── db-store.ts           # (Legacy) In-memory store
│   │   ├── mikro-orm.config.ts   # MikroORM configuration
│   │   └── entities/
│   │       └── Request.entity.ts  # Request entity definition
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Main page
├── public/
├── components.json                # Shadcn UI config
├── next.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

The application uses SQLite with the following schema:

```typescript
Request Entity:
- id: number (Primary Key, Auto-increment)
- method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD"
- url: string
- headers: string (JSON stringified)
- body?: string (nullable)
- responseStatus?: number (nullable)
- responseData?: string (nullable)
- responseTime?: number (nullable)
- tags?: string (nullable)
- createdAt: Date
```

## 🔌 API Routes

### POST `/api/requests/send`
Send a new HTTP request and save to history.

**Request Body**:
```json
{
  "method": "GET",
  "url": "https://api.example.com/data",
  "headers": "{}",
  "body": null,
  "tags": "testing"
}
```

**Response**:
```json
{
  "success": true,
  "request": {
    "id": 1,
    "method": "GET",
    "url": "https://api.example.com/data",
    "responseStatus": 200,
    "responseData": "...",
    "responseTime": 245
  }
}
```

### GET `/api/requests/history`
Fetch paginated request history.

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 10, max: 100)
- `sort`: "desc" | "asc" (default: "desc")

**Response**:
```json
{
  "success": true,
  "data": {
    "requests": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  },
  "fromCache": false
}
```

### GET `/api/requests/get?id={id}`
Get full details of a specific request.

**Response**:
```json
{
  "success": true,
  "request": {
    "id": 1,
    "method": "POST",
    "url": "https://api.example.com/data",
    "headers": {},
    "body": "{\"key\":\"value\"}",
    "responseStatus": 201,
    "responseData": "...",
    "responseTime": 156,
    "tags": "testing",
    "createdAt": "2026-01-07T10:30:00.000Z"
  }
}
```

### DELETE `/api/requests/delete?id={id}`
Delete a request from history.

**Response**:
```json
{
  "success": true,
  "message": "Request deleted successfully"
}
```

## ⚙️ Configuration

### TypeScript Configuration
The project uses TypeScript with decorator support for MikroORM:
```json
{
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

### MikroORM Configuration
Located in `app/lib/mikro-orm.config.ts`:
- Database: SQLite (`database.sqlite`)
- Entities: Auto-discovered
- Debug mode: Enabled in development

## 🎨 Features Showcase

### Pagination System
- Efficient data loading with offset-based pagination
- Configurable items per page
- Total count and page information display

### Caching Strategy
- 1-minute TTL for history requests
- In-memory cache reduces database load
- Cache invalidation on data changes

### Error Handling
- Graceful fallbacks for failed requests
- User-friendly error messages
- Console logging for debugging

## 🚦 Build and Deployment

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📝 Environment Variables

No environment variables are required for basic functionality. The SQLite database is created automatically at `./database.sqlite`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is created as part of an assignment/internship application.

## 🐛 Known Issues

- None currently reported

## 📞 Support

For issues or questions, please create an issue in the repository.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI inspired by [Postman](https://www.postman.com/)
- Database management by [MikroORM](https://mikro-orm.io/)

---

**Made with ❤️ for REST API testing**
