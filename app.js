/**
 * CleanPro Laundry Management Suite - Professional Business Edition
 * Core Application Engine & State Controller
 */

// Global Error Handler
window.addEventListener('error', function(e) {
    console.warn('System notice caught:', e.message);
});

// ==========================================
// 1. DATABASE & INITIAL STATE
// ==========================================
const db = {
    users: JSON.parse(localStorage.getItem('cp_users')) || [],
    services: JSON.parse(localStorage.getItem('cp_services')) || [],
    timeSlots: JSON.parse(localStorage.getItem('cp_timeSlots')) || [],
    appointments: JSON.parse(localStorage.getItem('cp_appointments')) || [],
    orders: JSON.parse(localStorage.getItem('cp_orders')) || [],
    queueEntries: JSON.parse(localStorage.getItem('cp_queueEntries')) || [],
    pickupSchedules: JSON.parse(localStorage.getItem('cp_pickupSchedules')) || [],
    announcements: JSON.parse(localStorage.getItem('cp_announcements')) || [],
    notifications: JSON.parse(localStorage.getItem('cp_notifications')) || [],
    shop: JSON.parse(localStorage.getItem('cp_shop')) || {
        name: 'CleanPro Laundry & Dry Cleaning',
        tagline: 'Premium Garment Care & Express Services',
        logo: '🧺',
        phone: '+63 (02) 8876-5432',
        email: 'care@cleanprolaundry.com',
        address: 'Ground Floor, Horizon Commerce Center, Ayala Ave, Makati City',
        openingTime: '08:00',
        closingTime: '19:00',
        currency: '₱'
    },
    settings: JSON.parse(localStorage.getItem('cp_settings')) || {
        bookingWindow: 30,
        rescheduleWindow: 24,
        cancelWindow: 24,
        pickupMode: 'admin'
    }
};

