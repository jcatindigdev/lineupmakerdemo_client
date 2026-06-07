const { createApp } = Vue;

const API_BASE = "https://lineupmakerdemo-server.onrender.com/api";

createApp({
  data() {
    return {
      activeTab: "library",

      alert: { message: "", type: "success" },

      contentItems: [],
      loading: false,
      searchQuery: "",
      categoryFilter: "",
      currentPage: 1,
      totalPages: 1,
      searchDebounce: null,

      selectedItems: [],

      form: {
        title: "",
        body: "",
        author: "",
        category: "", 
        tags: "",
        fileType: "", 
      },
      uploading: false,

      pdfSettings: {
        title: "",
        author: "",
        includeMetadata: true,
      },
      generating: false,
      previewData: [],

      dragIndex: null,
      dragTargetIndex: null,
      user: null, 

      loginForm: {
        email: "",
        password: "",
      },

      registerForm: {
        username: "",
        email: "",
        password: "",
      },

      editForm: {
        _id: "",
        title: "",
        body: "",
        author: "",
        category: "",  
        tags: ""
      },
      updating: false,
    };
  },

  computed: {
    isAdminUser() {
      return this.user && this.user.isAdmin === true;
    }
  },

  watch: {
    categoryFilter() {
      this.fetchContent(1);
    }
  },

  mounted() {
    this.fetchContent();
    this.checkAuth();
  },

  methods: {

    getToken() {
      return localStorage.getItem("token");
    },

    async checkAuth() {
      const token = this.getToken();

      if (!token) return;

      try {
        const res = await fetch(
          `${API_BASE}/auth/me`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data.success) {
          this.user = data.user;
        } else {
          localStorage.removeItem("token");
          this.user = null;
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      }
    },

    logout() {
      localStorage.removeItem("token");
      this.user = null;
      this.showAlert("Logged out.");
    },

    async register() {
      try {
        const res = await fetch(
          `${API_BASE}/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.registerForm),
          }
        );

        const data = await res.json();

        if (data.success) {
          this.showAlert("Account created successfully.");

          const modalEl = document.getElementById("registerModal");
          if (modalEl) {
            bootstrap.Modal
              .getOrCreateInstance(modalEl)
              .hide();
          }

          this.registerForm = {
            username: "",
            email: "",
            password: "",
          };
        } else {
          this.showAlert(data.message, "danger");
        }
      } catch {
        this.showAlert("Registration failed.", "danger");
      }
    },

    async login() {
      try {
        const res = await fetch(
          `${API_BASE}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.loginForm),
          }
        );

        const data = await res.json();

        if (data.success) {
          localStorage.setItem("token", data.token);

          this.user = data.user;

          const modalEl = document.getElementById("loginModal");
          if (modalEl) {
            bootstrap.Modal
              .getOrCreateInstance(modalEl)
              .hide();
          }

          this.showAlert("Login successful.");
          
          this.loginForm = { email: "", password: "" };
        } else {
          this.showAlert(data.message, "danger");
        }
      } catch {
        this.showAlert("Login failed.", "danger");
      }
    },

    showAlert(message, type = "success") {
      this.alert = { message, type };
      setTimeout(() => (this.alert.message = ""), 4000);
    },

    truncate(text, len) {
      if (!text) return "";
      return text.length > len ? text.slice(0, len) + "…" : text;
    },

    formatDate(dateStr) {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    },

    async fetchContent(page = 1) {
      this.loading = true;
      try {
        const params = new URLSearchParams({ page, limit: 12 });
        if (this.searchQuery.trim()) params.append("search", this.searchQuery.trim());
        if (this.categoryFilter.trim()) params.append("category", this.categoryFilter.trim());

        const res = await fetch(`${API_BASE}/content?${params}`);
        const data = await res.json();

        if (data.success) {
          this.contentItems = data.data;
          this.totalPages = data.totalPages;
          this.currentPage = data.page;
        } else {
          this.showAlert(data.message || "Failed to load content.", "danger");
        }
      } catch (err) {
        this.showAlert("Cannot reach the server. Is the backend running?", "danger");
      } finally {
        this.loading = false;
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => this.fetchContent(1), 350);
    },

    clearSearch() {
      this.searchQuery = "";
      this.categoryFilter = "";
      this.fetchContent(1);
    },

    goToPage(p) {
      if (p < 1 || p > this.totalPages) return;
      this.fetchContent(p);
    },

    isSelected(id) {
      return this.selectedItems.some((i) => i._id === id);
    },

    toggleSelect(item) {
      const idx = this.selectedItems.findIndex((i) => i._id === item._id);
      if (idx === -1) {
        this.selectedItems.push({ ...item });
      } else {
        this.selectedItems.splice(idx, 1);
      }
    },

    clearSelection() {
      this.selectedItems = [];
    },

    async deleteItem(id) {
      if (!confirm("Delete this content item? This cannot be undone.")) return;
      try {
        const res = await fetch(
          `${API_BASE}/content/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${this.getToken()}`
            }
          }
        );
        const data = await res.json();
        if (data.success) {
          this.showAlert("Item deleted.");
          this.contentItems = this.contentItems.filter((i) => i._id !== id);
          this.selectedItems = this.selectedItems.filter((i) => i._id !== id);
        } else {
          this.showAlert(data.message, "danger");
        }
      } catch {
        this.showAlert("Delete failed.", "danger");
      }
    },

    openEditModal(item) {
      this.editForm = {
        _id: item._id,
        title: item.title,
        body: item.body,
        author: item.author || "",
        category: item.category || "", // Correctly loads existing "Mass" or "Worship" values into dropdown
        tags: Array.isArray(item.tags) ? item.tags.join(", ") : ""
      };

      const modalEl = document.getElementById("editModal");
      if (modalEl) {
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
      }
    },

    async updateContent() {
      if (!this.editForm.title.trim() || !this.editForm.body.trim() || !this.editForm.category) {
        this.showAlert("Title, body, and category selection are required fields.", "danger");
        return;
      }

      this.updating = true;

      try {
        const formattedTags = this.editForm.tags
          .split(",")
          .map(t => t.trim())
          .filter(Boolean);

        const payload = {
          title: this.editForm.title.trim(),
          body: this.editForm.body.trim(),
          author: this.editForm.author.trim() || "Anonymous",
          category: this.editForm.category, // Standard string reference passed down securely from choice mapping selection
          tags: formattedTags
        };

        const res = await fetch(`${API_BASE}/content/${this.editForm._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.getToken()}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
          this.showAlert("Song details updated successfully!");

          const modalEl = document.getElementById("editModal");
          if (modalEl) {
            bootstrap.Modal.getOrCreateInstance(modalEl).hide();
          }

          this.fetchContent(this.currentPage);
        } else {
          this.showAlert(data.message || "Failed to edit song.", "danger");
        }
      } catch (error) {
        console.error("Updating system failure:", error);
        this.showAlert("Failed to connect to the server.", "danger");
      } finally {
        this.updating = false;
      }
    },

    async uploadContent() {
      // Enforce selection tracking checks prior to transmission dispatch methods
      if (!this.form.title.trim() || !this.form.body.trim() || !this.form.category || !this.form.fileType) {
        this.showAlert("Title, body, category, and content type are required.", "danger");
        return;
      }
      this.uploading = true;
      try {
        const payload = {
          title: this.form.title.trim(),
          body: this.form.body.trim(),
          author: this.form.author.trim() || "Anonymous",
          category: this.form.category,
          tags: this.form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          fileType: this.form.fileType,
        };

        const res = await fetch(`${API_BASE}/content`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.success) {
          this.showAlert("Content saved to database!");
          this.resetForm();
          this.activeTab = "library";
          this.fetchContent(1);
        } else {
          this.showAlert(data.message || "Failed to save.", "danger");
        }
      } catch {
        this.showAlert("Upload failed. Check server connection.", "danger");
      } finally {
        this.uploading = false;
      }
    },

    resetForm() {
      this.form = { 
        title: "", 
        body: "", 
        author: "", 
        category: "",
        tags: "", 
        fileType: ""
      };
    },

    moveItem(from, to) {
      const arr = [...this.selectedItems];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      this.selectedItems = arr;
      this.previewData = [];
    },

    removeFromBuilder(idx) {
      this.selectedItems.splice(idx, 1);
      this.previewData = [];
    },

    dragStart(idx) {
      this.dragIndex = idx;
    },

    dragOver(idx) {
      if (this.dragIndex === null || this.dragIndex === idx) return;
      this.dragTargetIndex = idx;
      const arr = [...this.selectedItems];
      const [item] = arr.splice(this.dragIndex, 1);
      arr.splice(idx, 0, item);
      this.selectedItems = arr;
      this.dragIndex = idx;
    },

    dragEnd() {
      this.dragIndex = null;
      this.dragTargetIndex = null;
      this.previewData = [];
    },

    async previewPDF() {
      if (this.selectedItems.length === 0) return;

      const docTitle = this.pdfSettings.title || "My Document";
      const docAuthor = this.pdfSettings.author || "";
      const includeMeta = this.pdfSettings.includeMetadata;
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });

      const coverHTML = `
        <div class="preview-cover">
          <div class="preview-cover__title">${docTitle}</div>
          ${docAuthor ? `<div class="preview-cover__author">by ${docAuthor}</div>` : ""}
          <div class="preview-cover__date">${date}</div>
          <div class="preview-cover__count">${this.selectedItems.length} section${this.selectedItems.length !== 1 ? "s" : ""}</div>
        </div>`;

      const tocHTML = `
        <div class="preview-toc">
          <div class="preview-toc__title">Table of Contents</div>
          <hr class="preview-toc__divider"/>
          <ul class="preview-toc__list">
            ${this.selectedItems.map((item, idx) => `
              <li class="preview-toc__item">
                <span><span class="preview-toc__num">${idx + 1}.</span>
                <span class="preview-toc__item-title">${item.title}</span></span>
                <span class="preview-toc__item-cat">${item.category || ""}</span>
              </li>`).join("")}
          </ul>
        </div>`;

      const pagesHTML = this.selectedItems.map((item, idx) => `
        <div class="preview-page">
          <div class="preview-page__bar"></div>
          <div class="preview-page__inner">
            <div class="preview-page__header">
              <div class="preview-page__badge">${idx + 1}</div>
              <div class="preview-page__title">${item.title}</div>
            </div>
            ${includeMeta ? `<div class="preview-page__meta">
              ${item.author && item.author !== "Anonymous" ? `<span>Author: ${item.author}</span>` : ""}
              ${item.category ? `<span>Category: ${item.category}</span>` : ""}
              ${item.tags && item.tags.length ? `<span>Tags: ${item.tags.join(", ")}</span>` : ""}
            </div>` : ""}
            <hr class="preview-page__divider"/>
            <div class="preview-page__body">${item.body}</div>
          </div>
          <div class="preview-page__footer">
            ${docTitle} &mdash; Section ${idx + 1} of ${this.selectedItems.length}
          </div>
        </div>`).join("");

      document.getElementById("preview-document").innerHTML = `
        <style>
          #preview-document { background: #d8d8d8; padding: 28px; font-family: Georgia, serif; }
          .preview-cover {
            background: #1a1a2e; color: #e8d5b7;
            min-height: 420px; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 48px; margin-bottom: 20px; border-radius: 4px;
            text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.18);
          }
          .preview-cover__title { font-size: 30px; font-weight: 700; margin-bottom: 14px; line-height: 1.2; }
          .preview-cover__author { font-size: 14px; color: #a09080; margin-bottom: 10px; font-style: italic; }
          .preview-cover__date { font-size: 12px; color: #706050; margin-bottom: 4px; }
          .preview-cover__count { font-size: 11px; color: #504030; }
          .preview-toc {
            background: white; padding: 40px 52px 36px; margin-bottom: 20px;
            border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          }
          .preview-toc__title { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 14px; }
          .preview-toc__divider { border: none; border-top: 1.5px solid #c9a96e; margin-bottom: 16px; }
          .preview-toc__list { list-style: none; padding: 0; margin: 0; }
          .preview-toc__item { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
          .preview-toc__item:last-child { border-bottom: none; }
          .preview-toc__num { color: #c9a96e; font-weight: 700; margin-right: 10px; min-width: 20px; }
          .preview-toc__item-title { font-weight: 500; flex: 1; }
          .preview-toc__item-cat { font-size: 11px; color: #888; background: #f5f5f5; padding: 2px 9px; border-radius: 999px; margin-left: 8px; }
          .preview-page {
            background: white; padding: 0 0 56px 0;
            margin-bottom: 20px; border-radius: 4px;
            position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.10);
            overflow: hidden;
          }
          .preview-page__bar { height: 7px; background: #c9a96e; width: 100%; }
          .preview-page__inner { padding: 24px 52px 0; }
          .preview-page__header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 6px; }
          .preview-page__badge { width: 30px; height: 30px; background: #1a1a2e; color: #e8d5b7; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
          .preview-page__title { font-size: 20px; font-weight: 700; color: #1a1a2e; line-height: 1.3; }
          .preview-page__meta { font-size: 11px; color: #999; display: flex; gap: 14px; flex-wrap: wrap; margin: 4px 0 10px 44px; }
          .preview-page__divider { border: none; border-top: 1px solid #e8e0d8; margin: 10px 0 16px; }
          .preview-page__body { font-size: 13px; color: #2c2c2c; line-height: 1.85; white-space: pre-wrap; }
          .preview-page__footer {
            position: absolute; bottom: 0; left: 0; right: 0;
            padding: 10px 52px; font-size: 10px; color: #bbb;
            text-align: center; border-top: 1px solid #f0f0f0;
            background: white;
          }
        </style>
        ${coverHTML}
        ${tocHTML}
        ${pagesHTML}
      `;

      this.previewData = this.selectedItems.map((item, idx) => ({
        order: idx + 1,
        id: item._id,
        title: item.title,
        category: item.category,
      }));

      const modalEl = document.getElementById("previewModal");
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    },

    async generatePDF() {
      if (!this.user) {
        this.showAlert("Authentication required to download PDFs.", "danger");
        return; 
      }
      if (this.selectedItems.length === 0) {
        this.showAlert("Add at least one item to the builder.", "danger");
        return;
      }
      this.generating = true;
      try {
        const payload = {
          items: this.selectedItems.map((item, idx) => ({ id: item._id, order: idx })),
          title: this.pdfSettings.title || "My Document",
          author: this.pdfSettings.author || "",
          includeMetadata: this.pdfSettings.includeMetadata,
        };

        const res = await fetch(`${API_BASE}/pdf/generate`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getToken()}`
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "PDF generation failed.");
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const filename =
          (this.pdfSettings.title || "document").replace(/[^a-z0-9_\-]/gi, "_") + ".pdf";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showAlert("PDF downloaded successfully!");
      } catch (err) {
        this.showAlert(err.message || "PDF generation failed.", "danger");
      } finally {
        this.generating = false;
      }
    },
    
  },

}).mount("#app");