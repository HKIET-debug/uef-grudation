function $(id) {
  return document.getElementById(id);
}

function getGuestSlug() {
  const path = decodeURIComponent(window.location.pathname)
    .replace(/^\/+|\/+$/g, "");

  // Dạng chính: /thiep/<slug>
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 2 && parts[0].toLowerCase() === "thiep") {
    return parts[1];
  }

  // Cho phép test nhanh: ?guest=<slug>
  const params = new URLSearchParams(window.location.search);
  return params.get("guest") || "";
}

function getGuest() {
  const slug = getGuestSlug();
  if (slug && GUESTS[slug]) return GUESTS[slug];

  // Khi chưa có slug hoặc chưa có dữ liệu, dùng lời chào chung.
  return { name: "Bạn thân mến" };
}

function formatDateVN(dateString) {
  if (!dateString) return "Chưa cập nhật";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date).replaceAll("/", " / ");
}

function formatTime(time) {
  if (!time) return "Chưa cập nhật";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;

  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

function applyConfig() {
  const guest = getGuest();

  $("university").textContent = INVITATION.university;
  $("guestName").textContent = guest.name;
  $("graduateName").textContent = INVITATION.graduateName;

  $("eventDate").textContent = formatDateVN(INVITATION.eventDate);
  $("eventTime").textContent = formatTime(INVITATION.eventTime);
  $("eventLocation").textContent = INVITATION.location;
  $("eventAddress").textContent = INVITATION.address;
    setContactLink($("modalContactHa"), "SDT Thu Hà", INVITATION.contactHa);
    setContactLink($("modalContactHaBe"), "SDT Hà bé", INVITATION.contactHaBe);
  $("closingMessage").textContent = INVITATION.closingMessage;

  const map = $("mapLink");
  if (INVITATION.mapUrl) {
    map.href = INVITATION.mapUrl;
    map.style.display = "inline-block";
  } else {
    map.style.display = "none";
  }

  // Cập nhật title để khi chia sẻ link có thông tin rõ ràng hơn.
  document.title = `Thiệp mời tốt nghiệp UEF - ${INVITATION.graduateName}`;
}

function setContactLink(element, label, phone) {
    element.textContent = `${label}: ${phone}`;
    element.href = `tel:${phone}`;
}

const contactBtn = $("contactBtn");
const contactModal = $("contactModal");
const contactModalClose = $("contactModalClose");

function setContactModal(open) {
    contactModal.classList.toggle("is-open", open);
    contactModal.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("modal-open", open);

    if (open) {
        contactModalClose.focus();
    } else {
        contactBtn.focus();
    }
}

contactBtn.addEventListener("click", () => setContactModal(true));
contactModalClose.addEventListener("click", () => setContactModal(false));
contactModal.querySelector("[data-close-contact]").addEventListener("click", () => {
    setContactModal(false);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contactModal.classList.contains("is-open")) {
        setContactModal(false);
    }
});

function startCountdown() {
  const target = new Date(
    `${INVITATION.eventDate}T${INVITATION.eventTime || "00:00"}:00`
  );

  function tick() {
    const diff = target.getTime() - Date.now();

    if (Number.isNaN(target.getTime()) || diff <= 0) {
      $("days").textContent = "00";
      $("hours").textContent = "00";
      $("minutes").textContent = "00";
      $("seconds").textContent = "00";
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff / 3600000) % 24);
    const minutes = Math.floor((diff / 60000) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

        const values = {
            days: String(days).padStart(2, "0"),
            hours: String(hours).padStart(2, "0"),
            minutes: String(minutes).padStart(2, "0"),
            seconds: String(seconds).padStart(2, "0")
        };

        Object.entries(values).forEach(([id, value]) => {
            const element = $(id);
            if (element.textContent === value) return;

            element.textContent = value;
            element.classList.remove("is-ticking");
            void element.offsetWidth;
            element.classList.add("is-ticking");
        });
  }

  tick();
  setInterval(tick, 1000);
}

function setupMotionEffects() {
    const invitation = $("invitation");
    const hero = document.querySelector(".hero");
    const heroContent = document.querySelector(".hero-content");
    const sections = document.querySelectorAll(".invitation > .section");
    const revealItems = document.querySelectorAll(
        ".event-card, .photo-frame, .map-btn, #rsvpForm, footer"
    );

    invitation.classList.add("motion-ready");
    revealItems.forEach((item) => item.classList.add("reveal-item"));

    $("openInvitation").addEventListener("click", () => {
        hero.classList.add("is-open");
        heroContent.classList.add("is-visible");
    }, { once: true });

    if (!("IntersectionObserver" in window)) {
        sections.forEach((section) => section.classList.add("is-visible"));
        revealItems.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
        });
    }, { threshold: .15 });

    sections.forEach((section) => observer.observe(section));
    revealItems.forEach((item) => observer.observe(item));
}

