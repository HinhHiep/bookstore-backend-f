# 📘 Promotion API List
## 1. Create Promotion
- **Method:** POST  
- **Endpoint:** `/api/promotions`  
- **Mô tả:** Tạo chương trình khuyến mãi (giảm theo %)
### Body Params

| Trường           | Kiểu dữ liệu | Bắt buộc | Mô tả |
|------------------|-------------|----------|------|
| `name`           | String      | ✔️       | Tên chương trình |
| `description`    | String      | ❌       | Mô tả |
| `value`          | Number      | ✔️       | % giảm (0–100) |
| `maxDiscount`    | Number      | ❌       | Giảm tối đa |
| `minOrderValue`  | Number      | ❌       | Giá trị đơn tối thiểu |
| `event`          | String      | ❌       | Tên sự kiện |
| `bookIds`        | ObjectId[]  | ❌       | Danh sách book áp dụng |
| `usageLimit`     | Number      | ❌       | Tổng lượt dùng |
| `startDate`      | Date        | ✔️       | Thời gian bắt đầu |
| `endDate`        | Date        | ✔️       | Thời gian kết thúc |

### Validation

- `name`: 1–255 ký tự  
- `description ≤ 1000 ký tự`  
- `value`: `0 < value ≤ 100`  
- `maxDiscount ≥ 0` (nếu có)  
- `minOrderValue ≥ 0`  
- `startDate < endDate`  
- `bookIds`: không trùng, phải tồn tại và `active`  
### Business Logic

1. Validate input  

2. Normalize data:
   - trim `name`, `description`  
   - remove duplicate `bookIds`  

3. Set default:
   - `usedCount = 0`  
   - `status = active`  

4. Lưu database  

5. Trigger sync:
```js
update book.finalPrice
```
### Response
#### 201 Created
```json
{
  "status": "success",
  "data": {
    "_id": "promo_01",
    "name": "Flash Sale 30%",
    "description": "Giảm 30% trong khung giờ vàng",
    "value": 30,
    "status": "active",
    "startDate": "2026-04-21T10:00:00Z",
    "endDate": "2026-04-21T12:00:00Z"
  }
}
```
#### 400 Bad Request
```json
{
  "status": "error",
  "endpoint": "POST /api/promotions",
  "message": "Validation Error",
  "details": "Discount value must be between 0 and 100"
}
```

#### 404 Not Found
```json
{
  "status": "error",
  "endpoint": "POST /api/promotions",
  "message": "Book not found"
}
```
#### 500 Internal Server Error
```json
{
  "status": "error",
  "endpoint": "POST /api/promotions",
  "message": "Book not found"
}
```
## 2. Get Promotions (List)
- **GET** `/api/promotions`  
→ Lấy danh sách promotion (filter + pagination)

## 3. Get Promotion Detail
- **Method:** GET  
- **Endpoint:** `/api/promotions`  
- **Mô tả:** Lấy danh sách promotion, hỗ trợ filter, trạng thái hiệu lực và phân trang  
### Query Params

| Param        | Kiểu    | Bắt buộc | Mô tả |
|--------------|---------|----------|------|
| `status`     | String  | ❌       | `active` / `inactive` |
| `event`      | String  | ❌       | Lọc theo event |
| `isActive`   | Boolean | ❌       | Promotion đang hiệu lực theo thời gian |
| `page`       | Number  | ❌       | Trang (default: 1) |
| `limit`      | Number  | ❌       | Số lượng (default: 10, max: 50) |

### Validation

- `status`: `active` / `inactive`  
- `page ≥ 1`  
- `limit` từ 1 → 50  
- `isActive`: true / false  

### Business Logic

1. Build filter:
   - Nếu có `status`:
     ```
     status = input
     ```
   - Nếu có `event`:
     ```
     event = input
     ```

