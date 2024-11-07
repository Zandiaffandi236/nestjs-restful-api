# Contact API Spec

## Create Contact

Endpoint : `POST` /api/contacts

Headers :

- Authorization: token

Request Body :

```json
{
  "first_name": "Marzandi Zahran",
  "last_name": "Affandi Leta",
  "email": "marjan@example.com",
  "phone": "08123456789"
}
```

Response Body :

```json
{
  "status": "success",
  "message": "Contact created successfully",
  "data": {
    "id": 1,
    "first_name": "Marzandi Zahran",
    "last_name": "Affandi Leta",
    "email": "marjan@example.com",
    "phone": "08123456789"
  }
}
```

## Get Contact

Endpoint : `GET` /api/contacts/:contactId

Headers :

- Authorization: token

Response Body :

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "first_name": "Marzandi Zahran",
    "last_name": "Affandi Leta",
    "email": "marjan@example.com",
    "phone": "08123456789"
  }
}
```

## Update Contact

Endpoint : `PUT` /api/contacts/:contactId

Headers :

- Authorization: token

Request Body :

```json
{
  "first_name": "Marzandi Zahran",
  "last_name": "Affandi Leta",
  "email": "marjan@example.com",
  "phone": "08123456789"
}
```

Response Body :

```json
{
  "status": "success",
  "message": "Contact updated successfully",
  "data": {
    "id": 1,
    "first_name": "Marzandi Zahran",
    "last_name": "Affandi Leta",
    "email": "marjan@example.com",
    "phone": "08123456789"
  }
}
```

## Remove Contact

Endpoint : `DELETE` /api/contacts/:contactId

Headers :

- Authorization: token

Response Body :

```json
{
  "status": "success",
  "message": "Contact deleted successfully"
}
```

## Search Contact

Endpoint : `GET` /api/contacts

Headers :

- Authorization: token

Query Params :

- name : `string`, contact first name or last name `optional`
- phone : `string`, contact phone `optional`
- email : `string`, contact email `optional`
- page : `number`, default 1
- size : `number`, default 10

Response Body :

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "first_name": "Marzandi Zahran",
      "last_name": "Affandi Leta",
      "email": "marjan@example.com",
      "phone": "08123456789"
    },
    {
      "id": 2,
      "first_name": "Marzandi Zahran",
      "last_name": "Affandi Leta",
      "email": "marjan@example.com",
      "phone": "08123456789"
    },
    { ... }
  ],
  "paging": {
    "current_page": 1,
    "total_page": 10,
    "size": 10
  }
}
```
