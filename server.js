const express = require("express");
const path = require("path");
const NodeCache = require("node-cache");

const app = express();
const PORT = 3000;

// ===== CACHE 5 PHÚT =====
const cache = new NodeCache({ stdTTL: 300 });

app.use(express.static(path.join(__dirname)));


// ================= PHIM MỚI =================
app.get("/api/phim-moi", async (req, res) => {
  const page = req.query.page || 1;
  const key = `phim-moi-${page}`;

  if (cache.get(key)) {
    return res.json(cache.get(key));
  }

  const response = await fetch(
    `https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=${page}`
  );

  const data = await response.json();
  cache.set(key, data);

  res.json(data);
});


// ================= TÌM KIẾM =================
app.get("/api/tim-kiem", async (req, res) => {
  const {
    keyword = "",
    page = 1,
    sort_field = "modified.time",
    sort_type = "desc",
    sort_lang = "",
    category = "",
    country = "",
    year = "",
    limit = 20
  } = req.query;

  const key = `search-${keyword}-${page}-${sort_field}-${sort_type}-${sort_lang}-${category}-${country}-${year}-${limit}`;

  if (cache.get(key)) {
    return res.json(cache.get(key));
  }

  const url = new URL("https://phimapi.com/v1/api/tim-kiem");

  url.searchParams.append("keyword", keyword);
  url.searchParams.append("page", page);
  url.searchParams.append("sort_field", sort_field);
  url.searchParams.append("sort_type", sort_type);

  if (sort_lang) url.searchParams.append("sort_lang", sort_lang);
  if (category) url.searchParams.append("category", category);
  if (country) url.searchParams.append("country", country);
  if (year) url.searchParams.append("year", year);

  url.searchParams.append("limit", limit);

  const response = await fetch(url.toString());
  const data = await response.json();

  cache.set(key, data);
  res.json(data);
});


// ================= DANH SÁCH =================
app.get("/api/danh-sach/:type", async (req, res) => {
  const { type } = req.params;
  const { page = 1 } = req.query;

  const key = `list-${type}-${page}`;

  if (cache.get(key)) {
    return res.json(cache.get(key));
  }

  const response = await fetch(
    `https://phimapi.com/v1/api/danh-sach/${type}?page=${page}&limit=20`
  );

  const data = await response.json();
  cache.set(key, data);

  res.json(data);
});


// ================= CHI TIẾT PHIM =================
app.get("/api/phim/:slug", async (req, res) => {
  const { slug } = req.params;
  const key = `phim-${slug}`;

  if (cache.get(key)) {
    return res.json(cache.get(key));
  }

  const response = await fetch(
    `https://phimapi.com/phim/${slug}`
  );

  const data = await response.json();
  cache.set(key, data);

  res.json(data);
});


// ================= THỂ LOẠI =================
app.get("/api/the-loai", async (req, res) => {
  const key = `the-loai`;

  if (cache.get(key)) {
    return res.json(cache.get(key));
  }

  const response = await fetch("https://phimapi.com/the-loai");
  const data = await response.json();

  cache.set(key, data);
  res.json(data);
});


app.listen(PORT, () => {
  console.log("Server chạy tại http://localhost:3000");
});