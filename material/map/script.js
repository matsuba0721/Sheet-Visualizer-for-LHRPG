// ====== Constants & State ======
const SITE_VERSION = "0.1.0";
const CANVAS = document.getElementById("canvas");
const CTX = CANVAS.getContext("2d");
const SYSTEM_MESSAGE = document.getElementById("message");

const colsInput = document.getElementById("cols");
const rowsInput = document.getElementById("rows");
const tileSizeSelect = document.getElementById("tileSize");
const applyBtn = document.getElementById("apply");
const gridSelect = document.getElementById("grid");
const coordSelect = document.getElementById("coord");
const checkeredSelect = document.getElementById("checkered");
const centerMarkSelect = document.getElementById("centermark");
const dlBtn = document.getElementById("download");

const layersTabs = Array.from(document.getElementById("layers").children);
const chipGroupsTabs = Array.from(document.getElementById("chipGroups").children);
const paletteEl = document.getElementById("palette");

let COLS = 8;
let ROWS = 8;
let TILE = 64;
let GRID_STYLE = { width: 1, color: "#FFFFFFDD" }; // { width: px, color: hex }
let COORD_STYLE = { size: 16, color: "#FFFFFFFF" }; // { size: px, color: hex }
let CHECKERERD_STYLE = { count: 0, color: "#88888888" }; // { count: 0でチェックなし、1以上でチェックあり, color: hex }
let CENTERMARK_STYLE = { width: 1, color: "#FFFFFFDD" }; // { width: px, color: hex }
let currentLayer = "terrain"; // "background" | "overlay"
let currentChipGroup = "colors";
let currentChip = null; // { type: 'color'|'image', key, value }

let layers = {}; // { ground: { grid: [r][c] }, terrain: { grid: [r][c] }, object: { grid: [r*2][c*2] } }
// let walls = []; // [r][c] -> {top,right,bottom,left}

const IMAGE_CACHE = new Map(); // key -> HTMLImageElement

// ====== Chip Catalog ======
const COLOR_TILES = ["#FFFF66", "#FFCC66", "#FF99CC", "#FF9966", "#FF6666", "#CC66FF", "#99FF66", "#99CCFF", "#999900", "#996600", "#993300", "#990066", "#990000", "#66FFFF", "#66FFCC", "#66FF66", "#6699FF", "#669900", "#660099", "#009999", "#009900", "#006666", "#003366", "#000099"]
	.map((hex) => {
		return { hex: hex.toLowerCase(), rgb: hexToRgb(hex) };
	})
	.map((col) => {
		return { hex: col.hex, hsv: rgb2hsv(col.rgb.r, col.rgb.g, col.rgb.b) };
	})
	.sort((a, b) => {
		return a.hsv.h - b.hsv.h || a.hsv.s - b.hsv.s || a.hsv.v - b.hsv.v;
	})
	.map((col) => col.hex)
	.concat(["#FFF", "#CCC", "#999", "#666", "#333", "#000"]);
const LPC_FIELD_TILES = createChips("lpc_field_chips", 33, 6);

// カタログ構造
const CATALOG = {
	colors: COLOR_TILES.map((hex, i) => ({ type: "color", key: `color_${i}`, value: hex })),
	LPCField: LPC_FIELD_TILES.map((t) => ({ type: "image", key: `LPCField_${t.key}`, value: t.url })),
};

// ====== Utilities ======
function initGrid() {
	layers = {
		ground: { grid: Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null)) },
		terrain: { grid: Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => null)) },
		object: { grid: Array.from({ length: ROWS * 2 }, () => Array.from({ length: COLS * 2 }, () => null)) },
	};
}
// 	walls = Array.from({ length: ROWS }, () =>
// 		Array.from({ length: COLS }, () => ({
// 			top: false,
// 			right: false,
// 			bottom: false,
// 			left: false,
// 		}))
// 	);
// }

function resizeCanvas() {
	CANVAS.width = COLS * TILE;
	CANVAS.height = ROWS * TILE;
}

