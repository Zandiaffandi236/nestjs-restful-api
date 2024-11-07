# User API Spec

## Register User

Endpoint : `POST` /api/users

Request Body :

```json
{
  "username": "MarjanTheConqueror",
  "password": "secret",
  "name": "Marzandi Zahran"
}
```

Response Body (Success) :

```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "username": "MarjanTheConqueror",
    "name": "Marzandi Zahran"
  }
}
```

Response Body (Failed) :

```json
{
  "status": "fail",
  "message": "Username already exist on database"
}
```

```json
{
  "status": "fail",
  "message": ["String must contain at least 1 character(s) on value username"]
}
```

## Login User

Endpoint : `POST` /api/users/login

Request Body :

```json
{
  "username": "MarjanTheConqueror",
  "password": "secret"
}
```

Response Body (Success) :

```json
{
  "status": "success",
  "data": {
    "username": "MarjanTheConqueror",
    "name": "Marzandi Zahran",
    "token": "session_generate_id"
  }
}
```

Response Body (Failed) :

```json
{
  "status": "fail",
  "message": "username or password invalid"
}
```

```json
{
  "status": "fail",
  "message": ["String must contain at least 1 character(s) on value password"]
}
```

## Get User

Endpoint : `GET` /api/users/current

Headers :

- Authorization: token

Response Body (Success) :

```json
{
  "status": "success",
  "data": {
    "username": "marjanTheConqueror",
    "name": "Marzandi Zahran"
  }
}
```

Response Body (Failed) :

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

## Update User

Endpoint : `PATCH` /api/users/current

Headers:

- Authorization: token

Request Body :

```json
{
  "password": "secret", // optional
  "name": "Marzandi Zahran" // optional
}
```

Response Body (Success) :

```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "username": "MarjanTheConqueror",
    "name": "Marzandi Zahran"
  }
}
```

Response Body (Failed) :

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```

```json
{
  "status": "fail",
  "message": [
    "String must contain at least 1 character(s) on value name",
    "String must contain at least 1 character(s) on value password"
  ]
}
```

## Logout User

Endpoint : `DELETE` /api/users/current

Headers:

- Authorization: token

Response Body (Success) :

```json
{
  "status": "success",
  "message": "Session terminated for marjanTheConqueror"
}
```

Response Body (Failed) :

```json
{
  "status": "fail",
  "message": "Unauthorized"
}
```
