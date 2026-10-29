(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
  const prettyDate = (value) => {
    if (!value) return "Date not set";
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };
  const prettyTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  };

  let client = null;
  let posts = [];
  let activeFilter = "all";
  let currentUser = null;
  const replyCache = new Map();
  const busyReplies = new Set();

  function showStatus(message, type = "info") {
    const node = $("#community-status");
    if (!node) return;
    node.textContent = message;
    node.className = `community-status ${type}`;
    node.hidden = !message;
  }

  function currentDisplayName(user) {
    return String(
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Traveller"
    ).trim().slice(0, 80) || "Traveller";
  }

  function initDestinationOptions() {
    const stateSelect = $("#post-state");
    const destinationSelect = $("#post-destination");
    const states = typeof STATES !== "undefined" && Array.isArray(STATES) ? STATES : [
      "Arunachal Pradesh", "Assam", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura",
    ];
    const places = typeof DESTINATION_CATALOG !== "undefined" && Array.isArray(DESTINATION_CATALOG) ? DESTINATION_CATALOG : [];
    stateSelect.insertAdjacentHTML("beforeend", states.map((state) => `<option value="${escapeHTML(state)}">${escapeHTML(state)}</option>`).join(""));
    destinationSelect.insertAdjacentHTML("beforeend", places.map((place) => `<option value="${escapeHTML(place.place)}" data-state="${escapeHTML(place.state)}">${escapeHTML(place.place)}</option>`).join(""));
    stateSelect.addEventListener("change", () => {
      [...destinationSelect.options].forEach((option) => {
        if (!option.value) return;
        option.hidden = !!stateSelect.value && option.dataset.state !== stateSelect.value;
      });
      if (destinationSelect.selectedOptions[0]?.hidden) destinationSelect.value = "";
    });
  }

  function applyBuddyFields() {
    const isBuddy = $("#post-type").value === "buddy";
    $("#buddy-fields").hidden = !isBuddy;
    $("#post-date").required = isBuddy;
    $("#post-level").required = isBuddy;
    $("#post-title").placeholder = isBuddy
      ? "e.g. Looking for two trekkers for Dzükou Valley"
      : $("#post-type").value === "tip"
        ? "e.g. What I wish I knew before the trek"
        : "e.g. Is this trail manageable for beginners?";
  }

  function countsByPost(replies) {
    const counts = new Map();
    (replies || []).forEach((reply) => counts.set(reply.post_id, (counts.get(reply.post_id) || 0) + 1));
    return counts;
  }

  function renderPosts() {
    const container = $("#community-posts");
    const query = $("#community-search").value.trim().toLowerCase();
    const filtered = posts.filter((post) => {
      if (activeFilter !== "all" && post.post_type !== activeFilter) return false;
      const haystack = [post.title, post.body, post.state, post.destination, post.author_name, post.post_type].join(" ").toLowerCase();
      return !query || haystack.includes(query);
    });
    if (!filtered.length) {
      container.innerHTML = `<div class="community-empty"><span aria-hidden="true">✳</span><h3>No discussions match that filter yet</h3><p>Try another filter or start the first useful conversation for this trail.</p></div>`;
      return;
    }
    container.innerHTML = filtered.map((post) => {
      const typeLabels = { question: "Question", tip: "Trail tip", buddy: "Trek buddy" };
      const typeIcons = { question: "?", tip: "↗", buddy: "♧" };
      const replyCount = Number(post.reply_count || 0);
      const details = [post.destination, post.state, post.post_type === "buddy" && post.travel_date ? `Trek date: ${prettyDate(post.travel_date)}` : "", post.post_type === "buddy" && post.experience_level ? post.experience_level : ""].filter(Boolean);
      return `<article class="community-post" data-post-id="${escapeHTML(post.id)}">
        <div class="community-post-top"><span class="community-kind kind-${escapeHTML(post.post_type)}"><b aria-hidden="true">${typeIcons[post.post_type] || "•"}</b>${typeLabels[post.post_type] || "Discussion"}</span><time datetime="${escapeHTML(post.created_at || "")}">${prettyTime(post.created_at)}</time></div>
        <h3>${escapeHTML(post.title)}</h3>
        <p class="community-post-body">${escapeHTML(post.body).replace(/\n/g, "<br>")}</p>
        ${details.length ? `<div class="community-post-tags">${details.map((detail) => `<span>${escapeHTML(detail)}</span>`).join("")}</div>` : ""}
        <div class="community-post-footer"><span class="community-author"><span class="community-author-avatar" aria-hidden="true">${escapeHTML(currentInitials(post.author_name))}</span> ${escapeHTML(post.author_name || "Traveller")}</span><button type="button" class="community-reply-toggle" data-action="replies" data-id="${escapeHTML(post.id)}">${replyCount} ${replyCount === 1 ? "reply" : "replies"} <span aria-hidden="true">⌄</span></button></div>
        <div class="community-reply-panel" id="reply-panel-${escapeHTML(post.id)}" hidden></div>
      </article>`;
    }).join("");
  }

  function currentInitials(value) {
    return String(value || "Traveller").trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "T";
  }

  function renderReplies(postId, rows) {
    const panel = $(`#reply-panel-${CSS.escape(postId)}`);
    if (!panel) return;
    const replyMarkup = rows.length ? rows.map((reply) => `<div class="community-reply"><span class="community-reply-avatar" aria-hidden="true">${escapeHTML(currentInitials(reply.author_name))}</span><div><p><b>${escapeHTML(reply.author_name || "Traveller")}</b><small>${prettyTime(reply.created_at)}</small></p><div>${escapeHTML(reply.body).replace(/\n/g, "<br>")}</div></div></div>`).join("") : `<p class="community-no-replies">No replies yet. Add a thoughtful answer or ask for more details.</p>`;
    const formMarkup = currentUser ? `<form class="community-reply-form" data-reply-form="${escapeHTML(postId)}"><label class="sr-only" for="reply-text-${escapeHTML(postId)}">Your reply</label><textarea id="reply-text-${escapeHTML(postId)}" name="body" rows="2" maxlength="1500" required placeholder="Write a helpful reply…"></textarea><button class="btn sm" type="submit">Reply</button></form>` : `<p class="community-login-reply"><a href="login.html">Log in</a> to reply to this post.</p>`;
    panel.innerHTML = `<div class="community-replies-list">${replyMarkup}</div>${formMarkup}`;
    panel.hidden = false;
  }

  async function loadReplies(postId, panel) {
    panel.hidden = false;
    panel.innerHTML = `<p class="community-no-replies">Loading replies…</p>`;
    if (replyCache.has(postId)) {
      renderReplies(postId, replyCache.get(postId));
      return;
    }
    const { data, error } = await client.from("community_replies").select("id,post_id,author_id,author_name,body,created_at").eq("post_id", postId).order("created_at", { ascending: true });
    if (error) {
      panel.innerHTML = `<p class="community-no-replies">Replies could not load. Check the community table migration and permissions.</p>`;
      return;
    }
    replyCache.set(postId, Array.isArray(data) ? data : []);
    renderReplies(postId, replyCache.get(postId));
  }

  async function refreshPosts() {
    if (!client) {
      showStatus("Community sharing is not connected. Confirm the Supabase URL/key in supabase-config.js, then run the included supabase-upgrade.sql migration.", "warning");
      $("#community-posts").innerHTML = "";
      return;
    }
    showStatus("Loading community posts…");
    const { data, error } = await client.from("community_posts").select("id,author_id,author_name,post_type,title,body,state,destination,travel_date,experience_level,created_at").eq("is_hidden", false).order("created_at", { ascending: false }).limit(100);
    if (error) {
      console.warn("Community posts could not load:", error.message);
      showStatus("The community tables are not ready yet. Run the updated supabase-upgrade.sql file in Supabase SQL Editor, then refresh this page.", "warning");
      $("#community-posts").innerHTML = "";
      return;
    }
    const nextPosts = Array.isArray(data) ? data : [];
    const { data: replyRows, error: replyError } = await client.from("community_replies").select("post_id");
    const counts = replyError ? new Map() : countsByPost(replyRows);
    posts = nextPosts.map((post) => ({ ...post, reply_count: counts.get(post.id) || 0 }));
    showStatus(posts.length ? `${posts.length} recent discussion${posts.length === 1 ? "" : "s"} · posts are public, posting requires an account.` : "No discussions yet. Start the first one and help another traveller plan better.", posts.length ? "success" : "info");
    renderPosts();
  }

  async function submitPost(event) {
    event.preventDefault();
    if (!client) {
      showStatus("Supabase is not connected. Configure it before publishing a shared post.", "warning");
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    currentUser = userData?.user || null;
    if (userError || !currentUser) {
      showStatus("Please log in before posting or replying.", "warning");
      $("#community-form-note").innerHTML = 'You need an account to publish. <a href="login.html">Log in or create an account</a>.';
      return;
    }
    const type = $("#post-type").value;
    const post = {
      author_id: currentUser.id,
      author_name: currentDisplayName(currentUser),
      post_type: type,
      title: $("#post-title").value.trim(),
      body: $("#post-body").value.trim(),
      state: $("#post-state").value,
      destination: $("#post-destination").value,
      travel_date: type === "buddy" ? $("#post-date").value || null : null,
      experience_level: type === "buddy" ? $("#post-level").value : "",
      is_hidden: false,
    };
    if (!post.title || !post.body) {
      showStatus("Add a title and details before publishing.", "warning");
      return;
    }
    const submit = $(".community-submit");
    submit.disabled = true;
    submit.textContent = "Publishing…";
    const { error } = await client.from("community_posts").insert(post);
    submit.disabled = false;
    submit.innerHTML = 'Post to the community <span aria-hidden="true">↗</span>';
    if (error) {
      console.warn("Community post insert failed:", error.message);
      showStatus("Your post could not be published. Check the SQL migration and make sure you are signed in.", "warning");
      return;
    }
    $("#community-form").reset();
    $("#post-state").value = "";
    $("#post-destination").value = "";
    applyBuddyFields();
    showStatus("Your post is live. Thanks for adding useful trail knowledge.", "success");
    await refreshPosts();
  }

  async function submitReply(event) {
    const form = event.target.closest("form[data-reply-form]");
    if (!form) return;
    event.preventDefault();
    if (!client) return;
    const { data: userData } = await client.auth.getUser();
    currentUser = userData?.user || null;
    if (!currentUser) {
      showStatus("Log in before replying to a community post.", "warning");
      return;
    }
    const postId = form.dataset.replyForm;
    const body = $("textarea[name=body]", form).value.trim();
    if (!body) return;
    const submit = $("button[type=submit]", form);
    submit.disabled = true;
    const { error } = await client.from("community_replies").insert({
      post_id: postId,
      author_id: currentUser.id,
      author_name: currentDisplayName(currentUser),
      body,
    });
    submit.disabled = false;
    if (error) {
      showStatus("Reply not sent. Check your connection and community permissions.", "warning");
      return;
    }
    replyCache.delete(postId);
    const post = posts.find((item) => item.id === postId);
    if (post) post.reply_count = Number(post.reply_count || 0) + 1;
    renderPosts();
    const panel = $(`#reply-panel-${CSS.escape(postId)}`);
    if (panel) await loadReplies(postId, panel);
    showStatus("Reply posted.", "success");
  }

  async function boot() {
    initDestinationOptions();
    applyBuddyFields();
    $("#post-type").addEventListener("change", applyBuddyFields);
    $$(".community-filter").forEach((button) => button.addEventListener("click", () => {
      activeFilter = button.dataset.filter || "all";
      $$(".community-filter").forEach((item) => item.classList.toggle("on", item === button));
      renderPosts();
    }));
    $("#community-search").addEventListener("input", renderPosts);
    $("#community-refresh").addEventListener("click", () => { replyCache.clear(); refreshPosts(); });
    $("#community-form").addEventListener("submit", submitPost);
    $("#community-posts").addEventListener("click", async (event) => {
      const button = event.target.closest('[data-action="replies"]');
      if (!button) return;
      const postId = button.dataset.id;
      const panel = $(`#reply-panel-${CSS.escape(postId)}`);
      if (!panel) return;
      if (!panel.hidden) {
        panel.hidden = true;
        return;
      }
      await loadReplies(postId, panel);
    });
    $("#community-posts").addEventListener("submit", submitReply);
    client = window.twuGetSupabaseClient?.() || null;
    if (client) {
      const { data } = await client.auth.getUser();
      currentUser = data?.user || null;
      if (currentUser) {
        $("#community-form-note").textContent = `Posting as ${currentDisplayName(currentUser)}. Keep personal contact details private.`;
      }
    }
    await refreshPosts();
  }

  document.addEventListener("DOMContentLoaded", boot, { once: true });
})();
