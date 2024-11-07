# Address API Spec

## Create Address

Endpoint : `POST` /api/contacts/:contactId/addresses

Headers :

- Authorization: token

Request Body :

```json
{
  "street": "Jalan Pemuda",
  "city": "Semarang",
  "province": "Jawa Tengah",
  "country": "Indonesia",
  "postal_code": "123123"
}
```

Response Body :

```json
{
  "status": "success",
  "message": "Address created successfully",
  "data": {
    "id": 1,
    "street": "Jalan Pemuda",
    "city": "Semarang",
    "province": "Jawa Tengah",
    "country": "Indonesia",
    "postal_code": "123123"
  }
}
```

## Get Address

Endpoint : `GET` /api/contacts/:contactId/addresses/:addressId

Headers :

- Authorization: token

Response Body :

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "street": "Jalan Pemuda",
    "city": "Semarang",
    "province": "Jawa Tengah",
    "country": "Indonesia",
    "postal_code": "123123"
  }
}
```

## Update Address

Endpoint : `PUT` /api/contacts/:contactId/addresses/:addressId

Headers :

- Authorization: token

Request Body :

```json
{
  "street": "Jalan Pemuda",
  "city": "Semarang",
  "province": "Jawa Tengah",
  "country": "Indonesia",
  "postal_code": "123123"
}
```

Response Body :

```json
{
  "status": "success",
  "message": "Address updated successfully",
  "data": {
    "id": 1,
    "street": "Jalan Pemuda",
    "city": "Semarang",
    "province": "Jawa Tengah",
    "country": "Indonesia",
    "postal_code": "123123"
  }
}
```

## Remove Address

Endpoint : `DELETE` /api/contacts/:contactId/addresses/:addressId

Headers :

- Authorization: token

Response Body :

```json
{
  "status": "success",
  "message": "Address deleted successfully"
}
```

## List Addresses

Endpoint : `GET` /api/contacts/:contactId/addresses

Headers :

- Authorization: token

Response Body :

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "street": "Jalan Pemuda",
      "city": "Semarang",
      "province": "Jawa Tengah",
      "country": "Indonesia",
      "postal_code": "123123"
    },
    {
      "id": 2,
      "street": "Jalan Pemuda",
      "city": "Semarang",
      "province": "Jawa Tengah",
      "country": "Indonesia",
      "postal_code": "123123"
    },
    { ... }
  ]
}
```
