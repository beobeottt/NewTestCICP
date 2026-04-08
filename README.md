# Document Management System (Product Company)

Ứng dụng quản lý công văn gồm **Backend ASP.NET Core + PostgreSQL** và **Frontend Angular**.

## Tính năng chính (để báo cáo)

### Authentication & User Management
- **Đăng nhập** (login)
- **Quản lý người dùng** (User Manager):
  - Xem danh sách user
  - Tạo user mới
  - Xoá user
- **Phân quyền theo role**:
  - `Admin`: có quyền **xử lý công văn** (trang Process)
  - `User`: không có quyền xử lý (chỉ xem/danh sách)

### Document Management
- Danh sách công văn theo từng trang:
  - **Incoming**
  - **Outgoing**
  - **Process** (xử lý/đổi trạng thái)
  - **Statistics** (thống kê theo trạng thái)
- **CRUD công văn** (tạo / xem chi tiết / cập nhật / xoá)
- **Trạng thái (Role/Status)**:
  - `Pending` (Đang chờ xử lý)
  - `Approved` (Đã được chấp thuận)
  - `Rejected` (Đã bị từ chối)
  - FE có mapping để hiển thị đúng cả khi backend trả `0/1/2` hoặc string.
- **Tìm kiếm + lọc**:
  - Search theo từ khoá (tiêu đề/mô tả)
  - Filter theo trạng thái
- **Upload file đính kèm** khi tạo công văn (multipart/form-data)
  - File được phục vụ lại qua đường dẫn `/uploads/...`

### UI/UX
- Dashboard layout: sidebar full chiều cao, khu vực bảng scroll khi dữ liệu dài.
- Logout bằng nút **Thoát** (xoá token + quay về login).

## Kiến trúc & Ports

### Docker Compose (khuyến nghị)
- **Postgres**: internal network, không cần expose ra ngoài
- **Backend**: container port `5000`, map ra host `5001`
- **Frontend (Nginx)**: container port `80`, map ra host `80`

URLs khi chạy bằng compose:
- **Frontend**: `http://localhost/` (port 80)
- **Backend API**: `http://localhost:5001/`
- **Swagger** (nếu bật): `http://localhost:5001/swagger`

> Lưu ý: Frontend Docker image đã cấu hình Nginx proxy `/api/*` và `/uploads/*` sang backend service name `backend_api` (chạy chung network compose).

## Chạy project bằng Docker

### Yêu cầu
- Docker Desktop (macOS/Windows) hoặc Docker Engine trên Linux
- (Khuyến nghị) `docker compose` plugin

### 1) Chuẩn bị biến môi trường

Repo có file `.env` ở root dùng cho `docker-compose.yml`.

Các biến quan trọng:
- **Database**:
  - `POSTGRES_DB`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
- **Backend**:
  - `ASPNETCORE_ENVIRONMENT`
  - `ConnectionStrings__DefaultConnection` (được set trực tiếp trong compose)
- **Cloudinary**
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

Khuyến nghị: tạo file `.env` riêng cho production và **không commit secret**.

### 2 Chạy bằng Docker Compose (dùng image từ Docker Hub)

File: `docker-compose.yml` đang trỏ tới images:
- `beobeotttt/backend:latest`
- `beobeotttt/frontend:latest`

Chạy:

```bash
docker compose up -d
```

Xem logs:

```bash
docker compose logs -f backend_api
docker compose logs -f angular_fe
```

Stop:

```bash
docker compose down
```

Reset database (xoá dữ liệu postgres):

```bash
docker compose down -v
```

### 3) Build images từ source (local) rồi chạy

Build:

```bash
docker build -t local/backend -f Dockerfile.backend .
docker build -t local/frontend -f Dockerfile.frontend .
```

Sau đó bạn có thể sửa `docker-compose.yml` sang `local/backend` và `local/frontend`, hoặc chạy `docker run` thủ công.

### 4) Chạy bằng `docker run` (không khuyến nghị)

Nếu chạy từng container bằng `docker run`, bạn **phải tạo network** để Nginx trong frontend resolve được `backend_api`:

```bash
docker network create app_net
```

Postgres:

```bash
docker run -d --name postgres_db --network app_net \
  -e POSTGRES_DB=productcompany \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=long \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

Backend:

```bash
docker run -d --name backend_api --network app_net -p 5001:5000 \
  -e ASPNETCORE_ENVIRONMENT=Development \
  -e ConnectionStrings__DefaultConnection="Host=postgres_db;Port=5432;Database=productcompany;Username=postgres;Password=long" \
  beobeotttt/backend:latest
```

Frontend (Nginx):

```bash
docker run -d --name angular_fe --network app_net -p 80:80 \
  beobeotttt/frontend:latest
```

## Seed data / tài khoản test

Backend có seed data (nếu DB đang trống):
- `khang / 123456` (role `Admin`)
- `long / longdep` (role `User`)

Và một số **documents mẫu** với trạng thái `Pending/Approved/Rejected`.

## API endpoints chính

### User
- `POST /api/user/login`
- `POST /api/user/register`
- `GET /api/user`
- `DELETE /api/user/{id}`

### Document
- `GET /api/document`
- `GET /api/document/{id}`
- `POST /api/document` (JSON)
- `POST /api/document/with-file` (multipart/form-data)
- `PUT /api/document/{id}`
- `DELETE /api/document/{id}`

## CI/CD (GitHub Actions → Docker Hub)

Workflow: `.github/workflows/deploy.yml`
- Trigger: push lên branch `main`
- Steps: build & push 2 images:
  - `${DOCKER_USERNAME}/backend:latest`
  - `${DOCKER_USERNAME}/frontend:latest`

Yêu cầu bạn set GitHub Secrets:
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

## Gợi ý bổ sung (nếu muốn nâng cấp)
- **JWT thật** (hiện FE dùng localStorage token đơn giản). Nên trả JWT từ backend login và dùng Bearer token.
- **Authorization ở backend**: chặn endpoint xử lý công văn theo role (Admin).
- **Pagination server-side** cho danh sách documents/users (khi dữ liệu lớn).
- **Audit log**: lưu lịch sử xử lý công văn (ai đổi trạng thái, lúc nào).
- **Dark mode**: lưu theme trong localStorage và toggle trong UI.



cấu trúc deploy:

sử dụng docker hub xây dựng 2 container: beobeotttt/frontend, beobeottt/backend

cách vận hành:

khi push code lên git thì nó sẽ rebuild lại để cập nhập trực tiếp trang đã được deploy theo cấu trúc CI/CP

chức năng:

thêm, xoá, sửa document
thêm, xoá User

2 actor: User(chỉ được xem document và thống kê), Admin(Thêm xoá sửa document, Thêm xoá User)


