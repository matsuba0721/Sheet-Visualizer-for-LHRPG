/**
 * テーマ切り替え機能
 * ライトテーマとダークテーマを切り替える
 */

(function () {
	"use strict";

	// テーマの定数
	const THEMES = {
		LIGHT: "light",
		DARK: "dark",
	};

	const STORAGE_KEY = "lhz-supporter-theme";

	/**
	 * 現在のテーマを取得
	 * @returns {string} 'light' または 'dark'
	 */
	function getCurrentTheme() {
		const savedTheme = localStorage.getItem(STORAGE_KEY);
		if (savedTheme) {
			return savedTheme;
		}

		// システム設定を確認
		if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
			return THEMES.DARK;
		}

		return THEMES.LIGHT;
	}

	/**
	 * テーマを適用
	 * @param {string} theme - 'light' または 'dark'
	 */
	function applyTheme(theme) {
		const html = document.documentElement;

		if (theme === THEMES.DARK) {
			html.setAttribute("data-theme", "dark");
		} else {
			html.removeAttribute("data-theme");
		}

		localStorage.setItem(STORAGE_KEY, theme);
		updateToggleButton(theme);
	}

	/**
	 * テーマを切り替え
	 */
	function toggleTheme() {
		const currentTheme = getCurrentTheme();
		const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
		applyTheme(newTheme);
	}

	/**
	 * トグルボタンのアイコンを更新
	 * @param {string} theme - 現在のテーマ
	 */
	function updateToggleButton(theme) {
		const button = document.getElementById("theme-toggle");
		if (button) {
			button.textContent = theme === THEMES.DARK ? "☀️" : "🌙";
			button.setAttribute("aria-label", theme === THEMES.DARK ? "ライトテーマに切り替え" : "ダークテーマに切り替え");
		}
	}

	/**
	 * トグルボタンを作成
	 */
	function createToggleButton() {
		// 既存のボタンがあれば削除
		const existingButton = document.getElementById("theme-toggle");
		if (existingButton) {
			existingButton.remove();
		}

		const button = document.createElement("button");
		button.id = "theme-toggle";
		button.className = "theme-toggle-btn";
		button.setAttribute("type", "button");
		button.setAttribute("title", "テーマ切り替え");

		const currentTheme = getCurrentTheme();
		button.textContent = currentTheme === THEMES.DARK ? "☀️" : "🌙";
		button.setAttribute("aria-label", currentTheme === THEMES.DARK ? "ライトテーマに切り替え" : "ダークテーマに切り替え");

		button.addEventListener("click", toggleTheme);

		document.body.appendChild(button);
	}

	/**
	 * システムのテーマ設定変更を監視
	 */
	function watchSystemTheme() {
		if (window.matchMedia) {
			const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

			darkModeQuery.addEventListener("change", (e) => {
				// ユーザーが明示的にテーマを選択していない場合のみ、システム設定に従う
				const savedTheme = localStorage.getItem(STORAGE_KEY);
				if (!savedTheme) {
					applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
				}
			});
		}
	}

	/**
	 * 初期化処理
	 */
	function init() {
		// 保存されたテーマまたはシステム設定のテーマを適用
		const theme = getCurrentTheme();
		applyTheme(theme);

		// トグルボタンを作成
		createToggleButton();

		// システムテーマの変更を監視
		watchSystemTheme();
	}

	// DOMContentLoadedイベントで初期化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}

	// グローバルに公開（必要に応じて使用）
	window.ThemeToggle = {
		getCurrentTheme,
		applyTheme,
		toggleTheme,
	};
})();
