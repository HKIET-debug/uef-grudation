/* ========================================
   ADMIN
======================================== */


/*
    DOM
*/

const loginPage =
    document.getElementById("loginPage");

const adminPage =
    document.getElementById("adminPage");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutBtn =
    document.getElementById("logoutBtn");

const guestTable =
    document.getElementById("guestTable");

const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const refreshBtn =
    document.getElementById("refreshBtn");


let responses = [];



/* ========================================
   KIỂM TRA LOGIN
======================================== */

async function checkAuth() {

    const {
        data: {
            session
        }
    } =
        await supabaseClient
            .auth
            .getSession();


    if (session) {

        showAdmin();

        await loadResponses();

    } else {

        showLogin();

    }

}


function showLogin() {

    loginPage.classList.remove("hidden");

    adminPage.classList.add("hidden");

}


function showAdmin() {

    loginPage.classList.add("hidden");

    adminPage.classList.remove("hidden");

}



/* ========================================
   LOGIN
======================================== */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        loginError.textContent =
            "";


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        const {
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({
                    email,
                    password
                });


        if (error) {

            loginError.textContent =
                "Email hoặc mật khẩu không đúng.";

            return;

        }


        showAdmin();

        await loadResponses();

    }
);



/* ========================================
   LOGOUT
======================================== */

logoutBtn.addEventListener(
    "click",
    async () => {

        await supabaseClient
            .auth
            .signOut();

        showLogin();

    }
);



/* ========================================
   LOAD DATABASE
======================================== */

async function loadResponses() {

    guestTable.innerHTML = `
        <tr>
            <td colspan="6">
                Đang tải dữ liệu...
            </td>
        </tr>
    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("guest_responses")
            .select("*")
            .order(
                "updated_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        guestTable.innerHTML = `
            <tr>
                <td colspan="6">
                    Không thể tải dữ liệu.
                </td>
            </tr>
        `;

        return;

    }


    responses = data || [];


    renderStats();

    renderTable();

}



/* ========================================
   THỐNG KÊ
======================================== */

function renderStats() {

    const total =
        responses.length;


    const attending =
        responses.filter(
            row => row.will_attend === true
        ).length;


    const absent =
        responses.filter(
            row => row.will_attend === false
        ).length;


    /*
        Chú ý:

        Bảng guest_responses chỉ chứa
        người đã gửi RSVP.

        Vì vậy:

        pending không thể lấy từ
        guest_responses.

        Pending sẽ được tính ở bước
        tiếp theo từ danh sách GUESTS.
    */


    const totalPeople =
        responses
            .filter(
                row => row.will_attend
            )
            .reduce(
                (sum, row) =>
                    sum + Number(row.guest_count || 0),
                0
            );


    document
        .getElementById("totalGuests")
        .textContent =
        total;


    document
        .getElementById("attendingGuests")
        .textContent =
        attending;


    document
        .getElementById("absentGuests")
        .textContent =
        absent;


    document
        .getElementById("totalPeople")
        .textContent =
        totalPeople;


    /*
        Pending tạm thời

        Nếu bạn đã có GUESTS,
        tính tổng số khách trong GUESTS.

        Ví dụ:

        GUESTS có 50 người
        responses có 40 người

        pending = 10
    */
const totalGuestList = (typeof GUESTS !== "undefined" && GUESTS) 
    ? Object.keys(GUESTS).length 
    : 0;

const pending = Math.max(totalGuestList - total, 0);


    document
        .getElementById("pendingGuests")
        .textContent =
        pending;

}



/* ========================================
   RENDER TABLE
======================================== */

function renderTable() {

    const keyword =
        searchInput
            .value
            .trim()
            .toLowerCase();


    const filter =
        statusFilter.value;


    const responseSlugs = new Set(
        responses.map(row => row.guest_slug)
    );

    const pendingRows =
        (typeof GUESTS !== "undefined" ? Object.entries(GUESTS) : [])
            .filter(([slug]) => !responseSlugs.has(slug))
            .map(([guest_slug, guest]) => ({
                guest_slug,
                guest_name: guest.name,
                will_attend: null,
                guest_count: 0,
                note: "—",
                updated_at: null
            }));

    let filtered =
        filter === "pending" ? pendingRows : [...responses];


    /*
        SEARCH
    */

    if (keyword) {

        filtered =
            filtered.filter(
                row =>
                    row.guest_name
                        .toLowerCase()
                        .includes(keyword)
            );

    }


    /*
        FILTER STATUS
    */

    if (filter === "attending") {

        filtered =
            filtered.filter(
                row =>
                    row.will_attend === true
            );

    }


    if (filter === "absent") {

        filtered =
            filtered.filter(
                row =>
                    row.will_attend === false
            );

    }


    /*
        Không có dữ liệu
    */

    if (filtered.length === 0) {

        guestTable.innerHTML = `
            <tr>
                <td colspan="6">
                    Không có dữ liệu.
                </td>
            </tr>
        `;

        return;

    }


    /*
        RENDER
    */

    guestTable.innerHTML =
        filtered
            .map(
                (row, index) => {

                    let status = "";

                    let statusClass = "";


                    if (row.will_attend === null) {

                        status = "○ Chưa phản hồi";
                        statusClass = "pending";

                    } else if (row.will_attend) {

                        status =
                            "✓ Sẽ tham dự";

                        statusClass =
                            "attending";

                    } else {

                        status =
                            "✕ Không tham dự";

                        statusClass =
                            "absent";

                    }


                    return `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>


                            <td>

                                <strong>
                                    ${escapeHtml(
                                        row.guest_name
                                    )}
                                </strong>

                                <div class="slug">
                                    ${escapeHtml(
                                        row.guest_slug
                                    )}
                                </div>

                            </td>


                            <td>

                                <span
                                    class="status ${statusClass}"
                                >
                                    ${status}
                                </span>

                            </td>


                            <td>

                                ${
                                    row.will_attend
                                        ? row.guest_count
                                        : "0"
                                }

                            </td>


                            <td>

                                <div class="note">

                                    ${
                                        escapeHtml(
                                            row.note || "—"
                                        )
                                    }

                                </div>

                            </td>


                            <td>

                                ${formatDateTime(
                                    row.updated_at
                                )}

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}



/* ========================================
   SEARCH
======================================== */

searchInput.addEventListener(
    "input",
    renderTable
);


statusFilter.addEventListener(
    "change",
    renderTable
);


refreshBtn.addEventListener(
    "click",
    loadResponses
);



/* ========================================
   FORMAT DATE
======================================== */

function formatDateTime(value) {

    if (!value) {
        return "—";
    }


    return new Intl.DateTimeFormat(
        "vi-VN",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    ).format(
        new Date(value)
    );

}



/* ========================================
   SECURITY
======================================== */

function escapeHtml(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}



/* ========================================
   START
======================================== */

checkAuth();