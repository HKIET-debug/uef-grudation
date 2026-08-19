# V3 - UEF Graduation Invitation

## Mục tiêu

Một website thiệp mời duy nhất cho Nguyễn Thu Hà nhưng có thể tạo link riêng cho
từng người được mời.

Ví dụ:

- `https://your-domain.vercel.app/thiep/nguyen-van-a`
- `https://your-domain.vercel.app/thiep/tran-thi-b`

## Cách thêm khách mời

Mở `guests.js`:

```js
const GUESTS = {
  "nguyen-van-a": { name: "Nguyễn Văn A" },
  "tran-thi-b": { name: "Trần Thị B" },
  "le-thi-c": { name: "Lê Thị C" }
};
```

Sau khi deploy lại:

`/thiep/nguyen-van-a`

sẽ tự hiển thị:

**TRÂN TRỌNG KÍNH MỜI**

**Nguyễn Văn A**

trong khi:

`/thiep/tran-thi-b`

sẽ hiển thị:

**Trần Thị B**

## Nếu chưa biết tên khách

Không cần điền. URL chung:

`/`

hoặc URL test:

`/?guest=nguyen-van-a`

cũng được hỗ trợ.

## Thay ảnh

Đặt ảnh của bạn vào:

- `assets/hero.jpg`
- `assets/main-photo.jpg`

Không cần sửa HTML.

## Điền ngày / giờ / địa điểm

Sửa `config.js`:

```js
eventDate: "2026-09-20",
eventTime: "08:00",
location: "Hội trường ...",
address: "...",
mapUrl: "https://maps.google.com/..."
```

## Deploy Vercel

1. Tạo GitHub repository.
2. Upload toàn bộ thư mục V3.
3. Vào Vercel -> Add New Project -> Import repository.
4. Framework Preset: Other.
5. Deploy.
6. Vercel cấp domain `.vercel.app`.
7. Sau đó gửi các URL `/thiep/<slug>` cho từng người.

`vercel.json` đã được thêm để Vercel chuyển mọi URL `/thiep/<slug>` về `index.html`.
JavaScript sẽ đọc `<slug>` và lấy đúng tên từ `guests.js`.

## Giới hạn của V3

Đây là bản static, chưa có database và trang quản trị.

Nếu muốn giống một dịch vụ thiệp mời thực sự, V4 có thể thêm:

- database Supabase/Firebase
- trang admin đăng nhập
- form tạo khách mời
- tự sinh slug
- nút copy link
- QR code cho từng khách
- RSVP
- thống kê số người đã xác nhận
- album ảnh
- nhạc nền
- hiệu ứng mở phong bì
