import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/faculty-photo/:filename", async (req, res) => {
    const file = req.params.filename;
    const url =
        "https://vitap-backend.s3.ap-south-1.amazonaws.com/" + file;

    console.log("➡️ Incoming request:", file);
    console.log("🌐 Fetching:", url);

    try {
        const response = await fetch(url, {
            headers: {
                // VERY IMPORTANT: pretend to be a real browser
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
                "Accept":
                    "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
            },
        });

        console.log("⬅️ S3 status:", response.status);

        if (!response.ok) {
            res.status(response.status).send("Failed to fetch image");
            return;
        }

        const contentType = response.headers.get("content-type");
        console.log("🧾 Content-Type:", contentType);

        res.setHeader("Content-Type", contentType);
        response.body.pipe(res);
    } catch (err) {
        console.error("❌ Proxy error:", err);
        res.sendStatus(500);
    }
});

app.listen(5000, () => {
    console.log("✅ Image proxy running on http://localhost:5000");
});