async function preloadImagesFor(category) {
	function fileToBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => resolve(e.target.result);
			reader.onerror = (e) => reject(e);
			reader.readAsDataURL(file);
		});
	}

	// localStorageからキャッシュ済み画像を取得
	function loadCachedImage(key) {
		const cache = localStorage.getItem(key);
		if (!cache) return null;

		const meta = JSON.parse(cache);
		if (meta.version !== SITE_VERSION) {
			// バージョンが古ければ破棄
			localStorage.removeItem(key);
			return null;
		}
		return meta.data; // Base64文字列
	}

	// localStorageに画像を保存
	function saveCachedImage(key, base64) {
		const meta = {
			version: SITE_VERSION,
			data: base64,
			timestamp: Date.now(),
		};
		localStorage.setItem(key, JSON.stringify(meta));
	}

	const items = CATALOG[category] || [];
	for (const item of items) {
		if (item.type === "image") {
			SYSTEM_MESSAGE.innerHTML = `Preloading ${items.length} images for ${category}...${items.indexOf(item) + 1}/${items.length}`;
			if (IMAGE_CACHE.has(item.key)) continue;
			let base64 = loadCachedImage(item.key);
			if (!base64) {
				const file = await fetch(item.value).then((res) => res.blob());
				base64 = await fileToBase64(file);
				saveCachedImage(item.key, base64);
			}

			const img = new Image();
			img.onload = () => {
				IMAGE_CACHE.set(item.key, img);
			};
			img.onerror = (e) => {
				console.warn("Failed to load", item.value);
			};
			img.src = base64;
			SYSTEM_MESSAGE.innerHTML = "";
		}
	}
}

function renderPalette() {
	paletteEl.innerHTML = "";
	const items = CATALOG[currentChipGroup] || [];
	items.forEach((item) => {
		const chip = document.createElement("button");
		chip.className = "chip";
		if (item.type === "color") {
			chip.style.backgroundColor = item.value;
		} else {
			chip.style.backgroundImage = `url("${item.value}")`;
		}
		chip.title = item.key;
		chip.addEventListener("click", () => {
			document.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
			chip.classList.add("selected");
			currentChip = item;
		});
		paletteEl.appendChild(chip);
	});
	// 先頭を自動選択
	const first = paletteEl.querySelector(".chip");
	if (first) {
		first.click();
	}
}

function draw(dl = false) {
	function drawCheckboard() {
		CTX.fillStyle = "#8888";
		const tile = TILE / CHECKERERD_STYLE.count;
		for (let x = 0; x < CANVAS.width / tile; x++) {
			for (let y = 0; y < CANVAS.height / tile; y++) {
				if ((x + y) % 2) {
					CTX.fillRect(x * tile, y * tile, tile, tile);
				}
			}
		}
	}
	function drawCells(grid, rows, cols, tile) {
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const x = c * tile,
					y = r * tile;
				const cell = grid[r][c];
				if (!cell) continue;
				if (cell.type === "color") {
					CTX.fillStyle = cell.value;
					CTX.fillRect(x, y, tile, tile);
				} else if (cell.type === "image") {
					const img = IMAGE_CACHE.get(cell.key);
					if (img) {
						CTX.drawImage(img, x, y, tile, tile);
					} else {
						// ロード中プレース
						CTX.fillStyle = "#222a45";
						CTX.fillRect(x, y, tile, tile);
					}
				}
			}
		}
	}
	function drawGridLines(rows, cols, tile) {
		CTX.lineWidth = GRID_STYLE.width;
		CTX.strokeStyle = GRID_STYLE.color;
		CTX.setLineDash([5, 5]);
		for (let r = 1; r <= rows; r++) {
			CTX.beginPath();
			CTX.moveTo(0, r * tile + 0.5);
			CTX.lineTo(cols * tile, r * tile + 0.5);
			CTX.stroke();
		}
		for (let c = 1; c <= cols; c++) {
			CTX.beginPath();
			CTX.moveTo(c * tile + 0.5, 0);
			CTX.lineTo(c * tile + 0.5, rows * tile);
			CTX.stroke();
		}
		CTX.setLineDash([]);
	}
	function drawCoordinates(rows, cols, tile) {
		CTX.font = `${COORD_STYLE.size}px Arial`;
		CTX.fillStyle = COORD_STYLE.color;
		CTX.textAlign = "left";
		CTX.textBaseline = "top";
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const x = c * tile,
					y = r * tile;
				const label = String.fromCharCode(65 + c) + (r + 1);
				CTX.fillText(label, x + TILE / 10, y + TILE / 10);
			}
		}
	}
	function drawCenterMark(rows, cols, tile) {
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const x = c * tile,
					y = r * tile;
				CTX.lineWidth = CENTERMARK_STYLE.width;
				CTX.strokeStyle = CENTERMARK_STYLE.color;
				CTX.beginPath();
				CTX.moveTo(x + (tile * 3) / 8, y + tile / 2);
				CTX.lineTo(x + (tile * 5) / 8, y + tile / 2);
				CTX.moveTo(x + tile / 2, y + (tile * 3) / 8);
				CTX.lineTo(x + tile / 2, y + (tile * 5) / 8);
				CTX.stroke();
			}
		}
	}

	CTX.clearRect(0, 0, CANVAS.width, CANVAS.height);
	if (!dl) {
		CTX.fillStyle = "#1a2245";
		CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
	}
	if (CHECKERERD_STYLE.count > 0) {
		drawCheckboard();
	}
	drawCells(layers.ground.grid, ROWS, COLS, TILE);
	drawCells(layers.terrain.grid, ROWS, COLS, TILE);
	drawCells(layers.object.grid, ROWS * 2, COLS * 2, TILE / 2);
	if (GRID_STYLE.width > 0) {
		drawGridLines(ROWS, COLS, TILE);
	}
	if (COORD_STYLE.size > 0) {
		drawCoordinates(ROWS, COLS, TILE);
	}
	if (CENTERMARK_STYLE.width > 0) {
		drawCenterMark(ROWS, COLS, TILE);
	}
}

