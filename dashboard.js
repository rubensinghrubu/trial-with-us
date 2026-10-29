(() => {
  const $ = (s) => document.querySelector(s);
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const configured =
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_URL.includes("YOUR-PROJECT") &&
    !window.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE") &&
    window.supabase;
  const client = configured
    ? window.__twuSupabase ||
      (window.__twuSupabase = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            storage: window.localStorage,
          },
        },
      ))
    : null;
  const expected = document.body.dataset.role;
  const say = (message, isError = false) => {
    const el = $("#notice");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    el.classList.toggle("notice-error", isError);
  };
  const money = (value) =>
    "₹" + Math.round(Number(value) || 0).toLocaleString("en-IN");
  const requestSummary = (raw) => {
    try {
      const items = Array.isArray(raw) ? raw : JSON.parse(raw || "[]");
      return Array.isArray(items)
        ? items
            .map((item) => item.title)
            .filter(Boolean)
            .join(" · ")
        : "";
    } catch (_) {
      return "";
    }
  };
  const DEFAULT_PACKAGE_ROWS = [
    {
      title: "Dzükou Weekend",
      description:
        "Suggested Dzükou itinerary with guide, stay and return transport planning. Price is indicative; providers, permits and availability must be confirmed.",
      price: 9800,
      duration_days: 3,
      image_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1100&q=85",
    },
    {
      title: "Roots and Rivers",
      description:
        "Suggested Nongriat trek, Dawki boat ride and Shillong transfer itinerary. Price is indicative; providers and availability must be confirmed.",
      price: 18500,
      duration_days: 5,
      image_url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1100&q=85",
    },
    {
      title: "Wild Assam",
      description:
        "Suggested Kaziranga safaris and Majuli river-island itinerary. Price is indicative; safari slots, permits and transport must be confirmed.",
      price: 24000,
      duration_days: 4,
      image_url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1100&q=85",
    },
    {
      title: "Tawang and Ziro Loop",
      description:
        "Suggested monastery circuit and Apatani valley itinerary. Price is indicative; local providers and availability must be confirmed.",
      price: 36000,
      duration_days: 7,
      image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1100&q=85",
    },
  ];
  if (!client) {
    say(
      "Supabase is not configured. Follow SUPABASE_SETUP.md, then edit supabase-config.js.",
      true,
    );
    return;
  }
  let me, profile;

  async function start() {
    const {
      data: { session },
      error,
    } = await client.auth.getSession();
    if (error) throw error;
    if (!session) {
      location.href =
        "login.html?next=" +
        encodeURIComponent(location.pathname.split("/").pop());
      return;
    }
    me = session.user;
    const { data, error: profileError } = await client
      .from("profiles")
      .select("*")
      .eq("id", me.id)
      .single();
    if (profileError) throw profileError;
    profile = data;
    if (expected !== "any" && profile.role !== expected) {
      location.href =
        profile.role === "admin"
          ? "dashboard-admin.html"
          : profile.role === "guide"
            ? "dashboard-guide.html"
            : "dashboard-user.html";
      return;
    }
    $("#welcome").textContent = `Hello, ${profile.full_name || me.email}`;
    $("#account-email").textContent = me.email;
    $("#signout").addEventListener("click", async () => {
      await client.auth.signOut();
      location.href = "index.html";
    });
    if (expected === "admin") await admin();
    else if (expected === "guide") await guide();
    else await user();
  }

  async function user() {
    const { data: bookings, error } = await client
      .from("bookings")
      .select(
        "id,status,payment_status,total_amount,subtotal_amount,discount_amount,discount_code,special_requests,start_date,created_at,packages(title)",
      )
      .eq("user_id", me.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    $("#bookings").innerHTML = bookings.length
      ? bookings
          .map(
            (b) =>
              `<article class="dash-item"><h3>${esc(b.packages?.title || "Trip request")}</h3><p>Status: <b>${esc(b.status)}</b> · Payment: <b>${esc(b.payment_status || "unpaid")}</b> · Total: ${money(b.total_amount)}</p>${requestSummary(b.special_requests) ? `<small>${esc(requestSummary(b.special_requests))}</small><br>` : ""}${Number(b.discount_amount) > 0 ? `<small>Subtotal ${money(b.subtotal_amount)} · Code ${esc(b.discount_code || "")} · Saved ${money(b.discount_amount)}</small><br>` : ""}<small>Reference ${esc(b.id.slice(0, 8).toUpperCase())} · ${esc(b.start_date || b.created_at?.slice(0, 10) || "Date pending")}</small></article>`,
          )
          .join("")
      : "<p>No trip requests yet. Browse packages or add a guide and review your trip at checkout.</p>";
    const { data: userNotifications, error: userNotificationError } =
      await client
        .from("notifications")
        .select("id,title,message,is_read,created_at")
        .eq("user_id", me.id)
        .order("created_at", { ascending: false })
        .limit(10);
    if ($("#user-notifications")) {
      $("#user-notifications").innerHTML = userNotificationError
        ? "<p>Notifications are unavailable until the latest Supabase migration is installed.</p>"
        : (userNotifications || []).length
          ? userNotifications
              .map(
                (n) =>
                  `<article class="dash-item"><h3>${esc(n.title)}</h3><p>${esc(n.message)}</p><small>${esc(n.created_at?.slice(0, 16).replace("T", " ") || "Just now")}${n.is_read ? " · Read" : " · New"}</small></article>`,
              )
              .join("")
          : "<p>No notifications yet. Trip request updates will appear here.</p>";
      const unreadIds = (userNotifications || [])
        .filter((n) => !n.is_read)
        .map((n) => n.id);
      if (unreadIds.length) {
        const { error: readError } = await client
          .from("notifications")
          .update({ is_read: true })
          .in("id", unreadIds);
        if (readError)
          console.warn("Could not mark notifications read:", readError.message);
      }
    }
    $("#apply-guide").addEventListener("click", () => {
      $("#guide-application").hidden = !$("#guide-application").hidden;
    });
    $("#guide-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        user_id: me.id,
        full_name: $("#app-name").value.trim(),
        phone: $("#app-phone").value.trim(),
        languages: $("#app-languages")
          .value.split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        destinations: $("#app-destinations")
          .value.split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        daily_rate: Number($("#app-daily-rate").value),
        experience: $("#app-experience").value.trim(),
        verification_notes: $("#app-verification").value.trim(),
      };
      const { error: applicationError } = await client
        .from("guide_applications")
        .insert(payload);
      if (applicationError) throw applicationError;
      say(
        "Application submitted. The admin will review your details and verification notes.",
      );
      e.target.reset();
      $("#guide-application").hidden = true;
    });
  }

  async function guide() {
    const { data: apps, error } = await client
      .from("guide_applications")
      .select("id,status,created_at,admin_notes")
      .eq("user_id", me.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    $("#guide-status").innerHTML =
      `<p>Guide status: <b>${esc(profile.guide_status || "not approved")}</b></p>`;
    $("#guide-applications").innerHTML = apps.length
      ? apps
          .map(
            (a) =>
              `<article class="dash-item"><h3>${a.status === "approved" ? "Application approved" : a.status === "rejected" ? "Application update" : "Guide application"}</h3><p>Status: <b>${esc(a.status)}</b></p>${a.status === "approved" ? '<p class="notice">Congratulations! Your guide application has been approved.</p>' : a.status === "rejected" ? '<p class="notice notice-error">Your guide application was not approved. Review the admin note below or contact support if you need clarification.</p>' : ""}<small>${esc(a.created_at?.slice(0, 10) || "Recently submitted")}</small>${a.admin_notes ? `<p>${esc(a.admin_notes)}</p>` : ""}</article>`,
          )
          .join("")
      : "<p>No guide application found. If you are not yet approved, apply from your traveller dashboard.</p>";
    const { data: notifications, error: notificationError } = await client
      .from("notifications")
      .select("id,title,message,is_read,created_at")
      .eq("user_id", me.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (notificationError) {
      $("#guide-notifications").innerHTML =
        "<p>Application decisions are also shown in the application status below.</p>";
    } else {
      $("#guide-notifications").innerHTML = notifications.length
        ? notifications
            .map(
              (n) =>
                `<article class="dash-item"><h3>${esc(n.title)}</h3><p>${esc(n.message)}</p><small>${esc(n.created_at?.slice(0, 16).replace("T", " ") || "Just now")}${n.is_read ? " · Read" : " · New"}</small></article>`,
            )
            .join("")
        : "<p>No notifications yet.</p>";
      const unreadIds = (notifications || [])
        .filter((n) => !n.is_read)
        .map((n) => n.id);
      if (unreadIds.length) {
        const { error: readError } = await client
          .from("notifications")
          .update({ is_read: true })
          .in("id", unreadIds);
        if (readError)
          console.warn("Could not mark notifications read:", readError.message);
      }
    }
    const { data: bookings, error: bookingError } = await client
      .from("bookings")
      .select("id,status,start_date,total_amount,packages(title)")
      .eq("guide_id", me.id)
      .order("created_at", { ascending: false });
    if (bookingError) throw bookingError;
    $("#guide-bookings").innerHTML = bookings.length
      ? bookings
          .map(
            (b) =>
              `<article class="dash-item"><h3>${esc(b.packages?.title || "Trip request")}</h3><p>${esc(b.status)} · ${esc(b.start_date || "Date pending")}</p></article>`,
          )
          .join("")
      : "<p>No trips assigned yet.</p>";
  }

  async function admin() {
    // Seed the site's original curated packages once, so administrator edits affect public listings.
    const { data: existingPackageRows, error: existingPackageError } =
      await client.from("packages").select("title");
    if (existingPackageError) throw existingPackageError;
    // Seed starter itineraries only for an empty table. Do not recreate packages an admin intentionally deleted.
    if (!existingPackageRows || existingPackageRows.length === 0) {
      const initialPackages = DEFAULT_PACKAGE_ROWS.map((row) => ({
        ...row,
        discount_percent: 0,
        is_published: true,
        created_by: me.id,
      }));
      const { error: defaultInsertError } = await client
        .from("packages")
        .insert(initialPackages);
      if (defaultInsertError) throw defaultInsertError;
    }
    const [packages, bookings, applications, places, discounts, inventory] =
      await Promise.all([
        client
          .from("packages")
          .select("*")
          .order("created_at", { ascending: false }),
        client
          .from("bookings")
          .select(
            "id,user_id,status,payment_status,total_amount,subtotal_amount,discount_amount,discount_code,special_requests,start_date,created_at",
          )
          .order("created_at", { ascending: false })
          .limit(50),
        client
          .from("guide_applications")
          .select("id,user_id,full_name,status,created_at")
          .order("created_at", { ascending: false }),
        client.from("places").select("*").order("name"),
        client
          .from("discounts")
          .select("*")
          .order("created_at", { ascending: false }),
        client
          .from("trip_listings")
          .select("*")
          .order("listing_type")
          .order("catalog_key", { ascending: true, nullsFirst: false })
          .order("title"),
      ]);
    for (const result of [
      packages,
      bookings,
      applications,
      places,
      discounts,
      inventory,
    ])
      if (result.error) throw result.error;

    $("#admin-packages").innerHTML = packages.data.length
      ? packages.data
          .map(
            (item) =>
              `<article class="dash-item"><h3>${esc(item.title)}</h3><p>${money(item.price)} base · ${Number(item.discount_percent || 0)}% discount · ${esc(item.is_published ? "Published" : "Draft")}</p><p>${esc(item.description || "")}</p><div class="dash-actions"><button class="btn sm" type="button" data-edit-package="${esc(item.id)}">Edit</button><button class="btn sm alt" type="button" data-delete-package="${esc(item.id)}">Delete</button></div></article>`,
          )
          .join("")
      : "<p>No packages yet.</p>";
    $("#admin-bookings").innerHTML = bookings.data.length
      ? bookings.data
          .map(
            (item) =>
              `<article class="dash-item"><h3>Request ${esc(item.id.slice(0, 8).toUpperCase())}</h3><p><b>${esc(item.status)}</b> · ${esc(item.payment_status || "unpaid")} · ${money(item.total_amount)}</p><small>Traveller ${esc(item.user_id?.slice(0, 8).toUpperCase() || "")} · ${esc(item.start_date || item.created_at?.slice(0, 10) || "Date pending")}</small>${requestSummary(item.special_requests) ? `<p>${esc(requestSummary(item.special_requests))}</p>` : ""}${Number(item.discount_amount) > 0 ? `<small>Subtotal ${money(item.subtotal_amount)} · code ${esc(item.discount_code || "")} · savings ${money(item.discount_amount)}</small>` : ""}<div class="dash-actions">${item.status === "pending" ? `<button class="btn sm" type="button" data-booking-status="confirmed" data-booking-id="${esc(item.id)}">Accept request</button><button class="btn sm alt" type="button" data-booking-status="cancelled" data-booking-id="${esc(item.id)}">Cancel request</button>` : ""}${item.status === "confirmed" ? `<button class="btn sm" type="button" data-booking-status="completed" data-booking-id="${esc(item.id)}">Mark completed</button><button class="btn sm alt" type="button" data-booking-status="cancelled" data-booking-id="${esc(item.id)}">Cancel request</button>` : ""}</div></article>`,
          )
          .join("")
      : "<p>No trip requests yet.</p>";
    $("#admin-bookings").onclick = async (event) => {
      const button = event.target.closest("[data-booking-status]");
      if (!button) return;
      const targetStatus = button.dataset.bookingStatus;
      const confirmText =
        targetStatus === "confirmed"
          ? "Accept this trip request? Confirm availability with the providers and arrange payment outside this website first."
          : targetStatus === "cancelled"
            ? "Cancel this trip request?"
            : "Mark this trip as completed?";
      if (!confirm(confirmText)) return;
      button.disabled = true;
      try {
        const { error } = await client.rpc("admin_update_trip_request", {
          p_booking_id: button.dataset.bookingId,
          p_status: targetStatus,
        });
        if (error) throw error;
        say(`Trip request ${targetStatus}.`);
        await admin();
      } catch (error) {
        say(error.message || "Could not update this trip request.", true);
        button.disabled = false;
      }
    };

    $("#admin-places").innerHTML = places.data.length
      ? places.data
          .map(
            (item) =>
              `<article class="dash-item"><h3>${esc(item.name)}</h3><p>${esc(item.state || "")} · ${esc(item.is_published ? "Published" : "Draft")}</p><p>${esc(item.description || "")}</p><div class="dash-actions"><button class="btn sm" type="button" data-edit-place="${esc(item.id)}">Edit</button><button class="btn sm alt" type="button" data-publish-place="${esc(item.id)}" data-published="${String(!!item.is_published)}">${item.is_published ? "Hide" : "Publish"}</button><button class="btn sm alt" type="button" data-delete-place="${esc(item.id)}">Delete</button></div></article>`,
          )
          .join("")
      : "<p>No places yet.</p>";
    $("#admin-inventory").innerHTML = inventory.data.length
      ? inventory.data
          .map(
            (item) =>
              `<article class="dash-item"><h3>${esc(item.emoji || "🧭")} ${esc(item.title)} <small>· ${esc(item.listing_type)}</small></h3><p>${money(item.price)} / ${esc(item.unit)} · ${esc(item.state || "All states")} · ${esc(item.destination || "Everywhere")}</p><p>${esc(item.description || "")}</p><p><b>${item.is_published ? "Published" : "Hidden"}</b></p><div class="dash-actions"><button class="btn sm" type="button" data-edit-listing="${esc(item.id)}">Edit</button><button class="btn sm alt" type="button" data-publish-listing="${esc(item.id)}" data-published="${String(!!item.is_published)}">${item.is_published ? "Hide" : "Publish"}</button><button class="btn sm alt" type="button" data-delete-listing="${esc(item.id)}">Delete</button></div></article>`,
          )
          .join("")
      : "<p>No shared inventory yet. Add stays, ride rates or gear above.</p>";

    $("#admin-applications").innerHTML = applications.data.length
      ? applications.data
          .map(
            (item) =>
              `<article class="dash-item"><h3>${esc(item.full_name || "Guide applicant")}</h3><p>${esc(item.status)} · ${esc(item.created_at?.slice(0, 10) || "")}</p><div class="dash-actions"><button class="btn sm" type="button" data-review="${esc(item.id)}" data-user="${esc(item.user_id)}" data-status="approved">Approve guide</button><button class="btn sm alt" type="button" data-review="${esc(item.id)}" data-user="${esc(item.user_id)}" data-status="rejected">Reject</button></div></article>`,
          )
          .join("")
      : "<p>No guide applications yet.</p>";
    $("#admin-discounts").innerHTML = discounts.data.length
      ? discounts.data
          .map((item) => {
            const active =
              item.is_active &&
              (!item.starts_at || new Date(item.starts_at) <= new Date()) &&
              (!item.ends_at || new Date(item.ends_at) > new Date()) &&
              (item.max_redemptions == null ||
                item.redemption_count < item.max_redemptions);
            const status = !item.is_active
              ? "Disabled"
              : item.starts_at && new Date(item.starts_at) > new Date()
                ? "Scheduled"
                : item.ends_at && new Date(item.ends_at) <= new Date()
                  ? "Expired"
                  : item.max_redemptions != null &&
                      item.redemption_count >= item.max_redemptions
                    ? "Limit reached"
                    : "Active";
            return `<article class="dash-item"><h3>${esc(item.code)} · ${Number(item.percent_off)}% off</h3><p>${esc(status)} · Used ${Number(item.redemption_count) || 0}${item.max_redemptions == null ? " / unlimited" : " / " + Number(item.max_redemptions)}</p><small>${item.starts_at ? "Starts " + esc(item.starts_at.slice(0, 10)) + " · " : ""}${item.ends_at ? "Ends " + esc(item.ends_at.slice(0, 10)) : "No end date"}</small><div class="dash-actions"><button class="btn sm" type="button" data-discount-toggle="${esc(item.id)}" data-active="${String(!!item.is_active)}">${item.is_active ? "Disable" : "Enable"}</button><button class="btn sm alt" type="button" data-discount-delete="${esc(item.id)}">Delete</button></div></article>`;
          })
          .join("")
      : "<p>No discount codes yet.</p>";

    $("#admin-discounts").onclick = async (event) => {
      const toggle = event.target.closest("[data-discount-toggle]");
      const del = event.target.closest("[data-discount-delete]");
      try {
        if (toggle) {
          const item = discounts.data.find(
            (x) => x.id === toggle.dataset.discountToggle,
          );
          if (!item) return;
          const { error } = await client
            .from("discounts")
            .update({ is_active: !item.is_active })
            .eq("id", item.id);
          if (error) throw error;
          say(
            `Discount code ${item.code} ${item.is_active ? "disabled" : "enabled"}.`,
          );
          await admin();
          return;
        }
        if (del) {
          const item = discounts.data.find(
            (x) => x.id === del.dataset.discountDelete,
          );
          if (!item || !confirm(`Delete discount code “${item.code}”?`)) return;
          const { error } = await client
            .from("discounts")
            .delete()
            .eq("id", item.id);
          if (error) throw error;
          say(`Discount code ${item.code} deleted.`);
          await admin();
        }
      } catch (error) {
        say(error.message || "Could not update discount code.", true);
      }
    };

    $("#admin-applications").onclick = async (event) => {
      const button = event.target.closest("[data-review]");
      if (!button) return;
      button.disabled = true;
      try {
        const status = button.dataset.status;
        const { error: applicationError } = await client
          .from("guide_applications")
          .update({
            status,
            reviewed_by: me.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", button.dataset.review);
        if (applicationError) throw applicationError;
        const { error: profileUpdateError } = await client
          .from("profiles")
          .update(
            status === "approved"
              ? { role: "guide", guide_status: "approved" }
              : { role: "user", guide_status: "rejected" },
          )
          .eq("id", button.dataset.user);
        if (profileUpdateError) throw profileUpdateError;
        // In-app notification is persisted for the applicant; dashboard status remains a fallback if notification fetch fails.
        const { error: notificationError } = await client
          .from("notifications")
          .insert({
            user_id: button.dataset.user,
            title:
              status === "approved"
                ? "Guide application approved"
                : "Guide application update",
            message:
              status === "approved"
                ? "Your guide application has been approved. You can now access your guide dashboard."
                : "Your guide application was not approved. Please review your dashboard for details.",
            type: "guide_application",
          });
        if (notificationError)
          console.warn(
            "Could not create applicant notification:",
            notificationError.message,
          );
        say(
          `Guide application ${status}. The applicant has been notified when notifications are enabled.`,
        );
        await admin();
      } catch (error) {
        say(error.message || "Could not update application.", true);
        button.disabled = false;
      }
    };

    $("#admin-packages").onclick = async (event) => {
      const edit = event.target.closest("[data-edit-package]");
      const del = event.target.closest("[data-delete-package]");
      try {
        if (edit) {
          const item = packages.data.find(
            (x) => x.id === edit.dataset.editPackage,
          );
          if (!item) return;
          const title = prompt("Package title:", item.title);
          if (title === null) return;
          const priceText = prompt("Base price in INR:", String(item.price));
          if (priceText === null) return;
          const price = Number(priceText);
          if (!title.trim() || !Number.isFinite(price) || price < 0)
            throw new Error("Enter a valid title and non-negative price.");
          const discountText = prompt(
            "Discount percentage (0–100):",
            String(item.discount_percent || 0),
          );
          if (discountText === null) return;
          const discount = Number(discountText);
          if (!Number.isFinite(discount) || discount < 0 || discount > 100)
            throw new Error("Discount must be between 0 and 100.");
          const description = prompt("Description:", item.description || "");
          if (description === null) return;
          const durationText = prompt(
            "Duration in days:",
            String(item.duration_days || 1),
          );
          if (durationText === null) return;
          const duration_days = Number(durationText);
          if (
            !Number.isInteger(duration_days) ||
            duration_days < 1 ||
            duration_days > 90
          )
            throw new Error("Duration must be 1–90 days.");
          const image_url = prompt(
            "Image URL (HTTPS URL or assets/ path):",
            item.image_url || "",
          );
          if (image_url === null) return;
          if (
            image_url &&
            !(image_url.startsWith("assets/") || /^https:\/\//i.test(image_url))
          )
            throw new Error("Use an assets/ image path or an HTTPS image URL.");
          const { error } = await client
            .from("packages")
            .update({
              title: title.trim(),
              price,
              discount_percent: discount,
              description: description.trim(),
              duration_days,
              image_url: image_url || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id);
          if (error) throw error;
          say("Package updated.");
          await admin();
          return;
        }
        if (del) {
          const item = packages.data.find(
            (x) => x.id === del.dataset.deletePackage,
          );
          if (!item || !confirm(`Delete package “${item.title}”?`)) return;
          const { error } = await client
            .from("packages")
            .delete()
            .eq("id", item.id);
          if (error) throw error;
          say("Package deleted.");
          await admin();
        }
      } catch (error) {
        say(error.message || "Package update failed.", true);
      }
    };
    $("#admin-places").onclick = async (event) => {
      const edit = event.target.closest("[data-edit-place]");
      const publish = event.target.closest("[data-publish-place]");
      const del = event.target.closest("[data-delete-place]");
      try {
        if (edit) {
          const item = places.data.find((x) => x.id === edit.dataset.editPlace);
          if (!item) return;
          const name = prompt("Place name:", item.name);
          if (name === null) return;
          const state = prompt(
            "State (one of the 8 Northeast states):",
            item.state || "",
          );
          if (state === null) return;
          const description = prompt("Description:", item.description || "");
          if (description === null) return;
          const validStates = [
            "Arunachal Pradesh",
            "Assam",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Sikkim",
            "Tripura",
          ];
          if (!name.trim() || !validStates.includes(state.trim()))
            throw new Error(
              "Enter a place name and one of the 8 Northeast states.",
            );
          const { error } = await client
            .from("places")
            .update({
              name: name.trim(),
              state: state.trim(),
              description: description.trim(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id);
          if (error) throw error;
          say("Place updated.");
          await admin();
          return;
        }
        if (publish) {
          const item = places.data.find(
            (x) => x.id === publish.dataset.publishPlace,
          );
          if (!item) return;
          const is_published = publish.dataset.published !== "true";
          const { error } = await client
            .from("places")
            .update({ is_published, updated_at: new Date().toISOString() })
            .eq("id", item.id);
          if (error) throw error;
          say(`Place ${is_published ? "published" : "hidden"}.`);
          await admin();
          return;
        }
        if (del) {
          const item = places.data.find(
            (x) => x.id === del.dataset.deletePlace,
          );
          if (!item || !confirm(`Delete place “${item.name}”?`)) return;
          const { error } = await client
            .from("places")
            .delete()
            .eq("id", item.id);
          if (error) throw error;
          say("Place deleted.");
          await admin();
        }
      } catch (error) {
        say(error.message || "Place update failed.", true);
      }
    };

    $("#package-form").onsubmit = async (event) => {
      event.preventDefault();
      try {
        const title = $("#package-title").value.trim(),
          price = Number($("#package-price").value),
          description = $("#package-description").value.trim(),
          discount_percent = Number($("#package-discount").value || 0),
          duration_days = Number($("#package-days").value || 1),
          image_url = $("#package-image").value.trim();
        if (
          image_url &&
          !(image_url.startsWith("assets/") || /^https:\/\//i.test(image_url))
        )
          throw new Error("Use an assets/ image path or an HTTPS image URL.");
        const { error } = await client
          .from("packages")
          .insert({
            title,
            price,
            description,
            discount_percent,
            duration_days,
            image_url: image_url || null,
            is_published: $("#package-published").checked,
            created_by: me.id,
          });
        if (error) throw error;
        say("Package created.");
        event.target.reset();
        await admin();
      } catch (error) {
        say(error.message || "Could not create package.", true);
      }
    };
    $("#place-form").onsubmit = async (event) => {
      event.preventDefault();
      try {
        const name = $("#place-name").value.trim(),
          state = $("#place-state").value.trim(),
          description = $("#place-description").value.trim();
        const validStates = [
          "Arunachal Pradesh",
          "Assam",
          "Manipur",
          "Meghalaya",
          "Mizoram",
          "Nagaland",
          "Sikkim",
          "Tripura",
        ];
        if (!name || !validStates.includes(state))
          throw new Error(
            "Enter a place name and one of the 8 Northeast states.",
          );
        const { error } = await client
          .from("places")
          .insert({
            name,
            state,
            description,
            is_published: $("#place-published").checked,
            created_by: me.id,
          });
        if (error) throw error;
        say("Place created.");
        event.target.reset();
        await admin();
      } catch (error) {
        say(error.message || "Could not create place.", true);
      }
    };
    const setInventoryUnitDefault = () => {
      const units = {
        stay: "per_room_night",
        ride: "per_km",
        gear: "per_item_day",
      };
      const input = $("#inventory-unit");
      if (input) input.value = units[$("#inventory-type")?.value] || "each";
    };
    $("#inventory-type")?.addEventListener("change", setInventoryUnitDefault);
    $("#inventory-form").onsubmit = async (event) => {
      event.preventDefault();
      try {
        const listing_type = $("#inventory-type").value,
          title = $("#inventory-title").value.trim(),
          price = Number($("#inventory-price").value),
          capacityText = $("#inventory-capacity").value.trim(),
          capacity = capacityText ? Number(capacityText) : null,
          unit = $("#inventory-unit").value.trim(),
          state = $("#inventory-state").value,
          destination =
            $("#inventory-destination").value.trim() || "Everywhere",
          emoji = $("#inventory-emoji").value.trim() || "🧭",
          image_url = $("#inventory-image").value.trim(),
          description = $("#inventory-description").value.trim();
        const expectedUnit = {
          stay: "per_room_night",
          ride: "per_km",
          gear: "per_item_day",
        }[listing_type];
        if (
          !title ||
          !Number.isFinite(price) ||
          price < 0 ||
          unit !== expectedUnit ||
          (capacity !== null && (!Number.isInteger(capacity) || capacity < 1))
        )
          throw new Error(
            `Enter a name, valid non-negative price, unit ${expectedUnit}, and optional positive whole-number capacity.`,
          );
        if (
          image_url &&
          !(image_url.startsWith("assets/") || /^https:\/\//i.test(image_url))
        )
          throw new Error("Use an assets/ path or HTTPS image URL.");
        const { error } = await client
          .from("trip_listings")
          .insert({
            listing_type,
            title,
            price,
            capacity,
            unit,
            state,
            destination,
            emoji,
            image_url: image_url || null,
            description,
            is_published: $("#inventory-published").checked,
            created_by: me.id,
          });
        if (error) throw error;
        say("Shared listing added. Public pages will now use this inventory.");
        event.target.reset();
        $("#inventory-unit").value = "per_room_night";
        $("#inventory-capacity").value = "";
        $("#inventory-destination").value = "Everywhere";
        $("#inventory-emoji").value = "🧭";
        $("#inventory-published").checked = false;
        await admin();
      } catch (error) {
        say(error.message || "Could not add inventory listing.", true);
      }
    };
    $("#admin-inventory").onclick = async (event) => {
      const edit = event.target.closest("[data-edit-listing]"),
        publish = event.target.closest("[data-publish-listing]"),
        del = event.target.closest("[data-delete-listing]");
      try {
        if (edit) {
          const item = inventory.data.find(
            (x) => x.id === edit.dataset.editListing,
          );
          if (!item) return;
          const title = prompt("Listing name:", item.title);
          if (title === null) return;
          const priceText = prompt("Price in INR:", String(item.price));
          if (priceText === null) return;
          const price = Number(priceText);
          if (!title.trim() || !Number.isFinite(price) || price < 0)
            throw new Error("Enter a valid name and non-negative price.");
          const expectedUnit = {
            stay: "per_room_night",
            ride: "per_km",
            gear: "per_item_day",
          }[item.listing_type];
          const unit = prompt(
            `Unit for ${item.listing_type} must be ${expectedUnit}:`,
            item.unit || expectedUnit,
          );
          if (unit === null) return;
          if (unit.trim() !== expectedUnit)
            throw new Error(
              `Unit must be ${expectedUnit} for ${item.listing_type} listings.`,
            );
          const capacityText = prompt(
            "Capacity / seats per vehicle (blank if not applicable):",
            item.capacity == null ? "" : String(item.capacity),
          );
          if (capacityText === null) return;
          const capacity =
            capacityText.trim() === "" ? null : Number(capacityText);
          if (
            capacity !== null &&
            (!Number.isInteger(capacity) || capacity < 1)
          )
            throw new Error(
              "Capacity must be a positive whole number or blank.",
            );
          const state = prompt(
            "State (one of the 8 states, or All states):",
            item.state || "All states",
          );
          if (state === null) return;
          const validStates = [
            "Arunachal Pradesh",
            "Assam",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Sikkim",
            "Tripura",
            "All states",
          ];
          if (!validStates.includes(state.trim()))
            throw new Error(
              "Choose one of the eight Northeast states or All states.",
            );
          const destination = prompt(
            "Destination:",
            item.destination || "Everywhere",
          );
          if (destination === null) return;
          const description = prompt("Description:", item.description || "");
          if (description === null) return;
          const emoji = prompt("Emoji / icon:", item.emoji || "🧭");
          if (emoji === null) return;
          const image_url = prompt(
            "Image URL (assets/ path or HTTPS):",
            item.image_url || "",
          );
          if (image_url === null) return;
          if (
            image_url &&
            !(image_url.startsWith("assets/") || /^https:\/\//i.test(image_url))
          )
            throw new Error("Use an assets/ path or HTTPS image URL.");
          const { error } = await client
            .from("trip_listings")
            .update({
              title: title.trim(),
              price,
              capacity,
              unit: unit.trim(),
              state: state.trim(),
              destination: destination.trim() || "Everywhere",
              description: description.trim(),
              emoji: emoji.trim() || "🧭",
              image_url: image_url || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id);
          if (error) throw error;
          say("Listing updated.");
          await admin();
          return;
        }
        if (publish) {
          const item = inventory.data.find(
            (x) => x.id === publish.dataset.publishListing,
          );
          if (!item) return;
          const is_published = publish.dataset.published !== "true";
          const expectedUnit = {
            stay: "per_room_night",
            ride: "per_km",
            gear: "per_item_day",
          }[item.listing_type];
          if (
            is_published &&
            (Number(item.price) <= 0 || item.unit !== expectedUnit)
          )
            throw new Error(
              `Set a positive price and unit ${expectedUnit} before publishing this listing.`,
            );
          const { error } = await client
            .from("trip_listings")
            .update({ is_published, updated_at: new Date().toISOString() })
            .eq("id", item.id);
          if (error) throw error;
          say(`Listing ${is_published ? "published" : "hidden"}.`);
          await admin();
          return;
        }
        if (del) {
          const item = inventory.data.find(
            (x) => x.id === del.dataset.deleteListing,
          );
          if (
            !item ||
            !confirm(`Delete ${item.listing_type} listing “${item.title}”?`)
          )
            return;
          const { error } = await client
            .from("trip_listings")
            .delete()
            .eq("id", item.id);
          if (error) throw error;
          say("Listing deleted.");
          await admin();
        }
      } catch (error) {
        say(error.message || "Could not update the listing.", true);
      }
    };

    $("#discount-form").onsubmit = async (event) => {
      event.preventDefault();
      try {
        const code = $("#discount-code").value.trim().toUpperCase(),
          percent_off = Number($("#discount-percent").value),
          startsValue = $("#discount-start").value,
          endsValue = $("#discount-end").value,
          maxValue = $("#discount-max").value.trim();
        const starts_at = startsValue
            ? new Date(startsValue).toISOString()
            : null,
          ends_at = endsValue ? new Date(endsValue).toISOString() : null;
        if (starts_at && ends_at && new Date(ends_at) <= new Date(starts_at))
          throw new Error("End date must be later than the start date.");
        const max_redemptions = maxValue ? Number(maxValue) : null;
        if (
          max_redemptions != null &&
          (!Number.isInteger(max_redemptions) || max_redemptions < 1)
        )
          throw new Error(
            "Maximum redemptions must be a positive whole number.",
          );
        const { error } = await client
          .from("discounts")
          .insert({
            code,
            percent_off,
            starts_at,
            ends_at,
            max_redemptions,
            is_active: true,
            created_by: me.id,
          });
        if (error) throw error;
        say("Discount code created. It can now be entered during checkout.");
        event.target.reset();
        await admin();
      } catch (error) {
        say(error.message || "Could not create discount code.", true);
      }
    };
  }

  start().catch((error) =>
    say(
      error.message ||
        "Could not load dashboard. Check Supabase configuration and RLS policies.",
      true,
    ),
  );
})();