2. Nếu `isActive = true`:
    ```
    status = active
    startDate ≤ now ≤ endDate
3. Pagination:
    ```
    skip = (page - 1) * limit
    ```
4. Query database:
- lấy danh sách promotion  
- đếm tổng (`total`)  

5. Trả response  

---

### Response

#### 200 OK
```json id="promo_list_success_final"
{
"status": "success",
"data": {
 "items": [
   {
     "_id": "promo_01",
     "name": "Flash Sale 30%",
     "description": "Giảm giá giờ vàng",
     "value": 30,
     "status": "active",
     "startDate": "2026-04-21T10:00:00Z",
     "endDate": "2026-04-21T12:00:00Z"
   }
 ],
 "pagination": {
   "page": 1,
   "limit": 10,
   "total": 20
 }
}
}
```
#### 400 Bad Request
```json
{
  "status": "error",
  "endpoint": "GET /api/promotions",
  "message": "Invalid query parameters"
}
```

#### 500 Internal Server Error
```json
{
  {
  "status": "error",
  "endpoint": "GET /api/promotions",
  "message": "Failed to fetch promotions"
}
}
```

## 4. Update Promotion
## 4. Update Promotion

- **Method:** PUT  
- **Endpoint:** `/api/promotions/:id`  
- **Mô tả:** Cập nhật thông tin chương trình khuyến mãi  

---

### Path Params

| Param | Kiểu   | Bắt buộc | Mô tả |
|-------|--------|----------|------|
| `id`  | String | ✔️       | ID của promotion |

---

### Body Params

| Trường           | Kiểu dữ liệu | Bắt buộc | Mô tả |
|------------------|-------------|----------|------|
| `name`           | String      | ❌       | Tên chương trình |
| `description`    | String      | ❌       | Mô tả |
| `value`          | Number      | ❌       | % giảm (0–100) |
| `maxDiscount`    | Number      | ❌       | Giảm tối đa |
| `minOrderValue`  | Number      | ❌       | Giá trị đơn tối thiểu |
| `event`          | String      | ❌       | Tên sự kiện |
| `bookIds`        | ObjectId[]  | ❌       | Danh sách book |
| `usageLimit`     | Number      | ❌       | Giới hạn sử dụng |
| `startDate`      | Date        | ❌       | Thời gian bắt đầu |
| `endDate`        | Date        | ❌       | Thời gian kết thúc |
| `status`         | String      | ❌       | active / inactive |

---

### Validation

- `id`: ObjectId hợp lệ  
- `value`: `0 < value ≤ 100` (nếu có)  
- `maxDiscount ≥ 0`  
- `minOrderValue ≥ 0`  
- `startDate < endDate` (nếu cập nhật cả 2)  
- `bookIds`: không trùng, phải tồn tại và `active`  

---

### Business Logic

1. Validate `id`  
2. Tìm promotion theo `id`  
3. Nếu không tồn tại → 404  

4. Normalize data:
   - trim `name`, `description`  
   - remove duplicate `bookIds`  

5. Cập nhật các field  

6. Lưu database  

7. Trigger sync:
```js
update book.finalPrice
```
### Response
#### 200 OK
```json
{
  "status": "success",
  "data": {
    "message": "Promotion updated successfully"
  }
}
```
#### 400 Bad Request
```json
{
  "status": "error",
  "endpoint": "PUT /api/promotions/:id",
  "message": "Validation Error"
}
```
#### 404 Not Found
```json
{
  "status": "error",
  "endpoint": "PUT /api/promotions/:id",
  "message": "Promotion not found"
}
```
#### 500 Internal Server Error
```json
{
  "status": "error",
  "endpoint": "PUT /api/promotions/:id",
  "message": "Failed to update promotion"
}
```
## 5. Delete Promotion
- **Method:** DELETE  
- **Endpoint:** `/api/promotions/:id`  
- **Mô tả:** Xoá promotion (mặc định soft delete)
### Path Params

| Param | Kiểu   | Bắt buộc | Mô tả |
|-------|--------|----------|------|
| `id`  | String | ✔️       | ID của promotion |

---

### Query Params (Optional)

| Param | Kiểu   | Bắt buộc | Mô tả |
|-------|--------|----------|------|
| `mode`| String | ❌       | `soft` (default) / `hard` |

---

### Validation

- `id`: ObjectId hợp lệ  
- Promotion phải tồn tại  

---

### Business Logic

#### Mode: soft (default)
1. Tìm promotion theo `id`  
2. Nếu không tồn tại → 404  
3. Cập nhật: `status = inactive`
4. Giữ dữ liệu để:
- thống kê  
- audit  

---

#### Mode: hard
1. Tìm promotion theo `id`  
2. Nếu không tồn tại → 404  
3. Xoá khỏi database  

---

#### Sau khi xoá (cả 2 mode)
```js
update book.finalPrice
```
### Response
#### 200 OK
```json
{
  "status": "success",
  "data": {
    "message": "Promotion deleted successfully"
  }
}
```
#### 400 Bad Request
```json
{
  "status": "error",
  "endpoint": "DELETE /api/promotions/:id",
  "message": "Invalid promotion id"
}
```
#### 404 Not Found
```json
{
  "status": "error",
  "endpoint": "DELETE /api/promotions/:id",
  "message": "Promotion not found"
}
```
#### 500 Internal Server Error
```json
{
  "status": "error",
  "endpoint": "DELETE /api/promotions/:id",
  "message": "Failed to delete promotion"
}
```

## 6. Get Active Promotions
- **Method:** GET  
- **Endpoint:** `/api/promotions/active`  
- **Mô tả:** Lấy danh sách promotion đang hiệu lực (theo thời gian hiện tại)
### Query Params

| Param        | Kiểu   | Bắt buộc | Mô tả |
|--------------|--------|----------|------|
| `event`      | String | ❌       | Lọc theo event |
| `bookId`     | String | ❌       | Lọc theo book |
| `page`       | Number | ❌       | Trang (default: 1) |
| `limit`      | Number | ❌       | Số lượng (default: 10, max: 50) |

### Validation

- `bookId`: ObjectId hợp lệ (nếu có)  
- `page ≥ 1`  
- `limit` từ 1 → 50  
### Business Logic

1. Lấy thời gian hiện tại: `now = currentDate`
2. Build filter: 
```
status = active
startDate ≤ now ≤ endDate
```
3. Nếu có `event`: `event = input`
4. Nếu có `bookId`: `bookIds contains bookId OR bookIds empty (global)`
5. Pagination: `skip = (page - 1) * limit`
6. Query database:
- lấy danh sách promotion  
- đếm tổng  
### Response

#### 200 OK
```json id="promo_active_success"
{
  "status": "success",
  "data": {
    "items": [
      {
        "_id": "promo_01",
        "name": "Flash Sale 30%",
        "value": 30,
        "event": "flash_sale",
        "startDate": "2026-04-21T10:00:00Z",
        "endDate": "2026-04-21T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5
    }
  }
}
```
#### 400 Bad Request
```json
{
  "status": "error",
  "endpoint": "GET /api/promotions/active",
  "message": "Invalid query parameters"
}
```
#### 500 Internal Server Error
```json
{
  "status": "error",
  "endpoint": "GET /api/promotions/active",
  "message": "Failed to fetch active promotions"
}
```

## 7. Apply Promotion
- **POST** `/api/promotions/apply`  
→ Tính toán giá sau khi áp dụng promotion  

## 8. Recalculate Prices (Admin)
- **POST** `/api/promotions/recalculate`  
→ Sync lại `finalPrice` cho tất cả book 
