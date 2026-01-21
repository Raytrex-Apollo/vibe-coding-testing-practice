---
description: LoginPage 測試案例
---

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限、副作用校驗

---

## [x] 【前端元素】渲染基本登入表單
**範例輸入**：無
**期待輸出**：頁面應包含 Email 輸入框、密碼輸入框、登入按鈕及「歡迎回來」標題。

---

## [x] 【function 邏輯】Email 格式校驗
**範例輸入**：Email 輸入 "invalid-email"
**期待輸出**：顯示「請輸入有效的 Email 格式」錯誤訊息。

---

## [x] 【function 邏輯】密碼長度校驗
**範例輸入**：密碼輸入 "short"
**期待輸出**：顯示「密碼必須至少 8 個字元」錯誤訊息。

---

## [x] 【function 邏輯】密碼組成校驗
**範例輸入**：密碼輸入 "12345678" (無字母) 或 "abcdefgh" (無數字)
**期待輸出**：顯示「密碼必須包含英文字母和數字」錯誤訊息。

---

## [x] 【Mock API】登入成功跳轉
**範例輸入**：輸入正確的 Email 與密碼，點擊登入
**期待輸出**：呼叫 login API 成功後，導向至 `/dashboard`。

---

## [x] 【Mock API】登入失敗顯示訊息
**範例輸入**：輸入錯誤的憑據，API 回傳 401 與錯誤訊息 "Invalid credentials"
**期待輸出**：頁面顯示 "Invalid credentials" 錯誤橫幅。

---

## [x] 【驗證權限】已登入自動跳轉
**範例輸入**：使用者已處於 `isAuthenticated = true` 狀態
**期待輸出**：進入 LoginPage 時應自動 navigate 到 `/dashboard`。

---

## [x] 【副作用校驗】顯示 Session 過期訊息
**範例輸入**：`authExpiredMessage` 有值
**期待輸出**：頁面顯示該過期訊息，並隨後調用 `clearAuthExpiredMessage`。