// ==========================================
// 2. MAIN APP OBJECT
// ==========================================
const app = {
    currentUser: JSON.parse(sessionStorage.getItem('cp_currentUser')) || null,
    selectedServiceId: null,
    selectedSlotId: null,

    // Initialize System & Mock Data
    init() {
        this.seedInitialData();
        this.bindGlobalEvents();
        this.startLiveClock();

        if (this.currentUser) {
            this.showAppShell();
        } else {
            this.showAuthView();
        }
    },

    seedInitialData() {
        // Pre-seed default accounts
        if (db.users.length === 0) {
            db.users = [
                {
                    id: 'usr-admin-01',
                    email: 'owner@cleanpro.com',
                    password: 'owner123',
                    firstName: 'Alexander',
                    lastName: 'Vance',
                    phone: '+63 917 800 0001',
                    address: 'CleanPro HQ, Makati City',
                    role: 'owner',
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'usr-staff-01',
                    email: 'staff@cleanpro.com',
                    password: 'staff123',
                    firstName: 'Sarah',
                    lastName: 'Jenkins',
                    phone: '+63 917 800 0002',
                    address: 'Makati Operations Hub',
                    role: 'staff',
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'usr-cust-01',
                    email: 'maria@example.com',
                    password: 'maria123',
                    firstName: 'Maria',
                    lastName: 'Santos',
                    phone: '+63 918 555 1234',
                    address: 'Unit 402 Horizon Towers, Legazpi Village, Makati',
                    role: 'customer',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveDB('users');
        }

        // Pre-seed services
        if (db.services.length === 0) {
            db.services = [
                { 
                    id: 'srv-01', 
                    name: 'Standard Wash & Fold', 
                    description: 'Full cycle wash with hypoallergenic detergent, fabric softener, tumble dry & crisp fold.', 
                    basePrice: 160, 
                    estimatedDays: 2, 
                    isActive: true 
                },
                { 
                    id: 'srv-02', 
                    name: 'Premium Dry Cleaning', 
                    description: 'Delicate garment care, spotting, organic eco-solvents, steam press & hanger wrap.', 
                    basePrice: 280, 
                    estimatedDays: 3, 
                    isActive: true 
                },
                { 
                    id: 'srv-03', 
                    name: 'Duvet & Comforter Care', 
                    description: 'Heavy blanket and bedding deep antibacterial steam sanitizing & anti-dust mite cycle.', 
                    basePrice: 350, 
                    estimatedDays: 2, 
                    isActive: true 
                },
                { 
                    id: 'srv-04', 
                    name: 'Express Same-Day Wash', 
                    description: 'Priority turnaround within 8 hours. Washed, dried, pressed, and neatly packed.', 
                    basePrice: 420, 
                    estimatedDays: 1, 
                    isActive: true 
                }
            ];
            this.saveDB('services');
        }

        // Pre-seed time slots
        if (db.timeSlots.length === 0) {
            const days = [0, 1, 2, 3, 4, 5, 6];
            let slotId = 1;
            days.forEach(day => {
                db.timeSlots.push(
                    { id: `slot-${slotId++}`, dayOfWeek: day, startTime: '09:00', endTime: '11:00', maxCapacity: 6, currentBookings: 1, isActive: true },
                    { id: `slot-${slotId++}`, dayOfWeek: day, startTime: '11:00', endTime: '13:00', maxCapacity: 6, currentBookings: 0, isActive: true },
                    { id: `slot-${slotId++}`, dayOfWeek: day, startTime: '14:00', endTime: '16:00', maxCapacity: 6, currentBookings: 2, isActive: true },
                    { id: `slot-${slotId++}`, dayOfWeek: day, startTime: '16:00', endTime: '18:00', maxCapacity: 6, currentBookings: 1, isActive: true }
                );
            });
            this.saveDB('timeSlots');
        }

        // Pre-seed sample active orders if empty
        if (db.orders.length === 0) {
            const today = new Date().toISOString().split('T')[0];
            db.appointments = [
                {
                    id: 'apt-101',
                    customerId: 'usr-cust-01',
                    appointmentDate: today,
                    timeSlotId: 'slot-1',
                    status: 'scheduled',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'apt-102',
                    customerId: 'usr-cust-01',
                    appointmentDate: today,
                    timeSlotId: 'slot-3',
                    status: 'completed',
                    createdAt: new Date().toISOString()
                }
            ];

            db.orders = [
                {
                    id: 'ORD-8921',
                    appointmentId: 'apt-101',
                    customerId: 'usr-cust-01',
                    serviceId: 'srv-01',
                    quantity: 4.5,
                    specialInstructions: 'Please separate whites and colored items.',
                    estimatedPickupDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
                    status: 'processing',
                    totalPrice: 720,
                    createdAt: new Date().toISOString(),
                    completedAt: null
                },
                {
                    id: 'ORD-8419',
                    appointmentId: 'apt-102',
                    customerId: 'usr-cust-01',
                    serviceId: 'srv-02',
                    quantity: 2,
                    specialInstructions: 'Business blazers - heavy starch on lapels.',
                    estimatedPickupDate: today,
                    status: 'ready-for-pickup',
                    totalPrice: 560,
                    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                    completedAt: null
                }
            ];

            db.announcements = [
                {
                    id: 'anc-01',
                    title: '🌧️ Monsoon Care Promo: 15% Off Bedding',
                    content: 'Ensure cozy, allergen-free bedding during the rainy season. Comforter care discount applies automatically this week.',
                    type: 'general',
                    startDate: today,
                    endDate: '2026-11-30',
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            ];

            db.notifications = [
                {
                    id: 'notif-01',
                    recipientUserId: 'usr-cust-01',
                    type: 'order-status',
                    message: 'Good news! Your order #ORD-8419 is sanitized and ready for pickup at our counter.',
                    isRead: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'notif-02',
                    recipientUserId: 'usr-cust-01',
                    type: 'appointment-confirmed',
                    message: 'Your drop-off booking for today has been logged into queue position #1.',
                    isRead: true,
                    createdAt: new Date(Date.now() - 3600000).toISOString()
                }
            ];

            this.saveDB('appointments');
            this.saveDB('orders');
            this.saveDB('announcements');
            this.saveDB('notifications');
        }
    },

    bindGlobalEvents() {
        // Close modal when clicking backdrop
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            });
        });

        // Close on ESC key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(m => {
                    this.closeModal(m.id);
                });
                this.closeNotifications();
            }
        });

        // Close notification dropdown if clicked outside
        window.addEventListener('click', (e) => {
            const notifWrapper = document.querySelector('.notif-wrapper');
            if (notifWrapper && !notifWrapper.contains(e.target)) {
                this.closeNotifications();
            }
        });
    },

    startLiveClock() {
        const update = () => {
            const clockEl = document.getElementById('live-clock');
            if (clockEl) {
                const now = new Date();
                const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
                clockEl.textContent = now.toLocaleDateString('en-US', options);
            }
        };
        update();
        setInterval(update, 1000);
    },

    // ==========================================
    // 3. AUTHENTICATION & SESSION
    // ==========================================
    showAuthView() {
        document.getElementById('auth-view').style.display = 'flex';
        document.getElementById('app-shell').style.display = 'none';
    },

    showAppShell() {
        document.getElementById('auth-view').style.display = 'none';
        document.getElementById('app-shell').style.display = 'flex';
        this.updateShopBranding();
        this.setupNavigation();
        this.updateHeaderUserInfo();
        this.renderNotificationsDropdown();

        // Direct user to role dashboard
        if (this.currentUser.role === 'customer') {
            this.navigate('customer-dashboard');
        } else if (this.currentUser.role === 'staff') {
            this.navigate('staff-dashboard');
        } else {
            this.navigate('admin-dashboard');
        }
    },

    login(e) {
        if (e) e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            if (user.status !== 'active') {
                this.showToast('Your account is currently disabled. Contact administration.', 'danger');
                return;
            }
            this.setCurrentUser(user);
            this.showToast(`Welcome back, ${user.firstName}!`, 'success');
        } else {
            this.showToast('Invalid credentials. Check email and password.', 'danger');
        }
    },

    register(e) {
        if (e) e.preventDefault();
        const email = document.getElementById('reg-email').value.trim();

        if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showToast('This email is already registered. Please sign in.', 'danger');
            return;
        }

        const newUser = {
            id: 'usr-' + Date.now().toString().slice(-6),
            email,
            password: document.getElementById('reg-password').value,
            firstName: document.getElementById('reg-fname').value.trim(),
            lastName: document.getElementById('reg-lname').value.trim(),
            phone: document.getElementById('reg-phone').value.trim() || '—',
            address: document.getElementById('reg-address').value.trim() || '—',
            role: 'customer',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        db.users.push(newUser);
        this.saveDB('users');
        this.showToast('Account registered successfully! Signing you in...', 'success');
        this.setCurrentUser(newUser);
    },

    setCurrentUser(user) {
        this.currentUser = user;
        sessionStorage.setItem('cp_currentUser', JSON.stringify(user));
        this.showAppShell();
    },

    logout() {
        if (!confirm('Are you sure you want to sign out?')) return;
        this.currentUser = null;
        sessionStorage.removeItem('cp_currentUser');
        this.showToast('You have been logged out securely.', 'info');
        this.showAuthView();
    },

    // ==========================================
    // 4. NAVIGATION & SHELL
    // ==========================================
    updateShopBranding() {
        const logoDisplays = document.querySelectorAll('.shop-logo-slot');
        const isImage = db.shop.logo && (db.shop.logo.startsWith('data:image/') || db.shop.logo.startsWith('http') || db.shop.logo.startsWith('blob:'));

        logoDisplays.forEach(el => {
            if (isImage) {
                el.innerHTML = `<img src="${db.shop.logo}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: inherit; display: block;">`;
            } else {
                el.textContent = db.shop.logo || '🧺';
            }
        });

        const nameDisplays = document.querySelectorAll('.shop-name-slot');
        nameDisplays.forEach(el => el.textContent = db.shop.name);

        const taglineDisplays = document.querySelectorAll('.shop-tagline-slot');
        taglineDisplays.forEach(el => el.textContent = db.shop.tagline);

        document.title = `${db.shop.name} | Laundry & Dry Cleaning Suite`;
    },

    updateHeaderUserInfo() {
        if (!this.currentUser) return;
        const nameEl = document.getElementById('header-user-name');
        const roleEl = document.getElementById('header-user-role');
        const avatarEl = document.getElementById('header-user-avatar');
        const footerNameEl = document.getElementById('sidebar-user-name');
        const footerRoleEl = document.getElementById('sidebar-user-role');

        const fullName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        const initials = `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();

        const displayRole = (this.currentUser.role === 'admin' || this.currentUser.role === 'owner') 
            ? 'Owner' 
            : (this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1));

        if (nameEl) nameEl.textContent = fullName;
        if (roleEl) roleEl.textContent = displayRole;
        if (avatarEl) avatarEl.textContent = initials;
        if (footerNameEl) footerNameEl.textContent = fullName;
        if (footerRoleEl) footerRoleEl.textContent = displayRole.toUpperCase();
    },

    setupNavigation() {
        const sidebarNav = document.getElementById('sidebar-nav-container');
        if (!sidebarNav) return;
        sidebarNav.innerHTML = '';

        const role = this.currentUser.role;
        const navStructure = {
            customer: [
                {
                    group: 'Overview',
                    items: [
                        { id: 'customer-dashboard', label: 'Dashboard', icon: 'fa-chart-pie' }
                    ]
                },
                {
                    group: 'Bookings & Orders',
                    items: [
                        { id: 'customer-booking', label: 'Book Appointment', icon: 'fa-calendar-plus' },
                        { id: 'customer-appointments', label: 'My Appointments', icon: 'fa-calendar-check' },
                        { id: 'customer-orders', label: 'My Orders & Tracking', icon: 'fa-shirt' }
                    ]
                }
            ],
            staff: [
                {
                    group: 'Overview',
                    items: [
                        { id: 'staff-dashboard', label: 'Dashboard', icon: 'fa-chart-pie' }
                    ]
                },
                {
                    group: 'Operations',
                    items: [
                        { id: 'staff-queue', label: 'Queue & Check-In', icon: 'fa-list-check' },
                        { id: 'staff-orders', label: 'Manage Orders', icon: 'fa-boxes-stacked' }
                    ]
                }
            ],
            admin: [
                {
                    group: 'Overview',
                    items: [
                        { id: 'admin-dashboard', label: 'Dashboard', icon: 'fa-chart-pie' }
                    ]
                },
                {
                    group: 'Operations',
                    items: [
                        { id: 'admin-appointments', label: 'All Appointments', icon: 'fa-calendar-days' },
                        { id: 'admin-pickups', label: 'Pickup Deliveries', icon: 'fa-truck-fast' },
                        { id: 'admin-timeslots', label: 'Time Slot Matrix', icon: 'fa-clock' }
                    ]
                },
                {
                    group: 'Management',
                    items: [
                        { id: 'admin-users', label: 'User Directory', icon: 'fa-users' },
                        { id: 'admin-services', label: 'Services & Pricing', icon: 'fa-tags' },
                        { id: 'admin-announcements', label: 'Announcements', icon: 'fa-bullhorn' }
                    ]
                },
                {
                    group: 'Analytics & Config',
                    items: [
                        { id: 'admin-reports', label: 'Revenue Reports', icon: 'fa-file-invoice-dollar' },
                        { id: 'admin-settings', label: 'Shop & System Config', icon: 'fa-sliders' }
                    ]
                }
            ]
        };

        const navKey = (role === 'owner' || role === 'admin') ? 'admin' : role;
        const groups = navStructure[navKey] || [];
        groups.forEach(grp => {
            const groupTitle = document.createElement('div');
            groupTitle.className = 'sidebar-nav-group-title';
            groupTitle.textContent = grp.group;
            sidebarNav.appendChild(groupTitle);

            const ul = document.createElement('ul');
            ul.className = 'sidebar-nav-list';

            grp.items.forEach(item => {
                const li = document.createElement('li');
                li.className = 'sidebar-nav-item';
                li.innerHTML = `
                    <a href="#" class="sidebar-nav-link" id="nav-link-${item.id}" onclick="event.preventDefault(); app.navigate('${item.id}')">
                        <i class="fa-solid ${item.icon}"></i>
                        <span>${item.label}</span>
                    </a>
                `;
                ul.appendChild(li);
            });
            sidebarNav.appendChild(ul);
        });
    },

    navigate(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.sidebar-nav-link').forEach(l => l.classList.remove('active'));

        const targetPage = document.getElementById(`page-${pageId}`);
        const targetNav = document.getElementById(`nav-link-${pageId}`);

        if (targetPage) targetPage.classList.add('active');
        if (targetNav) targetNav.classList.add('active');

        // Close mobile drawer if open
        this.closeMobileSidebar();

        // Route dispatcher
        if (pageId.startsWith('customer-')) this.loadCustomerView(pageId);
        else if (pageId.startsWith('staff-')) this.loadStaffView(pageId);
        else if (pageId.startsWith('admin-')) this.loadAdminView(pageId);
    },

    toggleMobileSidebar() {
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('active');
        }
    },

    closeMobileSidebar() {
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        if (sidebar && overlay) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        }
    },

    // ==========================================
    // 5. NOTIFICATION CENTER
    // ==========================================
    toggleNotifications() {
        const dropdown = document.getElementById('notif-dropdown');
        if (dropdown) dropdown.classList.toggle('active');
    },

    closeNotifications() {
        const dropdown = document.getElementById('notif-dropdown');
        if (dropdown) dropdown.classList.remove('active');
    },

    renderNotificationsDropdown() {
        const unreadBadge = document.getElementById('notif-badge');
        const listContainer = document.getElementById('notif-dropdown-list');
        if (!listContainer || !this.currentUser) return;

        const userNotifs = db.notifications
            .filter(n => n.recipientUserId === this.currentUser.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const unreadCount = userNotifs.filter(n => !n.isRead).length;

        if (unreadBadge) {
            if (unreadCount > 0) {
                unreadBadge.textContent = unreadCount;
                unreadBadge.style.display = 'flex';
            } else {
                unreadBadge.style.display = 'none';
            }
        }

        if (userNotifs.length === 0) {
            listContainer.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: var(--slate-400);">
                    <i class="fa-regular fa-bell-slash" style="font-size: 2rem; margin-bottom: 0.5rem; display:block;"></i>
                    <p style="font-size: 0.85rem;">No notifications right now</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = userNotifs.slice(0, 6).map(n => `
            <div class="notif-dropdown-item ${!n.isRead ? 'unread' : ''}" onclick="app.markNotificationRead('${n.id}')">
                <div class="notif-item-icon">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <div class="notif-item-content">
                    <div class="notif-item-title">${n.type.replace('-', ' ').toUpperCase()}</div>
                    <div class="notif-item-message">${n.message}</div>
                    <div class="notif-item-time">${new Date(n.createdAt).toLocaleDateString()} • ${new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
        `).join('');
    },

    markNotificationRead(notifId) {
        const notif = db.notifications.find(n => n.id === notifId);
        if (notif) {
            notif.isRead = true;
            this.saveDB('notifications');
            this.renderNotificationsDropdown();
        }
    },

    markAllNotificationsRead() {
        if (!this.currentUser) return;
        db.notifications
            .filter(n => n.recipientUserId === this.currentUser.id)
            .forEach(n => n.isRead = true);
        this.saveDB('notifications');
        this.renderNotificationsDropdown();
        this.showToast('All notifications marked as read', 'info');
    },

    addNotification(recipientId, orderId, appointmentId, type, message) {
        const notif = {
            id: 'notif-' + Date.now().toString(),
            recipientUserId: recipientId,
            orderId: orderId,
            appointmentId: appointmentId,
            type: type,
            message: message,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        db.notifications.push(notif);
        this.saveDB('notifications');
        if (this.currentUser && this.currentUser.id === recipientId) {
            this.renderNotificationsDropdown();
        }
    },

    // ==========================================
    // 6. CUSTOMER VIEWS & BOOKING ENGINE
    // ==========================================
    loadCustomerView(pageId) {
        switch (pageId) {
            case 'customer-dashboard':
                this.loadCustomerDashboard();
                break;
            case 'customer-booking':
                this.loadBookingForm();
                break;
            case 'customer-appointments':
                this.loadCustomerAppointments();
                break;
            case 'customer-orders':
                this.loadCustomerOrders();
                break;
        }
    },

    loadCustomerDashboard() {
        // Render Active Announcements
        const bannerContainer = document.getElementById('customer-announcements-banner');
        if (bannerContainer) {
            const today = new Date().toISOString().split('T')[0];
            const activeBanners = db.announcements.filter(a => a.isActive && a.startDate <= today && a.endDate >= today);
            bannerContainer.innerHTML = activeBanners.map(a => `
                <div class="alert alert-info" style="margin-bottom: 1.5rem;">
                    <i class="fa-solid fa-bullhorn" style="font-size: 1.25rem;"></i>
                    <div>
                        <strong>${a.title}</strong>
                        <div style="font-size: 0.85rem; margin-top: 0.2rem;">${a.content}</div>
                    </div>
                </div>
            `).join('');
        }

        // Stats
        const myOrders = db.orders.filter(o => o.customerId === this.currentUser.id);
        const readyCount = myOrders.filter(o => o.status === 'ready-for-pickup').length;
        const inProgressCount = myOrders.filter(o => o.status === 'processing' || o.status === 'pending').length;

        document.getElementById('cust-stat-ready').textContent = readyCount;
        document.getElementById('cust-stat-progress').textContent = inProgressCount;
        document.getElementById('cust-stat-total').textContent = myOrders.length;

        // Next Appointment
        const nextApt = db.appointments
            .filter(a => a.customerId === this.currentUser.id && a.status === 'scheduled' && a.appointmentDate >= new Date().toISOString().split('T')[0])
            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

        const nextAptEl = document.getElementById('cust-stat-next-apt');
        if (nextAptEl) {
            if (nextApt) {
                const slot = db.timeSlots.find(s => s.id === nextApt.timeSlotId);
                nextAptEl.textContent = `${nextApt.appointmentDate} (${slot ? slot.startTime : 'Time TBD'})`;
            } else {
                nextAptEl.textContent = 'None Scheduled';
            }
        }

        // Recent Orders List
        const recentOrdersContainer = document.getElementById('cust-recent-orders-list');
        if (recentOrdersContainer) {
            const recent = myOrders.slice(-3).reverse();
            if (recent.length === 0) {
                recentOrdersContainer.innerHTML = `
                    <div style="padding: 2.5rem; text-align: center; color: var(--slate-400);">
                        <i class="fa-solid fa-basket-shopping" style="font-size: 2.5rem; margin-bottom: 0.75rem; display:block;"></i>
                        <p style="font-weight: 600; color: var(--slate-600);">No orders submitted yet.</p>
                        <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="app.navigate('customer-booking')">Book Your First Order</button>
                    </div>
                `;
            } else {
                recentOrdersContainer.innerHTML = recent.map(o => {
                    const srv = db.services.find(s => s.id === o.serviceId) || { name: 'Laundry Service' };
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border-subtle);">
                            <div>
                                <div style="font-weight: 700; font-size: 0.95rem; color: var(--slate-900);">${srv.name} • ${o.id}</div>
                                <div style="font-size: 0.8rem; color: var(--slate-500);">${o.quantity} kg • Est. Pickup: ${o.estimatedPickupDate}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.75rem;">
                                <span class="badge ${this.getStatusBadgeClass(o.status)}">${o.status.replace('-', ' ')}</span>
                                <button class="btn btn-secondary btn-sm" onclick="app.printOrderSlip('${o.id}')"><i class="fa-solid fa-receipt"></i> Slip</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    },

    loadBookingForm() {
        const servicesGrid = document.getElementById('booking-service-cards');
        const dateInput = document.getElementById('booking-date-input');

        // Render Service Cards
        if (servicesGrid) {
            servicesGrid.innerHTML = db.services.filter(s => s.isActive).map(s => `
                <div class="service-pick-card ${this.selectedServiceId === s.id ? 'selected' : ''}" onclick="app.selectServiceCard('${s.id}')">
                    <div class="service-card-top">
                        <span class="service-card-title">${s.name}</span>
                        <span class="service-card-price">${db.shop.currency}${s.basePrice}<span style="font-size: 0.75rem; color: var(--slate-500); font-weight: normal;">/kg</span></span>
                    </div>
                    <div class="service-card-desc">${s.description}</div>
                    <div class="service-card-turnaround">
                        <i class="fa-regular fa-clock"></i> Est. turnaround: ${s.estimatedDays} days
                    </div>
                </div>
            `).join('');
        }

        // Set Date Limits
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + db.settings.bookingWindow);

            dateInput.min = today;
            dateInput.max = maxDate.toISOString().split('T')[0];

            if (!dateInput.value) {
                dateInput.value = today;
            }
            this.loadAvailableSlots(dateInput.value);
        }

        this.calculateBookingEstimate();
    },

    selectServiceCard(serviceId) {
        this.selectedServiceId = serviceId;
        document.getElementById('booking-selected-service').value = serviceId;
        this.loadBookingForm();
    },

    loadAvailableSlots(dateString) {
        const slotsGrid = document.getElementById('booking-slots-grid');
        if (!slotsGrid || !dateString) return;

        const date = new Date(dateString);
        const dayOfWeek = date.getDay();

        const available = db.timeSlots.filter(s => s.dayOfWeek === dayOfWeek && s.isActive);

        if (available.length === 0) {
            slotsGrid.innerHTML = `
                <div class="alert alert-warning" style="grid-column: 1/-1;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>No time slots available for this day. Please select another date.</span>
                </div>
            `;
            return;
        }

        slotsGrid.innerHTML = available.map(slot => {
            const left = slot.maxCapacity - slot.currentBookings;
            const isFull = left <= 0;
            const isSelected = this.selectedSlotId === slot.id;

            return `
                <div class="time-slot-card ${isSelected ? 'selected' : ''} ${isFull ? 'disabled' : ''}" 
                     onclick="${isFull ? '' : `app.selectSlot('${slot.id}')`}">
                    <div class="slot-time-text">${slot.startTime} - ${slot.endTime}</div>
                    <span class="slot-capacity-pill">${isFull ? 'Full' : `${left} slots left`}</span>
                </div>
            `;
        }).join('');
    },

    selectSlot(slotId) {
        this.selectedSlotId = slotId;
        document.getElementById('booking-selected-slot').value = slotId;
        const dateVal = document.getElementById('booking-date-input').value;
        this.loadAvailableSlots(dateVal);
    },

    calculateBookingEstimate() {
        const weightInput = document.getElementById('booking-weight-input');
        const estDisplay = document.getElementById('booking-total-preview');
        if (!estDisplay) return;

        const weight = parseFloat(weightInput?.value) || 1;
        const service = db.services.find(s => s.id === this.selectedServiceId);

        if (service) {
            const total = (service.basePrice * weight).toFixed(2);
            estDisplay.textContent = `${db.shop.currency}${total}`;
        } else {
            estDisplay.textContent = `${db.shop.currency}0.00`;
        }
    },

    submitBooking(e) {
        e.preventDefault();
        const serviceId = document.getElementById('booking-selected-service').value;
        const slotId = document.getElementById('booking-selected-slot').value;
        const date = document.getElementById('booking-date-input').value;
        const weight = parseFloat(document.getElementById('booking-weight-input').value) || 1;
        const instructions = document.getElementById('booking-instructions').value.trim();

        if (!serviceId) {
            this.showToast('Please select a laundry service.', 'warning');
            return;
        }
        if (!slotId) {
            this.showToast('Please pick an available time slot.', 'warning');
            return;
        }

        const slot = db.timeSlots.find(s => s.id === slotId);
        const service = db.services.find(s => s.id === serviceId);

        if (slot.currentBookings >= slot.maxCapacity) {
            this.showToast('Selected time slot has reached maximum capacity.', 'danger');
            return;
        }

        const pickupDate = new Date(date);
        pickupDate.setDate(pickupDate.getDate() + service.estimatedDays);

        const appointment = {
            id: 'apt-' + Date.now().toString().slice(-6),
            customerId: this.currentUser.id,
            appointmentDate: date,
            timeSlotId: slotId,
            status: 'scheduled',
            createdAt: new Date().toISOString()
        };

        const order = {
            id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
            appointmentId: appointment.id,
            customerId: this.currentUser.id,
            serviceId: serviceId,
            quantity: weight,
            specialInstructions: instructions || 'Standard laundry care',
            estimatedPickupDate: pickupDate.toISOString().split('T')[0],
            status: 'pending',
            totalPrice: service.basePrice * weight,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        // Increment booking counter
        slot.currentBookings++;

        db.appointments.push(appointment);
        db.orders.push(order);
        this.saveDB('appointments');
        this.saveDB('orders');
        this.saveDB('timeSlots');

        this.addNotification(this.currentUser.id, order.id, appointment.id, 'appointment-reminder', `Drop-off booked for ${date} at ${slot.startTime}. Order ID: ${order.id}`);

        this.showToast('Appointment and Order booked successfully!', 'success');
        this.selectedServiceId = null;
        this.selectedSlotId = null;
        this.navigate('customer-orders');
    },

    loadCustomerAppointments() {
        const list = document.getElementById('cust-appointments-list');
        if (!list) return;

        const apts = db.appointments
            .filter(a => a.customerId === this.currentUser.id)
            .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

        if (apts.length === 0) {
            list.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem;">
                    <i class="fa-regular fa-calendar-xmark" style="font-size: 3rem; color: var(--slate-300); margin-bottom: 1rem; display:block;"></i>
                    <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--slate-800);">No Appointments Scheduled</h3>
                    <p style="color: var(--slate-500); margin: 0.5rem 0 1.5rem;">Book a slot to skip queue lines at our counter.</p>
                    <button class="btn btn-primary" onclick="app.navigate('customer-booking')">Book Drop-off Now</button>
                </div>
            `;
            return;
        }

        list.innerHTML = apts.map(apt => {
            const slot = db.timeSlots.find(s => s.id === apt.timeSlotId) || { startTime: '09:00', endTime: '11:00' };
            const order = db.orders.find(o => o.appointmentId === apt.id);
            const srv = order ? (db.services.find(s => s.id === order.serviceId) || { name: 'Laundry Service' }) : { name: 'Drop-off Appointment' };

            return `
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <div style="font-size: 1.15rem; font-weight: 800; color: var(--slate-900);">${srv.name}</div>
                            <div style="color: var(--slate-500); font-size: 0.9rem; margin-top: 0.25rem;">
                                <i class="fa-regular fa-calendar"></i> ${apt.appointmentDate} • <i class="fa-regular fa-clock"></i> ${slot.startTime} - ${slot.endTime}
                            </div>
                        </div>
                        <span class="badge ${this.getStatusBadgeClass(apt.status)}">${apt.status}</span>
                    </div>
                    <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.85rem; color: var(--slate-500);">Order Ref: <strong>${order ? order.id : 'N/A'}</strong></span>
                        <div>
                            ${apt.status === 'scheduled' ? `
                                <button class="btn btn-secondary btn-sm" onclick="app.cancelAppointment('${apt.id}')">
                                    <i class="fa-solid fa-ban"></i> Cancel Booking
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    cancelAppointment(aptId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        const apt = db.appointments.find(a => a.id === aptId);
        if (apt) {
            apt.status = 'cancelled';
            const slot = db.timeSlots.find(s => s.id === apt.timeSlotId);
            if (slot) slot.currentBookings = Math.max(0, slot.currentBookings - 1);

            this.saveDB('appointments');
            this.saveDB('timeSlots');
            this.showToast('Appointment successfully cancelled.', 'info');
            this.loadCustomerAppointments();
        }
    },

    loadCustomerOrders() {
        const list = document.getElementById('cust-orders-list');
        if (!list) return;

        const myOrders = db.orders
            .filter(o => o.customerId === this.currentUser.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (myOrders.length === 0) {
            list.innerHTML = `
                <div class="card" style="text-align: center; padding: 3rem;">
                    <i class="fa-solid fa-shirt" style="font-size: 3rem; color: var(--slate-300); margin-bottom: 1rem; display:block;"></i>
                    <h3 style="font-weight: 700; color: var(--slate-800);">No Laundry Orders Found</h3>
                    <p style="color: var(--slate-500); margin: 0.5rem 0 1.5rem;">You haven't submitted any laundry batches yet.</p>
                    <button class="btn btn-primary" onclick="app.navigate('customer-booking')">Start First Order</button>
                </div>
            `;
            return;
        }

        list.innerHTML = myOrders.map(order => {
            const srv = db.services.find(s => s.id === order.serviceId) || { name: 'Laundry Care' };
            const stages = ['pending', 'processing', 'ready-for-pickup', 'picked-up'];
            const currentIndex = stages.indexOf(order.status);

            const stepperHTML = `
                <div class="tracking-stepper">
                    <div class="step-node ${currentIndex >= 0 ? (currentIndex === 0 ? 'current' : 'completed') : ''}">
                        <div class="step-circle"><i class="fa-solid fa-receipt"></i></div>
                        <div class="step-title">Order Placed</div>
                    </div>
                    <div class="step-node ${currentIndex >= 1 ? (currentIndex === 1 ? 'current' : 'completed') : ''}">
                        <div class="step-circle"><i class="fa-solid fa-soap"></i></div>
                        <div class="step-title">In Wash / Drying</div>
                    </div>
                    <div class="step-node ${currentIndex >= 2 ? (currentIndex === 2 ? 'current' : 'completed') : ''}">
                        <div class="step-circle"><i class="fa-solid fa-box-archive"></i></div>
                        <div class="step-title">Ready for Pickup</div>
                    </div>
                    <div class="step-node ${currentIndex >= 3 ? 'completed' : ''}">
                        <div class="step-circle"><i class="fa-solid fa-circle-check"></i></div>
                        <div class="step-title">Claimed</div>
                    </div>
                </div>
            `;

            return `
                <div class="order-tracking-card">
                    <div class="order-card-top">
                        <div>
                            <div class="order-badge-id">${order.id}</div>
                            <div style="font-size: 1.1rem; font-weight: 800; color: var(--slate-900); margin-top: 0.2rem;">${srv.name}</div>
                            <div class="order-meta-info">
                                Quantity: <strong>${order.quantity} kg</strong> • Est. Pickup Date: <strong>${order.estimatedPickupDate}</strong>
                            </div>
                        </div>
                        <div class="order-cost-display">
                            <div style="font-size: 0.8rem; color: var(--slate-500); text-transform: uppercase; font-weight: 700;">Total Price</div>
                            <div class="order-total-amount">${db.shop.currency}${order.totalPrice.toFixed(2)}</div>
                            <span class="badge ${this.getStatusBadgeClass(order.status)}">${order.status.replace('-', ' ')}</span>
                        </div>
                    </div>

                    ${stepperHTML}

                    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--slate-50); padding: 0.85rem 1.25rem; border-radius: var(--radius-md); margin-top: 1rem;">
                        <span style="font-size: 0.85rem; color: var(--slate-600);">
                            <i class="fa-regular fa-note-sticky"></i> Note: <em>${order.specialInstructions}</em>
                        </span>
                        <button class="btn btn-secondary btn-sm" onclick="app.printOrderSlip('${order.id}')">
                            <i class="fa-solid fa-print"></i> Claim Ticket
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==========================================
    // 7. STAFF OPERATIONS
    // ==========================================
    loadStaffView(pageId) {
        if (pageId === 'staff-dashboard') this.loadStaffDashboard();
        else if (pageId === 'staff-queue') this.loadStaffQueue();
        else if (pageId === 'staff-orders') this.loadStaffOrders();
    },

    loadStaffDashboard() {
        const today = new Date().toISOString().split('T')[0];
        const todayApts = db.appointments.filter(a => a.appointmentDate === today && a.status === 'scheduled');
        const pendingCheckins = todayApts.filter(a => {
            const order = db.orders.find(o => o.appointmentId === a.id);
            return order && order.status === 'pending';
        }).length;

        const readyForPickup = db.orders.filter(o => o.status === 'ready-for-pickup').length;
        const inWashing = db.orders.filter(o => o.status === 'processing').length;

        document.getElementById('staff-stat-today-apts').textContent = todayApts.length;
        document.getElementById('staff-stat-pending-checkins').textContent = pendingCheckins;
        document.getElementById('staff-stat-in-wash').textContent = inWashing;
        document.getElementById('staff-stat-ready').textContent = readyForPickup;

        // Queue preview table
        const previewContainer = document.getElementById('staff-today-queue-preview');
        if (previewContainer) {
            if (todayApts.length === 0) {
                previewContainer.innerHTML = '<p style="color: var(--slate-500); padding: 1.5rem; text-align: center;">No appointments scheduled for today.</p>';
            } else {
                previewContainer.innerHTML = todayApts.slice(0, 5).map(apt => {
                    const cust = db.users.find(u => u.id === apt.customerId) || { firstName: 'Customer', lastName: '' };
                    const slot = db.timeSlots.find(s => s.id === apt.timeSlotId) || { startTime: '09:00' };
                    const order = db.orders.find(o => o.appointmentId === apt.id);

                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.25rem; border-bottom: 1px solid var(--border-subtle);">
                            <div>
                                <div style="font-weight: 700; color: var(--slate-900);">${cust.firstName} ${cust.lastName}</div>
                                <div style="font-size: 0.8rem; color: var(--slate-500);">Slot: ${slot.startTime} • Order: ${order ? order.id : 'N/A'}</div>
                            </div>
                            <div>
                                ${order && order.status === 'pending' ? `
                                    <button class="btn btn-primary btn-sm" onclick="app.checkInOrder('${order.id}', '${apt.id}')">Check In</button>
                                ` : `
                                    <span class="badge ${this.getStatusBadgeClass(order ? order.status : 'pending')}">${order ? order.status : 'scheduled'}</span>
                                `}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }
    },

    loadStaffQueue() {
        const queueList = document.getElementById('staff-queue-items');
        if (!queueList) return;

        const today = new Date().toISOString().split('T')[0];
        const appointments = db.appointments.filter(a => a.appointmentDate === today && a.status === 'scheduled');

        if (appointments.length === 0) {
            queueList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--slate-400);">
                    <i class="fa-solid fa-calendar-check" style="font-size: 3rem; margin-bottom: 1rem; display:block;"></i>
                    <p style="font-weight: 700; color: var(--slate-700);">All customer drop-offs for today are processed!</p>
                </div>
            `;
            return;
        }

        queueList.innerHTML = appointments.map((apt, index) => {
            const cust = db.users.find(u => u.id === apt.customerId) || { firstName: 'Guest', lastName: '', phone: '—' };
            const slot = db.timeSlots.find(s => s.id === apt.timeSlotId) || { startTime: '09:00', endTime: '11:00' };
            const order = db.orders.find(o => o.appointmentId === apt.id);
            const srv = order ? db.services.find(s => s.id === order.serviceId) : null;

            return `
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1.25rem;">
                        <div style="font-size: 1.75rem; font-weight: 900; color: var(--brand-primary); min-width: 45px;">#${index + 1}</div>
                        <div>
                            <div style="font-weight: 800; font-size: 1.1rem; color: var(--slate-900);">${cust.firstName} ${cust.lastName}</div>
                            <div style="font-size: 0.85rem; color: var(--slate-500);">
                                Slot: <strong>${slot.startTime}</strong> • Phone: <strong>${cust.phone}</strong> • ${srv ? srv.name : ''} (${order ? order.quantity : 0} kg)
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span class="badge ${this.getStatusBadgeClass(order ? order.status : 'pending')}">${order ? order.status : 'scheduled'}</span>
                        ${order && order.status === 'pending' ? `
                            <button class="btn btn-primary btn-sm" onclick="app.checkInOrder('${order.id}', '${apt.id}')">
                                <i class="fa-solid fa-clipboard-check"></i> Check-In Order
                            </button>
                        ` : ''}
                        ${order ? `
                            <button class="btn btn-secondary btn-sm" onclick="app.printOrderSlip('${order.id}')">
                                <i class="fa-solid fa-receipt"></i> Slip
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    checkInOrder(orderId, aptId) {
        const order = db.orders.find(o => o.id === orderId);
        if (!order) return;

        order.status = 'processing';
        db.queueEntries.push({
            id: 'q-' + Date.now().toString(),
            orderId: orderId,
            appointmentId: aptId,
            checkedInTime: new Date().toISOString(),
            staffId: this.currentUser.id
        });

        this.saveDB('orders');
        this.saveDB('queueEntries');
        this.addNotification(order.customerId, order.id, aptId, 'order-status', `Your laundry batch (${order.id}) has been checked in and is currently in washing.`);
        this.showToast(`Order ${order.id} checked in & set to Processing!`, 'success');

        if (document.getElementById('page-staff-queue').classList.contains('active')) {
            this.loadStaffQueue();
        } else {
            this.loadStaffDashboard();
        }
    },

    loadStaffOrders() {
        const container = document.getElementById('staff-orders-table-body');
        if (!container) return;

        const query = document.getElementById('staff-order-search-input')?.value.toLowerCase() || '';
        const filterStatus = document.getElementById('staff-order-filter-status')?.value || 'all';

        let filtered = db.orders.filter(o => {
            const cust = db.users.find(u => u.id === o.customerId) || { firstName: '', lastName: '' };
            const srv = db.services.find(s => s.id === o.serviceId) || { name: '' };
            const matchQuery = o.id.toLowerCase().includes(query) ||
                               `${cust.firstName} ${cust.lastName}`.toLowerCase().includes(query) ||
                               srv.name.toLowerCase().includes(query);

            const matchStatus = filterStatus === 'all' || o.status === filterStatus;
            return matchQuery && matchStatus;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--slate-400);">No orders found matching your filter criteria.</td></tr>`;
            return;
        }

        container.innerHTML = filtered.map(o => {
            const cust = db.users.find(u => u.id === o.customerId) || { firstName: 'Customer', lastName: '' };
            const srv = db.services.find(s => s.id === o.serviceId) || { name: 'Service' };

            return `
                <tr>
                    <td><strong>${o.id}</strong></td>
                    <td>${cust.firstName} ${cust.lastName}</td>
                    <td>${srv.name}</td>
                    <td>${o.quantity} kg</td>
                    <td><strong>${db.shop.currency}${o.totalPrice.toFixed(2)}</strong></td>
                    <td>
                        <select class="form-control" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;" onchange="app.updateOrderStatus('${o.id}', this.value)">
                            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="ready-for-pickup" ${o.status === 'ready-for-pickup' ? 'selected' : ''}>Ready for Pickup</option>
                            <option value="picked-up" ${o.status === 'picked-up' ? 'selected' : ''}>Picked Up</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="app.printOrderSlip('${o.id}')" title="Print Claim Stub">
                            <i class="fa-solid fa-print"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    updateOrderStatus(orderId, newStatus) {
        const order = db.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            if (newStatus === 'picked-up') {
                order.completedAt = new Date().toISOString();
            }
            this.saveDB('orders');

            // Notify Customer
            let message = `Order ${order.id} status updated to: ${newStatus.replace('-', ' ')}.`;
            if (newStatus === 'ready-for-pickup') {
                message = `Good news! Your clean garments for order ${order.id} are ready for pickup at our store!`;
            } else if (newStatus === 'picked-up') {
                message = `Thank you for trusting CleanPro! Order ${order.id} was claimed.`;
            }

            this.addNotification(order.customerId, order.id, order.appointmentId, 'order-status', message);
            this.showToast(`Order ${order.id} status updated to ${newStatus}`, 'success');

            if (document.getElementById('page-staff-orders').classList.contains('active')) {
                this.loadStaffOrders();
            }
        }
    },

    // ==========================================
    // 8. ADMIN / OWNER MANAGEMENT
    // ==========================================
    loadAdminView(pageId) {
        switch (pageId) {
            case 'admin-dashboard':
                this.loadAdminDashboard();
                break;
            case 'admin-appointments':
                this.loadAdminAppointments();
                break;
            case 'admin-timeslots':
                this.loadAdminTimeSlots();
                break;
            case 'admin-users':
                this.loadAdminUsers();
                break;
            case 'admin-services':
                this.loadAdminServices();
                break;
            case 'admin-pickups':
                this.loadAdminPickups();
                break;
            case 'admin-announcements':
                this.loadAdminAnnouncements();
                break;
            case 'admin-reports':
                this.generateReport('monthly');
                break;
            case 'admin-settings':
                this.loadAdminSettings();
                break;
        }
    },

    loadAdminDashboard() {
        const customersCount = db.users.filter(u => u.role === 'customer').length;
        const staffCount = db.users.filter(u => u.role === 'staff').length;
        const today = new Date().toISOString().split('T')[0];
        const todayApts = db.appointments.filter(a => a.appointmentDate === today).length;
        const activeOrders = db.orders.filter(o => o.status !== 'picked-up').length;

        const currentMonth = today.slice(0, 7);
        const revenue = db.orders
            .filter(o => o.status === 'picked-up' && (o.completedAt || o.createdAt).slice(0, 7) === currentMonth)
            .reduce((sum, o) => sum + o.totalPrice, 0);

        document.getElementById('admin-stat-customers').textContent = customersCount;
        document.getElementById('admin-stat-staff').textContent = staffCount;
        document.getElementById('admin-stat-today-apts').textContent = todayApts;
        document.getElementById('admin-stat-active-orders').textContent = activeOrders;
        document.getElementById('admin-stat-revenue').textContent = `${db.shop.currency}${revenue.toLocaleString()}`;

        // Recent orders table
        const recentBody = document.getElementById('admin-recent-orders-table');
        if (recentBody) {
            recentBody.innerHTML = db.orders.slice(-5).reverse().map(o => {
                const cust = db.users.find(u => u.id === o.customerId) || { firstName: 'Customer', lastName: '' };
                const srv = db.services.find(s => s.id === o.serviceId) || { name: 'Service' };
                return `
                    <tr>
                        <td><strong>${o.id}</strong></td>
                        <td>${cust.firstName} ${cust.lastName}</td>
                        <td>${srv.name}</td>
                        <td>${db.shop.currency}${o.totalPrice.toFixed(2)}</td>
                        <td><span class="badge ${this.getStatusBadgeClass(o.status)}">${o.status}</span></td>
                    </tr>
                `;
            }).join('');
        }
    },

    loadAdminUsers() {
        const tbody = document.getElementById('admin-users-table-body');
        if (!tbody) return;

        tbody.innerHTML = db.users.map(u => `
            <tr>
                <td><strong>${u.firstName} ${u.lastName}</strong></td>
                <td>${u.email}</td>
                <td><span class="badge badge-slate">${(u.role === 'admin' || u.role === 'owner') ? 'owner' : u.role}</span></td>
                <td>${u.phone || '—'}</td>
                <td><span class="badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}">${u.status}</span></td>
                <td>
                    ${u.id !== this.currentUser.id ? `
                        <button class="btn btn-secondary btn-sm" onclick="app.toggleUserStatus('${u.id}')">
                            ${u.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                    ` : '<span style="color: var(--slate-400); font-size: 0.8rem;">Current Account</span>'}
                </td>
            </tr>
        `).join('');
    },

    addStaff(e) {
        e.preventDefault();
        const email = document.getElementById('new-staff-email').value.trim();

        if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showToast('This email is already in use.', 'danger');
            return;
        }

        const newStaff = {
            id: 'usr-staff-' + Date.now().toString().slice(-4),
            email,
            password: document.getElementById('new-staff-password').value,
            firstName: document.getElementById('new-staff-fname').value.trim(),
            lastName: document.getElementById('new-staff-lname').value.trim(),
            phone: document.getElementById('new-staff-phone').value.trim() || '—',
            role: 'staff',
            status: 'active',
            createdAt: new Date().toISOString()
        };

        db.users.push(newStaff);
        this.saveDB('users');
        this.showToast('New staff member added!', 'success');
        this.closeModal('modal-add-staff');
        this.loadAdminUsers();
    },

    toggleUserStatus(userId) {
        const user = db.users.find(u => u.id === userId);
        if (user) {
            user.status = user.status === 'active' ? 'inactive' : 'active';
            this.saveDB('users');
            this.showToast(`User status changed to ${user.status}`, 'info');
            this.loadAdminUsers();
        }
    },

    loadAdminTimeSlots() {
        const container = document.getElementById('admin-timeslots-grid');
        if (!container) return;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        container.innerHTML = db.timeSlots.map(slot => `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 800; font-size: 1.05rem; color: var(--slate-900);">${days[slot.dayOfWeek]}</div>
                    <div style="color: var(--slate-600); font-size: 0.9rem; margin-top: 0.2rem;">
                        <i class="fa-regular fa-clock"></i> ${slot.startTime} - ${slot.endTime}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--slate-500); margin-top: 0.25rem;">
                        Max Capacity: <strong>${slot.maxCapacity} orders</strong>
                    </div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="app.deleteTimeSlot('${slot.id}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        `).join('');
    },

    addTimeSlot(e) {
        e.preventDefault();
        const newSlot = {
            id: 'slot-' + Date.now().toString().slice(-6),
            dayOfWeek: parseInt(document.getElementById('new-slot-day').value),
            startTime: document.getElementById('new-slot-start').value,
            endTime: document.getElementById('new-slot-end').value,
            maxCapacity: parseInt(document.getElementById('new-slot-capacity').value) || 5,
            currentBookings: 0,
            isActive: true
        };

        db.timeSlots.push(newSlot);
        this.saveDB('timeSlots');
        this.showToast('Time slot configured successfully.', 'success');
        this.closeModal('modal-add-slot');
        this.loadAdminTimeSlots();
    },

    deleteTimeSlot(slotId) {
        if (!confirm('Are you sure you want to remove this time slot?')) return;
        db.timeSlots = db.timeSlots.filter(s => s.id !== slotId);
        this.saveDB('timeSlots');
        this.showToast('Time slot removed.', 'info');
        this.loadAdminTimeSlots();
    },

    loadAdminAppointments() {
        const tbody = document.getElementById('admin-appointments-table-body');
        if (!tbody) return;

        tbody.innerHTML = db.appointments.map(apt => {
            const cust = db.users.find(u => u.id === apt.customerId) || { firstName: 'Customer', lastName: '' };
            const slot = db.timeSlots.find(s => s.id === apt.timeSlotId) || { startTime: '09:00' };
            const order = db.orders.find(o => o.appointmentId === apt.id);

            return `
                <tr>
                    <td><strong>${apt.id}</strong></td>
                    <td>${apt.appointmentDate}</td>
                    <td>${slot.startTime}</td>
                    <td>${cust.firstName} ${cust.lastName}</td>
                    <td>${order ? order.id : '—'}</td>
                    <td><span class="badge ${this.getStatusBadgeClass(apt.status)}">${apt.status}</span></td>
                </tr>
            `;
        }).join('');
    },

    loadAdminServices() {
        const grid = document.getElementById('admin-services-grid');
        if (!grid) return;

        grid.innerHTML = db.services.map(s => `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div style="font-size: 1.15rem; font-weight: 800; color: var(--slate-900);">${s.name}</div>
                    <span class="badge badge-success">${db.shop.currency}${s.basePrice} / kg</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--slate-600); margin-bottom: 1rem; line-height: 1.5;">${s.description}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
                    <span style="font-size: 0.8rem; color: var(--slate-500);"><i class="fa-regular fa-clock"></i> ${s.estimatedDays} days turnaround</span>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteService('${s.id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    },

    addService(e) {
        e.preventDefault();
        const service = {
            id: 'srv-' + Date.now().toString().slice(-4),
            name: document.getElementById('new-srv-name').value.trim(),
            description: document.getElementById('new-srv-desc').value.trim(),
            basePrice: parseFloat(document.getElementById('new-srv-price').value),
            estimatedDays: parseInt(document.getElementById('new-srv-days').value) || 2,
            isActive: true
        };

        db.services.push(service);
        this.saveDB('services');
        this.showToast('New laundry service added.', 'success');
        this.closeModal('modal-add-service');
        this.loadAdminServices();
    },

    deleteService(serviceId) {
        if (!confirm('Are you sure you want to remove this service?')) return;
        db.services = db.services.filter(s => s.id !== serviceId);
        this.saveDB('services');
        this.showToast('Service removed.', 'info');
        this.loadAdminServices();
    },

    loadAdminPickups() {
        const container = document.getElementById('admin-pickups-list');
        if (!container) return;

        const readyOrders = db.orders.filter(o => o.status === 'ready-for-pickup');

        if (readyOrders.length === 0) {
            container.innerHTML = '<p style="color: var(--slate-500); text-align: center; padding: 2.5rem;">No orders are currently waiting for dispatch or pickup.</p>';
            return;
        }

        container.innerHTML = readyOrders.map(order => {
            const cust = db.users.find(u => u.id === order.customerId) || { firstName: 'Customer', lastName: '', phone: '', address: '' };
            const srv = db.services.find(s => s.id === order.serviceId) || { name: 'Service' };

            return `
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <div style="font-weight: 800; font-size: 1.1rem; color: var(--slate-900);">${order.id} • ${cust.firstName} ${cust.lastName}</div>
                        <div style="font-size: 0.85rem; color: var(--slate-600); margin-top: 0.2rem;">
                            ${srv.name} (${order.quantity} kg) • <strong>Delivery Address:</strong> ${cust.address}
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-success btn-sm" onclick="app.updateOrderStatus('${order.id}', 'picked-up')">
                            <i class="fa-solid fa-check"></i> Mark as Handed Over
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="app.printOrderSlip('${order.id}')">
                            <i class="fa-solid fa-print"></i> Slip
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    loadAdminAnnouncements() {
        const list = document.getElementById('admin-announcements-list');
        if (!list) return;

        list.innerHTML = db.announcements.map(a => `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--slate-900);">${a.title}</h3>
                    <span class="badge ${a.isActive ? 'badge-success' : 'badge-danger'}">${a.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p style="font-size: 0.9rem; color: var(--slate-600); margin-bottom: 0.75rem;">${a.content}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
                    <span style="font-size: 0.8rem; color: var(--slate-400);">Display: ${a.startDate} to ${a.endDate}</span>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteAnnouncement('${a.id}')">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    },

    addAnnouncement(e) {
        e.preventDefault();
        const anc = {
            id: 'anc-' + Date.now().toString().slice(-4),
            title: document.getElementById('new-anc-title').value.trim(),
            content: document.getElementById('new-anc-content').value.trim(),
            type: document.getElementById('new-anc-type').value,
            startDate: document.getElementById('new-anc-start').value,
            endDate: document.getElementById('new-anc-end').value,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        db.announcements.push(anc);
        this.saveDB('announcements');
        this.showToast('Announcement broadcasted!', 'success');
        this.closeModal('modal-add-announcement');
        this.loadAdminAnnouncements();
    },

    deleteAnnouncement(ancId) {
        if (!confirm('Delete this announcement?')) return;
        db.announcements = db.announcements.filter(a => a.id !== ancId);
        this.saveDB('announcements');
        this.showToast('Announcement deleted.', 'info');
        this.loadAdminAnnouncements();
    },

    generateReport(type) {
        const resultsEl = document.getElementById('admin-report-container');
        if (!resultsEl) return;

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        let relevantOrders = [];
        let title = '';

        if (type === 'daily') {
            title = `Daily Revenue & Operations Summary (${todayStr})`;
            relevantOrders = db.orders.filter(o => o.createdAt.slice(0, 10) === todayStr);
        } else if (type === 'weekly') {
            title = 'Last 7 Days Rolling Performance Report';
            const weekAgo = new Date(today.getTime() - 7 * 86400000);
            relevantOrders = db.orders.filter(o => new Date(o.createdAt) >= weekAgo);
        } else {
            const thisMonth = todayStr.slice(0, 7);
            title = `Monthly Business Report (${thisMonth})`;
            relevantOrders = db.orders.filter(o => o.createdAt.slice(0, 7) === thisMonth);
        }

        const totalRevenue = relevantOrders.reduce((sum, o) => sum + o.totalPrice, 0);
        const completedCount = relevantOrders.filter(o => o.status === 'picked-up').length;
        const avgOrder = relevantOrders.length ? (totalRevenue / relevantOrders.length).toFixed(2) : 0;

        resultsEl.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--slate-900);">${title}</h3>
                <p style="font-size: 0.85rem; color: var(--slate-500);">Generated on ${today.toLocaleString()}</p>
            </div>
            <div class="stats-grid">
                <div class="stat-card emerald">
                    <div class="stat-content">
                        <div class="stat-label">Total Revenue</div>
                        <div class="stat-value">${db.shop.currency}${totalRevenue.toLocaleString()}</div>
                    </div>
                    <div class="stat-icon-box"><i class="fa-solid fa-peso-sign"></i></div>
                </div>
                <div class="stat-card sky">
                    <div class="stat-content">
                        <div class="stat-label">Total Orders Logged</div>
                        <div class="stat-value">${relevantOrders.length}</div>
                    </div>
                    <div class="stat-icon-box"><i class="fa-solid fa-receipt"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-content">
                        <div class="stat-label">Claimed & Completed</div>
                        <div class="stat-value">${completedCount}</div>
                    </div>
                    <div class="stat-icon-box"><i class="fa-solid fa-circle-check"></i></div>
                </div>
                <div class="stat-card amber">
                    <div class="stat-content">
                        <div class="stat-label">Avg. Order Value</div>
                        <div class="stat-value">${db.shop.currency}${avgOrder}</div>
                    </div>
                    <div class="stat-icon-box"><i class="fa-solid fa-calculator"></i></div>
                </div>
            </div>
        `;
    },

    loadAdminSettings() {
        // Load Owner Personal Account Info
        if (this.currentUser) {
            const ownerFname = document.getElementById('owner-cfg-fname');
            const ownerLname = document.getElementById('owner-cfg-lname');
            const ownerEmail = document.getElementById('owner-cfg-email');
            const ownerPhone = document.getElementById('owner-cfg-phone');
            const ownerPass = document.getElementById('owner-cfg-password');

            if (ownerFname) ownerFname.value = this.currentUser.firstName || '';
            if (ownerLname) ownerLname.value = this.currentUser.lastName || '';
            if (ownerEmail) ownerEmail.value = this.currentUser.email || '';
            if (ownerPhone) ownerPhone.value = this.currentUser.phone || '';
            if (ownerPass) ownerPass.value = '';
        }

        // Load Shop & Policy Configuration
        document.getElementById('shop-cfg-name').value = db.shop.name;
        document.getElementById('shop-cfg-tagline').value = db.shop.tagline;
        document.getElementById('shop-cfg-phone').value = db.shop.phone;
        document.getElementById('shop-cfg-email').value = db.shop.email;
        document.getElementById('shop-cfg-address').value = db.shop.address;
        document.getElementById('shop-cfg-open').value = db.shop.openingTime;
        document.getElementById('shop-cfg-close').value = db.shop.closingTime;
        document.getElementById('sys-cfg-book-window').value = db.settings.bookingWindow;
        document.getElementById('sys-cfg-cancel-window').value = db.settings.cancelWindow;

        // Refresh logo preview box
        this.refreshLogoPreviewBox();
    },

    saveSettings(e) {
        if (e) e.preventDefault();

        // 1. Update Owner Personal Profile
        const newFname = document.getElementById('owner-cfg-fname')?.value.trim();
        const newLname = document.getElementById('owner-cfg-lname')?.value.trim();
        const newEmail = document.getElementById('owner-cfg-email')?.value.trim();
        const newPhone = document.getElementById('owner-cfg-phone')?.value.trim();
        const newPass = document.getElementById('owner-cfg-password')?.value;

        if (this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'owner')) {
            if (newFname) this.currentUser.firstName = newFname;
            if (newLname) this.currentUser.lastName = newLname;
            if (newEmail) this.currentUser.email = newEmail;
            if (newPhone !== undefined) this.currentUser.phone = newPhone;
            if (newPass && newPass.length >= 6) {
                this.currentUser.password = newPass;
            }

            // Sync with persistent db.users
            const userInDB = db.users.find(u => u.id === this.currentUser.id);
            if (userInDB) {
                userInDB.firstName = this.currentUser.firstName;
                userInDB.lastName = this.currentUser.lastName;
                userInDB.email = this.currentUser.email;
                userInDB.phone = this.currentUser.phone;
                if (newPass && newPass.length >= 6) {
                    userInDB.password = newPass;
                }
            }
            this.saveDB('users');
            sessionStorage.setItem('cp_currentUser', JSON.stringify(this.currentUser));
            this.updateHeaderUserInfo();

            // Clear password field after save
            const passField = document.getElementById('owner-cfg-password');
            if (passField) passField.value = '';
        }

        // 2. Update Store Profile & Branding (logo is saved separately via handleLogoFileUpload)
        db.shop.name = document.getElementById('shop-cfg-name').value.trim() || db.shop.name;
        db.shop.tagline = document.getElementById('shop-cfg-tagline').value.trim() || db.shop.tagline;
        db.shop.phone = document.getElementById('shop-cfg-phone').value.trim() || db.shop.phone;
        db.shop.email = document.getElementById('shop-cfg-email').value.trim() || db.shop.email;
        db.shop.address = document.getElementById('shop-cfg-address').value.trim() || db.shop.address;
        db.shop.openingTime = document.getElementById('shop-cfg-open').value || db.shop.openingTime;
        db.shop.closingTime = document.getElementById('shop-cfg-close').value || db.shop.closingTime;

        // 3. Update Policy Configuration
        db.settings.bookingWindow = parseInt(document.getElementById('sys-cfg-book-window').value) || 30;
        db.settings.cancelWindow = parseInt(document.getElementById('sys-cfg-cancel-window').value) || 24;

        this.saveDB('shop');
        this.saveDB('settings');
        this.updateShopBranding();
        this.showToast('Owner profile and shop settings successfully saved!', 'success');
    },

    // ==========================================
    // 9. LOGO FILE UPLOAD HANDLER
    // ==========================================

    /**
     * Reads the selected file and converts it to a base64 data URL,
     * immediately updating all logo slots across the page and
     * persisting the result to localStorage.
     */
    handleLogoFileUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate it is an image type
        if (!file.type.startsWith('image/')) {
            this.showToast('Please select a valid image file (PNG, JPG, SVG, WebP).', 'danger');
            event.target.value = '';
            return;
        }

        // Validate max 2 MB for logo
        const maxBytes = 2 * 1024 * 1024;
        if (file.size > maxBytes) {
            this.showToast('Image file is too large. Please use an image under 2 MB.', 'warning');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            db.shop.logo = dataUrl;
            this.saveDB('shop');
            this.updateShopBranding();
            this.refreshLogoPreviewBox();
            this.showToast('Shop logo updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    },

    /** Updates the preview box inside the settings card */
    refreshLogoPreviewBox() {
        const previewBox = document.getElementById('shop-logo-preview-box');
        if (!previewBox) return;

        const isImage = db.shop.logo && (
            db.shop.logo.startsWith('data:image/') ||
            db.shop.logo.startsWith('http') ||
            db.shop.logo.startsWith('blob:')
        );

        if (isImage) {
            previewBox.innerHTML = `<img src="${db.shop.logo}" alt="Logo preview" style="width: 100%; height: 100%; object-fit: contain; display: block;">`;
        } else {
            previewBox.innerHTML = db.shop.logo || '🧺';
        }
    },

    /** Resets the logo back to the default laundry basket emoji */
    resetLogoToDefault() {
        db.shop.logo = '🧺';
        this.saveDB('shop');
        this.updateShopBranding();
        this.refreshLogoPreviewBox();
        const fileInput = document.getElementById('shop-cfg-logo-file');
        if (fileInput) fileInput.value = '';
        this.showToast('Logo has been reset to the default icon.', 'info');
    },

    // ==========================================
    // 10. PRINTABLE CLAIM TICKET GENERATOR
    // ==========================================
    printOrderSlip(orderId) {
        const order = db.orders.find(o => o.id === orderId);
        if (!order) return;

        const cust = db.users.find(u => u.id === order.customerId) || { firstName: 'Valued Customer', lastName: '', phone: '—' };
        const srv = db.services.find(s => s.id === order.serviceId) || { name: 'Laundry Service', basePrice: 0 };
        const apt = db.appointments.find(a => a.id === order.appointmentId);

        const slipContainer = document.getElementById('claim-receipt-content');
        if (!slipContainer) return;

        // Build logo HTML for receipt
        const isImage = db.shop.logo && (
            db.shop.logo.startsWith('data:image/') ||
            db.shop.logo.startsWith('http') ||
            db.shop.logo.startsWith('blob:')
        );
        const receiptLogoHTML = isImage
            ? `<img src="${db.shop.logo}" alt="${db.shop.name} logo">`
            : db.shop.logo || '🧺';

        slipContainer.innerHTML = `
            <div class="receipt-header">
                <div class="receipt-shop-logo">${receiptLogoHTML}</div>
                <div class="receipt-shop-name">${db.shop.name}</div>
                <div class="receipt-shop-info">
                    ${db.shop.address}<br>
                    Tel: ${db.shop.phone} • Email: ${db.shop.email}<br>
                    Hours: ${db.shop.openingTime} - ${db.shop.closingTime}
                </div>
            </div>

            <div class="receipt-meta-grid">
                <div><span>Claim Ticket:</span> <strong>#${order.id}</strong></div>
                <div><span>Date:</span> ${new Date(order.createdAt).toLocaleDateString()}</div>
                <div><span>Customer:</span> ${cust.firstName} ${cust.lastName}</div>
                <div><span>Contact:</span> ${cust.phone}</div>
                <div><span>Est. Pickup:</span> <strong>${order.estimatedPickupDate}</strong></div>
                <div><span>Status:</span> <span class="badge ${this.getStatusBadgeClass(order.status)}">${order.status}</span></div>
            </div>

            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>Service Description</th>
                        <th style="text-align: right;">Weight/Qty</th>
                        <th style="text-align: right;">Rate</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>${srv.name}</strong></td>
                        <td style="text-align: right;">${order.quantity} kg</td>
                        <td style="text-align: right;">${db.shop.currency}${srv.basePrice}</td>
                        <td style="text-align: right;">${db.shop.currency}${order.totalPrice.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="receipt-total-row">
                <span>TOTAL DUE</span>
                <span>${db.shop.currency}${order.totalPrice.toFixed(2)}</span>
            </div>

            <div style="background: var(--slate-50); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-bottom: 1rem;">
                <strong>Special Care Instructions:</strong><br>
                ${order.specialInstructions || 'Standard hygiene washing protocol'}
            </div>

            <div class="receipt-barcode">
                <!-- Simulated Clean Vector Barcode -->
                <svg class="barcode-svg" viewBox="0 0 100 20">
                    <rect x="0" y="0" width="2" height="20" fill="#0f172a"/>
                    <rect x="4" y="0" width="1" height="20" fill="#0f172a"/>
                    <rect x="7" y="0" width="3" height="20" fill="#0f172a"/>
                    <rect x="12" y="0" width="2" height="20" fill="#0f172a"/>
                    <rect x="16" y="0" width="1" height="20" fill="#0f172a"/>
                    <rect x="19" y="0" width="4" height="20" fill="#0f172a"/>
                    <rect x="25" y="0" width="2" height="20" fill="#0f172a"/>
                    <rect x="29" y="0" width="1" height="20" fill="#0f172a"/>
                    <rect x="32" y="0" width="3" height="20" fill="#0f172a"/>
                    <rect x="37" y="0" width="2" height="20" fill="#0f172a"/>
                    <rect x="41" y="0" width="1" height="20" fill="#0f172a"/>
                    <rect x="44" y="0" width="3" height="20" fill="#0f172a"/>
                    <rect x="49" y="0" width="2" height="20" fill="#0f172a"/>
                    <rect x="53" y="0" width="4" height="20" fill="#0f172a"/>
                    <rect x="59" y="0" width="1" height="20" fill="#0f172a"/>
                    <rect x="62" y="0" width="2" height="20" fill="#0f172a"/>
                    <rect x="66" y="0" width="3" height="20" fill="#0f172a"/>
                    <rect x="71" y="0" width="1" height="20" fill="#0f172a"/>
                    <rect x="74" y="0" width="2" height="20" fill="#0f172a"/>
                    <rect x="78" y="0" width="3" height="20" fill="#0f172a"/>
                    <rect x="83" y="0" width="1" height="20" fill="#0f172a"/>
                    <rect x="86" y="0" width="2" height="20" fill="#0f172a"/>
                    <rect x="90" y="0" width="4" height="20" fill="#0f172a"/>
                    <rect x="96" y="0" width="2" height="20" fill="#0f172a"/>
                </svg>
                <div style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--slate-600); margin-top: 0.25rem;">
                    *${order.id}*
                </div>
            </div>

            <div class="receipt-footer-note">
                Please present this slip when claiming your garments.<br>
                Items not claimed within 30 days will be donated or disposed of.<br>
                Thank you for choosing ${db.shop.name}!
            </div>
        `;

        this.openModal('modal-claim-receipt');
    },

    // ==========================================
    // 10. UTILITIES & MODAL HELPERS
    // ==========================================
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            success: 'fa-circle-check',
            danger: 'fa-triangle-exclamation',
            warning: 'fa-circle-exclamation',
            info: 'fa-circle-info'
        };

        toast.innerHTML = `
            <i class="fa-solid ${iconMap[type] || 'fa-circle-info'}" style="font-size: 1.15rem;"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    getStatusBadgeClass(status) {
        switch (status) {
            case 'completed':
            case 'picked-up':
                return 'badge-success';
            case 'processing':
                return 'badge-warning';
            case 'ready-for-pickup':
                return 'badge-info';
            case 'cancelled':
                return 'badge-danger';
            default:
                return 'badge-slate';
        }
    },

    saveDB(key) {
        localStorage.setItem(`cp_${key}`, JSON.stringify(db[key]));
    }
};

// ==========================================
// 11. TAB CONTROLLERS
// ==========================================
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-tab-pane').forEach(p => p.style.display = 'none');

    const activeBtn = document.getElementById(`tab-btn-${tab}`);
    const activePane = document.getElementById(`tab-pane-${tab}`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activePane) activePane.style.display = 'block';
}

// Bootstrap on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
