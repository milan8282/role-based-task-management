# Final Backend API Summary + Testing Flow

## Base URL

```txt
http://localhost:5000/api
```

---

# 1. Auth APIs

## Register

```txt
POST /auth/register
```

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "123456"
}
```

## Login

```txt
POST /auth/login
```

```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

## Get Current User

```txt
GET /auth/me
```

## Logout

```txt
POST /auth/logout
```

---

# 2. User/Admin APIs

> Admin only.

## Get All Users

```txt
GET /users
```

## Get Single User

```txt
GET /users/:id
```

## Update User Role

```txt
PATCH /users/:id/role
```

```json
{
  "role": "admin"
}
```

## Activate / Deactivate User

```txt
PATCH /users/:id/status
```

```json
{
  "isActive": false
}
```

---

# 3. Category APIs

## Create Category

> Admin only.

```txt
POST /categories
```

```json
{
  "name": "Development",
  "description": "Software development related tasks"
}
```

## Get Categories

```txt
GET /categories
```

## Update Category

> Admin only.

```txt
PATCH /categories/:id
```

```json
{
  "name": "Frontend Development",
  "description": "React and UI related tasks",
  "isActive": true
}
```

## Delete Category

> Admin only.

```txt
DELETE /categories/:id
```

---

# 4. Task APIs

## Create Task

```txt
POST /tasks
```

```json
{
  "title": "Build login page",
  "description": "Create responsive login page with validation",
  "category": "CATEGORY_ID_HERE",
  "assignedTo": ["USER_ID_HERE"],
  "dueDate": "2026-05-01T10:00:00.000Z"
}
```

## Get Tasks

```txt
GET /tasks
```

Optional filters:

```txt
GET /tasks?status=todo
GET /tasks?category=CATEGORY_ID_HERE
GET /tasks?status=completed&category=CATEGORY_ID_HERE
```

## Get Tasks Grouped By Category

```txt
GET /tasks/grouped-by-category
```

## Get Single Task

```txt
GET /tasks/:id
```

## Update Task

```txt
PATCH /tasks/:id
```

```json
{
  "title": "Build login and register pages",
  "description": "Create responsive auth pages",
  "status": "in_progress",
  "category": "CATEGORY_ID_HERE",
  "assignedTo": ["USER_ID_HERE"],
  "dueDate": "2026-05-02T10:00:00.000Z"
}
```

## Mark Task Completed

```txt
PATCH /tasks/:id
```

```json
{
  "status": "completed"
}
```

## Delete Task

```txt
DELETE /tasks/:id
```

---

# 5. Comment APIs

## Add Comment

```txt
POST /tasks/:taskId/comments
```

```json
{
  "message": "I started working on this task."
}
```

## Get Task Comments

```txt
GET /tasks/:taskId/comments
```

## Update Comment

```txt
PATCH /comments/:id
```

```json
{
  "message": "Updated comment message."
}
```

## Delete Comment

```txt
DELETE /comments/:id
```

---

# 6. Notification APIs

## Get My Notifications

```txt
GET /notifications
```

## Get Unread Notification Count

```txt
GET /notifications/unread-count
```

## Mark One Notification As Read

```txt
PATCH /notifications/:id/read
```

## Mark All Notifications As Read

```txt
PATCH /notifications/mark-all-read
```

## Delete Notification

```txt
DELETE /notifications/:id
```

---

# 7. Device Token APIs

## Save Device Token

```txt
POST /device-tokens
```

```json
{
  "token": "firebase_device_token_here",
  "platform": "web",
  "browser": "Chrome"
}
```

## Remove Device Token

```txt
DELETE /device-tokens
```

```json
{
  "token": "firebase_device_token_here"
}
```

---

# Testing Flow

## Step 1: Register Admin

```txt
POST /auth/register
```

Then manually update the user role in MongoDB:

```js
role: "admin"
```

---

## Step 2: Login Admin

```txt
POST /auth/login
```

Postman will store cookie automatically.

---

## Step 3: Create Category

```txt
POST /categories
```

```json
{
  "name": "Development",
  "description": "Development tasks"
}
```

---

## Step 4: Register Normal User

```txt
POST /auth/register
```

```json
{
  "name": "Normal User",
  "email": "user@example.com",
  "password": "123456"
}
```

Copy normal user `_id`.

---

## Step 5: Login Admin Again

```txt
POST /auth/login
```

---

## Step 6: Create Task Assigned To User

```txt
POST /tasks
```

```json
{
  "title": "Create homepage UI",
  "description": "Build responsive Trello-style homepage task board",
  "category": "CATEGORY_ID_HERE",
  "assignedTo": ["USER_ID_HERE"],
  "dueDate": "2026-05-01T10:00:00.000Z"
}
```

Expected:

```txt
Task created
Notification created for assigned user
Socket event emitted if user is online
Push notification sent if device token exists
```

---

## Step 7: Login Normal User

```txt
POST /auth/login
```

---

## Step 8: View Assigned Tasks

```txt
GET /tasks
```

Normal user should see:

```txt
Own tasks
Assigned tasks
```

---

## Step 9: Add Comment

```txt
POST /tasks/:taskId/comments
```

```json
{
  "message": "I will complete this today."
}
```

Expected:

```txt
Comment saved
Notification sent to creator/assignees except commenter
Socket event comment:new emitted
```

---

## Step 10: Complete Task

```txt
PATCH /tasks/:taskId
```

```json
{
  "status": "completed"
}
```

Expected:

```txt
Task updated
completedAt added
Notification sent
Socket event task:updated emitted
```

---

# Socket Events

Client receives:

```txt
socket:connected
task:created
task:updated
task:deleted
comment:new
comment:updated
comment:deleted
notification:new
notification:read
notification:all-read
notification:deleted
```

Client emits:

```txt
task:join
task:leave
```

---

# Backend Completion Status

Backend now includes:

```txt
Express server
MongoDB connection
JWT auth with HTTP-only cookies
Register/login/logout/me
Role-based access control
Admin user management
Categories
Tasks
Task assignment
Due dates
Comments
In-app notifications
Socket.io real-time updates
Firebase push notification support
Device token management
Due-date reminder cron
```

Backend core is complete.

Next we can start **frontend setup + full React/MUI structure**.