$("openInvitation").addEventListener("click", () => {
  $("cover").classList.add("closed");
  $("invitation").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

$("shareBtn").addEventListener("click", async () => {
  const guest = getGuest();
  const data = {
    title: "Thiệp mời tốt nghiệp UEF",
    text: `Nguyễn Thu Hà trân trọng mời ${guest.name} đến dự lễ tốt nghiệp.`,
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(data);
    } catch (_) {}
    return;
  }

  try {
    await navigator.clipboard.writeText(window.location.href);
    $("shareBtn").textContent = "ĐÃ SAO CHÉP LINK";
    setTimeout(() => {
      $("shareBtn").textContent = "CHIA SẺ THIỆP";
    }, 1800);
  } catch (_) {
    window.prompt("Sao chép link thiệp:", window.location.href);
  }
});

applyConfig();
startCountdown();
setupMotionEffects();
/* ========================================
   RSVP
======================================== */

const rsvpForm = document.getElementById("rsvpForm");

const guestCountWrapper =
    document.getElementById("guestCountWrapper");

const guestCount =
    document.getElementById("guestCount");

const rsvpMessage =
    document.getElementById("rsvpMessage");

const rsvpSubmit =
    document.getElementById("rsvpSubmit");

const attendanceCelebration =
    document.getElementById("attendanceCelebration");

const celebrationImage =
    attendanceCelebration.querySelector("img");

celebrationImage.addEventListener("animationend", (event) => {
    if (event.animationName !== "heartImageCelebration") return;

    attendanceCelebration.classList.add("is-collapsing");
    attendanceCelebration.classList.remove("is-visible");
});


/*
    Lấy slug của người được mời.

    Ví dụ:

    /thiep/nguyen-van-a

    sẽ trả về:

    nguyen-van-a
*/

function getCurrentGuestSlug() {

    const path =
        decodeURIComponent(window.location.pathname)
        .replace(/^\/+|\/+$/g, "");

    const parts =
        path.split("/").filter(Boolean);

    if (
        parts.length >= 2 &&
        parts[0].toLowerCase() === "thiep"
    ) {
        return parts[1];
    }

    return "";
}


/*
    Khi chọn:

    "Không tham dự"

    thì ẩn phần số người.
*/

document
    .querySelectorAll('input[name="willAttend"]')
    .forEach((radio) => {

        radio.addEventListener("change", () => {

            const isAttending = radio.checked && radio.value === "yes";

            if (radio.checked) {
                attendanceCelebration.classList.remove("is-visible", "is-collapsing");

                if (isAttending) {
                    void attendanceCelebration.offsetWidth;
                    attendanceCelebration.classList.add("is-visible");
                }

                attendanceCelebration.setAttribute("aria-hidden", String(!isAttending));
            }

            if (radio.checked && radio.value === "no") {

                guestCountWrapper.style.display = "none";

                guestCount.value = "0";

            }

            if (radio.checked && radio.value === "yes") {

                guestCountWrapper.style.display = "block";

                if (guestCount.value === "0") {
                    guestCount.value = "1";
                }

            }

        });

    });


/*
    Gửi xác nhận vào Supabase
*/

rsvpForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const selected =
        document.querySelector(
            'input[name="willAttend"]:checked'
        );

    if (!selected) {

        showRsvpMessage(
            "Vui lòng chọn bạn có tham dự hay không.",
            "error"
        );

        return;
    }


    const willAttend =
        selected.value === "yes";


    const count =
        willAttend
            ? Number(guestCount.value)
            : 0;


    const guest =
        getGuest();


    const guestSlug =
        getCurrentGuestSlug();


    /*
        Nếu URL không có slug
    */

    if (!guestSlug) {

        showRsvpMessage(
            "Link thiệp không hợp lệ. Vui lòng mở đúng link được gửi cho bạn.",
            "error"
        );

        return;
    }


    rsvpSubmit.disabled = true;
    rsvpSubmit.classList.add("is-loading");

    rsvpSubmit.textContent =
        "ĐANG GỬI...";


    try {

        /*
            Kiểm tra xem khách này đã xác nhận chưa
        */

        const { data: existing, error: findError } =
            await supabaseClient
                .from("guest_responses")
                .select("id")
                .eq("guest_slug", guestSlug)
                .maybeSingle();


        if (findError) {
            throw findError;
        }


        const payload = {

            guest_slug: guestSlug,

            guest_name: guest.name,

            will_attend: willAttend,

            guest_count: count,

            note:
                document
                    .getElementById("guestNote")
                    .value
                    .trim(),

            updated_at:
                new Date().toISOString()

        };


        /*
            Nếu đã tồn tại:

            UPDATE

            Nếu chưa tồn tại:

            INSERT
        */

        if (existing) {

            const { error } =
                await supabaseClient
                    .from("guest_responses")
                    .update(payload)
                    .eq("guest_slug", guestSlug);

            if (error) {
                throw error;
            }

        } else {

            const { error } =
                await supabaseClient
                    .from("guest_responses")
                    .insert({
                        ...payload,
                        created_at:
                            new Date().toISOString()
                    });

            if (error) {
                throw error;
            }

        }


        showRsvpMessage(
            willAttend
                ? `Cảm ơn ${guest.name}! Hà đã ghi nhận bạn sẽ tham dự cùng ${count} người. ❤️`
                : `Cảm ơn ${guest.name}! Hà đã ghi nhận bạn không thể tham dự. ❤️`,
            "success"
        );


        rsvpSubmit.textContent =
            "ĐÃ XÁC NHẬN";
        rsvpSubmit.classList.remove("is-loading");


    } catch (error) {

        console.error(
            "RSVP ERROR:",
            error
        );

        showRsvpMessage(
            "Có lỗi xảy ra khi gửi xác nhận. Vui lòng thử lại.",
            "error"
        );

        rsvpSubmit.disabled = false;
        rsvpSubmit.classList.remove("is-loading");

        rsvpSubmit.textContent =
            "XÁC NHẬN THAM DỰ";

    }

});


function showRsvpMessage(
    message,
    type
) {

    rsvpMessage.textContent =
        message;

    rsvpMessage.className =
        "rsvp-message rsvp-" + type;

}