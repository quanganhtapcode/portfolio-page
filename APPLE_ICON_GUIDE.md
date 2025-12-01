# Apple Touch Icon

Để logo hiện tốt nhất trên Safari và iOS:

1. Tạo file PNG từ favicon.svg với kích thước 180x180px
2. Đặt tên là `apple-touch-icon.png` 
3. Đặt trong folder public/

## Cách tạo nhanh:

### Online:
- Mở https://cloudconvert.com/svg-to-png
- Upload favicon.svg
- Set width: 180, height: 180
- Convert và download
- Đổi tên thành `apple-touch-icon.png`

### Hoặc dùng command (nếu có ImageMagick):
```bash
magick convert -resize 180x180 -background none favicon.svg apple-touch-icon.png
```

Sau khi có file, cập nhật index.html:
```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```
