// This function talks directly to NASA's public servers
async function fetchSpaceData() {
    const url = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`NASA responded with status ${response.status}`);
        }
        const data = await response.json();

        document.getElementById("image-title").innerText = data.title;
        document.getElementById("image-explanation").innerText = data.explanation;

        const img = document.getElementById("space-pic");
        if (data.media_type === "image") {
            img.src = data.hdurl || data.url;
            img.style.display = "";
        } else {
            img.style.display = "none";
            const link = document.createElement("a");
            link.href = data.url;
            link.innerText = "Watch today's video on NASA's site";
            link.style.color = "lightblue";
            document.getElementById("image-explanation").before(link);
        }
    } catch (error) {
        console.log("Error launching connection:", error);
        document.getElementById("image-title").innerText = "Couldn't load today's picture. Please try again later.";
    }
}

const grid = document.getElementById("gallery-grid");
const lightbox = document.getElementById("lightbox");

async function searchNASA(query) {
    grid.innerHTML = "<p>Searching the NASA archive...</p>";
    try {
        const response = await fetch(
            `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=24`
        );
        if (!response.ok) {
            throw new Error(`NASA library responded with status ${response.status}`);
        }
        const data = await response.json();
        const items = data.collection.items;

        if (!items.length) {
            grid.innerHTML = "<p>No images found. Try a different search.</p>";
            return;
        }

        grid.innerHTML = "";
        for (const item of items) {
            const info = item.data[0];
            const thumb = item.links && item.links[0] && item.links[0].href;
            if (!thumb) continue;

            const figure = document.createElement("figure");
            const img = document.createElement("img");
            img.src = thumb;
            img.alt = info.title || "NASA image";
            const caption = document.createElement("figcaption");
            caption.innerText = info.title || "";
            figure.append(img, caption);

            figure.addEventListener("click", () => openLightbox(item.href, info.title));
            grid.appendChild(figure);
        }
    } catch (error) {
        console.log("Gallery search failed:", error);
        grid.innerHTML = "<p>Couldn't reach the NASA library. Please try again later.</p>";
    }
}

async function openLightbox(manifestUrl, title) {
    lightbox.style.display = "block";
    document.getElementById("lightbox-caption").innerText = title || "";
    const lightboxImg = document.getElementById("lightbox-img");
    lightboxImg.src = "";
    try {
        const assets = await (await fetch(manifestUrl)).json();
        const full = assets.find(u => u.includes("~orig."))
            || assets.find(u => /\.(jpe?g|png)(\?|$)/i.test(u));
        if (full) lightboxImg.src = full;
    } catch (error) {
        console.log("Couldn't load full image:", error);
        lightbox.style.display = "none";
    }
}

document.querySelector("#lightbox .close").addEventListener("click", () => {
    lightbox.style.display = "none";
});
lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.style.display = "none";
});

document.getElementById("search-btn").addEventListener("click", () => {
    const query = document.getElementById("search-box").value.trim();
    if (query) searchNASA(query);
});
document.getElementById("search-box").addEventListener("keydown", (event) => {
    if (event.key === "Enter") document.getElementById("search-btn").click();
});

fetchSpaceData();
searchNASA("nebula");
