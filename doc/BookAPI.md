# 📘 Book API List

## Base URL
`/api/books`

---

## 1. Create Book
- **Method:** POST  
- **Endpoint:** `/api/books`  
- **Mô tả:** Tạo mới một sách  
### Request Body

```json
{
  "title": "Nhà giả kim",
  "description": "Một cuốn sách nổi tiếng",
  "price": 100000,
  "stock": 50,
  "categoryId": "cat_01",
  "thumbnail": "https://example.com/thumb.jpg",
  "images": ["https://example.com/img1.jpg"],
  "tags": ["tiểu thuyết"],
  "specifications": {
    "author": "Paulo Coelho",
    "publisher": "NXB Văn Học",
    "publishYear": 2024
  }
}
```
### Body Params

| Trường            | Kiểu dữ liệu | Bắt buộc | Mô tả |
|-------------------|-------------|----------|------|
| `title`           | String      | ✔️       | Tên sách (1–255 ký tự) |
| `description`     | String      | ❌       | Mô tả |
| `price`           | Number      | ✔️       | Giá gốc (> 0) |
| `stock`           | Number      | ✔️       | Số lượng (≥ 0) |
| `categoryId`      | ObjectId    | ✔️       | ID danh mục |
| `thumbnail`       | String      | ❌       | URL ảnh đại diện |
| `images`          | String[]    | ❌       | Danh sách URL ảnh |
| `tags`            | String[]    | ❌       | Từ khoá (không trùng) |
| `specifications`  | Object      | ❌       | Thông tin chi tiết |

---

### Validation

- `title`: bắt buộc, 1–255 ký tự, trim  
- `price`: > 0  
- `stock`: ≥ 0  
- `categoryId`: phải tồn tại và `active`  
- `thumbnail`, `images`: URL hợp lệ  
- `tags`: không trùng, tối đa 20  

**Không cho client gửi:**
- `slug`  
- `finalPrice`  
- `ratingAverage`  
- `ratingCount`  

---

### Business Logic

1. Validate input  
2. Generate `slug` từ `title`  
3. Kiểm tra trùng `slug`  
4. Kiểm tra `categoryId` tồn tại  
5. Set default:
   - `finalPrice = price`  
   - `ratingAverage = 0`  
   - `ratingCount = 0`  
   - `status = active`  
6. Lưu database  

---

### Response

#### 201 Created
```json id="create_book_res_ok"
{
  "status": "success",
  "data": {
    "_id": "book_01",
    "title": "Nhà giả kim",
    "slug": "nha-gia-kim",
    "price": 100000,
    "finalPrice": 100000,
    "stock": 50,
    "categoryId": "cat_01",
    "status": "active"
  }
}
```
#### 400 Bad Request
```json
{
  "status": "error",
  "endpoint": "POST /api/books",
  "message": "Validation Error",
  "details": "Price must be greater than 0"
}
```
#### 404 Not Found
```json
{
  "status": "error",
  "endpoint": "POST /api/books",
  "message": "Category not found"
}
```
#### 409 Conflict
```json
{
  "status": "error",
  "endpoint": "POST /api/books",
  "message": "Slug already exists"
}
```
---

## 2. Get Books (List)
- **Method:** GET  
- **Endpoint:** `/api/books`  
- **Mô tả:** Lấy danh sách sách, hỗ trợ filter, search, rating và phân trang  

### Query Params

| Param        | Kiểu   | Bắt buộc | Mô tả |
|--------------|--------|----------|------|
| `keyword`    | String | ❌       | Tìm theo title |
| `categoryId` | String | ❌       | Lọc theo danh mục |
| `minPrice`   | Number | ❌       | Giá tối thiểu |
| `maxPrice`   | Number | ❌       | Giá tối đa |
| `minRating`  | Number | ❌       | Rating tối thiểu (0–5) |
| `maxRating`  | Number | ❌       | Rating tối đa (0–5) |
| `status`     | String | ❌       | `active` / `inactive` |
| `sortBy`     | String | ❌       | `price`, `createdAt`, `sold`, `ratingAverage` |
| `order`      | String | ❌       | `asc` / `desc` |
| `page`       | Number | ❌       | Trang (default: 1) |
| `limit`      | Number | ❌       | Số lượng (default: 10, max: 50) |

### Validation

