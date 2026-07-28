/* ============================================================
 *  交互逻辑 —— 一般不需要修改
 *  如需调整行为可自行编辑
 * ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 注入个人信息 ---------- */
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || "";
  };

  setText("navLogo", PROFILE.name);
  setText("heroName", PROFILE.name);
  setText("heroTagline", PROFILE.tagline);
  const heroDescEl = document.getElementById("heroDesc");
  if (heroDescEl) heroDescEl.innerHTML = (PROFILE.desc || "").replace(/\n/g, "<br>");
  setText("footerText", PROFILE.footer);

  const heroAvatar = document.getElementById("heroAvatar");
  if (heroAvatar) {
    // 如果 avatar 是 URL 或文件路径（http、./、../ 或含 / \）就用背景图，否则当 emoji
    const isPath = PROFILE.avatar && (
      /^https?:\/\//.test(PROFILE.avatar) ||
      PROFILE.avatar.includes("/") ||
      PROFILE.avatar.includes("\\")
    );
    if (isPath) {
      heroAvatar.textContent = "";
      heroAvatar.style.backgroundImage = `url('${PROFILE.avatar}')`;
      heroAvatar.style.backgroundSize = "cover";
      heroAvatar.style.backgroundPosition = "center";
      heroAvatar.style.backgroundRepeat = "no-repeat";
    } else {
      heroAvatar.style.backgroundImage = "";
      heroAvatar.style.backgroundSize = "";
      heroAvatar.style.backgroundPosition = "";
      heroAvatar.style.backgroundRepeat = "";
      heroAvatar.textContent = PROFILE.avatar || "👤";
    }
  }

  /* ---------- 注入联系方式 ---------- */
  const contactContent = document.getElementById("contactContent");
  if (contactContent) {
    contactContent.innerHTML = "";
    CONTACTS.forEach((c) => {
      const div = document.createElement("div");
      div.className = "contact-card";
      let innerHtml = `<span class="contact-icon">${c.icon}</span><h3>${c.title}</h3><p>${c.value}</p>`;
      if (c.qr) {
        innerHtml += `<img src="${c.qr}" alt="${c.title} 微信二维码" class="contact-qrcode" />`;
      }
      div.innerHTML = innerHtml;
      contactContent.appendChild(div);
    });
  }

  /* ---------- 生成项目卡片 ---------- */
  function makeCard(p) {
    const card = document.createElement("div");
    card.className = "project-card reveal";
    card.innerHTML = `
      <div class="project-card-icon">${p.icon}</div>
      <h3>${p.name}</h3>
      <p class="card-tagline">${p.tagline}</p>
      <div class="project-card-tags">
        ${(p.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}
      </div>
    `;
    card.addEventListener("click", () => openDetail(p));
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
    return card;
  }

  /* ---------- 渲染主推项目 ---------- */
  const featuredGrid = document.getElementById("featuredGrid");
  if (featuredGrid && typeof FEATURED !== "undefined") {
    FEATURED.forEach((id) => {
      const p = PROJECTS.find((x) => x.id === id);
      if (p) featuredGrid.appendChild(makeCard(p));
    });
  }

  /* ---------- 渲染全部项目（排除已主推的，避免重复） ---------- */
  const grid = document.getElementById("projectGrid");
  const featuredIds = (typeof FEATURED !== "undefined") ? FEATURED : [];
  PROJECTS.forEach((p) => {
    if (!featuredIds.includes(p.id)) grid.appendChild(makeCard(p));
  });

  /* ---------- 项目详情弹窗 ---------- */
  const detail = document.getElementById("projectDetail");
  const detailBody = document.getElementById("projectDetailBody");
  const closeBtn = document.getElementById("closeDetail");

  function openDetail(p) {
    const descHtml = (p.desc || "").split("\n").filter((s) => s.trim()).map((s) => `<p>${s}</p>`).join("");
    let html = `
      <div class="detail-header">
        <div class="detail-icon">${p.icon}</div>
        <h2 class="detail-title">${p.name}</h2>
        <p class="detail-tagline">${p.tagline}</p>
        <div class="detail-tags">
          ${(p.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
      </div>
      <div class="detail-section">
        <h4>项目介绍</h4>
        ${descHtml || '<p style="color:var(--text-dim)">暂无介绍</p>'}
      </div>
    `;
    if (!p.hideFeatures) {
      html += `
      <div class="detail-section">
        <h4>项目特点</h4>
        <ul class="detail-features">
          ${(p.features || []).map((f) => `<li>${f}</li>`).join("")}
        </ul>
      </div>
      `;
    }
    if (!p.hideMeta) {
      html += `
      <div class="detail-section">
        <h4>项目信息</h4>
        <div class="detail-meta">
          <div class="meta-item">
            <span class="meta-label">项目周期</span>
            <span class="meta-value">${p.cycle || "—"}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">项目编号</span>
            <span class="meta-value">#${String(p.id).padStart(3, "0")}</span>
          </div>
        </div>
      </div>
      `;
    }
    detailBody.innerHTML = html;
    detail.classList.add("active");
    detail.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    detail.scrollTop = 0;
  }

  function closeDetail() {
    detail.classList.remove("active");
    detail.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeDetail);
  detail.addEventListener("click", (e) => {
    if (e.target === detail) closeDetail();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && detail.classList.contains("active")) closeDetail();
  });

  /* ---------- 移动端菜单 ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  menuToggle.addEventListener("click", () => navLinks.classList.toggle("active"));

  /* ---------- 平滑滚动 ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href === "#") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = target.offsetTop - 70;
        window.scrollTo({ top, behavior: "smooth" });
        navLinks.classList.remove("active");
      }
    });
  });

  /* ---------- 滚动渐显 ---------- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  /* ---------- 返回顶部 ---------- */
  const backTop = document.getElementById("backTop");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) backTop.classList.add("visible");
    else backTop.classList.remove("visible");
  });
  backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
});