// ====== Interaction ======
function cellFromEvent(e) {
	const rect = CANVAS.getBoundingClientRect();
	const tile = rect.width / COLS;
	const miniTile = rect.width / (COLS * 2);
	const px = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
	const py = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
	const c = Math.floor(px / tile);
	const r = Math.floor(py / tile);
	const dc = Math.floor(px / miniTile);
	const dr = Math.floor(py / miniTile);
	const lx = px - c * tile; // local x
	const ly = py - r * tile; // local y
	return { r, c, dr, dc };
}

// function toggleWallByLocal(r, c, lx, ly) {
// 	const band = Math.max(10, TILE * 0); // クリックしやすい帯
// 	if (ly < band) {
// 		walls[r][c].top = !walls[r][c].top;
// 		return true;
// 	}
// 	if (ly > TILE - band) {
// 		walls[r][c].bottom = !walls[r][c].bottom;
// 		return true;
// 	}
// 	if (lx < band) {
// 		walls[r][c].left = !walls[r][c].left;
// 		return true;
// 	}
// 	if (lx > TILE - band) {
// 		walls[r][c].right = !walls[r][c].right;
// 		return true;
// 	}
// 	return false;
// }

CANVAS.addEventListener("click", (e) => {
	const { r, c, dr, dc } = cellFromEvent(e);
	if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
	const layer = layers[currentLayer];
	if (!layer) return;
	const grid = layer.grid;
	if (currentChip) {
		if (currentLayer === "ground" || currentLayer === "terrain") {
			grid[r][c] = { ...currentChip };
			draw();
		} else if (currentLayer === "object") {
			grid[dr][dc] = { ...currentChip };
			draw();
		}
	}
});

CANVAS.addEventListener("contextmenu", (e) => {
	e.preventDefault();
	const { r, c, dr, dc } = cellFromEvent(e);
	if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
	const layer = layers[currentLayer];
	const grid = layer.grid;
	if (!layer) return;
	if (currentLayer === "ground" || currentLayer === "terrain") {
		grid[r][c] = null;
		draw();
	} else if (currentLayer === "object") {
		grid[dr][dc] = null;
		draw();
	}
});

// ====== Controls ======
layersTabs.forEach((btn) => {
	btn.addEventListener("click", async () => {
		layersTabs.forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		currentLayer = btn.dataset.layer;
	});
});