- `minPrice`, `maxPrice` ≥ 0  
- `minPrice ≤ maxPrice`  
- `minRating`, `maxRating` trong khoảng 0 → 5  
- `minRating ≤ maxRating`  
- `page ≥ 1`  
- `limit` từ 1 → 50  
- `status`: `active` / `inactive`  
- `sortBy`: chỉ cho phép field hợp lệ  

### Business Logic

1. Build filter:
   - `keyword` → regex search `title`  
   - `categoryId` → filter  
   - `price`:
     ```
     price >= minPrice
     price <= maxPrice
     ```
   - `rating`:
     ```
     ratingAverage >= minRating
     ratingAverage <= maxRating
     ```
   - `status`  

2. Build sort:
   - `sortBy` + `order`  

3. Pagination:skip = (page - 1) * limit
4. Query database:
- lấy danh sách book  
- đếm tổng (`total`)  

5. Trả response  

---

## 3. Get Book Detail
- **GET** `/api/books/:id`  
→ Lấy chi tiết sách  
### Response

#### 200 OK
```json id="book_list_success_full"
{
"status": "success",
"data": {
 "items": [
   {
     "_id": "book_01",
     "title": "Nhà giả kim",
     "price": 100000,
     "finalPrice": 80000,
     "thumbnail": "thumb.jpg",
     "ratingAverage": 4.5,
     "ratingCount": 120
   }
 ],
 "pagination": {
   "page": 1,
   "limit": 10,
   "total": 100
 }
}
}
```
#### 400 Bad Request
```json
{
  "status": "error",
  "endpoint": "GET /api/books",
  "message": "Invalid query parameters"
}
```
#### 500 Internal Server Error
```json
{
  "status": "error",
  "endpoint": "GET /api/books",
  "message": "Failed to fetch books"
}
```
---

## 4. Update Book
- **Method:** PUT  
- **Endpoint:** `/api/books/:id`  
- **Mô tả:** Cập nhật thông tin sách  

### Path Params

| Param | Kiểu   | Bắt buộc | Mô tả |
|-------|--------|----------|------|
| `id`  | String | ✔️       | ID của book |

### Request Body

```json
{
  "title": "Tên mới",
  "price": 120000,
  "stock": 80,
  "categoryId": "cat_02",
  "tags": ["văn học"],
  "specifications": {
    "author": "Tác giả mới"
  }
}
```
### Body Params

| Trường            | Kiểu dữ liệu | Bắt buộc | Mô tả |
|-------------------|-------------|----------|------|
| `title`           | String      | ❌       | Tên sách (1–255 ký tự) |
| `description`     | String      | ❌       | Mô tả |
| `price`           | Number      | ❌       | Giá (> 0) |
| `stock`           | Number      | ❌       | Tồn kho (≥ 0) |
| `categoryId`      | ObjectId    | ❌       | ID danh mục |
| `thumbnail`       | String      | ❌       | URL ảnh đại diện |
| `images`          | String[]    | ❌       | Danh sách URL ảnh |
| `tags`            | String[]    | ❌       | Từ khoá |
| `specifications`  | Object      | ❌       | Thông tin chi tiết |
| `status`          | String      | ❌       | `active` / `inactive` |

### Validation

- `id`: phải là ObjectId hợp lệ  
- `price > 0` (nếu có)  
- `stock ≥ 0` (nếu có)  
- `categoryId`: phải tồn tại và `active` (nếu có)  
- `thumbnail`, `images`: URL hợp lệ  
- `tags`: không trùng, tối đa 20  

**Không cho client update:**
- `slug`  
- `finalPrice`  
- `ratingAverage`  
- `ratingCount`  
### Business Logic

1. Validate `id`  
2. Tìm book theo `id`  
3. Nếu không tồn tại → trả lỗi 404  

4. Nếu cập nhật `title`:
   - Generate lại `slug`  
   - Kiểm tra trùng  

5. Nếu cập nhật `price`:
   - Recalculate `finalPrice` (theo promotion hiện tại nếu có)  

6. Nếu cập nhật `categoryId`:
   - Validate category  

7. Cập nhật các field khác  

8. Lưu database 

### Response

