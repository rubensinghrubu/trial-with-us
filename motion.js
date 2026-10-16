(() => {
  const reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsCrossDocument =
    "onpagereveal" in window && location.protocol !== "file:";
  if (!supportsCrossDocument) {
    document.documentElement.classList.add("fb");
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (
        !link ||
        link.target ||
        link.hasAttribute("download") ||
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const raw = link.getAttribute("href") || "";
      if (
        !raw ||
        raw.startsWith("#") ||
        /^(https?:|mailto:|tel:|sms:|javascript:)/i.test(raw)
      )
        return;
      let target;
      try {
        target = new URL(link.href, location.href);
      } catch (_) {
        return;
      }
      if (target.origin !== location.origin || target.href === location.href)
        return;
      event.preventDefault();
      if (reduced) {
        location.href = target.href;
        return;
      }
      document.body.classList.add("out");
      window.setTimeout(() => {
        location.href = target.href;
      }, 210);
    });
    window.addEventListener("pageshow", () =>
      document.body.classList.remove("out"),
    );
  }
  if (reduced) return;
  document.documentElement.classList.add("twu-motion-ready");
  const targets =
    "main, .blk, .ban .w, .card, .dash-panel, .dash-item, .destination-card, .state-feature-card, .destination-controls, .destination-results-heading, .checkout-line, .checkout-summary, .auth-card, .gallery-item, .gallery-card";
  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              entry.target.classList.add("is-in-view");
              observer.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -6% 0px", threshold: 0.04 },
        )
      : null;
  const enhance = (root) => {
    if (!observer || !root || !(root instanceof Element || root === document))
      return;
    const nodes = [];
    if (root instanceof Element && root.matches(targets)) nodes.push(root);
    nodes.push(...root.querySelectorAll(targets));
    nodes.forEach((node, index) => {
      if (
        node.closest(".top, .ft, .tile-modal, .cw, .td, .ov") ||
        node.dataset.motionObserved === "true"
      )
        return;
      if (
        node.matches("main") &&
        node.querySelector(".blk, .destination-card, .dash-panel, .auth-card")
      )
        return;
      node.dataset.motionObserved = "true";
      node.style.setProperty(
        "--reveal-delay",
        `${Math.min(index % 5, 4) * 45}ms`,
      );
      node.classList.add("twu-reveal");
      observer.observe(node);
    });
  };
  const run = () => enhance(document);
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
  if ("MutationObserver" in window)
    new MutationObserver((records) =>
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (node.nodeType === 1) enhance(node);
        }),
      ),
    ).observe(document.documentElement, { childList: true, subtree: true });
})();