chipGroupsTabs.forEach((btn) => {
	btn.addEventListener("click", async () => {
		chipGroupsTabs.forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		currentChipGroup = btn.dataset.tips;
		renderPalette();
	});
});

applyBtn.addEventListener("click", () => {
	COLS = Math.max(1, Math.min(50, parseInt(colsInput.value || "8", 10)));
	ROWS = Math.max(1, Math.min(50, parseInt(rowsInput.value || "8", 10)));
	TILE = parseInt(tileSizeSelect.value, 10);
	resizeCanvas();
	initGrid();
	draw();
});

gridSelect.addEventListener("change", () => {
	const style = gridSelect.value || "0 #FFFFFF";
	const [width, color] = style.split(" ");
	GRID_STYLE = { width: parseInt(width, 0), color: color || "#FFFFFF" };
	draw();
});
coordSelect.addEventListener("change", () => {
	const style = coordSelect.value || "0 #FFFFFF";
	const [size, color] = style.split(" ");
	COORD_STYLE = { size: parseInt(size, 0), color: color || "#FFFFFF" };
	draw();
});
checkeredSelect.addEventListener("change", () => {
	const style = checkeredSelect.value || "0 #FFFFFF";
	const [width, color] = style.split(" ");
	CHECKERERD_STYLE = { count: parseInt(width, 0), color: color || "#FFFFFF" };
	draw();
});
centerMarkSelect.addEventListener("change", () => {
	const style = centerMarkSelect.value || "0 #FFFFFF";
	const [width, color] = style.split(" ");
	CENTERMARK_STYLE = { width: parseInt(width, 0), color: color || "#FFFFFF" };
	draw();
});

dlBtn.addEventListener("click", () => {
	const a = document.createElement("a");
	a.download = `map_${COLS}x${ROWS}.png`;
	draw((dl = true));
	a.href = CANVAS.toDataURL("image/png");
	a.click();
	draw();
});

// ====== Boot ======
(function boot() {
	COLS = parseInt(colsInput.value, 10);
	ROWS = parseInt(rowsInput.value, 10);
	TILE = parseInt(tileSizeSelect.value, 10);
	resizeCanvas();
	initGrid();
	// 先に単色は即時、他カテゴリはパレット切替時にプリロード
	renderPalette();
	draw();
	preloadImagesFor("LPCField");
})();

// ====== Load ======
function hexToRgb(hex) {
	const hexValue = hex.replace("#", "");
	const isOmit = hexValue.length === 3; // #fffなどの省略記法か

	const [r, g, b] = hexValue.match(isOmit ? /./g : /.{2}/g).map((s) => parseInt(isOmit ? s.repeat(2) : s, 16));
	return { r, g, b };
}
function rgb2hsv(r, g, b) {
	// 引数処理
	let tmp = [r, g, b];
	if (r !== void 0 && g === void 0) {
		const cc = parseInt(
			r
				.toString()
				.replace(/[^\da-f]/gi, "")
				.replace(/^(.)(.)(.)$/, "$1$1$2$2$3$3"),
			16
		);
		tmp = [(cc >> 16) & 0xff, (cc >> 8) & 0xff, cc & 0xff];
	} else {
		for (let i in tmp) tmp[i] = Math.max(0, Math.min(255, Math.floor(tmp[i])));
	}
	[r, g, b] = tmp;

	// RGB to HSV 変換
	const v = Math.max(r, g, b),
		d = v - Math.min(r, g, b),
		s = v ? d / v : 0,
		a = [r, g, b, r, g],
		i = a.indexOf(v),
		h = s ? (((a[i + 1] - a[i + 2]) / d + i * 2 + 6) % 6) * 60 : 0;

	// 戻り値
	return { h, s, v: v / 255 };
}
function createChips(name, r, c) {
	const chips = [];
	for (let y = 1; y <= r; y++) {
		for (let x = 1; x <= c; x++) {
			chips.push({ key: `${name}_${y}${x}`, url: `tileset/${name}/image_(${y}-${x}).png` });
		}
	}
	return chips;
}