#### 200 OK
```json id="upd_book_res_ok"
{
  "status": "success",
  "data": {
    "message": "Book updated successfully"
  }
}
```
#### 400 Bad Request
```json id="upd_book_res_ok"
{
  "status": "error",
  "endpoint": "PUT /api/books/:id",
  "message": "Validation Error"
}
```
#### 404 Not Found
```json
{
  "status": "error",
  "endpoint": "PUT /api/books/:id",
  "message": "Book not found"
}
```
#### 409 Conflict
```json
{
  "status": "error",
  "endpoint": "PUT /api/books/:id",
  "message": "Slug already exists"
}
```

---

## 5. Delete Book
- **Method:** DELETE  
- **Endpoint:** `/api/books/:id`  
- **Mô tả:** Xoá sách, hỗ trợ xoá mềm (soft delete) và xoá cứng (hard delete) 
### Path Params

| Param | Kiểu   | Bắt buộc | Mô tả |
|-------|--------|----------|------|
| `id`  | String | ✔️       | ID của book |

### Query Params

| Param | Kiểu   | Bắt buộc | Mô tả |
|-------|--------|----------|------|
| `mode`| String | ❌       | `soft` (default) hoặc `hard` |

### Validation

- `id`: phải là ObjectId hợp lệ  
- Book phải tồn tại  

---

### Business Logic

#### Mode: soft (default)
1. Tìm book theo `id`  
2. Nếu không tồn tại → 404  
3. Cập nhật:status = inactive
4. Giữ dữ liệu để phục vụ:
    - thống kê  
    - lịch sử order  
#### Mode: hard
1. Tìm book theo `id`  
2. Nếu không tồn tại → 404  
3. Kiểm tra ràng buộc:
    - book có tồn tại trong order không  
4. Nếu có liên kết:
    - trả lỗi 409  
5. Nếu không:
    - xoá khỏi database  
### Response

#### 200 OK
```json id="book_delete_success"
{
"status": "success",
"data": {
 "message": "Book deleted successfully"
}
}
```
#### 400 Bad Request
```json id="book_delete_success"
{
  "status": "error",
  "endpoint": "DELETE /api/books/:id",
  "message": "Invalid book id"
}
```
#### 404 Not Found
```json id="book_delete_success"
{
  "status": "error",
  "endpoint": "DELETE /api/books/:id",
  "message": "Book not found"
}
```
#### 409 Conflict
```json id="book_delete_success"
{
  "status": "error",
  "endpoint": "DELETE /api/books/:id",
  "message": "Cannot delete book with related orders"
}
```
---

## 6. Get Books by Category
- **Method:** GET  
- **Endpoint:** `/api/books/by-category/:categoryId`  
- **Mô tả:** Lấy danh sách sách theo danh mục (bao gồm cả danh mục con)

### Path Params

| Param        | Kiểu   | Bắt buộc | Mô tả |
|--------------|--------|----------|------|
| `categoryId` | String | ✔️       | ID danh mục |

### Query Params

| Param        | Kiểu   | Bắt buộc | Mô tả |
|--------------|--------|----------|------|
| `includeChildren` | Boolean | ❌ | Bao gồm danh mục con (default: true) |
| `minPrice`   | Number | ❌       | Giá tối thiểu |
| `maxPrice`   | Number | ❌       | Giá tối đa |
| `minRating`  | Number | ❌       | Rating tối thiểu |
| `sortBy`     | String | ❌       | `price`, `sold`, `createdAt` |
| `order`      | String | ❌       | `asc` / `desc` |
| `page`       | Number | ❌       | Trang |
| `limit`      | Number | ❌       | Số lượng |

### Validation

- `categoryId`: ObjectId hợp lệ  
- Category phải tồn tại  
- `minPrice ≤ maxPrice`  
- `minRating` trong khoảng 0–5  
- `page ≥ 1`, `limit ≤ 50`  

---

### Business Logic

1. Validate `categoryId`  
2. Kiểm tra category tồn tại  

3. Nếu `includeChildren = true`: categoryIds = [categoryId + descendants]
→ lấy từ `ancestors`

4. Build filter:
- `categoryId IN categoryIds`
- `price`, `rating` nếu có  

5. Sort + Pagination  

6. Query database  
7. Trả response  

### Response

