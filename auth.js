(() => {
  const $ = (s) => document.querySelector(s);
  const status = $("#auth-status");
  let mode = "signin";
  const supabaseUrl = String(window.SUPABASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  const supabaseKey = String(window.SUPABASE_ANON_KEY || "").trim();
  const configured =
    !!supabaseUrl &&
    !!supabaseKey &&
    !supabaseUrl.includes("YOUR-PROJECT") &&
    !supabaseKey.includes("YOUR_SUPABASE");
  let client = null;
  let clientInitError = "";
  if (configured && window.supabase) {
    try {
      const parsed = new URL(supabaseUrl);
      if (parsed.protocol !== "https:" && parsed.hostname !== "localhost")
        throw new Error("The Supabase Project URL must use HTTPS.");
      if (parsed.pathname !== "/" || parsed.search || parsed.hash)
        throw new Error(
          "Use only the Supabase Project URL origin, without an extra path or query string.",
        );
      client = window.supabase.createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
        },
      });
    } catch (err) {
      clientInitError = err.message || "Invalid Supabase configuration.";
    }
  }
  function message(text, kind = "") {
    status.textContent = text;
    status.className = "auth-status show " + kind;
  }
  const requestedEmail = new URLSearchParams(location.search).get("email");
  if (requestedEmail && $("#email")) $("#email").value = requestedEmail;

  async function checkSupabaseConnection(showResult = true) {
    if (!configured) {
      const result =
        "Supabase is not configured. Open supabase-config.js and add the exact Project URL and publishable/anon key from Supabase → Project Settings → API.";
      if (showResult) message(result, "error");
      return { ok: false, message: result };
    }
    if (clientInitError || !client) {
      const result =
        clientInitError ||
        "The Supabase client library did not load. Check your internet connection or whether the CDN is blocked.";
      if (showResult) message(result, "error");
      return { ok: false, message: result };
    }
    let parsed;
    try {
      parsed = new URL(supabaseUrl);
    } catch (_) {
      const result =
        "The Supabase Project URL is invalid. Copy the full URL from Project Settings → API (for example, https://your-project.supabase.co).";
      if (showResult) message(result, "error");
      return { ok: false, message: result };
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 9000);
      let response;
      try {
        response = await fetch(parsed.origin + "/auth/v1/settings", {
          method: "GET",
          headers: { apikey: supabaseKey },
          cache: "no-store",
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }
      if (response.ok) {
        const result =
          "Connection successful — the Supabase Auth endpoint is reachable. If account creation still fails, check Authentication → Providers → Email, the database signup trigger, and the browser console for the signup response.";
        if (showResult) message(result, "ok");
        return { ok: true, message: result };
      }
      if (response.status === 401 || response.status === 403) {
        const result =
          "Supabase responded, but rejected the API key. Copy the publishable/anon key for this same project into supabase-config.js.";
        if (showResult) message(result, "error");
        return { ok: false, message: result };
      }
      if (response.status === 404) {
        const result =
          "The Supabase endpoint returned 404. Check that the Project URL belongs to your current project and has no extra path.";
        if (showResult) message(result, "error");
        return { ok: false, message: result };
      }
      const result =
        "Supabase responded with HTTP " +
        response.status +
        ". Check the project status and API settings, then try again.";
      if (showResult) message(result, "error");
      return { ok: false, message: result };
    } catch (err) {
      const result =
        err && err.name === "AbortError"
          ? "The connection to Supabase timed out. Check whether the project is active and whether your network/VPN/firewall is blocking it."
          : "The browser cannot reach Supabase. This is a connection/configuration problem, not a password mismatch. Verify the exact Project URL in supabase-config.js, ensure the Supabase project is active, use the deployed HTTPS website (not a file:// page), and try another network or disable a blocking extension/VPN.";
      if (showResult) message(result, "error");
      return { ok: false, message: result };
    }
  }
  function validateSignup(showMessage = true) {
    const confirm = $("#confirm-password");
    const password = $("#password").value;
    const confirmation = confirm.value;
    const hint = $("#password-match-message");
    const mismatch = confirmation.length > 0 && password !== confirmation;
    const match = confirmation.length > 0 && password === confirmation;
    confirm.setCustomValidity(mismatch ? "Passwords do not match." : "");
    confirm.setAttribute("aria-invalid", String(mismatch));
    hint.textContent =
      !showMessage || !confirmation
        ? ""
        : mismatch
          ? "Passwords do not match. Please make them identical."
          : match
            ? "Passwords match."
            : "";
    hint.style.color = mismatch ? "#ffd0d0" : "#bbf7d0";
    const signupReady =
      $("#auth-form").checkValidity() &&
      password.length >= 8 &&
      match &&
      $("#full-name").value.trim().length > 0;
    $("#submit-btn").disabled = mode === "signup" ? !signupReady : false;
    return { mismatch, match, signupReady };
  }
  function setMode(next) {
    mode = next;
    $("#auth-title").textContent =
      mode === "signup" ? "Create your account" : "Welcome back.";
    $("#name-wrap").hidden = mode !== "signup";
    $("#full-name").required = mode === "signup";
    $("#full-name").disabled = mode !== "signup";
    $("#confirm-wrap").hidden = mode !== "signup";
    $("#confirm-password").required = mode === "signup";
    $("#confirm-password").disabled = mode !== "signup";
    $("#confirm-password").value = "";
    $("#confirm-password").setCustomValidity("");
    $("#password-match-message").textContent = "";
    $("#password").autocomplete =
      mode === "signup" ? "new-password" : "current-password";
    $("#submit-btn").textContent =
      mode === "signup" ? "Create account" : "Sign in";
    $("#toggle-mode").textContent =
      mode === "signup" ? "I already have an account" : "Create an account";
    $("#reset-password").hidden = mode === "signup";
    status.className = "auth-status";
    $("#submit-btn").disabled = false;
    if (mode === "signup") validateSignup(false);
  }
  async function routeUser(user) {
    // Role is read from the protected profile row; clients cannot set their own role through signup.
    const { data: profile, error } = await client
      .from("profiles")
      .select("role,full_name,guide_status")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!profile) {
      message(
        "Your account profile is still being created. Refresh in a moment or contact the administrator.",
        "error",
      );
      return;
    }
    // Preserve the page the visitor was trying to reach (especially checkout) without allowing external redirects.
    const requested = new URLSearchParams(location.search).get("next");
    if (requested) {
      const target = new URL(requested, location.href);
      if (
        target.origin === location.origin &&
        /\.html$/i.test(target.pathname)
      ) {
        location.href = target.pathname + target.search + target.hash;
        return;
      }
    }
    // Keep roles on the main site unless they explicitly came from a protected workflow.
    location.href = "index.html";
  }
  $("#auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!client) {
      message(
        clientInitError ||
          (!window.supabase
            ? "The Supabase client library did not load. Check your internet connection or CDN blocking."
            : "Supabase is not configured yet. Follow SUPABASE_SETUP.md and fill supabase-config.js."),
        "error",
      );
      return;
    }
    const email = $("#email").value.trim(),
      password = $("#password").value;
    if (mode === "signup") {
      const fullName = $("#full-name").value.trim();
      const confirmation = $("#confirm-password").value;
      if (!fullName) {
        message("Enter your full name.", "error");
        $("#full-name").focus();
        return;
      }
      if (password !== confirmation || !confirmation) {
        message(
          "Enter the same password in both password fields to continue.",
          "error",
        );
        $("#confirm-password").focus();
        return;
      }
    }
    $("#submit-btn").disabled = true;
    $("#submit-btn").textContent = "Please wait…";
    try {
      if (mode === "signup") {
        const full_name = $("#full-name").value.trim();
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name },
            emailRedirectTo: location.origin + "/login.html",
          },
        });
        if (error) throw error;
        if (!data.session) {
          message(
            "Account created. Check your email to confirm it, then sign in.",
            "ok",
          );
          return;
        }
        message("Account created. Opening your workspace…", "ok");
        await routeUser(data.user);
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        await routeUser(data.user);
      }
    } catch (err) {
      const raw = String((err && err.message) || "");
      if (/failed to fetch|networkerror|load failed|fetch failed/i.test(raw)) {
        const diagnosis = await checkSupabaseConnection(false);
        if (!diagnosis.ok) message(diagnosis.message, "error");
        else
          message(
            "Supabase is reachable, but the signup request failed. Check Authentication → Providers → Email, confirm that supabase-config.js uses this same project, and inspect the browser developer console for the request error. If email confirmation is enabled, configure the Site URL and Redirect URLs under Authentication → URL Configuration.",
            "error",
          );
      } else {
        const detail = raw || "Could not sign in. Try again.";
        message(detail, "error");
      }
    } finally {
      $("#submit-btn").textContent =
        mode === "signup" ? "Create account" : "Sign in";
      if (mode === "signup") validateSignup();
      else $("#submit-btn").disabled = false;
    }
  });
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute("aria-pressed", String(show));
      button.setAttribute(
        "aria-label",
        show ? "Hide password" : "Show password",
      );
      button.title = show ? "Hide password" : "Show password";
      button.classList.toggle("is-visible", show);
    });
  });
  $("#toggle-mode").addEventListener("click", () =>
    setMode(mode === "signup" ? "signin" : "signup"),
  );
  ["full-name", "email", "password", "confirm-password"].forEach((id) => {
    const field = document.getElementById(id);
    field.addEventListener("input", () => {
      if (mode === "signup") validateSignup();
    });
  });
  $("#reset-password").addEventListener("click", async () => {
    if (!client) {
      message("Configure Supabase first.", "error");
      return;
    }
    const email = $("#email").value.trim();
    if (!email) {
      message("Enter your email address first.", "error");
      return;
    }
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + "/login.html",
    });
    message(
      error
        ? error.message
        : "If an account exists for that email, a password reset link has been sent.",
      "ok",
    );
  });
  if (new URLSearchParams(location.search).get("mode") === "signup")
    setMode("signup");
})();
