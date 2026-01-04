# 🖼️ Image Proxy Server – Why It Exists & How It Works

## ❓ Why an Image Proxy Is Needed

Faculty images used in ABPA3 are stored inside an **AWS S3 bucket** that enforces strict access rules.

While these image URLs may open correctly when pasted into a browser tab, they **cannot be reliably loaded inside a web application** (such as a React app) due to the following restrictions:

- **CORS (Cross-Origin Resource Sharing)** limitations
- **Hotlink protection** on S3
- **Referer and User-Agent checks**
- Browser **security and mixed-content policies**

As a result, directly using S3 image URLs in `<img src="...">` tags causes:
- Images failing to load
- CORS errors in the browser console
- Inconsistent behavior across browsers

To solve this cleanly and reliably, ABPA3 uses a **local image proxy server**.

---

## 🧠 High-Level Architecture

```
React Frontend (localhost:3000)
          ↓
Image Proxy Server (localhost:5000)
          ↓
AWS S3 Bucket (Faculty Images)
```

- The frontend **never talks to AWS S3 directly**
- All image requests go through the proxy
- The proxy behaves like a trusted server-side client

---

## ⚙️ How the Image Proxy Works

1. **Frontend requests an image via the proxy**
   ```
   http://localhost:5000/faculty-photo/<image-name>.avif
   ```

2. **The proxy server receives the request**
   - Extracts the image filename from the route
   - Constructs the corresponding AWS S3 URL internally

3. **The proxy fetches the image from S3**
   - Adds browser-like headers (User-Agent, Accept)
   - Bypasses hotlinking and CORS restrictions

4. **The image is streamed back to the frontend**
   - Correct `Content-Type` is preserved
   - Browser treats the response as same-origin
   - `<img>` tags work normally without CORS errors

---

## ✅ Benefits of This Approach

- Eliminates frontend CORS issues
- Prevents direct exposure of S3 URLs
- Works with restricted or protected buckets
- Allows future extensions:
  - Authentication
  - Rate limiting
  - Caching
  - Logging

---

## 🔒 Security Considerations

- The proxy should validate image paths and filenames
- Rate limiting is recommended in production
- In production deployments, the proxy should run behind HTTPS

---

## 📌 Why This Fits ABPA3

ABPA3 is designed to be:
- **Local-first**
- **Deterministic**
- **Privacy-respecting**

The image proxy aligns with this philosophy by:
- Keeping network logic server-side
- Avoiding brittle frontend workarounds
- Providing predictable image loading behavior

---

This proxy is a **deliberate architectural choice**, not a workaround.