#### 200 OK
```json id="book_by_cat_success"
{
"status": "success",
"data": {
 "items": [
   {
     "_id": "book_01",
     "title": "Nhà giả kim",
     "price": 100000,
     "finalPrice": 80000,
     "ratingAverage": 4.5
   }
 ],
 "pagination": {
   "page": 1,
   "limit": 10,
   "total": 50
 }
}
}
```
#### 400 Bad Request
```json 
{
  "status": "error",
  "endpoint": "GET /api/books/by-category/:categoryId",
  "message": "Invalid category id"
}
```
#### 404 Not Found
```json 
{
  "status": "error",
  "endpoint": "GET /api/books/by-category/:categoryId",
  "message": "Category not found"
}
```
#### 500 Internal Server Error
```json 
{
  "status": "error",
  "endpoint": "GET /api/books/by-category/:categoryId",
  "message": "Failed to fetch books"
}
```
---

## 7. Search Books
- **Method:** GET  
- **Endpoint:** `/api/books/search`  
- **Mô tả:** Tìm kiếm sách theo từ khoá, hỗ trợ filter và phân trang  
### Query Params

| Param        | Kiểu   | Bắt buộc | Mô tả |
|--------------|--------|----------|------|
| `keyword`    | String | ✔️       | Từ khoá tìm kiếm (title, author, tags) |
| `categoryId` | String | ❌       | Lọc theo danh mục |
| `minPrice`   | Number | ❌       | Giá tối thiểu |
| `maxPrice`   | Number | ❌       | Giá tối đa |
| `minRating`  | Number | ❌       | Rating tối thiểu |
| `sortBy`     | String | ❌       | `price`, `createdAt`, `sold`, `ratingAverage` |
| `order`      | String | ❌       | `asc` / `desc` |
| `page`       | Number | ❌       | Trang (default: 1) |
| `limit`      | Number | ❌       | Số lượng (default: 10, max: 50) |

### Validation

- `keyword`: không được rỗng  
- `minPrice`, `maxPrice` ≥ 0  
- `minPrice ≤ maxPrice`  
- `minRating` trong khoảng 0–5  
- `page ≥ 1`, `limit ≤ 50`  
- `sortBy`: chỉ cho phép field hợp lệ  

### Business Logic

1. Build search condition:
    title LIKE keyword
    OR specifications.author LIKE keyword
    OR tags LIKE keyword
2. (Optional) Filter:
- `categoryId`
- `price`
- `rating`

3. Sort + Pagination  

4. Query database:
- dùng regex hoặc full-text search  

5. Trả response  
### Response
#### 200 OK
```json id="book_search_success"
{
"status": "success",
"data": {
 "items": [
   {
     "_id": "book_01",
     "title": "Nhà giả kim",
     "price": 100000,
     "finalPrice": 80000,
     "ratingAverage": 4.5
   }
 ],
 "pagination": {
   "page": 1,
   "limit": 10,
   "total": 25
 }
}
}
```
#### 400 Bad Request
```json
{
  "status": "error",
  "endpoint": "GET /api/books/search",
  "message": "Keyword is required"
}
```
#### 500 Internal Server Error
```json
{
  "status": "error",
  "endpoint": "GET /api/books/search",
  "message": "Search failed"
}
```
---

## 8. Get Bestseller Books
- **Method:** GET  
- **Endpoint:** `/api/books/bestseller`  
- **Mô tả:** Lấy danh sách sách bán chạy (dựa trên `sold`)  

### Query Params

| Param        | Kiểu   | Bắt buộc | Mô tả |
|--------------|--------|----------|------|
| `categoryId` | String | ❌       | Lọc theo danh mục |
| `limit`      | Number | ❌       | Số lượng (default: 10, max: 50) |
| `page`       | Number | ❌       | Trang (nếu cần pagination) |

### Validation

- `limit` từ 1 → 50  
- `page ≥ 1`  
- `categoryId`: phải hợp lệ nếu có  

---

### Business Logic

1. Build filter:
   - `status = active`  
   - nếu có `categoryId` → filter theo category  

2. Sort: sold DESC
3. Pagination (optional): skip = (page - 1) * limit
4. Query database:
- lấy danh sách book  
- đếm tổng nếu có pagination  

5. Trả response  

---

### Response

#### 200 OK
```json id="book_bestseller_success"
{
"status": "success",
"data": {
 "items": [
   {
     "_id": "book_01",
     "title": "Nhà giả kim",
     "sold": 500,
     "price": 100000,
     "finalPrice": 80000,
     "ratingAverage": 4.7
   }
 ],
 "pagination": {
   "page": 1,
   "limit": 10,
   "total": 100
 }
}
}
```
#### 400 Bad Request
```json
{
  "status": "error",
  "endpoint": "GET /api/books/bestseller",
  "message": "Invalid query parameters"
}
```
#### 500 Internal Server Error
```json
{
  "status": "error",
  "endpoint": "GET /api/books/bestseller",
  "message": "Failed to fetch bestseller books"
}
```
---

## 9. Get Featured Books
- **Method:** GET  
- **Endpoint:** `/api/books/featured`  
- **Mô tả:** Lấy danh sách sách nổi bật (featured), phục vụ hiển thị homepage / banner  

---

### Query Params

| Param        | Kiểu   | Bắt buộc | Mô tả |
|--------------|--------|----------|------|
| `limit`      | Number | ❌       | Số lượng (default: 10, max: 50) |
| `categoryId` | String | ❌       | Lọc theo danh mục |
| `page`       | Number | ❌       | Trang (optional) |

---

### Validation

- `limit` từ 1 → 50  
- `page ≥ 1`  
- `categoryId`: ObjectId hợp lệ nếu có  

---

### Business Logic

1. Build filter:  
    - `status` = active
    - `isFeatured` = true
2. Nếu có `categoryId`:
    - `categoryId` = input
3. Sort:
- ưu tiên:
  ```
  sortOrder ASC
  createdAt DESC
  ```

4. Pagination (optional): skip = (page - 1) * limit

5. Query database  

6. Trả response  

---

### Response

#### 200 OK
```json id="book_featured_success"
{
"status": "success",
"data": {
 "items": [
   {
     "_id": "book_01",
     "title": "Nhà giả kim",
     "price": 100000,
     "finalPrice": 80000,
     "thumbnail": "thumb.jpg",
     "ratingAverage": 4.6
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
  "endpoint": "GET /api/books/featured",
  "message": "Invalid query parameters"
}
```
#### 500 Internal Server Error
```json
{
  "status": "error",
  "endpoint": "GET /api/books/featured",
  "message": "Failed to fetch featured books"
}
```
---

## 10. Get Related Books
- **Method:** GET  
- **Endpoint:** `/api/books/:id/related`  
- **Mô tả:** Lấy danh sách sách liên quan để gợi ý (recommendation)
### Path Params

| Param | Kiểu   | Bắt buộc | Mô tả |
|-------|--------|----------|------|
| `id`  | String | ✔️       | ID của book |

### Query Params

| Param        | Kiểu   | Bắt buộc | Mô tả |
|--------------|--------|----------|------|
| `limit`      | Number | ❌       | Số lượng (default: 10, max: 20) |
| `strategy`   | String | ❌       | `category` / `tags` / `mixed` (default: mixed) |

### Validation

- `id`: ObjectId hợp lệ  
- Book phải tồn tại  
- `limit` từ 1 → 20  
- `strategy`:
  - `category`
  - `tags`
  - `mixed`  

---

### Business Logic

1. Validate `id`  
2. Lấy book hiện tại  
3. Build candidate query:

    #### Strategy: category
        categoryId = current.categoryId
    #### Strategy: tags
        tags IN current.tags
    #### Strategy: mixed (recommended)
        categoryId = current.categoryId
        OR tags IN current.tags
4. Exclude:  _id != currentBookId
5. Filter: status = active
6. Sort (ưu tiên):
   -  ratingAverage DESC
   - sold DESC
7. Limit kết quả  
### Response

#### 200 OK
```json id="book_related_success"
{
  "status": "success",
  "data": [
    {
      "_id": "book_02",
      "title": "Đắc Nhân Tâm",
      "price": 90000,
      "finalPrice": 75000,
      "ratingAverage": 4.7
    }
  ]
}
```
#### 400 Bad Request
```json
{
  "status": "error",
  "endpoint": "GET /api/books/:id/related",
  "message": "Invalid book id"
}
```
#### 404 Not Found
```json
{
  "status": "error",
  "endpoint": "GET /api/books/:id/related",
  "message": "Book not found"
}
```
#### 500 Internal Server Error
```json
{
  "status": "error",
  "endpoint": "GET /api/books/:id/related",
  "message": "Failed to fetch related books"
}
```
---


